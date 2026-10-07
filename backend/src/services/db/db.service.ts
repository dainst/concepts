import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {DatabaseError, Pool, QueryResult, QueryResultRow, types} from 'pg';
import {DBStatus} from 'common/interfaces/default';
import {CacheService} from '../cache/cache.service';
import {ApiError} from '../../classes/api-error';
import {ConceptRow} from '../../interfaces/concept-row';
import {convertConceptRow} from '../../functions/convert-concept-row';
import {Concept, ConceptId} from 'common/interfaces/concept';
import {ConceptQueryWithSettings, ConceptSelector, SearchResult} from 'common/interfaces/search';
import {ConceptHistory} from 'common/interfaces/concept-history';
import {convertHistoryRow} from '../../functions/convert-history-row';
import {searchCountSql, searchSql} from '../../functions/search-sql';
import {getAllDomainsSql, getConceptHistorySql, getDomainSql} from '../../functions/get-sql';
import {insertSql} from '../../functions/insert-sql';
import {SqlCommand} from '../../interfaces/sql';
import {deleteSql} from '../../functions/delete-sql';
import {validateConcept} from '../../functions/validate';
import {
  conceptItemDiff,
  getItemId,
  relationsDiff
} from '../../functions/concept';
import {unpackRelationSets} from 'common/functions/relation-set';
import {isConceptRow} from '../../functions/rows.typeguards';
import {
  CachedObjectType,
  CacheServiceResponse,
  CacheServiceStoreKey
} from '../../interfaces/cache';
import {HistoryRow} from '../../interfaces/history-row';
import {getErrorCode, getErrorMessage} from '../../functions/error';
import {EnvironmentService} from '../environment/environment.service';
import {Domain} from 'common/interfaces/domain';
import {isDomain} from 'common/functions/domain.typeguards';
import {User} from 'common/interfaces/user';
import {SettingsService} from '../settings/settings.service';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;
  private status: DBStatus = {
    status: null,
    version: null
  };

  constructor(
    private readonly cs: CacheService,
    private readonly es: EnvironmentService,
    private readonly ss: SettingsService
  ) {
    this.pool = new Pool(this.es.get().db);
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
    this.status = await this.queryStatus();
  }

  private async connect(retries: number = 5): Promise<void> {
    this.status = {
      status: 'connecting',
      version: String(6 - retries)
    };
    try {
      types.setTypeParser(types.builtins.INT8, Number);
      await this.pool.connect();
      console.log('[DB] Connected');
    } catch (err) {
      console.error(`[DB] Failed to connect (attempt ${6 - retries}):`, getErrorMessage(err));
      if (retries) return new Promise(resolve => {
        setTimeout(
          () => {
            void this.connect(retries - 1).then(resolve);
          },
          1500
        );
      });
      this.status = {
        status: 'offline',
        version: null
      };
      console.debug(this.es.get());
      throw new ApiError('internal-server-error', [
        `DB connection failed after ${6 - retries} attempts`,
         String(getErrorCode(err))
      ]);
    }
  }

  private async queryStatus(): Promise<DBStatus> {
    try {
      const result = await this.pool.query<{ val: string }>(
        "select * from meta where key = 'schema-version'"
      );
      return {
        status: 'online',
        version: result.rows[0]?.val || null
      };
    } catch (e) {
      console.error(`Can not fetch DB version`, e);
    }
    return {
      status: 'offline',
      version: null
    };
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async query<T extends QueryResultRow>(
    sql: string,
    params: (string | number | boolean | null)[] = [],
    cacheId: CacheServiceStoreKey | null = null
  ): Promise<QueryResult<T>> {
    console.log(sql);
    // console.log(params);

    if (cacheId == null) return this.pool.query<T>(sql, params);

    const cached: CacheServiceResponse<typeof cacheId> = this.cs.get<
      typeof cacheId
    >(cacheId, sql + params?.join());
    if (cached.result) return cached.result as unknown as QueryResult<T>;

    const res: QueryResult<T> = await this.pool.query<T>(sql, params);

    this.cs.store(
      cacheId,
      sql + params?.join(),
      res as unknown as CachedObjectType<typeof cacheId>, // TODO get rid of type assertion
      cached.hash
    );

    return res;
  }

  async transaction(commands: SqlCommand[]): Promise<QueryResult[]> {
    const client = await this.pool.connect();

    let queryNr = 0;
    try {
      await client.query('BEGIN');
      const results = [];
      for (const command of commands) {
        // oldschool loop to keep it sync
        results.push(await client.query(command[0], command.slice(1)));
        queryNr++;
      }
      await client.query('COMMIT');
      return results;
    } catch (e: unknown) {
      await client.query('ROLLBACK');
      if (e instanceof DatabaseError) {
        const params: string[] = [
          e.message,
          queryNr,
          (commands[queryNr] ?? ['unknown command'])[0],
          e.code
        ].map(String);
        throw new ApiError(
          'db-transaction-error',
          params,
          (commands[queryNr] ?? ['']).slice(1)
        );
      }
      throw e;
    } finally {
      client.release();
    }
  }

  getStatus(): DBStatus {
    return this.status;
  }

  private async queryConcepts(
    selector: ConceptQueryWithSettings
  ): Promise<ConceptRow[]> {
    const query = searchSql(selector);
    const res = await this.query<ConceptRow>(
      query,
      [],
      selector.forceCache ? 'concepts' : null
    );
    const correctRows = res.rows
      // .filter(isConceptRow);
    if (correctRows.length < res.rows.length)
      throw new ApiError('internal-server-error', ['Not found']); // TODO better error
    return correctRows;
  }

  private async getSearchResultCount(
    selector: ConceptSelector,
    found: number
  ): Promise<number> {
    if (!found) return 0;
    if (selector.limit && found > selector.limit) return NaN;
    if (selector.limit && found < selector.limit)
      return Number(selector.offset) + found;
    if (selector.id && selector.type) return found; // 0 or 1
    return this.getAvailableSearchResultCount(selector);
  }

  private async getAvailableSearchResultCount(
    selector: ConceptSelector
  ): Promise<number> {
    const sql = searchCountSql(selector);
    const res = await this.query<{ count: number }>(sql, [], 'count');
    return res.rows[0].count;
  }

  async getConcept(type: string, id: string, requester: User|null = null): Promise<Concept | null> {
    const conceptRows = await this.queryConcepts({
      ...this.ss.get(),
      ...{preferredLanguage: requester ? requester.preferredLanguage : this.ss.get().preferredLanguage},
      type,
      id,
      limit: 1,
      offset: 0,
      shards: [
        'labels',
        'relations',
        'geographical_extends',
        'temporal_extends',
        'title'
      ],
      includeIds: true
    });
    return conceptRows[0] ? convertConceptRow(conceptRows[0]) : null;
  }

  async search(selector: ConceptSelector, requester: User|null): Promise<SearchResult> {
    const results: Concept[] = (await this.queryConcepts({
      ...this.ss.get(),
      ...{preferredLanguage: requester ? requester.preferredLanguage : this.ss.get().preferredLanguage},
      ...selector,
      includeIds: false
    }))
      .map(convertConceptRow);
    const count = await this.getSearchResultCount(selector, results.length);
    return {
      selector,
      results,
      count,
      warnings: []
    };
  }

  async getConceptHistory(type: string, id: string): Promise<ConceptHistory> {
    return (
      await this.query<HistoryRow>(getConceptHistorySql, [type, id])
    ).rows.map(convertHistoryRow);
  }

  async upcertConcept(concept: Concept, user: User): Promise<ConceptId> {
    if (!user.groups.includes(concept.domain)) throw new ApiError('no-domain-access-write', [concept.domain]);

    const commands: SqlCommand[] = [['set constraints all deferred;']];
    if (!concept.id.id) {
      const insertConcept = insertSql.concept(concept);
      concept = {
        ...concept,
        id: {
          id: insertConcept[1],
          type: String(insertConcept[2])
        }
      };
      commands.push(
        insertConcept,
        insertSql.user(user.name, user.email),
        insertSql.conceptHistory(concept.id, 'create', user.email)
      );
    } else {
      const currentVersion = await this.getConcept(
        concept.id.type,
        concept.id.id
      );
      if (currentVersion) {
        const eventSql = insertSql.conceptHistory(concept.id, 'edit', user.email);
        commands.push(
          insertSql.user(user.name, user.email),
          eventSql,
          insertSql.snapshot(eventSql[1], currentVersion, 1)
        );

        const deleteRemoved = [
          ...conceptItemDiff('labels', currentVersion, concept)
            .map(getItemId)
            .map(deleteSql.label),
          ...conceptItemDiff('geographicalExtends', currentVersion, concept)
            .map(getItemId)
            .map(deleteSql.geographicalExtend),
          ...conceptItemDiff('temporalExtends', currentVersion, concept)
            .map(getItemId)
            .map(deleteSql.temporalExtend),
          ...relationsDiff(currentVersion, concept).map(deleteSql.relation)
        ];
        commands.push(...deleteRemoved);

        if (currentVersion.domain !== concept.domain) {
          if (!user.groups.includes(currentVersion.domain))
            throw new ApiError('no-domain-access-write', [currentVersion.domain]);
          commands.push(
            insertSql.concept(concept),
            insertSql.conceptHistory(concept.id, 'change-domain', user.email, currentVersion.domain)
          );
        }

      } else {
        commands.push(
          insertSql.concept(concept),
          insertSql.user(user.name, user.email),
          insertSql.conceptHistory(concept.id, 'create', user.email)
        );
      }
    }
    const issues = validateConcept(concept);
    if (issues.length) throw new ApiError('invalid-data', issues);

    commands.push(
      ...(concept.labels ?? []).map((label) =>
        insertSql.label(concept.id, label)
      ),
      ...(concept.temporalExtends ?? []).map((te) =>
        insertSql.temporalExtend(concept.id, te)
      ),
      ...(concept.geographicalExtends ?? []).map((ge) =>
        insertSql.geographicalExtend(concept.id, ge)
      ),
      ...unpackRelationSets(concept.id, concept.relations ?? []).map((r) =>
        insertSql.relation(concept.id, r)
      )
    );

    // console.log(commands);

    await this.transaction(commands);

    // console.log(results);

    return concept.id;
  }

  async upcertDomain(domain: Domain): Promise<void> {
    const commands: SqlCommand[] = [['set constraints all deferred;']];
    commands.push(insertSql.domain(domain.id));
    if (domain.root) {
      commands.push(insertSql.domainRoot(domain.id, domain.root));
    } else {
      // TODO delete domainRoot in case
    }
    await this.transaction(commands);
  }

  async getDomain(domainId: string): Promise<Domain> {
    const res = await this.query(getDomainSql, [domainId]);
    if (res.rows.length < 1) throw new ApiError('not-found', ['domain', domainId]);
    const domain = res.rows[0]?.['node'];
    if (!isDomain(domain)) throw new ApiError('internal-server-error', ['could not fetch domain', domainId]);
    return domain;
  }

  async getDomains(): Promise<Domain[]> {
    const res = await this.query(getAllDomainsSql);
    const domains = res.rows.map(row => row?.['node']);
    let mistake = domains.find(row => !isDomain(row));
    if (mistake) throw new ApiError('internal-server-error', ['could not fetch domains', JSON.stringify(mistake)]);
    return domains;
  }
}
