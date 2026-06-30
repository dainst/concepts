import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {Pool, PoolClient} from 'pg';
import {DBStatus} from 'common/interfaces/default';
import {Concept} from 'common/interfaces/concept';
import {isGeographicalExtendsRow, isLabelRow, isRelationRow} from '../functions/typeguards';
import {convertRow} from '../functions/convert-row';
import {getPreferredLabels} from '../functions/label';

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

  async getConcept(): Promise<Concept> {
    const res = await this.query("select * from concepts where id = '2052587' limit 1;", []);
    if (!res.rowCount) throw new Error("No result"); // TODO error handling
    const conceptRow = res.rows[0];
    const id = [
      conceptRow.id,
      conceptRow.type
    ];

    // TODO be more effective, use less queries
    const resRels = await this.query('select * from relations where subject_id = $1 and subject_type = $2;', id);
    const resLabl = await this.query('select * from labels where concept_id = $1 and concept_type = $2;', id);
    const resGeog = await this.query('select * from geographical_extends where concept_id = $1 and concept_type = $2;', id);

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

    const preferredLabels = getPreferredLabels(labels, {
      preferredLanguage: 'deu',
      preferTransliteration: false
    });

    return {
      id: {
        id: conceptRow.id,
        type: conceptRow.type
      },
      ...preferredLabels,
      relations,
      labels,
      geographicalExtends
    }
  }
}
