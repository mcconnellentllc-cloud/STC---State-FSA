import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { all, get, run, EXHIBITS_DIR } from '../services/database.js';
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

/* ─────────────────────────────────────────────────────────────────────────────
   FIELD OBSERVATIONS + PHOTO UPLOAD
   ───────────────────────────────────────────────────────────────────────────── */

// Multer storage helper: EXHIBITS_DIR/<appealId>/<tract>/<uuid>.<ext>
// Path components are sanitized to stay within the exhibits tree.
function exhibitStorageFor(appealId, tract) {
  const safeAppeal = String(appealId).replace(/[^A-Za-z0-9_-]/g, '_');
  const safeTract = String(tract || 'unassigned').replace(/[^A-Za-z0-9_-]/g, '_');
  const dir = path.join(EXHIBITS_DIR, safeAppeal, safeTract);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// List observations for an appeal (admin view, no recusal filter)
router.get('/observations', async (req, res) => {
  try {
    const appealId = req.query.appeal_id;
    const sql = appealId
      ? `SELECT * FROM field_observations WHERE appeal_id = ? ORDER BY visit_date ASC, id ASC`
      : `SELECT * FROM field_observations ORDER BY appeal_id, visit_date ASC, id ASC`;
    const rows = await all(sql, appealId ? [appealId] : []);
    for (const o of rows) {
      o.photos = await all(
        `SELECT id, label, description, file_path, cattle_count, annotations,
                is_marker_card, notes, uploaded_at
           FROM field_observation_photos WHERE observation_id = ? ORDER BY id ASC`,
        [o.id]
      );
    }
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/observations', async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.appeal_id) return res.status(400).json({ error: 'appeal_id required' });
    const result = await run(
      `INSERT INTO field_observations
        (appeal_id, contract_id, tract, visit_date, cattle_count, planned_max,
         status, exhibit, source, stubble_condition, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.appeal_id, b.contract_id || null, b.tract || null, b.visit_date || null,
       b.cattle_count ?? null, b.planned_max ?? null, b.status || null,
       b.exhibit || null, b.source || null, b.stubble_condition || null,
       b.notes || null, req.user.id]
    );
    const row = await get(`SELECT * FROM field_observations WHERE id = ?`, [result.lastInsertRowid]);
    row.photos = [];
    res.status(201).json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/observations/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    const existing = await get(`SELECT id FROM field_observations WHERE id = ?`, [id]);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const b = req.body || {};
    const fields = ['contract_id','tract','visit_date','cattle_count','planned_max',
                    'status','exhibit','source','stubble_condition','notes'];
    const sets = []; const vals = [];
    for (const f of fields) if (f in b) { sets.push(`${f} = ?`); vals.push(b[f]); }
    if (!sets.length) return res.status(400).json({ error: 'No updatable fields' });
    vals.push(id);
    await run(`UPDATE field_observations SET ${sets.join(', ')} WHERE id = ?`, vals);
    const row = await get(`SELECT * FROM field_observations WHERE id = ?`, [id]);
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/observations/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    const photos = await all(`SELECT file_path FROM field_observation_photos WHERE observation_id = ?`, [id]);
    await run(`DELETE FROM field_observation_photos WHERE observation_id = ?`, [id]);
    await run(`DELETE FROM field_observations WHERE id = ?`, [id]);
    // Best-effort cleanup of files on disk (ignore errors if missing)
    for (const p of photos) {
      const full = path.join(EXHIBITS_DIR, p.file_path);
      try { if (fs.existsSync(full)) fs.unlinkSync(full); } catch (_) {}
    }
    res.json({ deleted: true, id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Photo upload — multer must know the destination before processing, but we
// need to read the observation to figure out the path. Do a lookup first in
// a middleware step, attach the resolved directory to the request, then let
// multer use that. Single-file or array upload.
async function resolveObsDir(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    const obs = await get(`SELECT id, appeal_id, tract FROM field_observations WHERE id = ?`, [id]);
    if (!obs) return res.status(404).json({ error: 'Observation not found' });
    req._obs = obs;
    req._obsDir = exhibitStorageFor(obs.appeal_id, obs.tract);
    next();
  } catch (err) { next(err); }
}

const dynamicUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, req._obsDir),
    filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`)
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error(`Only JPG/PNG allowed; got ${ext}`));
    cb(null, true);
  }
});

router.post('/observations/:id/photos',
  resolveObsDir,
  dynamicUpload.array('photos', 20),
  async (req, res) => {
    try {
      const obs = req._obs;
      const safeAppeal = String(obs.appeal_id).replace(/[^A-Za-z0-9_-]/g, '_');
      const safeTract = String(obs.tract || 'unassigned').replace(/[^A-Za-z0-9_-]/g, '_');
      const labels = Array.isArray(req.body.labels) ? req.body.labels : (req.body.labels ? [req.body.labels] : []);
      const descriptions = Array.isArray(req.body.descriptions) ? req.body.descriptions : (req.body.descriptions ? [req.body.descriptions] : []);

      const rows = [];
      for (let i = 0; i < (req.files || []).length; i++) {
        const f = req.files[i];
        // Store file_path relative to EXHIBITS_DIR so the serve route can
        // resolve it without knowing the absolute disk layout.
        const rel = `${safeAppeal}/${safeTract}/${f.filename}`;
        const result = await run(
          `INSERT INTO field_observation_photos
             (observation_id, label, description, file_path, uploaded_by)
           VALUES (?, ?, ?, ?, ?)`,
          [obs.id, labels[i] || null, descriptions[i] || null, rel, req.user.id]
        );
        rows.push(await get(`SELECT * FROM field_observation_photos WHERE id = ?`, [result.lastInsertRowid]));
      }
      res.status(201).json(rows);
    } catch (err) {
      // If multer threw (e.g. disallowed ext) it surfaces here
      res.status(400).json({ error: err.message });
    }
  }
);

router.delete('/observation-photos/:photoId', async (req, res) => {
  try {
    const id = parseInt(req.params.photoId, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    const p = await get(`SELECT file_path FROM field_observation_photos WHERE id = ?`, [id]);
    if (!p) return res.status(404).json({ error: 'Not found' });
    await run(`DELETE FROM field_observation_photos WHERE id = ?`, [id]);
    const full = path.join(EXHIBITS_DIR, p.file_path);
    try { if (fs.existsSync(full)) fs.unlinkSync(full); } catch (_) {}
    res.json({ deleted: true, id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
