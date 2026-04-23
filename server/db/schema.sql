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
);

CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  extracted_text TEXT,
  tags TEXT,
  entry_id INTEGER,
  teams_file_id TEXT,
  teams_drive_id TEXT,
  teams_channel TEXT,
  processed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (entry_id) REFERENCES entries(id)
);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  vendor TEXT,
  amount REAL NOT NULL,
  category TEXT,
  description TEXT,
  document_id INTEGER,
  entry_id INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (document_id) REFERENCES documents(id),
  FOREIGN KEY (entry_id) REFERENCES entries(id)
);

CREATE VIRTUAL TABLE IF NOT EXISTS entries_fts USING fts5(
  title, content_fts, tags, location, attendees,
  content='entries', content_rowid='id'
);

CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
  original_name, extracted_text, tags,
  content='documents', content_rowid='id'
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  display_name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login TEXT
);

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
);

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
);

CREATE TABLE IF NOT EXISTS clarification_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clarification_id INTEGER NOT NULL,
  answer_text TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  posted_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (clarification_id) REFERENCES clarifications(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- appeal_id is a string id (e.g. 'APPEAL-2-2026-3RLAMB') from the appeals seed,
-- not an FK to a numeric table. Active recusal = row with revoked_at IS NULL.
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
);
