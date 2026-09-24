import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {DatabaseError, Pool, QueryResult, QueryResultRow, types} from 'pg';
import {DBStatus} from 'common/interfaces/default';
import {CacheService} from '../cache/cache.service';
import {ApiError} from '../../classes/api-error';
import {ConceptRow} from '../../interfaces/concept-row';
import {convertConceptRow} from '../../functions/convert-concept-row';
import {Concept, ConceptId} from 'common/interfaces/concept';
import {Settings} from 'common/interfaces/settings';
import {ConceptSelector, SearchResult} from 'common/interfaces/search';
import {ConceptHistory} from 'common/interfaces/concept-history';
import {convertHistoryRow} from '../../functions/convert-history-row';
import {searchCountSql, searchSql} from '../../functions/search-sql';
import {getConceptHistorySql} from '../../functions/history-sql';
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

const settings: Settings = {
  preferredLanguage: 'deu',
  preferTransliteration: false,
  geoExportFormat: 'GeoJSON',
  includeIds: true
}; // TODO extend by user settings

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;
  private status: DBStatus = {
    status: null,
    version: null
  };

  constructor(private readonly cs: CacheService) {
    this.pool = new Pool({
      user: 'app_user',
      password: 'secret_password',
      host: 'localhost',
      port: 5432,
      database: 'app_db'
    }); // TODO from env
  }

  async onModuleInit(): Promise<void> {
    try {
      types.setTypeParser(types.builtins.INT8, Number);
      await this.pool.connect();
      console.log('Connected');
      this.status = {
        status: 'online',
        version: null
      };
      const result = await this.pool.query<{ val: string }>(
        "select * from meta where key = 'schema-version'"
      );
      this.status = {
        status: 'online',
        version: result.rows[0]?.val || null
      };
    } catch (err) {
      console.error('Failed to connect:', err);
      // TODO retries...
      // TODO Error handling
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async query<T extends QueryResultRow>(
    sql: string,
    params: (string | number | boolean | null)[] = [],
    cacheId: CacheServiceStoreKey | null = null
  ): Promise<QueryResult<T>> {
    // console.log(sql);
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
    selector: ConceptSelector
  ): Promise<ConceptRow[]> {
    const query = searchSql(selector, settings);
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

  async getConcept(type: string, id: string): Promise<Concept | null> {
    const conceptRows = await this.queryConcepts({
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
      ]
    });
    return conceptRows[0] ? convertConceptRow(conceptRows[0]) : null;
  }

  async search(selector: ConceptSelector): Promise<SearchResult> {
    const results: Concept[] = (await this.queryConcepts(selector)).map(
      convertConceptRow
    );
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

  async upcertConcept(concept: Concept): Promise<ConceptId> {
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
        insertSql.conceptHistory(concept.id, 'create')
      );
    } else {
      const currentVersion = await this.getConcept(
        concept.id.type,
        concept.id.id
      );
      if (currentVersion) {
        const eventSql = insertSql.conceptHistory(concept.id, 'edit');
        commands.push(
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
      } else {
        commands.push(
          insertSql.concept(concept),
          insertSql.conceptHistory(concept.id, 'create')
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
}
