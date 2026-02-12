import React, { useState, useEffect } from 'react';
import { useApiFetch } from '../auth/apiFetch';
import FileUploader from '../components/FileUploader';

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const apiFetch = useApiFetch();

  const fetchDocs = () => {
    setLoading(true);
    const params = filter ? `?type=${encodeURIComponent(filter)}` : '';
    apiFetch(`/api/documents${params}`)
      .then(r => r.json())
      .then(setDocs)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, [filter, apiFetch]);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch('/api/documents/upload', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      setShowUpload(false);
      fetchDocs();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return;
    await apiFetch(`/api/documents/${id}`, { method: 'DELETE' });
    fetchDocs();
    setPreviewDoc(null);
  };

  const handleAutoTag = async (id) => {
    try {
      await apiFetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: id })
      });
      fetchDocs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExtractReceipt = async (id) => {
    try {
      const res = await apiFetch('/api/ai/extract-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: id })
      });
      const data = await res.json();
      if (data.amount) {
        const expRes = await apiFetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: data.date || new Date().toISOString().split('T')[0],
            vendor: data.vendor || '',
            amount: data.amount,
            category: data.category || 'other',
            description: data.description || '',
            document_id: id
          })
        });
        if (expRes.ok) alert(`Expense created: $${data.amount} at ${data.vendor}`);
      } else {
        alert('Could not extract receipt data from this document.');
      }
    } catch (err) {
      alert('Receipt extraction failed.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Documents</h2>
        <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? 'Cancel' : '+ Upload'}
        </button>
      </div>

      {showUpload && (
        <div style={{ marginBottom: 16 }}>
          <FileUploader onUpload={handleUpload} />
        </div>
      )}

      <div className="filter-bar">
        <div className="form-group">
          <label>Filter by type</label>
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All types</option>
            <option value=".pdf">PDF</option>
            <option value=".docx">DOCX</option>
            <option value=".xlsx">XLSX</option>
            <option value=".jpg">JPG</option>
            <option value=".png">PNG</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : docs.length === 0 ? (
        <div className="empty-state">
          <h3>No documents</h3>
          <p>Upload your first document or sync from Teams.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Tags</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <a href={`/api/documents/${doc.id}/file`} style={{ color: 'var(--info)', textDecoration: 'none' }}>
                      {doc.original_name}
                    </a>
                  </td>
                  <td>{doc.file_type}</td>
                  <td>{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '\u2014'}</td>
                  <td>
                    {doc.tags ? doc.tags.split(',').map((t, i) => (
                      <span key={i} className="tag">{t.trim()}</span>
                    )) : '\u2014'}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{doc.created_at}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => setPreviewDoc(doc)}>View</button>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleAutoTag(doc.id)}>Tag</button>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleExtractReceipt(doc.id)}>Receipt</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(doc.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {previewDoc && (
        <div className="modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
            <div className="modal-header">
              <h3>{previewDoc.original_name}</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setPreviewDoc(null)}>X</button>
            </div>
            <div style={{ marginBottom: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {previewDoc.file_type} | {previewDoc.file_size ? `${(previewDoc.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
              {previewDoc.teams_file_id && ' | Synced from Teams'}
            </div>
            {previewDoc.extracted_text ? (
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', maxHeight: 400, overflow: 'auto', background: 'var(--bg-primary)', padding: 16, borderRadius: 'var(--radius)' }}>
                {previewDoc.extracted_text}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No text extracted from this document.</p>
            )}
            <div style={{ marginTop: 12 }}>
              <a href={`/api/documents/${previewDoc.id}/file`} className="btn btn-primary" download>Download</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
