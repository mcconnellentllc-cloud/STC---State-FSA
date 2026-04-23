import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { all } from '../services/database.js';
import { requireAppealAccess } from '../middleware/authorize.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APPEALS_SEED_PATH = path.join(__dirname, '..', '..', 'src', 'data', 'appeals_seed.json');

// Load + cache the appeals seed on first read. A process restart (which every
// deploy triggers) picks up data edits.
let appealsCache = null;
function loadAppeals() {
  if (appealsCache) return appealsCache;
  const raw = fs.readFileSync(APPEALS_SEED_PATH, 'utf8');
  appealsCache = JSON.parse(raw);
  return appealsCache;
}

async function activeRecusalsForUser(userId) {
  if (!userId) return new Set();
  const rows = await all(
    'SELECT appeal_id FROM appeal_recusals WHERE user_id = ? AND revoked_at IS NULL',
    [userId]
  );
  return new Set(rows.map(r => r.appeal_id));
}

const router = Router();

// GET /api/appeals — list. Admin sees all; members see all minus any appeals
// they have an active recusal on (revoked_at IS NULL in appeal_recusals).
router.get('/', async (req, res) => {
  try {
    const appeals = loadAppeals();
    if (req.user?.role === 'admin') {
      return res.json(appeals);
    }
    const recused = await activeRecusalsForUser(req.user?.id);
    res.json(appeals.filter(a => !recused.has(a.id)));
  } catch (err) {
    console.error('appeals list failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/appeals/:id — single appeal. requireAppealAccess returns 404 (not 403)
// if the current user is recused, so appeal existence is not leaked.
router.get('/:id', requireAppealAccess('id'), (req, res) => {
  try {
    const appeal = loadAppeals().find(a => a.id === req.params.id);
    if (!appeal) return res.status(404).json({ error: 'Not found' });
    res.json(appeal);
  } catch (err) {
    console.error('appeal detail failed:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
