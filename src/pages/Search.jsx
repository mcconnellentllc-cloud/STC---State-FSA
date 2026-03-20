import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApiFetch } from '../auth/apiFetch';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const apiFetch = useApiFetch();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);

    try {
      const params = new URLSearchParams({ q: query });
      const [entriesRes, docsRes] = await Promise.all([
        apiFetch(`/api/entries?${params}`),
        apiFetch(`/api/documents?search=${encodeURIComponent(query)}`)
      ]);
      const entries = await entriesRes.json();
      const documents = await docsRes.json();
      setResults({ entries: entries || [], documents: documents || [] });
    } catch (err) {
      setResults({ entries: [], documents: [], error: 'Search failed. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Search</h2>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.9rem' }}>
        Search across all journal entries and documents.
      </p>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search your field archive..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ fontSize: '1rem', padding: '12px 16px' }}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {loading && (
        <div className="loading" style={{ marginTop: 40 }}>
          <div className="spinner" />
          <p style={{ marginTop: 12 }}>Searching...</p>
        </div>
      )}

      {results && (
        <div style={{ marginTop: 24 }}>
          {results.error && (
            <div className="card" style={{ borderLeft: '4px solid var(--danger)', marginBottom: 16 }}>
              <p style={{ color: 'var(--danger)' }}>{results.error}</p>
            </div>
          )}

          {results.entries.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12 }}>Journal Entries ({results.entries.length})</h4>
              {results.entries.map(e => (
                <div key={e.id} className="card" style={{ marginBottom: 8, padding: '12px 16px' }}>
                  <Link to={`/journal/${e.id}`} style={{ color: 'var(--info)', fontWeight: 600, textDecoration: 'none' }}>
                    {e.title}
                  </Link>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {e.date}{e.location ? ` | ${e.location}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.documents.length > 0 && (
            <div>
              <h4 style={{ marginBottom: 12 }}>Documents ({results.documents.length})</h4>
              {results.documents.map(d => (
                <div key={d.id} className="card" style={{ marginBottom: 8, padding: '12px 16px' }}>
                  <a href={`/api/documents/${d.id}/file`} style={{ color: 'var(--info)', fontWeight: 600, textDecoration: 'none' }}>
                    {d.original_name}
                  </a>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {d.file_type}{d.teams_folder ? ` | ${d.teams_folder}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!results.error && results.entries.length === 0 && results.documents.length === 0 && (
            <div className="empty-state" style={{ marginTop: 40 }}>
              <h3>No results found</h3>
              <p>Try different search terms.</p>
            </div>
          )}
        </div>
      )}

      {!loading && !results && (
        <div className="empty-state" style={{ marginTop: 60 }}>
          <h3>Search your archive</h3>
          <p>Try: "meeting" or "travel expenses" or "field visit"</p>
        </div>
      )}
    </div>
  );
}
