import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {DatabaseError, Pool, PoolClient, QueryResult, types} from 'pg';
import {DBStatus} from 'common/interfaces/default';
import {CacheService} from '../cache/cache.service';
import {ApiError} from '../../classes/api-error';
import {ConceptRow} from '../../interfaces/concept-row';
import {convertConceptRow} from '../../functions/convert-concept-row';
import {Concept, ConceptId} from 'common/interfaces/concept';
import {Settings} from 'common/interfaces/settings';
import {ConceptSelector, SearchResult, SearchShard} from 'common/interfaces/search';
import {ConceptHistory} from 'common/interfaces/concept-history';
import {convertHistoryRow} from '../../functions/convert-history-row';
import {searchCountSql, searchSql} from '../../functions/search-sql';
import {getConceptHistorySql} from '../../functions/history-sql';
import {insertSql} from '../../functions/insert-sql';
import {SqlCommand} from '../../interfaces/sql';
import {deleteSql} from '../../functions/delete-sql';
import {validateConcept} from '../../functions/validate';
import {conceptItemDiff, getItemId} from '../../functions/concept';

const settings: Settings = {
  preferredLanguage: 'deu',
  preferTransliteration: false,
  geoExportFormat: 'GeoJSON',
  includeIds: true
}; // TODO extend by user settings

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool
  private status: DBStatus = {
    status: null,
    version: null
  };

  constructor(
    private readonly cs: CacheService
  ) {
    this.pool = new Pool({
      user: 'app_user',
      password: 'secret_password',
      host: 'localhost',
      port: 5432,
      database: 'app_db',
    }); // TODO from env
  }

  async onModuleInit() {
    try {
      types.setTypeParser(types.builtins.INT8, Number);
      await this.pool.connect();
      console.log('Connected');
      this.status = {
        status: 'online',
        version: null
      };
      const result = await this.pool.query("select * from meta where key = 'schema-version'");
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

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query(sql: string, params: any[] = [], useCache: boolean = false): Promise<QueryResult> {
    // console.log(sql, params);

    if (!useCache) return this.pool.query(sql, params);

    const cached = this.cs.get('result', sql + params?.join());
    if (cached.result) return cached.result;

    const res =  await this.pool.query(sql, params);
    this.cs.store('result', sql + params?.join(), res, cached.hash);
    return res;
  }

  async transaction(commands: SqlCommand[]): Promise<QueryResult[]> {
    const client = await this.pool.connect();

    let queryNr = 0;
    try {
      await client.query('BEGIN');
      const results = [];
      for (const command of commands) { // oldschool loop to keep it sync
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
        ]
          .map(String);
        throw new ApiError('db-transaction-error', params, (commands[queryNr] ?? ['']).slice(1));
      }
      throw e;
    } finally {
      client.release();
    }
  }

  getStatus(): DBStatus {
    return this.status;
  }

  private async queryConcepts(selector: ConceptSelector): Promise<ConceptRow[]> {
    const query = searchSql(selector, settings);
    const res = await this.query(query, [], selector.forceCache);
    const correctRows = res.rows
      // .filter(isConceptRow);
    if (correctRows.length < res.rows.length) throw new ApiError('internal-server-error', ['Not found']); // TODO better error
    return correctRows;
  }

  private async getSearchResultCount(selector: ConceptSelector, found: number): Promise<number> {
    if (!found) return 0;
    if (selector.limit && (found > selector.limit)) return NaN;
    if (selector.limit && (found < selector.limit)) return Number(selector.offset) + found;
    if (selector.id && selector.type) return found; // 0 or 1
    return this.getAvailableSearchResultCount(selector);
  }

  private async getAvailableSearchResultCount(selector: ConceptSelector): Promise<number> {
    const sql = searchCountSql(selector);
    return (await this.query(sql, [], true)).rows[0].count;
  }

  async getConcept(type: string, id: string): Promise<Concept|null> {
    const conceptRows = await this.queryConcepts({
      type,
      id,
      limit: 1,
      offset: 0,
      shards: ['labels', 'relations', 'geographical_extends', 'temporal_extends', 'title']
    });
    return conceptRows[0] ? convertConceptRow(conceptRows[0]) : null;
  }

  async search(selector: ConceptSelector): Promise<SearchResult> {
    const results: Concept[] = (await this.queryConcepts(selector))
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
    return (await this.query(getConceptHistorySql, [type, id]))
      .rows
      .map(convertHistoryRow)
  }

  async upcertConcept(concept: Concept) {
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
      commands.push(insertConcept, insertSql.conceptHistory(concept.id, 'create'))
    } else {
      const currentVersion = await this.getConcept(concept.id.type, concept.id.id);
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
          ... conceptItemDiff('geographicalExtends', currentVersion, concept)
            .map(getItemId)
            .map(deleteSql.geographicalExtend),
          ... conceptItemDiff('temporalExtends', currentVersion, concept)
            .map(getItemId)
            .map(deleteSql.temporalExtend)
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
      ...(concept.labels ?? [])
        .map(label => insertSql.label(concept.id, label))
    );

    commands.push(
      ...(concept.temporalExtends ?? [])
        .map(te => insertSql.temporalExtend(concept.id, te))
    );

    commands.push(
      ...(concept.geographicalExtends ?? [])
        .map(ge => insertSql.geographicalExtend(concept.id, ge))
    );

    console.log(commands);

    const results = await this.transaction(commands);

    console.log(results);

    return concept.id;
  }
}
