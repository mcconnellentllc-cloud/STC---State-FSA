import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EntryEditor from '../components/EntryEditor';

export default function EntryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  const fetchEntry = () => {
    setLoading(true);
    fetch(`/api/entries/${id}`)
      .then(r => r.json())
      .then(setEntry)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEntry(); }, [id]);

  const handleUpdate = async (data) => {
    const res = await fetch(`/api/entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      setEditing(false);
      fetchEntry();
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this entry?')) return;
    await fetch(`/api/entries/${id}`, { method: 'DELETE' });
    navigate('/journal');
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_id: parseInt(id) })
      });
      const data = await res.json();
      setSummary(data.summary || 'No summary generated.');
    } catch (err) {
      setSummary('Error generating summary.');
    }
    setSummarizing(false);
  };

  const handleAutoTag = async () => {
    try {
      const res = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_id: parseInt(id) })
      });
      if (res.ok) fetchEntry();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!entry) return <div className="empty-state"><h3>Entry not found</h3></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-sm btn-secondary" onClick={() => navigate('/journal')} style={{ marginBottom: 8 }}>
            &larr; Back to Journal
          </button>
          <h2>{entry.title}</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm btn-secondary" onClick={handleAutoTag}>Auto-Tag</button>
          <button className="btn btn-sm btn-secondary" onClick={handleSummarize}>
            {summarizing ? 'Summarizing...' : 'AI Summary'}
          </button>
          <button className="btn btn-sm btn-secondary" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button className="btn btn-sm btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {editing ? (
        <EntryEditor entry={entry} onSave={handleUpdate} onCancel={() => setEditing(false)} />
      ) : (
        <>
          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16, fontSize: '0.85rem' }}>
              <div><strong>Date:</strong> {entry.date}</div>
              <div><strong>Location:</strong> {entry.location || '\u2014'}</div>
              <div><strong>Source:</strong> {entry.source}</div>
            </div>
            {entry.attendees && (
              <div style={{ marginBottom: 12, fontSize: '0.85rem' }}>
                <strong>Attendees:</strong> {entry.attendees}
              </div>
            )}
            {entry.tags && (
              <div style={{ marginBottom: 12 }}>
                {entry.tags.split(',').map((t, i) => (
                  <span key={i} className="tag">{t.trim()}</span>
                ))}
              </div>
            )}
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.9rem' }}>
              {entry.content}
            </div>
          </div>

          {summary && (
            <div className="ai-section" style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 8, color: 'var(--accent)' }}>AI Summary</h4>
              <div className="ai-response">{summary}</div>
            </div>
          )}

          {entry.documents?.length > 0 && (
            <div className="card">
              <h4 className="card-title" style={{ marginBottom: 12 }}>Linked Documents</h4>
              {entry.documents.map(doc => (
                <div key={doc.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <a href={`/api/documents/${doc.id}/file`} style={{ color: 'var(--info)' }}>
                    {doc.original_name}
                  </a>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{doc.file_type}</span>
                </div>
              ))}
            </div>
          )}

          {entry.expenses?.length > 0 && (
            <div className="card">
              <h4 className="card-title" style={{ marginBottom: 12 }}>Linked Expenses</h4>
              <table>
                <thead>
                  <tr><th>Date</th><th>Vendor</th><th>Amount</th><th>Category</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {entry.expenses.map(exp => (
                    <tr key={exp.id}>
                      <td>{exp.date}</td>
                      <td>{exp.vendor}</td>
                      <td>${(exp.amount || 0).toFixed(2)}</td>
                      <td>{exp.category}</td>
                      <td><span className={`badge badge-${exp.status}`}>{exp.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
