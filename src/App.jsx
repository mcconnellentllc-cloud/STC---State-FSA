import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import Sidebar from './components/Sidebar';

function AdminOnly({ children }) {
  const { isAdmin, profile } = useAuth();
  // While profile is still loading, don't flash the access-denied UI
  if (profile === null) return null;
  if (!isAdmin) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Access restricted</h2>
        <p style={{ color: 'var(--text-muted)' }}>This page is available to admin users only.</p>
      </div>
    );
  }
  return children;
}

import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import EntryDetail from './pages/EntryDetail';
import Documents from './pages/Documents';
import Expenses from './pages/Expenses';
import Search from './pages/Search';
import Settings from './pages/Settings';
import Meetings from './pages/Meetings';
import Contacts from './pages/Contacts';
import Ethics from './pages/Ethics';
import Issues from './pages/Issues';
import Summary from './pages/Summary';
import RobertsRules from './pages/RobertsRules';
import CostShareRates from './pages/CostShareRates';
import AppealsTraining from './pages/AppealsTraining';
import Appeals from './pages/Appeals';

function LoginScreen() {
  const { login, error } = useAuth();
  return (
    <div className="login-screen">
      <div className="login-card">
        <h1 className="login-title">Kyle McConnell</h1>
        <p className="login-subtitle">CO STC</p>
        <button className="btn btn-primary login-btn" onClick={login}>
          Sign in with Microsoft
        </button>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}

function AuthCallback() {
  return (
    <div className="loading">
      <div className="spinner" />
      <p style={{ marginTop: 12 }}>Completing sign-in...</p>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading" style={{ marginTop: '30vh' }}>
        <div className="spinner" />
        <p style={{ marginTop: 12 }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<LoginScreen />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:id" element={<EntryDetail />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/expenses" element={<AdminOnly><Expenses /></AdminOnly>} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/ethics" element={<AdminOnly><Ethics /></AdminOnly>} />
          <Route path="/roberts-rules" element={<RobertsRules />} />
          <Route path="/cost-share-rates" element={<CostShareRates />} />
          <Route path="/appeals-training" element={<AppealsTraining />} />
          <Route path="/appeals/*" element={<Appeals />} />
          <Route path="/appeals-tracker" element={<Navigate to="/appeals" replace />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<AdminOnly><Settings /></AdminOnly>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </main>
    </div>
  );
}
