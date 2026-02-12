import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'pfa.db');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const SCHEMA_PATH = path.join(__dirname, '..', 'db', 'schema.sql');

let db = null;
let SQL = null;

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

export async function initDatabase() {
  ensureDirectories();
  SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Run schema
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  // Split by semicolons and run each statement — sql.js needs individual statements
  const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of statements) {
    try {
      db.run(stmt);
    } catch (err) {
      // FTS5 not available in sql.js default build — silently skip
      if (err.message.includes('fts5') || err.message.includes('no such module') || err.message.includes('already exists')) {
        // Expected — FTS not available, using LIKE fallback
      } else {
        console.error('Schema error:', err.message, '\nStatement:', stmt.substring(0, 80));
      }
    }
  }

  // Add teams_folder column if it doesn't exist (migration)
  try {
    db.run("ALTER TABLE documents ADD COLUMN teams_folder TEXT");
    saveDatabase();
  } catch (err) {
    // Column already exists — ignore
  }

  saveDatabase();
  console.log('Database initialized at', DB_PATH);

  // Auto-save periodically
  setInterval(saveDatabase, 30000);

  return db;
}

export function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

export function save() {
  saveDatabase();
}

// Helper: run a query and return all results as array of objects
export function all(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Helper: run a query and return first result as object
export function get(sql, params = []) {
  const results = all(sql, params);
  return results.length > 0 ? results[0] : null;
}

// Helper: run an insert/update/delete and return changes info
export function run(sql, params = []) {
  db.run(sql, params);
  const lastId = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0];
  const changes = db.getRowsModified();
  saveDatabase();
  return { lastInsertRowid: lastId, changes };
}

// FTS helpers — no-ops since sql.js default build lacks FTS5
// Search uses LIKE-based queries instead (see searchEntries/searchDocuments below)
export function syncEntryFts(id, entry) {}
export function deleteEntryFts(id) {}
export function syncDocumentFts(id, doc) {}
export function deleteDocumentFts(id) {}

// Search entries — uses LIKE since FTS5 isn't available in sql.js default build
export function searchEntries(query) {
  const terms = query.split(/\s+/).filter(Boolean);
  if (!terms.length) return all('SELECT * FROM entries ORDER BY date DESC');

  // Build WHERE clause matching all terms across any column
  const conditions = terms.map(() =>
    "(title LIKE ? OR content LIKE ? OR content_fts LIKE ? OR tags LIKE ? OR location LIKE ? OR attendees LIKE ?)"
  );
  const params = terms.flatMap(t => {
    const like = `%${t}%`;
    return [like, like, like, like, like, like];
  });

  return all(
    `SELECT * FROM entries WHERE ${conditions.join(' AND ')} ORDER BY date DESC`,
    params
  );
}

// Search documents — uses LIKE since FTS5 isn't available in sql.js default build
export function searchDocuments(query) {
  const terms = query.split(/\s+/).filter(Boolean);
  if (!terms.length) return all('SELECT * FROM documents ORDER BY created_at DESC');

  const conditions = terms.map(() =>
    "(original_name LIKE ? OR extracted_text LIKE ? OR tags LIKE ?)"
  );
  const params = terms.flatMap(t => {
    const like = `%${t}%`;
    return [like, like, like];
  });

  return all(
    `SELECT * FROM documents WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
    params
  );
}

export { DATA_DIR, DB_PATH, UPLOADS_DIR };
