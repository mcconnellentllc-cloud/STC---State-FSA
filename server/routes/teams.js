import { Router } from 'express';
import { testConnection } from '../services/graph.js';
import { getStatus, manualSync, startWatcher, stopWatcher } from '../services/teams-watcher.js';

const router = Router();

// GET /api/teams/status — sync status
router.get('/status', (req, res) => {
  try {
    const status = getStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teams/test — test Graph API connection
router.post('/test', async (req, res) => {
  try {
    const result = await testConnection();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teams/sync — trigger manual sync
router.post('/sync', async (req, res) => {
  try {
    const result = await manualSync();
    res.json({ message: 'Sync completed', ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teams/start — start watcher
router.post('/start', async (req, res) => {
  try {
    await startWatcher();
    res.json({ message: 'Watcher started', ...getStatus() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teams/stop — stop watcher
router.post('/stop', (req, res) => {
  try {
    stopWatcher();
    res.json({ message: 'Watcher stopped', ...getStatus() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
