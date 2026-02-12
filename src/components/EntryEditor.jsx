import React, { useState } from 'react';

export default function EntryEditor({ entry, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: entry?.title || '',
    date: entry?.date || new Date().toISOString().split('T')[0],
    location: entry?.location || '',
    attendees: entry?.attendees || '',
    tags: entry?.tags || '',
    content: entry?.content || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          required
          placeholder="Meeting title or subject"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            placeholder="City, office, or field location"
          />
        </div>
      </div>
      <div className="form-group">
        <label>Attendees</label>
        <input
          type="text"
          value={form.attendees}
          onChange={e => setForm({ ...form, attendees: e.target.value })}
          placeholder="Names separated by commas"
        />
      </div>
      <div className="form-group">
        <label>Tags</label>
        <input
          type="text"
          value={form.tags}
          onChange={e => setForm({ ...form, tags: e.target.value })}
          placeholder="e.g. meeting, field-visit, policy"
        />
      </div>
      <div className="form-group">
        <label>Content / Notes</label>
        <textarea
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
          rows={8}
          placeholder="Meeting notes, observations, action items..."
        />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary">Save</button>
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
