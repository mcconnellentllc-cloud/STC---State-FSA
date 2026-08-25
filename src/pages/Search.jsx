import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApiFetch } from '../auth/apiFetch';

// Fields on each appeal that get scanned for matches. redFlags/theGood/etc.
// are arrays of strings or objects — flattened to text below.
const APPEAL_TEXT_FIELDS = [
  'id', 'caseId', 'title', 'appellants', 'county', 'program', 'presenter',
  'status', 'issueSummary', 'fullText', 'advisoryNotes', 'voteRecorded',
];

function appealToSearchableText(a) {
  const parts = [];
  for (const k of APPEAL_TEXT_FIELDS) if (a[k]) parts.push(String(a[k]));
  for (const arr of ['theGood', 'theBad', 'commonSense']) {
    for (const s of (a[arr] || [])) parts.push(String(s));
  }
  for (const rf of (a.redFlags || [])) {
    parts.push(rf.type || ''); parts.push(rf.text || '');
  }
  for (const issue of (a.issues || [])) {
    parts.push(issue.question || ''); parts.push(issue.regulation || ''); parts.push(issue.analysis || '');
    for (const p of (issue.agencyPosition || [])) parts.push(p);
    for (const p of (issue.appellantPosition || [])) parts.push(p);
  }
  for (const opt of (a.resolutionOptions || [])) {
    parts.push(opt.label || ''); parts.push(opt.description || '');
  }
  return parts.join(' ').toLowerCase();
}

function snippet(text, q, width = 140) {
  if (!text || !q) return '';
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text.slice(0, width);
  const start = Math.max(0, i - Math.floor(width / 2));
  const end = Math.min(text.length, start + width);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appeals, setAppeals] = useState([]); // cached; recusal-filtered by server
  const apiFetch = useApiFetch();

  // Preload appeals on mount so appeals search is instant. Respects recusal
  // via the /api/appeals endpoint (members recused from an appeal don't
  // receive it here, so it cannot surface in search results either).
  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/appeals')
      .then(r => (r.ok ? r.json() : []))
      .then(data => { if (!cancelled) setAppeals(data || []); })
      .catch(() => { if (!cancelled) setAppeals([]); });
    return () => { cancelled = true; };
  }, [apiFetch]);

  const searchAppeals = useCallback((q) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return appeals
      .map(a => ({ appeal: a, text: appealToSearchableText(a) }))
      .filter(x => x.text.includes(needle))
      .map(x => ({
        id: x.appeal.id,
        caseId: x.appeal.caseId,
        title: x.appeal.title,
        status: x.appeal.status,
        archived: !!x.appeal.archived,
        county: x.appeal.county,
        program: x.appeal.program,
        voteRecorded: x.appeal.voteRecorded,
        snippet: snippet(x.appeal.issueSummary || x.appeal.fullText || '', q),
      }));
  }, [appeals]);

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
      const appealHits = searchAppeals(query);
      setResults({ entries: entries || [], documents: documents || [], appeals: appealHits });
    } catch (err) {
      setResults({ entries: [], documents: [], appeals: [], error: 'Search failed. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Search</h2>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.9rem' }}>
        Search across appeals (active and resolved), journal entries, and documents.
      </p>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search appeals, journal entries, and documents..."
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

          {results.appeals && results.appeals.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12 }}>Appeals ({results.appeals.length})</h4>
              {results.appeals.map(a => (
                <div key={a.id} className="card" style={{ marginBottom: 8, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <Link to={`/appeals/${a.id}`} style={{ color: 'var(--info)', fontWeight: 600, textDecoration: 'none' }}>
                      {a.caseId} — {a.title}
                    </Link>
                    <span style={{
                      fontSize: '0.72rem', padding: '2px 8px', borderRadius: 10, fontFamily: 'monospace', fontWeight: 700,
                      background: a.status === 'RESOLVED' ? 'rgba(40,167,69,0.15)' : 'rgba(var(--warning-rgb, 240,173,78), 0.15)',
                      color: a.status === 'RESOLVED' ? 'var(--success)' : 'var(--warning, #f0ad4e)',
                    }}>{a.status}</span>
                    {a.archived && (
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 10, fontFamily: 'monospace', fontWeight: 700, background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        ARCHIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    {a.program} &middot; {a.county} County
                  </div>
                  {a.snippet && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {a.snippet}
                    </div>
                  )}
                  {a.voteRecorded && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: 4, fontFamily: 'monospace' }}>
                      Determined: {a.voteRecorded.slice(0, 120)}{a.voteRecorded.length > 120 ? '…' : ''}
                    </div>
                  )}
                </div>
              ))}
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

          {!results.error && (results.appeals?.length || 0) === 0 && results.entries.length === 0 && results.documents.length === 0 && (
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
          <p>Try: "Ebright", "LDP", "grazing records", "Washington County", "Raptopoulos"</p>
        </div>
      )}
    </div>
  );
}
