import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApiFetch } from '../auth/apiFetch';

export default function Search() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const apiFetch = useApiFetch();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await apiFetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ answer: 'Search failed. Please try again.', sources: { entries: [], documents: [] } });
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Search</h2>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.9rem' }}>
        Search across all journal entries, documents, and expenses using natural language. AI will synthesize an answer from your archive.
      </p>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Ask anything about your field archive..."
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
          <p style={{ marginTop: 12 }}>Searching your archive and generating response...</p>
        </div>
      )}

      {result && (
        <div style={{ marginTop: 24 }}>
          <div className="ai-section">
            <h4 style={{ color: 'var(--accent)', marginBottom: 8 }}>AI Response</h4>
            <div className="ai-response">{result.answer}</div>
          </div>

          {(result.sources?.entries?.length > 0 || result.sources?.documents?.length > 0) && (
            <div className="sources-list" style={{ marginTop: 16 }}>
              <h4>Sources</h4>
              {result.sources.entries?.map(e => (
                <Link key={`e-${e.id}`} to={`/journal/${e.id}`}>
                  Journal: {e.title} ({e.date})
                </Link>
              ))}
              {result.sources.documents?.map(d => (
                <a key={`d-${d.id}`} href={`/api/documents/${d.id}/file`}>
                  Document: {d.name} ({d.type})
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !result && (
        <div className="empty-state" style={{ marginTop: 60 }}>
          <h3>Ask a question</h3>
          <p>Try: "What meetings did I have in January?" or "Show me all travel expenses"</p>
        </div>
      )}
    </div>
  );
}
