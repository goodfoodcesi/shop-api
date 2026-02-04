import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schemas/index.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

const useSsl = process.env.DATABASE_SSL === "true";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});


pool.on('error', (err) => {
  console.error('PostgreSQL error:', err);
  process.exit(-1);
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    process.exit(1);
  }
  console.log('✅ PostgreSQL connected at', res.rows[0].now);
});

export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === 'development'
});

export { pool };

export async function closeDatabase() {
  await pool.end();
  console.log('🔌 Database connection closed');
}
