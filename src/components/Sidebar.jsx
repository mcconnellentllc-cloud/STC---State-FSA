import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', icon: '\u25A3' },
  { to: '/journal', label: 'Journal', icon: '\u270E' },
  { to: '/documents', label: 'Documents', icon: '\u2750' },
  { to: '/expenses', label: 'Expenses', icon: '\u0024' },
  { to: '/search', label: 'Search', icon: '\u2315' },
  { to: '/settings', label: 'Settings', icon: '\u2699' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>PFA</h1>
        <div className="subtitle">Project Field Archive</div>
      </div>
      <nav>
        {links.map(({ to, label, icon }) => (
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
      </nav>
      {user && (
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-email">{user.email}</div>
          </div>
          <button className="btn btn-sm btn-secondary sidebar-signout" onClick={logout}>
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
