import React, { useState, useEffect } from 'react';

export default function Settings() {
  const [teamsStatus, setTeamsStatus] = useState(null);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = () => {
    fetch('/api/teams/status')
      .then(r => r.json())
      .then(setTeamsStatus)
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchStatus(); }, []);

  const testConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/teams/test', { method: 'POST' });
      const data = await res.json();
      alert(data.connected ? 'Connection successful!' : `Connection failed: ${data.error}`);
      fetchStatus();
    } catch (err) {
      alert('Connection test failed.');
    }
    setTesting(false);
  };

  const triggerSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/teams/sync', { method: 'POST' });
      const data = await res.json();
      alert(`Sync completed. Files processed: ${data.filesProcessed}`);
      fetchStatus();
    } catch (err) {
      alert('Sync failed.');
    }
    setSyncing(false);
  };

  const startWatcher = async () => {
    await fetch('/api/teams/start', { method: 'POST' });
    fetchStatus();
  };

  const stopWatcher = async () => {
    await fetch('/api/teams/stop', { method: 'POST' });
    fetchStatus();
  };

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 16 }}>Microsoft Teams / SharePoint Integration</h3>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span className="status-indicator">
              <span className={`status-dot ${teamsStatus?.running ? 'connected' : 'disconnected'}`}></span>
              <span style={{ fontSize: '0.9rem' }}>
                Watcher: {teamsStatus?.running ? 'Running' : 'Stopped'}
              </span>
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            <div>Last sync: {teamsStatus?.lastSync || 'Never'}</div>
            <div>Files processed: {teamsStatus?.filesProcessed || 0}</div>
            <div>Poll interval: {teamsStatus?.pollInterval || 300}s</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={testConnection} disabled={testing}>
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button className="btn btn-primary" onClick={triggerSync} disabled={syncing}>
            {syncing ? 'Syncing...' : 'Manual Sync'}
          </button>
          {teamsStatus?.running ? (
            <button className="btn btn-danger" onClick={stopWatcher}>Stop Watcher</button>
          ) : (
            <button className="btn btn-secondary" onClick={startWatcher}>Start Watcher</button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="card-title" style={{ marginBottom: 12 }}>Configuration Notes</h3>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <p><strong>SharePoint Folder:</strong> FSA - State Committee</p>
          <p><strong>Supported file types:</strong> PDF, DOCX, XLSX, JPG, PNG</p>
          <p><strong>Auto-processing:</strong> Files synced from SharePoint are automatically parsed for text, tagged by AI, and checked for receipt data.</p>
          <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>
            Azure App Registration requires Application permissions (not Delegated): Files.Read.All and Sites.Read.All with admin consent granted.
          </p>
        </div>
      </div>
    </div>
  );
}
