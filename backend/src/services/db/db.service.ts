import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {Pool, PoolClient} from 'pg';
import {DBStatus} from 'common/interfaces/default';
import {Concept, ConceptAbstract} from 'common/interfaces/concept';
import {isConceptRow, isGeographicalExtendsRow, isLabelRow, isRelationRow} from '../../functions/rows.typeguards';
import {convertRow} from '../../functions/convert-row';
import {getPreferredLabels} from '../../functions/label';
import {ConceptSelector} from 'common/interfaces/select';
import {isById, isByQ} from '../../functions/selector.typeguards';
import {Settings} from 'common/interfaces/settings';
import {ConceptRow} from '../../interfaces/rows';
import {SearchQuery, SearchResult} from 'common/interfaces/search';

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

  constructor() {
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

  async query(sql: string, params?: any[]) {
    return this.pool.query(sql, params);
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

  private async queryConcepts(searchQuery: SearchQuery): Promise<ConceptRow[]> {
    let conditions= [];

    if (isById(searchQuery.selector)) conditions.push(`id = '${searchQuery.selector.id}' and type = '${searchQuery.selector.type}'`);
    if (isByQ(searchQuery.selector)) conditions.push('1 = 1'); // TODO implement

    const where =
      (conditions.length ? 'where ' : '')
      + conditions
        .map(e => `(${e})`)
        .join(' and ');
    const query = `select * from concepts ${where} limit ${searchQuery.limit ?? 10} offset ${searchQuery.offset ?? 0};`;
    console.log(query);

    const res = await this.query(query, []);
    return res.rows
      .filter(isConceptRow) // TODO should we raise error here maybe?
      .map(convertRow.concept);
  }

  private async queryConceptAbstract(id: ConceptRow): Promise<ConceptAbstract> {
    const resLabl = await this.query('select * from labels where concept_id = $1 and concept_type = $2;', [id.id, id.type]);
    const labels = resLabl
      .rows
      .filter(isLabelRow)
      .map(convertRow.label);
    const preferredLabels = getPreferredLabels(labels, settings);
    return {
      id,
      ...preferredLabels
    };
  }

  async search(query: SearchQuery): Promise<SearchResult> {
    const results = await this.getConceptAbstracts(query);
    const count = await this.getSearchResultCount(query.selector);
    return {
      ...query,
      results,
      count,
      warnings: []
    };
  }

  async getSearchResultCount(selector: ConceptSelector): Promise<number> {
    // TODO implement (with cache!)
    return 1000000;
  }

  async getConceptAbstracts(query: SearchQuery): Promise<ConceptAbstract[]> {
    const conceptRows = await this.queryConcepts(query);
    return Promise.all(conceptRows.map(this.queryConceptAbstract.bind(this)));
  }

  async getConcept(selector: ConceptSelector): Promise<Concept> {
    const conceptRows = await this.queryConcepts({selector, limit:1, offset: 0});
    if (conceptRows.length !== 1) throw new Error(`wrong result number: ${0}`);  // TODO error handling
    const id = conceptRows[0];
    const geoFn = settings.geoExportFormat === 'WKT' ? 'ST_AsText' : 'ST_AsGeoJSON';

    // TODO be more effective, use less queries
    const resRels = await this.query('select * from relations where subject_id = $1 and subject_type = $2;', [id.id, id.type]);
    const resLabl = await this.query('select * from labels where concept_id = $1 and concept_type = $2;', [id.id, id.type]);
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

    const relations = resRels
      .rows
      .filter(isRelationRow)
      .map(convertRow.relation);
    const labels = resLabl
      .rows
      .filter(isLabelRow)
      .map(convertRow.label);
    const geographicalExtends = resGeog
      .rows
      .filter(isGeographicalExtendsRow)
      .map(convertRow.geographicalExtend);

    const preferredLabels = getPreferredLabels(labels, settings);

    return {
      id,
      ...preferredLabels,
      relations,
      labels,
      geographicalExtends
    }
  }
}
