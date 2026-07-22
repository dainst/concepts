import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {Pool, PoolClient, QueryResult, types} from 'pg';
import {DBStatus} from 'common/interfaces/default';
import {isConceptRow} from '../../functions/rows.typeguards';
import {CacheService} from '../cache/cache.service';
import {ApiError} from '../../classes/api-error';
import {ConceptRow} from '../../interfaces/rows';
import {convertRow} from '../../functions/convert-row';
import {Concept, ConceptAbstract} from 'common/interfaces/concept';
import {Settings} from 'common/interfaces/settings';
import {ConceptSelector, SearchResult, SearchShard} from 'common/interfaces/search';

const settings: Settings = {
  preferredLanguage: 'deu',
  preferTransliteration: false,
  geoExportFormat: 'GeoJSON',
}; // TODO extend by get parameters

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
    console.log(sql, params);

    if (!useCache) return this.pool.query(sql, params);

    const cached = this.cs.get('result', sql + params?.join());
    const result = cached.result;
    if (cached.result) console.log(`from cache ${cached.hash}, ${cached.storeCount}`);
    if (cached.result) return cached.result;

    const res =  await this.pool.query(sql, params);
    this.cs.store('result', sql + params?.join(), res, cached.hash);
    return res;
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  getStatus(): DBStatus {
    return this.status;
  }

  private async queryConcepts(selector: ConceptSelector): Promise<ConceptRow[]> {
    const query = this.buildQuery(selector);
    const res = await this.query(query, []);
    return res.rows
      .filter(isConceptRow); // TODO should we raise error here maybe?
  }

  async getSearchResultCount(selector: ConceptSelector): Promise<number> {
    const sql = `
      select
        count(*) as count
      from (
        select
          concept_id, concept_type from concepts
            left join labels on concepts.id = labels.concept_id and concepts.type = labels.concept_type
        ${this.buildWhere(selector)}
        group by concept_id, concept_type
      )`;
    return (await this.query(sql, [], true)).rows[0].count;
  }

  private buildWhere(selector: ConceptSelector): string {
    let conditions= Object.entries(selector)
      .map(([cond, val]) => {
        switch (cond) {
          case 'q':
            return `label ilike '%${selector.q}%'`;
          case 'id':
            return `concepts.id = '${selector.id}'`;
          case 'type':
            return `concepts.type = '${selector.type}'`;
          case 'domain':
            return `concepts.domain_id = '${selector.domain}'`;
          case 'limit':
          case 'offset':
          default:
            return undefined;
        }
      })
        .filter(a => !!a);
    return (conditions.length ? 'where ' : '')
      + conditions
        .map(e => `(${e})`)
        .join(' and ');
  }

  private autoCompleteShards = (selector: ConceptSelector): SearchShard[] => {
    const uniqueShard = new Set<SearchShard>(['base', ...(selector.shards ?? [])]);
    if (selector.q) uniqueShard.add('labels');
    return [...uniqueShard];
  }

  private buildQuery(selector: ConceptSelector): string {
    const geoFn = settings.geoExportFormat === 'WKT' ? 'ST_AsText' : 'ST_AsGeoJSON';
    const shardSelectMap: {[s in SearchShard]: string} = {
      base: `
        concepts.id as id,
        concepts.type as type,
        concepts.domain_id as domain`,
      geographical_extends: `
        json_agg(json_build_object(
          'center', ${geoFn}(geographical_extends.center),
          'shape', ${geoFn}(geographical_extends.shape)
        )) as geographical_extends,`,
      labels: `
        json_agg(json_build_object(
          'type', labels.type,
          'label', labels.label,
          'language', labels.language,
          'transliteration', labels.transliteration,
          'is_preferred', labels.is_preferred
        )) as labels`,
      relations: `
        json_agg(json_build_object(
          'predicate_id', relations.predicate_id,
          'predicate_type', relations.predicate_type,
          'object_id', relations.object_id,
          'object_type', relations.object_type
        )) as relationsFrom`,
      temporal_extends: `
        json_agg(json_build_object(
         'start_min', temporal_extends.start_min,
         'start_max', temporal_extends.start_max,
         'end_min', temporal_extends.end_min,
         'end_max', temporal_extends.end_max,
         'start_precision', temporal_extends.start_precision,
         'end_precision', temporal_extends.end_precision,
         'start_certainty', temporal_extends.start_certainty,
         'end_certainty', temporal_extends.end_certainty
        )) as temporal_extends`
    };
    const shardJoinsMap: {[s in SearchShard]: string} = {
      base: `-- never used`,
      geographical_extends: `left join geographical_extends on concepts.id = geographical_extends.concept_id and concepts.type = geographical_extends.concept_type`,
      labels: `left join labels on concepts.id = labels.concept_id and concepts.type = labels.concept_type`,
      relations: `left join relations on concepts.id = relations.subject_id and concepts.type = relations.subject_type`,
      temporal_extends: `left join temporal_extends on concepts.id = temporal_extends.concept_id and concepts.type = temporal_extends.concept_type`
    };
    const shards = this.autoCompleteShards(selector);
    return `select
      ${(shards).map((s: SearchShard) => shardSelectMap[s]).join(`,\n\t\t`)}
    from
      concepts
        ${(shards).filter(a => a !== 'base').map((s: SearchShard) => shardJoinsMap[s]).join(`,\n\t\t`)}
    ${this.buildWhere(selector)}
    group by
      concepts.id, concepts.type
    limit ${selector.limit ?? 10}
    offset ${selector.offset ?? 0}`;
  }

  async getConcept(type: string, id: string): Promise<Concept> {
    const conceptRows = await this.queryConcepts({
      type,
      id,
      limit: 1,
      offset: 0,
      shards: ['base', 'labels', 'relations', 'geographical_extends', 'temporal_extends']
    });

    if (!conceptRows.length) throw new ApiError('not-found', ['concept', type, id]);

    return convertRow(settings)(conceptRows[0]);
  }

  async search(selector: ConceptSelector): Promise<SearchResult> {
    const results: ConceptAbstract[] = (await this.queryConcepts(selector))
      .map(convertRow(settings));
    const count = await this.getSearchResultCount(selector);
    return {
      selector,
      results,
      count,
      warnings: []
    };
  }
}
