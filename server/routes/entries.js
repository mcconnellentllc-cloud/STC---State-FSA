import { Router } from 'express';
import { all, get, run, searchEntries, syncEntryFts, deleteEntryFts } from '../services/database.js';

const router = Router();

// GET /api/entries — list all, supports ?search= for FTS
router.get('/', (req, res) => {
  try {
    const { search } = req.query;
    let entries;
    if (search) {
      entries = searchEntries(search);
    } else {
      entries = all('SELECT * FROM entries ORDER BY date DESC, created_at DESC');
    }
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/entries/:id — single entry with linked documents and expenses
router.get('/:id', (req, res) => {
  try {
    const entry = get('SELECT * FROM entries WHERE id = ?', [req.params.id]);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    const documents = all('SELECT * FROM documents WHERE entry_id = ?', [req.params.id]);
    const expenses = all('SELECT * FROM expenses WHERE entry_id = ?', [req.params.id]);

    res.json({ ...entry, documents, expenses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/entries — create new entry
router.post('/', (req, res) => {
  try {
    const { title, date, location, attendees, tags, content, source } = req.body;
    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required' });
    }

    const contentFts = [title, content, tags, location, attendees].filter(Boolean).join(' ');

    const result = run(
      `INSERT INTO entries (title, date, location, attendees, tags, content, content_fts, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, date, location || null, attendees || null, tags || null, content || null, contentFts, source || 'manual']
    );

    const id = result.lastInsertRowid;
    syncEntryFts(id, { title, content_fts: contentFts, tags, location, attendees });

    const entry = get('SELECT * FROM entries WHERE id = ?', [id]);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/entries/:id — update entry
router.put('/:id', (req, res) => {
  try {
    const existing = get('SELECT * FROM entries WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Entry not found' });

    const { title, date, location, attendees, tags, content, source } = req.body;
    const contentFts = [title || existing.title, content || existing.content, tags || existing.tags, location || existing.location, attendees || existing.attendees].filter(Boolean).join(' ');

    run(
      `UPDATE entries SET title = ?, date = ?, location = ?, attendees = ?, tags = ?, content = ?, content_fts = ?, source = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        title || existing.title,
        date || existing.date,
        location !== undefined ? location : existing.location,
        attendees !== undefined ? attendees : existing.attendees,
        tags !== undefined ? tags : existing.tags,
        content !== undefined ? content : existing.content,
        contentFts,
        source || existing.source,
        req.params.id
      ]
    );

    syncEntryFts(req.params.id, {
      title: title || existing.title,
      content_fts: contentFts,
      tags: tags !== undefined ? tags : existing.tags,
      location: location !== undefined ? location : existing.location,
      attendees: attendees !== undefined ? attendees : existing.attendees
    });

    const entry = get('SELECT * FROM entries WHERE id = ?', [req.params.id]);
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/entries/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = get('SELECT * FROM entries WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Entry not found' });

    run('DELETE FROM entries WHERE id = ?', [req.params.id]);
    deleteEntryFts(req.params.id);

    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
