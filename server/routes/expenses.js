import { Router } from 'express';
import { all, get, run } from '../services/database.js';
import { generateExpenseXlsx, generateExpensePdf } from '../services/export.js';

const router = Router();

// GET /api/expenses — list with filters
router.get('/', async (req, res) => {
  try {
    const { from, to, category, status } = req.query;
    let sql = 'SELECT e.*, d.original_name as receipt_name FROM expenses e LEFT JOIN documents d ON e.document_id = d.id';
    const conditions = [];
    const params = [];

    if (from) {
      conditions.push('e.date >= ?');
      params.push(from);
    }
    if (to) {
      conditions.push('e.date <= ?');
      params.push(to);
    }
    if (category) {
      conditions.push('e.category = ?');
      params.push(category);
    }
    if (status) {
      conditions.push('e.status = ?');
      params.push(status);
    }

    if (conditions.length) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY e.date DESC';

    res.json(await all(sql, params));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/expenses/summary — totals by category
router.get('/summary', async (req, res) => {
  try {
    const { from, to } = req.query;
    let sql = 'SELECT category, SUM(amount) as total, COUNT(*) as count FROM expenses';
    const conditions = [];
    const params = [];

    if (from) {
      conditions.push('date >= ?');
      params.push(from);
    }
    if (to) {
      conditions.push('date <= ?');
      params.push(to);
    }

    if (conditions.length) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' GROUP BY category ORDER BY total DESC';

    const summary = await all(sql, params);
    const grandTotal = summary.reduce((sum, row) => sum + (row.total || 0), 0);

    res.json({ categories: summary, grandTotal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/expenses/:id
router.get('/:id', async (req, res) => {
  try {
    const expense = await get(
      'SELECT e.*, d.original_name as receipt_name FROM expenses e LEFT JOIN documents d ON e.document_id = d.id WHERE e.id = ?',
      [req.params.id]
    );
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses — create
router.post('/', async (req, res) => {
  try {
    const { date, vendor, amount, category, description, document_id, entry_id, status } = req.body;
    if (!date || amount === undefined) {
      return res.status(400).json({ error: 'Date and amount are required' });
    }

    const result = await run(
      `INSERT INTO expenses (date, vendor, amount, category, description, document_id, entry_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, vendor || null, amount, category || null, description || null, document_id || null, entry_id || null, status || 'pending']
    );

    const expense = await get('SELECT * FROM expenses WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/expenses/:id
router.put('/:id', async (req, res) => {
  try {
    const existing = await get('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Expense not found' });

    const { date, vendor, amount, category, description, document_id, entry_id, status } = req.body;

    await run(
      `UPDATE expenses SET date = ?, vendor = ?, amount = ?, category = ?, description = ?, document_id = ?, entry_id = ?, status = ?
       WHERE id = ?`,
      [
        date || existing.date,
        vendor !== undefined ? vendor : existing.vendor,
        amount !== undefined ? amount : existing.amount,
        category !== undefined ? category : existing.category,
        description !== undefined ? description : existing.description,
        document_id !== undefined ? document_id : existing.document_id,
        entry_id !== undefined ? entry_id : existing.entry_id,
        status || existing.status,
        req.params.id
      ]
    );

    const expense = await get('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const existing = await get('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Expense not found' });

    await run('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses/export — generate expense report
router.post('/export', async (req, res) => {
  try {
    const { format, from, to, category, status } = req.body;
    let sql = 'SELECT * FROM expenses';
    const conditions = [];
    const params = [];

    if (from) { conditions.push('date >= ?'); params.push(from); }
    if (to) { conditions.push('date <= ?'); params.push(to); }
    if (category) { conditions.push('category = ?'); params.push(category); }
    if (status) { conditions.push('status = ?'); params.push(status); }

    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY date ASC';

    const expenses = await all(sql, params);

    if (format === 'pdf') {
      const buffer = await generateExpensePdf(expenses);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=expense-report.pdf');
      res.send(buffer);
    } else {
      const buffer = generateExpenseXlsx(expenses);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=expense-report.xlsx');
      res.send(Buffer.from(buffer));
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
