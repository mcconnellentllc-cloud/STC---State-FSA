import React, { useState, useEffect } from 'react';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ from: '', to: '', category: '', status: '' });
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], vendor: '', amount: '', category: '', description: '', status: 'pending' });

  const fetchExpenses = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.category) params.set('category', filters.category);
    if (filters.status) params.set('status', filters.status);
    const q = params.toString();

    Promise.all([
      fetch(`/api/expenses${q ? '?' + q : ''}`).then(r => r.json()),
      fetch(`/api/expenses/summary${q ? '?' + q : ''}`).then(r => r.json())
    ])
      .then(([exp, sum]) => { setExpenses(exp); setSummary(sum); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchExpenses(); }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) })
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ date: new Date().toISOString().split('T')[0], vendor: '', amount: '', category: '', description: '', status: 'pending' });
      fetchExpenses();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    fetchExpenses();
  };

  const handleExport = async (format) => {
    const params = new URLSearchParams();
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.category) params.set('category', filters.category);
    if (filters.status) params.set('status', filters.status);

    const res = await fetch('/api/expenses/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, ...Object.fromEntries(params) })
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense-report.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const categories = ['travel', 'meals', 'supplies', 'lodging', 'fuel', 'parking', 'other'];

  return (
    <div>
      <div className="page-header">
        <h2>Expenses</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => handleExport('xlsx')}>Export XLSX</button>
          <button className="btn btn-secondary" onClick={() => handleExport('pdf')}>Export PDF</button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Expense'}
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid-3" style={{ marginBottom: 16 }}>
          <div className="stat-card">
            <div className="stat-value">${(summary.grandTotal || 0).toFixed(2)}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{expenses.length}</div>
            <div className="stat-label">Expenses</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{summary.categories?.length || 0}</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>
      )}

      <div className="filter-bar">
        <div className="form-group">
          <label>From</label>
          <input type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} />
        </div>
        <div className="form-group">
          <label>To</label>
          <input type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h4 style={{ marginBottom: 12 }}>Add Expense</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Vendor</label>
                <input type="text" value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} placeholder="Vendor name" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Amount ($)</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
            </div>
            <button type="submit" className="btn btn-primary">Save Expense</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <h3>No expenses</h3>
          <p>Add your first expense or extract from a receipt.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Description</th>
                <th>Receipt</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id}>
                  <td>{exp.date}</td>
                  <td>{exp.vendor || '\u2014'}</td>
                  <td style={{ fontWeight: 600 }}>${(exp.amount || 0).toFixed(2)}</td>
                  <td>{exp.category || '\u2014'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.description || '\u2014'}</td>
                  <td>
                    {exp.receipt_name ? (
                      <a href={`/api/documents/${exp.document_id}/file`} style={{ color: 'var(--info)', fontSize: '0.8rem' }}>{exp.receipt_name}</a>
                    ) : '\u2014'}
                  </td>
                  <td><span className={`badge badge-${exp.status}`}>{exp.status}</span></td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(exp.id)}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
