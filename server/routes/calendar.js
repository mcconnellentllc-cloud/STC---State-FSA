import { Router } from 'express';
import { all, get, run } from '../services/database.js';

const router = Router();

// GET /api/calendar — list all notices, supports ?year=&month= filters
router.get('/', async (req, res) => {
  try {
    const { year, month } = req.query;
    let sql = 'SELECT * FROM calendar_notices';
    const conditions = [];
    const params = [];

    if (year && month) {
      // Filter by year-month prefix on date field (e.g. "2026-02")
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      conditions.push('date LIKE ?');
      params.push(`${prefix}%`);
    } else if (year) {
      conditions.push('date LIKE ?');
      params.push(`${year}%`);
    }

    if (conditions.length) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY date ASC, start_time ASC';

    res.json(await all(sql, params));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/calendar/:id — single notice
router.get('/:id', async (req, res) => {
  try {
    const notice = await get('SELECT * FROM calendar_notices WHERE id = ?', [req.params.id]);
    if (!notice) return res.status(404).json({ error: 'Notice not found' });
    res.json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/calendar — create notice
router.post('/', async (req, res) => {
  try {
    const { title, date, notice_type, location, description, all_day, start_time, end_time } = req.body;
    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required' });
    }

    const result = await run(
      `INSERT INTO calendar_notices (title, date, notice_type, location, description, all_day, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        date,
        notice_type || 'meeting',
        location || null,
        description || null,
        all_day !== false,
        start_time || null,
        end_time || null
      ]
    );

    const notice = await get('SELECT * FROM calendar_notices WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/calendar/:id — update notice
router.put('/:id', async (req, res) => {
  try {
    const existing = await get('SELECT * FROM calendar_notices WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Notice not found' });

    const { title, date, notice_type, location, description, all_day, start_time, end_time } = req.body;

    await run(
      `UPDATE calendar_notices SET title = ?, date = ?, notice_type = ?, location = ?, description = ?, all_day = ?, start_time = ?, end_time = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        title || existing.title,
        date || existing.date,
        notice_type !== undefined ? notice_type : existing.notice_type,
        location !== undefined ? location : existing.location,
        description !== undefined ? description : existing.description,
        all_day !== undefined ? all_day : existing.all_day,
        start_time !== undefined ? start_time : existing.start_time,
        end_time !== undefined ? end_time : existing.end_time,
        req.params.id
      ]
    );

    const notice = await get('SELECT * FROM calendar_notices WHERE id = ?', [req.params.id]);
    res.json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/calendar/:id — delete notice
router.delete('/:id', async (req, res) => {
  try {
    const existing = await get('SELECT * FROM calendar_notices WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Notice not found' });

    await run('DELETE FROM calendar_notices WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
