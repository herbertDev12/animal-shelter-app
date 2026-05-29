import { Pool, QueryResult, QueryResultRow } from 'pg';

export abstract class BaseRepository {
  constructor(protected pool: Pool) {}

  /**
   * Execute a query with parameterized values (prevents SQL injection)
   * @param query SQL query with $1, $2, etc. placeholders
   * @param values Array of values corresponding to placeholders
   */
  protected async execute<T extends QueryResultRow = any>(
    query: string,
    values: any[] = [],
  ): Promise<QueryResult<T>> {
    try {
      return await this.pool.query<T>(query, values);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Execute a query and return rows
   */
  protected async query<T extends QueryResultRow = any>(
    query: string,
    values: any[] = [],
  ): Promise<T[]> {
    const result = await this.execute<T>(query, values);
    return result.rows;
  }

  /**
   * Execute a query and return single row
   */
  protected async queryOne<T extends QueryResultRow = any>(
    query: string,
    values: any[] = [],
  ): Promise<T | null> {
    const rows = await this.query<T>(query, values);
    return rows[0] || null;
  }

  /**
   * Execute a query and return count
   */
  protected async count(query: string, values: any[] = []): Promise<number> {
    const result = await this.queryOne<{ count: string }>(query, values);
    return result ? parseInt(result.count, 10) : 0;
  }
}
