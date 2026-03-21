import { Router } from 'express';
import { getAccessToken, getSiteId, getDriveId } from '../services/graph.js';
import fetch from 'node-fetch';

const router = Router();
const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';
const DATA_FILE = 'stc_issues.json';

// Seed data — December 4, 2025 session
const SEED_DATA = [
  { id: '2025-12-001', date: '2025-06-11', session: '2025-12', county: 'Moffat', program: 'CRP', issue_type: 'Admin Failure', severity: 'High', status: 'Pending DAFP', ced: 'Moffat County FSA Office', employee: 'Hunter Cleveland', description: 'CRP Contract 223B/C termination — systematic FSA procedural failures spanning 2013–2025', notes: 'Failed at every succession event: no revised CRP-1, no successor letters, no follow-up on Letters of Administration. No official termination letter until May 2025 — 11 months post-termination. State office compounded error Jan 2025. Equitable relief approved, forwarded to DAFP for reinstatement and final year payment.', district: 'Northwest', created_at: '2025-12-04T09:00:00.000Z', updated_at: '2025-12-04T09:00:00.000Z' },
  { id: '2025-12-002', date: '2025-08-19', session: '2025-12', county: 'Yuma', program: 'CRP', issue_type: 'Payment Waiver', severity: 'Medium', status: 'Resolved', ced: 'Yuma COC', employee: 'Hunter Cleveland', description: 'Unauthorized haying of 157.8 acres on CRP contract 11783A — wrong field hayed in error', notes: 'Both contract holder and responsible producer confirmed error. 100% waiver of $9,468 approved. Good faith confirmed.', district: 'Northeast', created_at: '2025-12-04T09:00:00.000Z', updated_at: '2025-12-04T09:00:00.000Z' },
  { id: '2025-12-003', date: '2025-12-04', session: '2025-12', county: 'Kit Carson', program: 'CRP', issue_type: 'Rate Dispute', severity: 'Low', status: 'Resolved', ced: 'State Office', employee: 'Hunter Cleveland', description: 'FY2026 alternative SRR Republican River CREP — provisional $173, approved alt $234/ac', notes: 'Contiguous county average (Yuma $262, Washington $205). Approved by Acting STC, forwarded to DAFP.', district: 'Northeast', created_at: '2025-12-04T09:00:00.000Z', updated_at: '2025-12-04T09:00:00.000Z' },
  { id: '2025-12-004', date: '2025-12-04', session: '2025-12', county: 'Lincoln', program: 'CRP', issue_type: 'Rate Dispute', severity: 'Low', status: 'Resolved', ced: 'State Office', employee: 'Hunter Cleveland', description: 'FY2026 alternative SRR Republican River CREP — provisional $161, approved alt $188/ac', notes: 'Contiguous county average (Cheyenne $170, Washington $205). Approved.', district: 'Southeast', created_at: '2025-12-04T09:00:00.000Z', updated_at: '2025-12-04T09:00:00.000Z' },
  { id: '2025-12-005', date: '2025-12-04', session: '2025-12', county: 'Alamosa', program: 'CRP', issue_type: 'Rate Dispute', severity: 'Medium', status: 'Open', ced: 'Alamosa COC', employee: 'Hunter Cleveland', description: 'DISCREPANCY: State-level $220 rate REJECTED (Item C), COC-level $250 APPROVED (Item D) — same county same session', notes: 'Critical inconsistency. State proposed $220 rejected, COC proposed $250 approved for same Alamosa County in same session. 12 leases, 4,200 acres, avg market $323/ac. Must reconcile before DAFP submission.', district: 'South Central', created_at: '2025-12-04T09:00:00.000Z', updated_at: '2025-12-04T09:00:00.000Z' },
  { id: '2025-12-006', date: '2025-05-09', session: '2025-12', county: 'Crowley', program: 'NAP', issue_type: 'Late Filing', severity: 'Medium', status: 'Monitoring', ced: 'Otero/Crowley FSA', employee: 'Janae Rader', description: 'Russell Groves — NAP CCC-471 filed 159 days late. Producer unaware coverage did not extend from Otero to inherited Crowley County ground.', notes: 'Programmatic relief approved at basic 50/55. Risk: NOLs started Jan 2025, application May 9 — disaster events pre-date coverage. Bent 32 NOLs, Crowley 12, Kiowa 6. Monitor for loss claims.', district: 'Southeast', created_at: '2025-12-04T09:00:00.000Z', updated_at: '2025-12-04T09:00:00.000Z' },
  { id: '2025-12-007', date: '2025-12-04', session: '2025-12', county: 'Statewide', program: 'NAP', issue_type: 'Admin Failure', severity: 'Low', status: 'Open', ced: 'State Office', employee: 'Janae Rader', description: 'Clerical error in Dec 2025 minutes — Honey NCT section recorded as Alfalfa', notes: 'Must be corrected before minutes are finalized and approved at Jan 2026 session.', district: 'Statewide', created_at: '2025-12-04T09:00:00.000Z', updated_at: '2025-12-04T09:00:00.000Z' },
];

