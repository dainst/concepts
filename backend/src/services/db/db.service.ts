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
    const existsCond = (agg: string, where: string): string => `exists (
      select 1 from ${agg} where ${where} and concepts.id = ${agg}.concept_id and concepts.type = ${agg}.concept_type
    )`;
    let conditions= Object.entries(selector)
      .map(([cond, val]) => {
        switch (cond) {
          case 'q':
            return existsCond('labels', `label ilike '%${selector.q}%'`);
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
    const uniqueShard = selector.shards ?? [];
    if (selector.q) uniqueShard.push('labels');
    return [...new Set<SearchShard>(uniqueShard)];
  }

  private buildQuery(selector: ConceptSelector): string {
    const geoFn = settings.geoExportFormat === 'WKT' ? 'ST_AsText' : 'ST_AsGeoJSON';
    const shards = this.autoCompleteShards(selector);
    const select= [
      `concepts.id as id`,
      `concepts.type as type`,
      `concepts.domain_id as domain`,
      ...shards
    ];
    const shardJoinsMap: {[s in SearchShard]: string} = {
      geographical_extends: `left join lateral (
        select
          json_agg(json_build_object(
            'center', ${geoFn}(geographical_extends.center),
            'shape', ${geoFn}(geographical_extends.shape),
            'certainty', certainty,
            'precision', precision
          )) as geographical_extends
        from geographical_extends
        where concepts.id = geographical_extends.concept_id and concepts.type = geographical_extends.concept_type
      ) on true`,
      labels: `left join lateral (
        select
          json_agg(json_build_object(
            'type', labels.type,
            'label', labels.label,
            'language', labels.language,
            'transliteration', labels.transliteration,
            'is_preferred', labels.is_preferred
          )) as labels
        from labels
        where concepts.id = labels.concept_id and concepts.type = labels.concept_type
      ) on true`,
      relations_to: `left join lateral (
        select
          json_agg(json_build_object(
            'predicate_id', relations.predicate_id,
            'predicate_type', relations.predicate_type,
            'object_id', relations.object_id,
            'object_type', relations.object_type
          )) as relations_to
        from relations
        where concepts.id = relations.subject_id and concepts.type = relations.subject_type
      ) on true`,
      temporal_extends: `left join lateral (
        select
          json_agg(json_build_object(
            'start_min', temporal_extends.start_min,
            'start_max', temporal_extends.start_max,
            'end_min', temporal_extends.end_min,
            'end_max', temporal_extends.end_max,
            'start_precision', temporal_extends.start_precision,
            'end_precision', temporal_extends.end_precision,
            'start_certainty', temporal_extends.start_certainty,
            'end_certainty', temporal_extends.end_certainty
          )) as temporal_extends
        from temporal_extends
        where concepts.id = temporal_extends.concept_id and concepts.type = temporal_extends.concept_type
      ) on true`
    };

    return `select
      ${(select).join(`,\n\t\t`)}
    from concepts
      ${(shards).map((s: SearchShard) => shardJoinsMap[s]).join(`\n\t\t\t`)}
    ${this.buildWhere(selector)}
    limit ${selector.limit ?? 10}
    offset ${selector.offset ?? 0}`;
  }

  async getConcept(type: string, id: string): Promise<Concept> {
    const conceptRows = await this.queryConcepts({
      type,
      id,
      limit: 1,
      offset: 0,
      shards: ['labels', 'relations_to', 'geographical_extends', 'temporal_extends']
    });

    if (!conceptRows.length) throw new ApiError('not-found', ['concept', type, id]);

    return convertRow(settings)(conceptRows[0]);
  }

  async search(selector: ConceptSelector): Promise<SearchResult> {
    const results: Concept[] = (await this.queryConcepts(selector))
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
