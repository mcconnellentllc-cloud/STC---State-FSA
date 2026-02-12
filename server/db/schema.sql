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
