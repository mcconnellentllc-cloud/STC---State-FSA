import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { all, get } from '../services/database.js';
import { requireAppealAccess } from '../middleware/authorize.js';
import { EXHIBITS_DIR } from '../services/database.js';

const router = Router();

// GET /api/appeals/:appealId/observations — list all observations for an
// appeal, with photos nested. Gated by requireAppealAccess so a member
// recused from the appeal gets 404. Admin bypasses.
router.get('/appeals/:appealId/observations', requireAppealAccess('appealId'), async (req, res) => {
  try {
    const appealId = req.params.appealId;
    const obs = await all(
      `SELECT * FROM field_observations WHERE appeal_id = ? ORDER BY visit_date ASC, id ASC`,
      [appealId]
    );
    for (const o of obs) {
      o.photos = await all(
        `SELECT id, label, description, file_path, cattle_count, annotations,
                is_marker_card, notes, uploaded_at
           FROM field_observation_photos
          WHERE observation_id = ?
          ORDER BY id ASC`,
        [o.id]
      );
    }
    res.json(obs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/exhibits/:appealId/:tract/:filename — serve a specific photo.
// Goes through requireAuth (global) + this handler's requireAppealAccess on
// the URL appealId. Member recused from the appeal gets 404; otherwise the
// file is streamed from EXHIBITS_DIR.
router.get('/exhibits/:appealId/:tract/:filename',
  (req, res, next) => requireAppealAccess('appealId')(req, res, next),
  async (req, res) => {
    try {
      const { appealId, tract, filename } = req.params;
      // Defensive: disallow traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ error: 'Invalid filename' });
      }
      if (tract.includes('..') || tract.includes('/') || tract.includes('\\')) {
        return res.status(400).json({ error: 'Invalid tract segment' });
      }
      const filePath = path.join(EXHIBITS_DIR, appealId, tract, filename);
      if (!filePath.startsWith(EXHIBITS_DIR + path.sep)) {
        return res.status(400).json({ error: 'Invalid path' });
      }
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.sendFile(filePath);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
