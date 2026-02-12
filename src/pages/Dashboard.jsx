import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApiFetch } from '../auth/apiFetch';

const quickLinks = [
  { label: 'FSA Colorado', url: 'https://www.fsa.usda.gov/state-offices/colorado', icon: '\uD83C\uDFDB' },
  { label: 'FSA Programs', url: 'https://www.fsa.usda.gov/resources/programs', icon: '\uD83D\uDCCB' },
  { label: 'Find Local Office', url: 'https://www.farmers.gov/working-with-us/service-center-locator', icon: '\uD83D\uDCCD' },
  { label: 'CRP Info', url: 'https://www.fsa.usda.gov/resources/programs/conservation-programs/conservation-reserve-program', icon: '\uD83C\uDF3E' },
  { label: 'ELAP Info', url: 'https://www.fsa.usda.gov/resources/programs/emergency-assistance-livestock-honeybees-farm-raised-fish-elap', icon: '\uD83D\uDC02' },
  { label: 'Rangeland Analysis', url: 'https://rangelands.app', icon: '\uD83D\uDDFA' },
  { label: 'Drought Monitor', url: 'https://droughtmonitor.unl.edu/', icon: '\u2600' },
  { label: 'FSA Fact Sheets', url: 'https://www.fsa.usda.gov/tools/informational/fact-sheets', icon: '\uD83D\uDCC4' },
  { label: 'FSA Handbooks', url: 'https://www.fsa.usda.gov/news-events/laws-regulations/fsa-handbooks', icon: '\uD83D\uDCD6' },
  { label: 'NRCS Colorado', url: 'https://www.nrcs.usda.gov/conservation-basics/conservation-by-state/colorado', icon: '\uD83C\uDF31' },
  { label: 'USDA Box', url: 'https://usda.app.box.com', icon: '\uD83D\uDCC1' },
];

const committeeMembers = [
  { name: 'Donald Cleo Brown', role: 'Chair', location: 'Yuma' },
  { name: 'Darrell Mackey', role: 'Member', location: 'Springfield' },
  { name: 'Kyle Dean McConnell', role: 'Member', location: 'Haxtun' },
  { name: 'Joeseph Petrocco', role: 'Member', location: 'Thornton' },
  { name: 'Steve George Raftopoulos', role: 'Member', location: 'Craig' },
];

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
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="banner-subtitle">USDA Farm Service Agency</div>
        <h2>Colorado FSA State Committee &mdash; Project Field Archive</h2>
        <p>Meeting notes, documents, expenses, and resources for Colorado STC operations.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
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
          <div className="stat-label">This Month</div>
        </div>
        <Link to="/meetings" className="stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="stat-value" style={{ fontSize: '1.1rem', color: 'var(--success)' }}>Feb 10</div>
          <div className="stat-label">Last STC Meeting</div>
        </Link>
      </div>

      {/* Committee Quick Reference */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">State Committee Members</span>
          <Link to="/contacts" className="btn btn-sm btn-secondary">Full Directory</Link>
        </div>
        <div className="committee-quick-ref">
          {committeeMembers.map((m, i) => (
            <Link to="/contacts" key={i} className="committee-member-chip">
              <div>
                <div style={{ fontWeight: 600 }}>{m.name}</div>
                <div className="member-role">{m.role}</div>
                <div className="member-loc">{m.location}, CO</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">Quick Links &amp; Resources</span>
        </div>
        <div className="quick-links-grid">
          {quickLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="quick-link-card"
            >
              <span className="ql-icon">{link.icon}</span>
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
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
                <Link to={`/journal/${e.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
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
                <Link to="/documents" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
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
