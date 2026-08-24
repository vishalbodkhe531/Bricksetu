import { pool } from '../shared/db/pool.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding initial data...');
    const seedFile = path.resolve(__dirname, '../../db/migrations/0009_seed_data.sql');
    const sql = fs.readFileSync(seedFile, 'utf8');
    await client.query(sql);
    console.log('Seed data inserted successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