/**
 * Get the OneDrive data folder path.
 * Uses SHAREPOINT_WATCH_FOLDER env var, placing data files in a /data/ subfolder.
 */
function getDataFolderPath() {
  const watchFolder = process.env.SHAREPOINT_WATCH_FOLDER || 'FSA - State Committee';
  return `${watchFolder}/data`;
}

/**
 * Read stc_issues.json from OneDrive. Returns array of issues.
 * If file does not exist, seeds with initial data and returns it.
 */
async function readIssues() {
  try {
    const token = await getAccessToken();
    const siteId = await getSiteId();
    const driveId = await getDriveId(siteId);
    const folderPath = getDataFolderPath();
    const encodedPath = folderPath.split('/').map(seg => encodeURIComponent(seg)).join('/');
    const encodedFile = encodeURIComponent(DATA_FILE);

    const url = `${GRAPH_BASE}/drives/${driveId}/root:/${encodedPath}/${encodedFile}:/content`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const text = await response.text();
      return JSON.parse(text);
    }

    // File not found — seed it
    if (response.status === 404) {
      await writeIssues(SEED_DATA);
      return [...SEED_DATA];
    }

    throw new Error(`Graph read error (${response.status})`);
  } catch (err) {
    // If Graph is unavailable for any reason, fall back to seed data in memory
    console.warn('Graph unavailable — using in-memory seed data:', err.message);
    return [...SEED_DATA];
  }
}

/**
 * Write issues array to stc_issues.json in OneDrive.
 */
async function writeIssues(issues) {
  const token = await getAccessToken();
  const siteId = await getSiteId();
  const driveId = await getDriveId(siteId);
  const folderPath = getDataFolderPath();
  const encodedPath = folderPath.split('/').map(seg => encodeURIComponent(seg)).join('/');
  const encodedFile = encodeURIComponent(DATA_FILE);

  const url = `${GRAPH_BASE}/drives/${driveId}/root:/${encodedPath}/${encodedFile}:/content`;
  const body = JSON.stringify(issues, null, 2);

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Graph write error (${response.status}): ${errText}`);
  }

  return response.json();
}

// GET /api/issues — list all issues
router.get('/', async (req, res) => {
  try {
    const issues = await readIssues();
    res.json(issues);
  } catch (err) {
    console.error('GET /api/issues error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/issues — create new issue
router.post('/', async (req, res) => {
  try {
    const issues = await readIssues();
    const now = new Date().toISOString();
    const newIssue = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: req.body.date || now.split('T')[0],
      session: req.body.session || '',
      county: req.body.county || '',
      program: req.body.program || 'Other',
      issue_type: req.body.issue_type || 'Other',
      severity: req.body.severity || 'Medium',
      status: req.body.status || 'Open',
      ced: req.body.ced || '',
      employee: req.body.employee || '',
      description: req.body.description || '',
      notes: req.body.notes || '',
      district: req.body.district || '',
      created_at: now,
      updated_at: now,
    };

    issues.push(newIssue);
    await writeIssues(issues);
    res.status(201).json(newIssue);
  } catch (err) {
    console.error('POST /api/issues error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/issues/:id — update issue
router.patch('/:id', async (req, res) => {
  try {
    const issues = await readIssues();
    const idx = issues.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Issue not found' });

    const updated = { ...issues[idx], ...req.body, id: issues[idx].id, updated_at: new Date().toISOString() };
    issues[idx] = updated;
    await writeIssues(issues);
    res.json(updated);
  } catch (err) {
    console.error('PATCH /api/issues error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/issues/:id — delete issue
router.delete('/:id', async (req, res) => {
  try {
    const issues = await readIssues();
    const filtered = issues.filter(i => i.id !== req.params.id);
    if (filtered.length === issues.length) return res.status(404).json({ error: 'Issue not found' });

    await writeIssues(filtered);
    res.json({ message: 'Issue deleted' });
  } catch (err) {
    console.error('DELETE /api/issues error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
