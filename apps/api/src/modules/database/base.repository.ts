import { Pool, QueryResult, QueryResultRow } from 'pg';

export abstract class BaseRepository {
  constructor(protected pool: Pool) {}

  /**
   * Execute a query with parameterized values (prevents SQL injection)
   * @param query SQL query with $1, $2, etc. placeholders
   * @param values Array of values corresponding to placeholders
   */
  protected async execute<T extends QueryResultRow = QueryResultRow>(
    query: string,
    values: unknown[] = [],
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
  protected async query<T extends QueryResultRow = QueryResultRow>(
    query: string,
    values: unknown[] = [],
  ): Promise<T[]> {
    const result = await this.execute<T>(query, values);
    return result.rows;
  }

  /**
   * Execute a query and return single row
   */
  protected async queryOne<T extends QueryResultRow = QueryResultRow>(
    query: string,
    values: unknown[] = [],
  ): Promise<T | null> {
    const rows = await this.query<T>(query, values);
    return rows[0] || null;
  }

  /**
   * Execute a query and return count
   */
  protected async count(
    query: string,
    values: unknown[] = [],
  ): Promise<number> {
    const result = await this.queryOne<{ count: string }>(query, values);
    return result ? parseInt(result.count, 10) : 0;
  }

  /**
   * Generic create method
   */
  protected async create<T extends QueryResultRow = QueryResultRow>(
    tableName: string,
    data: Record<string, unknown>,
  ): Promise<T> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO "${tableName}" (${columns.map((c) => `"${c}"`).join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.queryOne<T>(query, values);
    if (!result) {
      throw new Error(`Failed to create record in ${tableName}`);
    }
    return result;
  }

  /**
   * Generic update method
   */
  protected async update<T extends QueryResultRow = QueryResultRow>(
    tableName: string,
    id: string | number,
    data: Record<string, unknown>,
    options: { idColumn?: string; timestampColumn?: string | null } = {},
  ): Promise<T> {
    const idColumn = options.idColumn || 'id';
    const timestampColumn =
      options.timestampColumn !== undefined
        ? options.timestampColumn
        : 'updated_at';

    const updates: string[] = [];
    const values: unknown[] = [id];
    let paramCount = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        paramCount++;
        updates.push(`"${key}" = $${paramCount}`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      const existing = await this.queryOne<T>(
        `SELECT * FROM "${tableName}" WHERE "${idColumn}" = $1`,
        [id],
      );
      if (!existing) throw new Error(`Record not found in ${tableName}`);
      return existing;
    }

    const query = `
      UPDATE "${tableName}"
      SET ${updates.join(', ')}${
        timestampColumn ? `, "${timestampColumn}" = NOW()` : ''
      }
      WHERE "${idColumn}" = $1
      RETURNING *
    `;

    const result = await this.queryOne<T>(query, values);
    if (!result) {
      throw new Error(`Record not found in ${tableName}`);
    }
    return result;
  }

  /**
   * Generic delete method
   */
  protected async delete(
    tableName: string,
    id: string | number,
    idColumn: string = 'id',
  ): Promise<boolean> {
    const query = `DELETE FROM "${tableName}" WHERE "${idColumn}" = $1`;
    const result = await this.execute(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
