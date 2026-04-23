import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const memberLinks = [
  { to: '/', label: 'Dashboard', icon: '▣' },
  { to: '/summary', label: 'Summary of Events', icon: '📋' },
  { to: '/meetings', label: 'Meetings', icon: '📅' },
  { to: '/journal', label: 'Journal', icon: '✎' },
  { to: '/documents', label: 'Documents', icon: '📄' },
  { to: '/issues', label: 'County Issues', icon: '⚠' },
  { to: '/appeals', label: 'Appeals', icon: '⚖️' },
  { to: '/cost-share-rates', label: 'Cost Share Rates', icon: '$' },
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
