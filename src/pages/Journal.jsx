import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EntryEditor from '../components/EntryEditor';

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEntries = (q = '') => {
    setLoading(true);
    const url = q ? `/api/entries?search=${encodeURIComponent(q)}` : '/api/entries';
    fetch(url)
      .then(r => r.json())
      .then(setEntries)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEntries(search);
  };

  const handleSave = async (data) => {
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      setShowEditor(false);
      fetchEntries();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Journal</h2>
        <button className="btn btn-primary" onClick={() => setShowEditor(true)}>+ New Entry</button>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search entries..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">Search</button>
      </form>

      {showEditor && (
        <div className="modal-overlay" onClick={() => setShowEditor(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Journal Entry</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowEditor(false)}>X</button>
            </div>
            <EntryEditor onSave={handleSave} onCancel={() => setShowEditor(false)} />
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <h3>No entries found</h3>
          <p>Create your first journal entry to get started.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Location</th>
                <th>Tags</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id} className="clickable-row" onClick={() => navigate(`/journal/${e.id}`)}>
                  <td>{e.date}</td>
                  <td style={{ fontWeight: 500 }}>{e.title}</td>
                  <td>{e.location || '\u2014'}</td>
                  <td>
                    {e.tags ? e.tags.split(',').map((t, i) => (
                      <span key={i} className="tag">{t.trim()}</span>
                    )) : '\u2014'}
                  </td>
                  <td>{e.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
