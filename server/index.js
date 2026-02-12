import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, all, get } from './services/database.js';
import entriesRouter from './routes/entries.js';
import documentsRouter from './routes/documents.js';
import expensesRouter from './routes/expenses.js';
import aiRouter from './routes/ai.js';
import teamsRouter from './routes/teams.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API routes
app.use('/api/entries', entriesRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/teams', teamsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Dashboard stats
app.get('/api/dashboard', (req, res) => {
  try {
    const recentEntries = all('SELECT id, title, date, location, tags FROM entries ORDER BY created_at DESC LIMIT 5');
    const recentDocs = all('SELECT id, original_name, file_type, created_at FROM documents ORDER BY created_at DESC LIMIT 5');

    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const expenseSummary = get(
      'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ?',
      [monthStart]
    );

    const totalEntries = get('SELECT COUNT(*) as count FROM entries');
    const totalDocs = get('SELECT COUNT(*) as count FROM documents');
    const totalExpenses = get('SELECT COUNT(*) as count FROM expenses');

    res.json({
      recentEntries,
      recentDocs,
      expenseSummary: expenseSummary || { count: 0, total: 0 },
      totals: {
        entries: totalEntries?.count || 0,
        documents: totalDocs?.count || 0,
        expenses: totalExpenses?.count || 0
      }
    });
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

// Start
async function start() {
  try {
    await initDatabase();
    console.log('Database ready');

    app.listen(PORT, HOST, () => {
      console.log(`PFA server running at http://${HOST}:${PORT}`);
    });

    // Start Teams watcher AFTER server is listening (non-blocking)
    try {
      const { startWatcher } = await import('./services/teams-watcher.js');
      startWatcher(); // no await - runs in background
    } catch (err) {
      console.warn('Teams watcher not started:', err.message);
    }
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();