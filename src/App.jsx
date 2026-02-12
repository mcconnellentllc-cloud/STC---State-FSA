import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import EntryDetail from './pages/EntryDetail';
import Documents from './pages/Documents';
import Expenses from './pages/Expenses';
import Search from './pages/Search';
import Settings from './pages/Settings';

export default function App() {
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
        </Routes>
      </main>
    </div>
  );
}
