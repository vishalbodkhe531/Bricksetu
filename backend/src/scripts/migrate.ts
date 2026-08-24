import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../shared/db/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('Starting DB Migration...');
    await client.query('BEGIN');

    // Migration tracker table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        version varchar(255) PRIMARY KEY,
        applied_at timestamptz DEFAULT clock_timestamp()
      );
    `);

    const migrationsDir = path.resolve(__dirname, '../../db/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const { rows } = await client.query('SELECT version FROM public.schema_migrations WHERE version = $1', [file]);
      if (rows.length === 0) {
        console.log(`Applying migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await client.query(sql);
        await client.query('INSERT INTO public.schema_migrations (version) VALUES ($1)', [file]);
      } else {
        console.log(`Skipping already applied migration: ${file}`);
      }
    }

    // Apply PL/pgSQL function files
    const functionsDir = path.resolve(__dirname, '../../db/functions');
    if (fs.existsSync(functionsDir)) {
      const functionFiles = fs.readdirSync(functionsDir).filter(f => f.endsWith('.sql'));
      for (const file of functionFiles) {
        console.log(`Applying function file: ${file}`);
        const sql = fs.readFileSync(path.join(functionsDir, file), 'utf8');
        await client.query(sql);
      }
    }

    await client.query('COMMIT');
    console.log('All DB Migrations & Functions applied successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
