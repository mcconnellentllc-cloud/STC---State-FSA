import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const mainLinks = [
  { to: '/', label: 'Dashboard', icon: '\u25A3' },
  { to: '/meetings', label: 'Meetings', icon: '\uD83D\uDCC5' },
  { to: '/journal', label: 'Journal', icon: '\u270E' },
  { to: '/documents', label: 'Documents', icon: '\uD83D\uDCC4' },
  { to: '/expenses', label: 'Expenses', icon: '\uD83D\uDCB2' },
];

const toolLinks = [
  { to: '/contacts', label: 'Committee & Contacts', icon: '\uD83D\uDC65' },
  { to: '/search', label: 'Search', icon: '\uD83D\uDD0D' },
  { to: '/settings', label: 'Settings', icon: '\u2699' },
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
        {toolLinks.map(({ to, label, icon }) => (
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
