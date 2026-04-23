import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(DATA_DIR, 'uploads');
const SQLITE_PATH = process.env.SQLITE_PATH || path.join(DATA_DIR, 'pfa.db');

let sqliteDb = null;

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function initDatabase() {
  ensureDirectories();

  sqliteDb = new Database(SQLITE_PATH);
  sqliteDb.pragma('journal_mode = WAL');
  console.log('SQLite (better-sqlite3) loaded from', SQLITE_PATH);

  runSchemaSQLite();
  console.log('Database initialized');
  return sqliteDb;
}

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

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
      display_name TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login TEXT
    )
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS edits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      record_type TEXT NOT NULL,
      record_id TEXT NOT NULL,
      field_edited TEXT NOT NULL,
      content_before TEXT,
      content_after TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS clarifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appeal_id TEXT NOT NULL,
      question_text TEXT NOT NULL,
      author_id INTEGER NOT NULL,
      posted_at TEXT NOT NULL DEFAULT (datetime('now')),
      resolved INTEGER NOT NULL DEFAULT 0,
      resolved_at TEXT,
      locked INTEGER NOT NULL DEFAULT 0,
      locked_by INTEGER,
      locked_at TEXT,
      FOREIGN KEY (author_id) REFERENCES users(id),
      FOREIGN KEY (locked_by) REFERENCES users(id)
    )
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS clarification_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clarification_id INTEGER NOT NULL,
      answer_text TEXT NOT NULL,
      author_id INTEGER NOT NULL,
      posted_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (clarification_id) REFERENCES clarifications(id),
      FOREIGN KEY (author_id) REFERENCES users(id)
    )
  `);

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS appeal_recusals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appeal_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      reason TEXT,
      set_by INTEGER NOT NULL,
      set_at TEXT NOT NULL DEFAULT (datetime('now')),
      revoked_at TEXT,
      revoked_by INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (set_by) REFERENCES users(id),
      FOREIGN KEY (revoked_by) REFERENCES users(id)
    )
  `);

  // Ties SharePoint/Graph files (by their Graph item id) to one or more
  // appeals. Used to hide files from members who are recused from any of the
  // linked appeals. Admin UI for managing links ships in PR D.
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS document_recusal_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      graph_file_id TEXT NOT NULL,
      appeal_id TEXT NOT NULL,
      set_by INTEGER NOT NULL,
      set_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(graph_file_id, appeal_id),
      FOREIGN KEY (set_by) REFERENCES users(id)
    )
  `);

  seedUsersIfEmpty();
}

function seedUsersIfEmpty() {
  const row = sqliteDb.prepare('SELECT COUNT(*) as c FROM users').get();
  if (row.c > 0) return;

  const insert = sqliteDb.prepare(
    'INSERT INTO users (email, role, display_name, active) VALUES (?, ?, ?, 1)'
  );
  insert.run('kyle@togoag.com', 'admin', 'Kyle McConnell');
  insert.run('kyle.mcconnell@plantpioneer.com', 'member', 'Kyle McConnell (member)');
  console.log('Seeded users table: kyle@togoag.com (admin), kyle.mcconnell@plantpioneer.com (member)');
}

// ---- Unified query interface ----

export function getPool() {
  if (!sqliteDb) throw new Error('Database not initialized. Call initDatabase() first.');
  return sqliteDb;
}

export function isPostgres() {
  return false;
}

export async function all(sql, params = []) {
  const stmt = sqliteDb.prepare(sql);
  return stmt.all(...params);
}

export async function get(sql, params = []) {
  const stmt = sqliteDb.prepare(sql);
  return stmt.get(...params) || null;
}

export async function run(sql, params = []) {
  const stmt = sqliteDb.prepare(sql);
  const result = stmt.run(...params);
  return {
    lastInsertRowid: result.lastInsertRowid || null,
    changes: result.changes
  };
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
