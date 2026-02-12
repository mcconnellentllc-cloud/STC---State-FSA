import React, { useState } from 'react';
import { useApiFetch } from '../auth/apiFetch';

export default function AIChat() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiFetch = useApiFetch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.answer || 'No response', sources: data.sources }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error processing your request.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="ai-section">
      <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 12, padding: 12, background: msg.role === 'user' ? 'var(--bg-card)' : 'var(--bg-primary)', borderRadius: 'var(--radius)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              {msg.role === 'user' ? 'You' : 'AI'}
            </div>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{msg.text}</div>
          </div>
        ))}
        {loading && <div className="loading"><div className="spinner" /></div>}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask about your archive..."
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>Send</button>
      </form>
    </div>
  );
}
