import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const mainLinks = [
  { to: '/', label: 'Dashboard', icon: '▣' },
  { to: '/summary', label: 'Summary of Events', icon: '📋' },
  { to: '/meetings', label: 'Meetings (Calendar)', icon: '📅' },
  { to: '/board-meetings', label: 'Board Meetings', icon: '🏛' },
  { to: '/board-actions', label: 'Board Actions', icon: '✓' },
  { to: '/journal', label: 'Journal', icon: '✎' },
  { to: '/documents', label: 'Documents', icon: '📄' },
  { to: '/expenses', label: 'Expenses', icon: '💲' },
  { to: '/issues', label: 'County Issues', icon: '⚠' },
  { to: '/appeals', label: 'Appeals', icon: '⚖️' },
  { to: '/cost-share-rates', label: 'Cost Share Rates', icon: '$' },
  { to: '/arc-plc', label: 'ARC / PLC', icon: '🌾' },
];

const toolLinks = [
  { to: '/contacts', label: 'Committee & Contacts', icon: '👥' },
  { to: '/ethics', label: 'Ethics & OGE 450', icon: '📝', external: true },
  { to: '/appeals-training', label: 'Appeals Training', icon: '⚖' },
  { to: '/roberts-rules', label: 'Roberts Rules', icon: '§' },
  { to: '/search', label: 'Search', icon: '🔍' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

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
        <div className="sidebar-divider">Resources</div>
        {toolLinks.map(({ to, label, icon, external }) => (
          external ? (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span className="icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span className="icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          )
        ))}
      </nav>
      {user && (
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-email">{user.email}</div>
          </div>
          <button className="btn btn-sm sidebar-signout" onClick={logout}>
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
