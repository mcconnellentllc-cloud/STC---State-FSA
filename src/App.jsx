import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import EntryDetail from './pages/EntryDetail';
import Documents from './pages/Documents';
import Expenses from './pages/Expenses';
import Search from './pages/Search';
import Settings from './pages/Settings';

function LoginScreen() {
  const { login, error } = useAuth();
  return (
    <div className="login-screen">
      <div className="login-card">
        <h1 className="login-title">PFA</h1>
        <p className="login-subtitle">Project Field Archive</p>
        <p className="login-desc">FSA State Committee field notes, documents, and expenses</p>
        <button className="btn btn-primary login-btn" onClick={login}>
          Sign in with Microsoft
        </button>
        {error && <p className="login-error">{error}</p>}
        <p className="login-note">Authorized users: kyle@togoag.com, brandi@togoag.com</p>
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
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:id" element={<EntryDetail />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </main>
    </div>
  );
}
