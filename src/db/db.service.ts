import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {Pool, PoolClient} from 'pg';
import {DBStatus} from 'common/interfaces/default';
import {Concept} from 'common/interfaces/concept';
import {isLabelRow, isRelationRow} from '../functions/typeguards';
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
    const res = await this.query('select * from concepts limit 1;', []);
    if (!res.rowCount) throw new Error("No result"); // TODO error handling
    const conceptRow = res.rows[0];
    const res2 = await this.query(
      'select * from relations where subjectid = $1 and subjecttype = $2;', // TODO more effective, less queries
      [
        conceptRow.id,
        conceptRow.type
      ]
    );
    const relations = res2
      .rows
      .filter(isRelationRow) // !!
      .map(convertRow.relation);

    const res3 = await this.query(
      'select * from labels where conceptid = $1 and concepttype = $2;', // TODO more effective, less queries
      [
        conceptRow.id,
        conceptRow.type
      ]
    );
    console.log(res3);
    const labels = res3
      .rows
      .filter(isLabelRow) // !!
      .map(convertRow.label);
    console.log(labels);

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
      labels
    }
  }
}
