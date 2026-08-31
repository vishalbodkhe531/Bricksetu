import { Pool, QueryResult, QueryResultRow } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function getPool(): Pool {
  const connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'bricksetu',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };

  if (process.env.NODE_ENV === 'production') {
    const p = new Pool(connectionConfig);
    p.on('error', (err) => {
      console.error('[DB POOL IDLE CLIENT ERROR]', err?.message || err);
    });
    return p;
  }

  if (!globalThis.__pgPool) {
    const p = new Pool(connectionConfig);
    p.on('error', (err) => {
      console.error('[DB POOL IDLE CLIENT ERROR]', err?.message || err);
    });
    globalThis.__pgPool = p;
  }

  return globalThis.__pgPool;
}

export const pool = getPool();

export async function query<R extends QueryResultRow = any, I extends any[] = any[]>(
  text: string,
  params?: I
): Promise<QueryResult<R>> {
  const start = Date.now();
  try {
    const res = await pool.query<R>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 500) {
      console.warn(`[DB SLOW QUERY] ${duration}ms: ${text.slice(0, 100)}...`);
    }
    return res;
  } catch (err: any) {
    const errMsg =
      err?.message && typeof err.message === 'string'
        ? err.message
        : 'Database connection or query execution error';
    console.error('[DB QUERY ERROR]', { text: text.slice(0, 100), error: errMsg });
    throw new Error(errMsg);
  }
}
