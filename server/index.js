import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, all, get } from './services/database.js';
import { requireAuth } from './middleware/auth.js';
import { requireAdmin } from './middleware/authorize.js';
import entriesRouter from './routes/entries.js';
import documentsRouter from './routes/documents.js';
import expensesRouter from './routes/expenses.js';

import teamsRouter from './routes/teams.js';
import calendarRouter from './routes/calendar.js';
import issuesRouter from './routes/issues.js';
import nctRouter from './routes/nct.js';
import appealsRouter from './routes/appeals.js';
import adminRouter from './routes/admin.js';
import observationsRouter from './routes/observations.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check — exempt from auth
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protect all /api/* routes with Microsoft Entra ID authentication
app.use('/api', requireAuth);

// Profile endpoint — returns the authenticated user's app-side profile so the
// client can gate admin-only UI without re-decoding the JWT.
app.get('/api/me', (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    display_name: req.user.display_name
  });
});

// API routes (all protected by auth middleware above)
app.use('/api/entries', entriesRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/expenses', requireAdmin, expensesRouter);

app.use('/api/teams', teamsRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/nct', nctRouter);
app.use('/api/appeals', appealsRouter);
app.use('/api/admin', adminRouter);  // requireAdmin applied inside the router
app.use('/api', observationsRouter);  // /api/appeals/:id/observations + /api/exhibits/...

// Dashboard stats. Expense data (even $0.00) is admin-only; members get a
// response with expenseSummary and totals.expenses omitted. Defense in depth —
// UI also hides the tile on the client.
app.get('/api/dashboard', async (req, res) => {
  try {
    const recentEntries = await all('SELECT id, title, date, location, tags FROM entries ORDER BY created_at DESC LIMIT 5');
    const recentDocs = await all('SELECT id, original_name, file_type, created_at FROM documents ORDER BY created_at DESC LIMIT 5');

    const isAdmin = req.user?.role === 'admin';

    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const expenseSummary = isAdmin
      ? await get(
          'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ?',
          [monthStart]
        )
      : null;

    const totalEntries = await get('SELECT COUNT(*) as count FROM entries');
    const totalDocs = await get('SELECT COUNT(*) as count FROM documents');
    const totalExpenses = isAdmin ? await get('SELECT COUNT(*) as count FROM expenses') : null;

    const payload = {
      recentEntries,
      recentDocs,
      totals: {
        entries: totalEntries?.count || 0,
        documents: totalDocs?.count || 0
      }
    };

    if (isAdmin) {
      payload.expenseSummary = expenseSummary || { count: 0, total: 0 };
      payload.totals.expenses = totalExpenses?.count || 0;
    }

    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve built frontend in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

// Prevent unhandled errors from crashing the server (e.g., Tesseract worker errors)
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection (non-fatal):', err?.message || err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception (non-fatal):', err?.message || err);
  // Don't exit — keep the server running
});

// Start
async function start() {
  try {
    await initDatabase();
    console.log('Database ready');

    app.listen(PORT, HOST, () => {
      console.log(`PFA server running at http://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();
