import React, { useState } from 'react';
import { useApiFetch } from '../auth/apiFetch';

export default function Settings() {
  const [testing, setTesting] = useState(false);
  const apiFetch = useApiFetch();

  const testConnection = async () => {
    setTesting(true);
    try {
      const res = await apiFetch('/api/teams/test', { method: 'POST' });
      const data = await res.json();
      alert(data.connected ? 'Connection successful!' : `Connection failed: ${data.error}`);
    } catch (err) {
      alert('Connection test failed.');
    }
    setTesting(false);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 16 }}>Microsoft SharePoint / OneDrive Access</h3>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
          SharePoint/OneDrive browsing, file downloads, and Excel export remain available.
          Background auto-sync is disabled — documents are parsed and published through the
          project workflow instead.
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={testConnection} disabled={testing}>
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="card-title" style={{ marginBottom: 12 }}>Configuration Notes</h3>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <p><strong>SharePoint Folder:</strong> FSA - State Committee</p>
          <p><strong>Supported file types:</strong> PDF, DOCX, XLSX, JPG, PNG</p>
          <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>
            Azure App Registration requires Application permissions (not Delegated): Files.Read.All and Sites.Read.All with admin consent granted.
          </p>
        </div>
      </div>
    </div>
  );
}
