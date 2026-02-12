import React from 'react';

export default function DocPreview({ doc, onClose }) {
  if (!doc) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
        <div className="modal-header">
          <h3>{doc.original_name}</h3>
          <button className="btn btn-sm btn-secondary" onClick={onClose}>X</button>
        </div>
        <div style={{ marginBottom: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {doc.file_type} | {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
        </div>
        {doc.extracted_text ? (
          <div style={{
            whiteSpace: 'pre-wrap',
            fontSize: '0.85rem',
            maxHeight: 400,
            overflow: 'auto',
            background: 'var(--bg-primary)',
            padding: 16,
            borderRadius: 'var(--radius)'
          }}>
            {doc.extracted_text}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No text extracted.</p>
        )}
        <div style={{ marginTop: 12 }}>
          <a href={`/api/documents/${doc.id}/file`} className="btn btn-primary" download>Download</a>
        </div>
      </div>
    </div>
  );
}
