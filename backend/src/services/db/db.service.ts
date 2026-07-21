import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {Pool, PoolClient, QueryResult} from 'pg';
import {DBStatus} from 'common/interfaces/default';
import {Concept, ConceptAbstract, RelationAbstractSets} from 'common/interfaces/concept';
import {
  isGeographicalExtendsRow,
  isTemporalExtendsRow,
  isLabelledConceptRow,
  isRelationRow
} from '../../functions/rows.typeguards';
import {convertRow} from '../../functions/convert-row';
import {getPreferredLabels} from '../../functions/label';
import {ConceptSelector} from 'common/interfaces/selector';
import {Settings} from 'common/interfaces/settings';
import {LabelledConceptRow, RelationRow} from '../../interfaces/rows';
import {SearchResult} from 'common/interfaces/search';
import {CacheService} from '../cache/cache.service';

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

  private async queryConcepts(selector: ConceptSelector): Promise<LabelledConceptRow[]> {
    const query = this.buildQuery(selector);
    const res = await this.query(query, []);
    return res.rows
      .filter(isLabelledConceptRow); // TODO should we raise error here maybe?
  }

  async search(selector: ConceptSelector): Promise<SearchResult> {
    const results: ConceptAbstract[] = (await this.queryConcepts(selector))
      .map(concept => ({
        id: {
          id: concept.id,
          type: concept.type,
        },
        ...getPreferredLabels(concept.labels, settings)
      }));
    const count = await this.getSearchResultCount(selector);
    return {
      selector,
      results,
      count,
      warnings: []
    };
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
            return `concept_id = '${selector.id}'`;
          case 'type':
            return `concept_type = '${selector.type}'`;
          case 'domain':
            return `scope_id = '${selector.domain}'`;
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

  private buildQuery(selector: ConceptSelector): string {
    return `
      select
        labels.concept_id as id,
        labels.concept_type as type,
        json_agg(json_build_object(
          'type', labels.type,
          'label', labels.label,
          'language', labels.language,
          'transliteration', labels.transliteration,
          'is_preferred', labels.is_preferred
        )) as labels
      from concepts
        left join labels on concepts.id = labels.concept_id and concepts.type = labels.concept_type
      ${this.buildWhere(selector)}
      group by concept_id, concept_type
      limit ${selector.limit ?? 10} offset ${selector.offset ?? 0}`;
  }

  async getConcept(selector: ConceptSelector): Promise<Concept> {
    const conceptRows = await this.queryConcepts({...selector, limit: 1, offset: 0});
    if (conceptRows.length !== 1) throw new Error(`wrong result number: ${0}`);
    const id = {
      id: conceptRows[0].id,
      type: conceptRows[0].type
    };
    const geoFn = settings.geoExportFormat === 'WKT' ? 'ST_AsText' : 'ST_AsGeoJSON';

    // TODO be more effective, use less queries
    const resRels = await this.query('select * from relations where subject_id = $1 and subject_type = $2;', [id.id, id.type]);
    const resGeog = await this.query(
      `select
        *,
        ${geoFn}(center) as center,
        ${geoFn}(shape) as shape
      from
        geographical_extends
      where
        concept_id = $1 and concept_type = $2;`,
      [id.id, id.type]
    );
    const resTemp = await this.query(
      `select * from temporal_extends where concept_id = $1 and concept_type = $2;`,
      [id.id, id.type]
    );

    const relations = resRels
      .rows
      .filter(isRelationRow)
      .reduce((rass: RelationAbstractSets, row: RelationRow) => {
        let rasIndex = rass.to
          .findIndex(r => (r.relation.id.id === row.predicate_id && r.relation.id.type === row.predicate_type));
        if (rasIndex === -1) {
          rasIndex = rass.to.push({
            relation: {
              id: {
                id: row.predicate_id,
                type: row.predicate_type,
              },
              title: `TODO: ${row.predicate_id}`
            },
            objects: []
          }) - 1;
        }
        rass.to[rasIndex].objects.push({
          id: {
            id: row.object_id,
            type: row.object_type
          },
          title: `TODO: ${row.object_id}`
        });
        return rass
      },
      {from: [], to: []}
    );

    const geographicalExtends = resGeog
      .rows
      .filter(isGeographicalExtendsRow)
      .map(convertRow.geographicalExtend);

    const temporalExtends = resTemp
      .rows
      .filter(isTemporalExtendsRow)
      .map(convertRow.temporalExtend);

    const labels = conceptRows[0].labels;
    const preferredLabels = getPreferredLabels(labels, settings);

    return {
      id,
      ...preferredLabels,
      labels,
      relations,
      ...(geographicalExtends.length && {geographicalExtends}), // TODO distinguish between is not geographical at all and has no coordinates
      ...(temporalExtends.length && {temporalExtends})  // TODO distinguish between is not temporal at all and has no coordinates
    }
  }
}
