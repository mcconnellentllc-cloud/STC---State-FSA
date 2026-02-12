import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApiFetch } from '../auth/apiFetch';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiFetch = useApiFetch();

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then(r => r.json())
      .then(setData)
      .catch(err => console.error('Dashboard error:', err))
      .finally(() => setLoading(false));
  }, [apiFetch]);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const d = data || { recentEntries: [], recentDocs: [], expenseSummary: { count: 0, total: 0 }, totals: { entries: 0, documents: 0, expenses: 0 } };

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{d.totals.entries}</div>
          <div className="stat-label">Journal Entries</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{d.totals.documents}</div>
          <div className="stat-label">Documents</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${(d.expenseSummary.total || 0).toFixed(2)}</div>
          <div className="stat-label">This Month&apos;s Expenses</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Entries</span>
            <Link to="/journal" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          {d.recentEntries.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No entries yet</p>
          ) : (
            d.recentEntries.map(e => (
              <div key={e.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <Link to={`/journal/${e.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
                  {e.title}
                </Link>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {e.date} {e.location ? `\u2022 ${e.location}` : ''}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Documents</span>
            <Link to="/documents" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          {d.recentDocs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No documents yet</p>
          ) : (
            d.recentDocs.map(doc => (
              <div key={doc.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <Link to="/documents" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  {doc.original_name}
                </Link>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {doc.file_type} \u2022 {doc.created_at}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
