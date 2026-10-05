import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import meetingsRegistry from '../data/meetings_registry.json';

const memberLinks = [
  { to: '/', label: 'Dashboard', icon: '▣' },
  { to: '/summary', label: 'Meeting Agenda', icon: '📋' },
  { to: '/meetings', label: 'Meetings (Calendar)', icon: '📅' },
  { to: '/board-meetings', label: 'Board Meetings', icon: '🏛' },
  { to: '/board-meetings/2026-09-29/follow', label: 'Live Follow (Sept 29)', icon: '🎯' },
  { to: '/board-actions', label: 'Board Actions', icon: '✓' },
  { to: '/journal', label: 'Journal', icon: '✎' },
  { to: '/documents', label: 'Documents', icon: '📄' },
  { to: '/issues', label: 'County Issues', icon: '⚠' },
  { to: '/appeals', label: 'Appeals', icon: '⚖️' },
  { to: '/cure-lfp-tracker', label: 'Cure LFP Tracker', icon: '📂' },
  { to: '/cost-share-rates', label: 'Cost Share Rates', icon: '$' },
  { to: '/arc-plc', label: 'ARC / PLC', icon: '🌾' },
];

const adminMainLinks = [
  { to: '/expenses', label: 'Expenses', icon: '💲' },
];

const memberResourceLinks = [
  { to: '/contacts', label: 'Committee & Contacts', icon: '👥' },
  { to: '/appeals-training', label: 'Appeals Training', icon: '⚖' },
  { to: '/roberts-rules', label: 'Roberts Rules', icon: '§' },
  { to: '/search', label: 'Search', icon: '🔍' },
];

const adminResourceLinks = [
  { to: '/ethics', label: 'Ethics & OGE 450', icon: '📝' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Compact Year / Month picker for the sidebar. Reads meetings_registry
// directly so it stays in sync with whatever meetings are on file. When both
// dropdowns are set, matching meetings render as clickable rows underneath
// (multiple rows only when a month has more than one meeting, e.g. Feb 10/11).
function MeetingPicker() {
  const navigate = useNavigate();
  const meetings = useMemo(
    () => [...(meetingsRegistry?.meetings || [])].sort((a, b) => b.date.localeCompare(a.date)),
    []
  );

  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');

  const years = useMemo(() => {
    const s = new Set(meetings.map(m => m.date.slice(0, 4)));
    return [...s].sort((a, b) => b.localeCompare(a));
  }, [meetings]);

  const monthsForYear = useMemo(() => {
    const rows = year ? meetings.filter(m => m.date.startsWith(year + '-')) : meetings;
    const s = new Set(rows.map(m => m.date.slice(5, 7)));
    return [...s].sort((a, b) => b.localeCompare(a));
  }, [meetings, year]);

  useEffect(() => {
    if (month && !monthsForYear.includes(month)) setMonth('');
  }, [month, monthsForYear]);

  const matches = useMemo(() => {
    if (!year || !month) return [];
    return meetings.filter(m => m.date.startsWith(`${year}-${month}`));
  }, [meetings, year, month]);

  const selectStyle = {
    width: '100%',
    padding: '6px 8px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 4,
    color: 'inherit',
    fontSize: '0.82rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
    marginBottom: 6,
  };

  return (
    <div style={{ padding: '10px 14px 6px', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', margin: '6px 0' }}>
      <div style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 8 }}>
        Jump to Meeting
      </div>
      <select value={year} onChange={e => setYear(e.target.value)} style={selectStyle} aria-label="Year">
        <option value="">Year…</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <select
        value={month}
        onChange={e => setMonth(e.target.value)}
        style={{ ...selectStyle, opacity: monthsForYear.length ? 1 : 0.5 }}
        disabled={!monthsForYear.length}
        aria-label="Month"
      >
        <option value="">Month…</option>
        {monthsForYear.map(mm => (
          <option key={mm} value={mm}>{MONTH_NAMES[parseInt(mm, 10) - 1]}</option>
        ))}
      </select>
      {year && month && matches.length === 0 && (
        <div style={{ fontSize: '0.75rem', opacity: 0.6, padding: '4px 0' }}>No meeting</div>
      )}
      {matches.length === 1 && (
        <button
          onClick={() => { navigate(`/board-meetings/${matches[0].date}`); }}
          style={{
            width: '100%', textAlign: 'left', padding: '6px 8px',
            background: 'rgba(200,149,42,0.15)', border: '1px solid rgba(200,149,42,0.4)',
            borderRadius: 4, color: 'inherit', fontSize: '0.82rem', fontWeight: 600,
            cursor: 'pointer', marginTop: 2,
          }}
        >
          Open {matches[0].date}
        </button>
      )}
      {matches.length > 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 2 }}>
          {matches.map(m => (
            <button
              key={m.date}
              onClick={() => { navigate(`/board-meetings/${m.date}`); }}
              style={{
                textAlign: 'left', padding: '6px 8px',
                background: 'rgba(200,149,42,0.15)', border: '1px solid rgba(200,149,42,0.4)',
                borderRadius: 4, color: 'inherit', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Open {m.date}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { user, profile, isAdmin, logout } = useAuth();

  const mainLinks = isAdmin ? [...memberLinks, ...adminMainLinks] : memberLinks;
  const resourceLinks = isAdmin ? [...memberResourceLinks, ...adminResourceLinks] : memberResourceLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand-row">
          <div className="sidebar-usda-shield">USDA</div>
          <div className="sidebar-brand-text">
            <span className="usda-text">USDA</span>
            <span className="fsa-text">Farm Service Agency</span>
          </div>
        </div>
        <h1>PFA</h1>
        <div className="subtitle">Project Field Archive</div>
      </div>
      <nav>
        {mainLinks.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <span className="icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
        <MeetingPicker />
        <div className="sidebar-divider">Resources</div>
        {resourceLinks.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <span className="icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      {user && (
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{profile?.display_name || user.name}</div>
            <div className="sidebar-user-email">{user.email}</div>
            {profile?.role && (
              <div className="sidebar-user-role" style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {profile.role}
              </div>
            )}
          </div>
          <a
            href="https://myaccount.microsoft.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm sidebar-signout"
            style={{ display: 'block', textAlign: 'center', marginBottom: 6, textDecoration: 'none' }}
          >
            Manage Microsoft account
          </a>
          <button className="btn btn-sm sidebar-signout" onClick={logout}>
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
