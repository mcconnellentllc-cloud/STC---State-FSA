import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

let pool = null;

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function initDatabase() {
  ensureDirectories();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  // Test connection
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    console.log('PostgreSQL connected successfully');
  } finally {
    client.release();
  }

  // Run schema
  await runSchema();

  console.log('PostgreSQL database initialized');
  return pool;
}

async function runSchema() {
  // Create tables with PostgreSQL syntax
  await pool.query(`
    CREATE TABLE IF NOT EXISTS entries (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT,
      attendees TEXT,
      tags TEXT,
      content TEXT,
      content_fts TEXT,
      source TEXT DEFAULT 'manual',
      teams_message_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      extracted_text TEXT,
      tags TEXT,
      entry_id INTEGER REFERENCES entries(id),
      teams_file_id TEXT,
      teams_drive_id TEXT,
      teams_channel TEXT,
      teams_folder TEXT,
      processed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      vendor TEXT,
      amount REAL NOT NULL,
      category TEXT,
      description TEXT,
      document_id INTEGER REFERENCES documents(id),
      entry_id INTEGER REFERENCES entries(id),
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Calendar notices table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS calendar_notices (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      notice_type TEXT DEFAULT 'meeting',
      location TEXT,
      description TEXT,
      all_day BOOLEAN DEFAULT true,
      start_time TEXT,
      end_time TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Add teams_folder column if it doesn't exist (migration safety)
  try {
    await pool.query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS teams_folder TEXT`);
  } catch (err) {
    // Ignore if column already exists
  }
}

export function getPool() {
  if (!pool) throw new Error('Database not initialized. Call initDatabase() first.');
  return pool;
}

// Helper: run a query and return all results as array of objects
export async function all(sql, params = []) {
  const pgSql = convertPlaceholders(sql);
  const result = await pool.query(pgSql, params);
  return result.rows;
}

// Helper: run a query and return first result as object
export async function get(sql, params = []) {
  const results = await all(sql, params);
  return results.length > 0 ? results[0] : null;
}

// Helper: run an insert/update/delete and return changes info
export async function run(sql, params = []) {
  const pgSql = convertPlaceholders(sql);

  // For INSERT statements, add RETURNING id to get the last inserted id
  let finalSql = pgSql;
  if (/^\s*INSERT\s/i.test(pgSql) && !/RETURNING/i.test(pgSql)) {
    finalSql = pgSql + ' RETURNING id';
  }

  const result = await pool.query(finalSql, params);
  return {
    lastInsertRowid: result.rows?.[0]?.id || null,
    changes: result.rowCount
  };
}

// Convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
function convertPlaceholders(sql) {
  let idx = 0;
  let converted = sql.replace(/\?/g, () => `$${++idx}`);

  // Convert SQLite datetime('now') to PostgreSQL NOW()
  converted = converted.replace(/datetime\('now'\)/gi, 'NOW()');

  // Convert SQLite last_insert_rowid() — not needed with RETURNING
  converted = converted.replace(/last_insert_rowid\(\)/gi, 'lastval()');

  return converted;
}

// FTS helpers — PostgreSQL has native full-text search but we keep LIKE for simplicity
export async function syncEntryFts(id, entry) {}
export async function deleteEntryFts(id) {}
export async function syncDocumentFts(id, doc) {}
export async function deleteDocumentFts(id) {}

// Search entries — uses ILIKE for case-insensitive search
export async function searchEntries(query) {
  const terms = query.split(/\s+/).filter(Boolean);
  if (!terms.length) return all('SELECT * FROM entries ORDER BY date DESC');

  const conditions = [];
  const params = [];
  let idx = 0;

  for (const term of terms) {
    idx++;
    const p = `$${idx}`;
    conditions.push(
      `(title ILIKE ${p} OR content ILIKE ${p} OR content_fts ILIKE ${p} OR tags ILIKE ${p} OR location ILIKE ${p} OR attendees ILIKE ${p})`
    );
    params.push(`%${term}%`);
  }

  const result = await pool.query(
    `SELECT * FROM entries WHERE ${conditions.join(' AND ')} ORDER BY date DESC`,
    params
  );
  return result.rows;
}

// Search documents — uses ILIKE for case-insensitive search
export async function searchDocuments(query) {
  const terms = query.split(/\s+/).filter(Boolean);
  if (!terms.length) return all('SELECT * FROM documents ORDER BY created_at DESC');

  const conditions = [];
  const params = [];
  let idx = 0;

  for (const term of terms) {
    idx++;
    const p = `$${idx}`;
    conditions.push(
      `(original_name ILIKE ${p} OR extracted_text ILIKE ${p} OR tags ILIKE ${p})`
    );
    params.push(`%${term}%`);
  }

  const result = await pool.query(
    `SELECT * FROM documents WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
    params
  );
  return result.rows;
}

export { DATA_DIR, UPLOADS_DIR };
