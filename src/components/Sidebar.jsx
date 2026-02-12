import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '\u25A3' },
  { to: '/journal', label: 'Journal', icon: '\u270E' },
  { to: '/documents', label: 'Documents', icon: '\u2750' },
  { to: '/expenses', label: 'Expenses', icon: '\u0024' },
  { to: '/search', label: 'Search', icon: '\u2315' },
  { to: '/settings', label: 'Settings', icon: '\u2699' },
];

export default function Sidebar() {
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
    </aside>
  );
}
