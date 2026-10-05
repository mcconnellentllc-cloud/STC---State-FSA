import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApiFetch } from '../auth/apiFetch';
import { useAuth } from '../auth/AuthContext';
import meetingsRegistry from '../data/meetings_registry.json';

/* ── Next-meeting prep + Sept 29 follow-up actions ──────────────── */
const UPCOMING_PREP_ITEMS = [
  { label: 'Otero/Crowley PP — producer responses', detail: 'Doug Andresen letter (10/1/26) sent to 36 producers requiring proof of water-expectation + any form of intent-to-plant. 30-day response window. STC to review returned documentation.', status: 'in-flight' },
  { label: 'CEY methodology adoption', detail: 'SED + Farm Program Chief directed to reconcile data-quality flags (Sugar Beet Yuma, Sorghum Montezuma, Onions Red Otero/Crowley/Fremont propagation error) + propose methodology for October adoption.', status: 'in-flight' },
  { label: 'Virtual fencing rate — Items 5a / 6a', detail: 'Awaiting Hunter Cleveland response on CO NRCS EQIP 645 2026 rate + preferred rate structure (per collar / per head / % of invoice).', status: 'in-flight' },
  { label: 'Cure LFP series — 6 Kit Carson applications', detail: 'Awaiting attorney Byrd brief and supporting documentation. See Cure LFP Tracker for per-application status.', status: 'blocker', link: '/cure-lfp-tracker' },
  { label: 'Prowers ARC/PLC 321 Adams Family', detail: 'Approved as walk-on 9/29 — October 2026 ARC/PLC payments can proceed.', status: 'done' },
];

/* ── Upcoming deadlines ────────────────────────────────────────── */
const DEADLINES = [];

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
  { label: 'USDA Box \u2014 STC Folder', url: 'https://usda.app.box.com', icon: '\uD83D\uDCC1' },
];

const committeeMembers = [
  { name: 'Donald Cleo Brown', role: 'Chair', location: 'Yuma' },
  { name: 'Darrell Mackey', role: 'Member', location: 'Springfield' },
  { name: 'Kyle Dean McConnell', role: 'Member', location: 'Haxtun' },
  { name: 'Joseph Petrocco', role: 'Member', location: 'Thornton' },
  { name: 'Steve George Raftopoulos', role: 'Member', location: 'Craig' },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiFetch = useApiFetch();
  const { isAdmin } = useAuth();

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

      {/* Next-meeting prep banner */}
      {(() => {
        const upcoming = (meetingsRegistry?.meetings || []).find(m => m.status === 'upcoming');
        if (!upcoming) return null;
        return (
          <div className="card" style={{
            marginBottom: 16, padding: '16px 20px',
            borderLeft: '4px solid var(--accent, #1a4a8a)',
            background: 'linear-gradient(135deg, var(--card-bg, #fff) 0%, rgba(26,74,138,0.04) 100%)',
          }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent, #1a4a8a)', letterSpacing: '0.08em', marginBottom: 6 }}>
              Next STC Meeting
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem' }}>{upcoming.title}</h3>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.6 }}>
              📍 {upcoming.location}{upcoming.sessions?.length ? ' · ' + upcoming.sessions.join(' / ') : ''}
            </div>
            {upcoming.note && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.03)', padding: '8px 12px', borderRadius: 4, lineHeight: 1.6, marginBottom: 10 }}>
                {upcoming.note}
              </div>
            )}
            {upcoming.indexFile ? (
              <Link to={`/board-meetings/${upcoming.date}`} className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>Open Meeting Agenda →</Link>
            ) : (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Agenda pending — index file not yet generated.</span>
            )}
          </div>
        );
      })()}

      {/* Sept 29 follow-up tracker */}
      <div className="card" style={{ marginBottom: 20, padding: '14px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
          <h4 style={{ margin: 0, fontSize: '0.98rem' }}>Sept 29 Follow-Up Actions</h4>
          <Link to="/board-meetings/2026-09-29" style={{ fontSize: '0.78rem', color: 'var(--accent, #1a4a8a)' }}>Sept 29 cliff notes →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {UPCOMING_PREP_ITEMS.map((item, i) => {
            const statusCfg = {
              'blocker':   { bg: 'rgba(220,53,69,0.08)',  color: '#b91c1c', label: 'BLOCKER'   },
              'in-flight': { bg: 'rgba(240,173,78,0.08)', color: '#d97706', label: 'IN FLIGHT' },
              'done':      { bg: 'rgba(21,128,61,0.08)',  color: '#15803d', label: 'DONE'      },
            }[item.status] || { bg: 'rgba(0,0,0,0.03)', color: '#64748b', label: item.status.toUpperCase() };
            const body = (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', color: statusCfg.color, background: statusCfg.bg, padding: '2px 6px', borderRadius: 3 }}>{statusCfg.label}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.label}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{item.detail}</div>
              </>
            );
            return item.link ? (
              <Link key={i} to={item.link} style={{ textDecoration: 'none', color: 'inherit', padding: '8px 12px', background: statusCfg.bg, borderRadius: 4, borderLeft: `3px solid ${statusCfg.color}` }}>{body}</Link>
            ) : (
              <div key={i} style={{ padding: '8px 12px', background: statusCfg.bg, borderRadius: 4, borderLeft: `3px solid ${statusCfg.color}` }}>{body}</div>
            );
          })}
        </div>
      </div>

      {/* Deadline alerts */}
      {DEADLINES.map((dl, i) => {
        const now = new Date();
        const due = new Date(dl.due + 'T23:59:59');
        const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        if (days < -30) return null; // hide old deadlines after 30 days
        const isOverdue = days < 0;
        const isUrgent = days <= 7 && !isOverdue;
        return (
          <Link key={i} to={dl.link} className="card" style={{
            display: 'block',
            marginBottom: 16,
            padding: '14px 20px',
            textDecoration: 'none',
            color: 'inherit',
            borderLeft: `4px solid ${isOverdue ? 'var(--danger)' : isUrgent ? 'var(--warning, #f0ad4e)' : 'var(--success)'}`,
            background: isOverdue ? 'rgba(220,53,69,0.06)' : isUrgent ? 'rgba(240,173,78,0.06)' : undefined,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 700 }}>{dl.label}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 12 }}>Due: {dl.due}</span>
              </div>
              <span style={{
                fontWeight: 700,
                fontSize: '0.88rem',
                color: isOverdue ? 'var(--danger)' : isUrgent ? 'var(--warning, #f0ad4e)' : 'var(--success)',
              }}>
                {isOverdue ? `OVERDUE (${Math.abs(days)}d)` : `${days} day(s) left`} &rarr;
              </span>
            </div>
          </Link>
        );
      })}

      {/* Quick Stats — expense tile is admin-only (financial data) */}
      <div className={isAdmin ? 'grid-4' : 'grid-3'} style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{d.totals.entries}</div>
          <div className="stat-label">Journal Entries</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{d.totals.documents}</div>
          <div className="stat-label">Documents</div>
        </div>
        {isAdmin && d.expenseSummary && (
          <div className="stat-card">
            <div className="stat-value">${(d.expenseSummary.total || 0).toFixed(2)}</div>
            <div className="stat-label">This Month</div>
          </div>
        )}
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
