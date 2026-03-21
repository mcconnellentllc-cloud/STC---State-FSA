import pg from 'pg';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const SQLITE_PATH = path.join(DATA_DIR, 'pfa.db');

let pool = null;
let sqliteDb = null;
let usingPostgres = false;

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function initDatabase() {
  ensureDirectories();

  const connectionString = process.env.DATABASE_URL;

  // Try PostgreSQL first
  if (connectionString) {
    try {
      pool = new pg.Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
      });

      const client = await pool.connect();
      try {
        await client.query('SELECT NOW()');
        console.log('PostgreSQL connected successfully');
      } finally {
        client.release();
      }

      usingPostgres = true;
      await runSchemaPostgres();
      console.log('PostgreSQL database initialized');
      return pool;
    } catch (err) {
      console.warn('PostgreSQL connection failed:', err.message);
      console.warn('Falling back to SQLite...');
      pool = null;
    }
  } else {
    console.warn('No DATABASE_URL set — using SQLite fallback');
  }

  // Fallback to better-sqlite3 (native C binding — much lower memory than sql.js WASM)
  sqliteDb = new Database(SQLITE_PATH);
  sqliteDb.pragma('journal_mode = WAL');
  console.log('SQLite (better-sqlite3) loaded from', SQLITE_PATH);

  usingPostgres = false;
  runSchemaSQLite();
  console.log('SQLite database initialized');
  return sqliteDb;
}

// ---- PostgreSQL schema ----
async function runSchemaPostgres() {
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

  try {
    await pool.query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS teams_folder TEXT`);
  } catch (err) {
    // Ignore if column already exists
  }

  await deduplicateAndApproveExpensesPg();
  await correctFeb2026ExpensesPg();
}

async function deduplicateAndApproveExpensesPg() {
  await pool.query(`
    DELETE FROM expenses
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM expenses
      GROUP BY date, vendor, amount, category, description
    )
  `);
  await pool.query(`UPDATE expenses SET status = 'approved' WHERE status = 'pending'`);
}

async function correctFeb2026ExpensesPg() {
  await pool.query(`
    UPDATE expenses
    SET amount = 258.10,
        description = '356 mi roundtrip @ $0.725/mi — Haxtun ↔ Denver'
    WHERE vendor = 'Mileage Reimbursement'
      AND category = 'mileage'
      AND date = '2026-02-09'
      AND amount < 200
  `);

  const meetingHours = await pool.query(`
    SELECT id FROM expenses
    WHERE vendor = 'STC Compensation' AND category = 'hours'
      AND date = '2026-02-10'
      AND description ILIKE '%meeting day%'
  `);
  if (meetingHours.rows.length === 0) {
    await pool.query(`
      INSERT INTO expenses (date, vendor, amount, category, description, status)
      VALUES ('2026-02-10', 'STC Compensation', 503.93, 'hours',
              '7.5h @ $67.19/hr (GS-14 Step 1 (Member), Denver) — Meeting Day', 'approved')
    `);
  }

  const perDiem = await pool.query(`
    SELECT id FROM expenses
    WHERE category = 'per-diem'
      AND date = '2026-02-10'
  `);
  if (perDiem.rows.length === 0) {
    await pool.query(`
      INSERT INTO expenses (date, vendor, amount, category, description, status)
      VALUES ('2026-02-10', 'Per Diem (M&IE)', 68.81, 'per-diem',
              'Denver rate $92/day, 75% partial = $69.00 — adjusted to $68.81', 'approved')
    `);
  }
}

// ---- SQLite schema ----
function runSchemaSQLite() {
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT,
      attendees TEXT,
      tags TEXT,
      content TEXT,
      content_fts TEXT,
      source TEXT DEFAULT 'manual',
      teams_message_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      processed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      vendor TEXT,
      amount REAL NOT NULL,
      category TEXT,
      description TEXT,
      document_id INTEGER REFERENCES documents(id),
      entry_id INTEGER REFERENCES entries(id),
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS calendar_notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      notice_type TEXT DEFAULT 'meeting',
      location TEXT,
      description TEXT,
      all_day INTEGER DEFAULT 1,
      start_time TEXT,
      end_time TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

// ---- Unified query interface ----

export function getPool() {
  if (usingPostgres) {
    if (!pool) throw new Error('Database not initialized. Call initDatabase() first.');
    return pool;
  }
  if (!sqliteDb) throw new Error('Database not initialized. Call initDatabase() first.');
  return sqliteDb;
}

export function isPostgres() {
  return usingPostgres;
}

// Helper: run a query and return all results as array of objects
export async function all(sql, params = []) {
  if (usingPostgres) {
    const pgSql = convertPlaceholders(sql);
    const result = await pool.query(pgSql, params);
    return result.rows;
  }
  // better-sqlite3: prepare + all
  const stmt = sqliteDb.prepare(sql);
  return stmt.all(...params);
}

// Helper: run a query and return first result as object
export async function get(sql, params = []) {
  if (usingPostgres) {
    const pgSql = convertPlaceholders(sql);
    const result = await pool.query(pgSql, params);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  // better-sqlite3: prepare + get
  const stmt = sqliteDb.prepare(sql);
  return stmt.get(...params) || null;
}

// Helper: run an insert/update/delete and return changes info
export async function run(sql, params = []) {
  if (usingPostgres) {
    const pgSql = convertPlaceholders(sql);
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
  // better-sqlite3: prepare + run (auto-persists to disk, no manual save needed)
  const stmt = sqliteDb.prepare(sql);
  const result = stmt.run(...params);
  return {
    lastInsertRowid: result.lastInsertRowid || null,
    changes: result.changes
  };
}

// Convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
function convertPlaceholders(sql) {
  let idx = 0;
  let converted = sql.replace(/\?/g, () => `$${++idx}`);
  converted = converted.replace(/datetime\('now'\)/gi, 'NOW()');
  converted = converted.replace(/last_insert_rowid\(\)/gi, 'lastval()');
  return converted;
}

// FTS helpers — kept as no-ops for compatibility
export async function syncEntryFts(id, entry) {}
export async function deleteEntryFts(id) {}
export async function syncDocumentFts(id, doc) {}
export async function deleteDocumentFts(id) {}

// Search entries
export async function searchEntries(query) {
  const terms = query.split(/\s+/).filter(Boolean);
  if (!terms.length) return all('SELECT * FROM entries ORDER BY date DESC');

  if (usingPostgres) {
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

  // SQLite — use LIKE (case-insensitive by default for ASCII)
  const conditions = [];
  const params = [];
  for (const term of terms) {
    conditions.push(
      `(title LIKE ? OR content LIKE ? OR content_fts LIKE ? OR tags LIKE ? OR location LIKE ? OR attendees LIKE ?)`
    );
    for (let i = 0; i < 6; i++) params.push(`%${term}%`);
  }
  return all(
    `SELECT * FROM entries WHERE ${conditions.join(' AND ')} ORDER BY date DESC`,
    params
  );
}

// Search documents
export async function searchDocuments(query) {
  const terms = query.split(/\s+/).filter(Boolean);
  if (!terms.length) return all('SELECT * FROM documents ORDER BY created_at DESC');

  if (usingPostgres) {
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

  // SQLite
  const conditions = [];
  const params = [];
  for (const term of terms) {
    conditions.push(
      `(original_name LIKE ? OR extracted_text LIKE ? OR tags LIKE ?)`
    );
    for (let i = 0; i < 3; i++) params.push(`%${term}%`);
  }
  return all(
    `SELECT * FROM documents WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
    params
  );
}

export { DATA_DIR, UPLOADS_DIR };
