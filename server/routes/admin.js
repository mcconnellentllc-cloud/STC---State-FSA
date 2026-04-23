import { Router } from 'express';
import { all, get, run } from '../services/database.js';
import { requireAdmin } from '../middleware/authorize.js';

// All routes here require admin role. Mounted under requireAuth in index.js,
// then this router applies requireAdmin so members get 403 on every endpoint.
const router = Router();
router.use(requireAdmin);

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const isValidEmail = (s) => typeof s === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
const isValidRole = (r) => r === 'admin' || r === 'member';

/* ─────────────────────────────────────────────────────────────────────────────
   USERS
   ───────────────────────────────────────────────────────────────────────────── */

router.get('/users', async (req, res) => {
  try {
    const rows = await all(
      `SELECT id, email, role, display_name, active, created_at, last_login
         FROM users
        ORDER BY active DESC, role DESC, display_name`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/users', async (req, res) => {
  try {
    const email = (req.body?.email || '').trim().toLowerCase();
    const display_name = (req.body?.display_name || '').trim();
    const role = req.body?.role || 'member';
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Valid email required' });
    if (!display_name) return res.status(400).json({ error: 'Display name required' });
    if (!isValidRole(role)) return res.status(400).json({ error: 'Role must be admin or member' });

    const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ error: 'A user with this email already exists' });

    const result = await run(
      `INSERT INTO users (email, role, display_name, active) VALUES (?, ?, ?, 1)`,
      [email, role, display_name]
    );
    const created = await get(
      `SELECT id, email, role, display_name, active, created_at, last_login FROM users WHERE id = ?`,
      [result.lastInsertRowid]
    );
    res.status(201).json(created);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    const target = await get('SELECT id, email, role FROM users WHERE id = ?', [id]);
    if (!target) return res.status(404).json({ error: 'Not found' });

    const updates = {};
    if (typeof req.body?.active === 'boolean') updates.active = req.body.active ? 1 : 0;
    if (typeof req.body?.display_name === 'string' && req.body.display_name.trim()) {
      updates.display_name = req.body.display_name.trim();
    }
    if (req.body?.role && isValidRole(req.body.role)) updates.role = req.body.role;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updatable fields supplied' });
    }

    // Safety: cannot deactivate or demote yourself or any other admin if it
    // would leave zero active admins. Keeps the app from being locked out.
    if (updates.active === 0 || updates.role === 'member') {
      if (target.role === 'admin') {
        const otherAdmins = await get(
          `SELECT COUNT(*) as c FROM users WHERE role = 'admin' AND active = 1 AND id != ?`,
          [id]
        );
        if ((otherAdmins?.c || 0) === 0) {
          return res.status(409).json({
            error: 'Cannot deactivate or demote the last active admin',
          });
        }
      }
    }

    const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    await run(`UPDATE users SET ${setClauses} WHERE id = ?`, values);

    const updated = await get(
      `SELECT id, email, role, display_name, active, created_at, last_login FROM users WHERE id = ?`,
      [id]
    );
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ─────────────────────────────────────────────────────────────────────────────
   APPEAL RECUSALS
   ───────────────────────────────────────────────────────────────────────────── */

router.get('/appeal-recusals', async (req, res) => {
  try {
    const rows = await all(
      `SELECT ar.id, ar.appeal_id, ar.user_id, ar.reason, ar.set_at, ar.set_by,
              ar.revoked_at, ar.revoked_by,
              u.email AS user_email, u.display_name AS user_display_name
         FROM appeal_recusals ar
         LEFT JOIN users u ON u.id = ar.user_id
        ORDER BY ar.revoked_at IS NOT NULL, ar.set_at DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/appeal-recusals', async (req, res) => {
  try {
    const appeal_id = (req.body?.appeal_id || '').trim();
    const user_id = parseInt(req.body?.user_id, 10);
    const reason = (req.body?.reason || '').trim() || null;
    if (!appeal_id) return res.status(400).json({ error: 'appeal_id required' });
    if (!Number.isInteger(user_id)) return res.status(400).json({ error: 'user_id required' });

    const u = await get('SELECT id FROM users WHERE id = ? AND active = 1', [user_id]);
    if (!u) return res.status(400).json({ error: 'User not found or inactive' });

    // Prevent duplicate active recusal
    const existing = await get(
      `SELECT id FROM appeal_recusals
        WHERE appeal_id = ? AND user_id = ? AND revoked_at IS NULL`,
      [appeal_id, user_id]
    );
    if (existing) return res.status(409).json({ error: 'Active recusal already exists for this member on this appeal' });

    const result = await run(
      `INSERT INTO appeal_recusals (appeal_id, user_id, reason, set_by) VALUES (?, ?, ?, ?)`,
      [appeal_id, user_id, reason, req.user.id]
    );
    const row = await get(`SELECT * FROM appeal_recusals WHERE id = ?`, [result.lastInsertRowid]);
    res.status(201).json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/appeal-recusals/:id/revoke', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    const target = await get(`SELECT id, revoked_at FROM appeal_recusals WHERE id = ?`, [id]);
    if (!target) return res.status(404).json({ error: 'Not found' });
    if (target.revoked_at) return res.status(409).json({ error: 'Already revoked' });
    await run(
      `UPDATE appeal_recusals SET revoked_at = datetime('now'), revoked_by = ? WHERE id = ?`,
      [req.user.id, id]
    );
    const row = await get(`SELECT * FROM appeal_recusals WHERE id = ?`, [id]);
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ─────────────────────────────────────────────────────────────────────────────
   FOLDER RECUSALS  (folder_path is relative to MEMBER_DOCS_ROOT)
   ───────────────────────────────────────────────────────────────────────────── */

router.get('/folder-recusals', async (req, res) => {
  try {
    const rows = await all(
      `SELECT id, folder_path, appeal_id, set_by, set_at FROM folder_recusal_links ORDER BY set_at DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/folder-recusals', async (req, res) => {
  try {
    const folder_path = (req.body?.folder_path || '').trim().replace(/^\/+|\/+$/g, '');
    const appeal_id = (req.body?.appeal_id || '').trim();
    if (!folder_path) return res.status(400).json({ error: 'folder_path required (relative to Committee Shared)' });
    if (!appeal_id) return res.status(400).json({ error: 'appeal_id required' });

    const existing = await get(
      `SELECT id FROM folder_recusal_links WHERE folder_path = ? AND appeal_id = ?`,
      [folder_path, appeal_id]
    );
    if (existing) return res.status(409).json({ error: 'Link already exists' });

    const result = await run(
      `INSERT INTO folder_recusal_links (folder_path, appeal_id, set_by) VALUES (?, ?, ?)`,
      [folder_path, appeal_id, req.user.id]
    );
    const row = await get(`SELECT * FROM folder_recusal_links WHERE id = ?`, [result.lastInsertRowid]);
    res.status(201).json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/folder-recusals/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    const target = await get(`SELECT id FROM folder_recusal_links WHERE id = ?`, [id]);
    if (!target) return res.status(404).json({ error: 'Not found' });
    await run(`DELETE FROM folder_recusal_links WHERE id = ?`, [id]);
    res.json({ deleted: true, id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ─────────────────────────────────────────────────────────────────────────────
   APPEALS LIST (for dropdowns) — minimal projection so admin UI dropdowns can
   show "APPEAL-2-2026-3RLAMB — LDP — Washington" without re-fetching the full
   /api/appeals payload. Reuses the same JSON source.
   ───────────────────────────────────────────────────────────────────────────── */
router.get('/appeals-summary', async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const seedPath = path.join(__dirname, '..', '..', 'src', 'data', 'appeals_seed.json');
    const data = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    const summary = data.map(a => ({
      id: a.id,
      caseId: a.caseId,
      title: a.title,
      county: a.county,
      program: a.program,
      advisoryNotes: a.advisoryNotes || '',
    }));
    res.json(summary);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
