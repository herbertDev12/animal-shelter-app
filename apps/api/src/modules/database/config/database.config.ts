import * as dotenv from 'dotenv';
import * as path from 'path';

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../../../.env') });

import { Pool, PoolConfig } from 'pg';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export function createDatabasePool(): Pool {
  const config: PoolConfig = {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'animal_shelter',
  };

  return new Pool(config);
}

export async function connectToDatabase(): Promise<Pool> {
  const pool = createDatabasePool();

  try {
    const client = await pool.connect();
    console.log('✓ Database connected successfully');
    client.release();
  } catch (error) {
    console.error('✗ Failed to connect to database:', error);
    await pool.end();
    throw error;
  }

  return pool;
}
