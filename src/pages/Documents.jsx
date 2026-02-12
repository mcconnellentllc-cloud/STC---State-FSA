import React, { useState, useEffect, useCallback } from 'react';
import { useApiFetch } from '../auth/apiFetch';
import FileUploader from '../components/FileUploader';

const FILE_ICONS = {
  '.pdf': '\uD83D\uDCC4',
  '.docx': '\uD83D\uDDD2',
  '.xlsx': '\uD83D\uDCCA',
  '.pptx': '\uD83D\uDCCA',
  '.pptm': '\uD83D\uDCCA',
  '.jpg': '\uD83D\uDDBC',
  '.jpeg': '\uD83D\uDDBC',
  '.png': '\uD83D\uDDBC',
};

function formatSize(bytes) {
  if (!bytes) return '\u2014';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
  if (!dateStr) return '\u2014';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
}

function getFileIcon(name) {
  const ext = (name || '').toLowerCase().match(/\.[^.]+$/)?.[0] || '';
  return FILE_ICONS[ext] || '\uD83D\uDCC1';
}

export default function Documents() {
  const [activeTab, setActiveTab] = useState('teams');  // teams | local
  const apiFetch = useApiFetch();

  /* ═══════════════════════════════════════════════════════════
     TEAMS BROWSER STATE
     ═══════════════════════════════════════════════════════════ */
  const [currentPath, setCurrentPath] = useState('');
  const [folderItems, setFolderItems] = useState([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);

  /* ═══════════════════════════════════════════════════════════
     LOCAL DOCS STATE (original)
     ═══════════════════════════════════════════════════════════ */
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  /* ── Teams folder browser ──────────────────────────────────── */
  const browsePath = useCallback(async (pathStr) => {
    setBrowseLoading(true);
    setBrowseError(null);
    try {
      const params = pathStr ? `?path=${encodeURIComponent(pathStr)}` : '';
      const res = await apiFetch(`/api/teams/browse${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Browse failed (${res.status})`);
      }
      const data = await res.json();
      setFolderItems(data.items || []);
      setCurrentPath(pathStr);
    } catch (err) {
      setBrowseError(err.message);
      setFolderItems([]);
    } finally {
      setBrowseLoading(false);
    }
  }, [apiFetch]);

  const fetchSyncStatus = useCallback(async () => {
    try {
      const res = await apiFetch('/api/teams/status');
      if (res.ok) {
        const data = await res.json();
        setSyncStatus(data);
      }
    } catch {}
  }, [apiFetch]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiFetch('/api/teams/sync', { method: 'POST' });
      await fetchSyncStatus();
      await browsePath(currentPath);
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleStartWatcher = async () => {
    try {
      await apiFetch('/api/teams/start', { method: 'POST' });
      await fetchSyncStatus();
    } catch (err) {
      console.error('Start watcher error:', err);
    }
  };

  const handleStopWatcher = async () => {
    try {
      await apiFetch('/api/teams/stop', { method: 'POST' });
      await fetchSyncStatus();
    } catch (err) {
      console.error('Stop watcher error:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'teams') {
      browsePath('');
      fetchSyncStatus();
    }
  }, [activeTab, browsePath, fetchSyncStatus]);

  /* ── Local documents ───────────────────────────────────────── */
  const fetchDocs = useCallback(() => {
    setLoading(true);
    const params = filter ? `?type=${encodeURIComponent(filter)}` : '';
    apiFetch(`/api/documents${params}`)
      .then(r => r.json())
      .then(setDocs)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [filter, apiFetch]);

  useEffect(() => {
    if (activeTab === 'local') {
      fetchDocs();
    }
  }, [activeTab, fetchDocs]);

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
    } catch (err) { console.error(err); }
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
    } catch {
      alert('Receipt extraction failed.');
    }
  };

  /* ── Breadcrumb ────────────────────────────────────────────── */
  const breadcrumbs = currentPath ? currentPath.split('/').filter(Boolean) : [];

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════ */
  return (
    <div>
      <div className="page-header">
        <h2>Documents</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {activeTab === 'teams' && (
            <>
              <button
                className="btn btn-secondary"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? 'Syncing...' : '\u21BB Sync Now'}
              </button>
              {syncStatus && (
                <span className="status-indicator">
                  <span className={`status-dot ${syncStatus.running ? 'connected' : 'disconnected'}`} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {syncStatus.running ? 'Watching' : 'Stopped'}
                  </span>
                </span>
              )}
            </>
          )}
          {activeTab === 'local' && (
            <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)}>
              {showUpload ? 'Cancel' : '+ Upload'}
            </button>
          )}
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────── */}
      <div className="expense-tabs">
        <button
          className={`expense-tab ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          Teams Channel Files
        </button>
        <button
          className={`expense-tab ${activeTab === 'local' ? 'active' : ''}`}
          onClick={() => setActiveTab('local')}
        >
          Local / Synced Documents
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB: TEAMS CHANNEL BROWSER
          ═══════════════════════════════════════════════════════ */}
      {activeTab === 'teams' && (
        <div>
          {/* Watcher controls */}
          {syncStatus && (
            <div className="card" style={{ marginBottom: 16, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: '0.85rem' }}>
                <strong>Auto-Sync:</strong>{' '}
                <span style={{ color: syncStatus.running ? 'var(--success)' : 'var(--text-muted)' }}>
                  {syncStatus.running ? `Active (every ${syncStatus.pollInterval}s)` : 'Stopped'}
                </span>
                {syncStatus.lastSync && (
                  <span style={{ marginLeft: 16, color: 'var(--text-muted)' }}>
                    Last sync: {formatDate(syncStatus.lastSync)}
                  </span>
                )}
                {syncStatus.filesProcessed > 0 && (
                  <span style={{ marginLeft: 16, color: 'var(--text-muted)' }}>
                    {syncStatus.filesProcessed} files processed
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {syncStatus.running ? (
                  <button className="btn btn-sm btn-secondary" onClick={handleStopWatcher}>Stop Watcher</button>
                ) : (
                  <button className="btn btn-sm btn-success" onClick={handleStartWatcher}>Start Watcher</button>
                )}
              </div>
            </div>
          )}

          {/* Breadcrumb navigation */}
          <div className="doc-breadcrumb">
            <button
              className="breadcrumb-item"
              onClick={() => browsePath('')}
              style={{ fontWeight: currentPath === '' ? 700 : 400 }}
            >
              {'\uD83D\uDCC1'} Kyle - FSA - State Committee
            </button>
            {breadcrumbs.map((seg, i) => {
              const pathUpTo = breadcrumbs.slice(0, i + 1).join('/');
              return (
                <React.Fragment key={i}>
                  <span className="breadcrumb-sep">/</span>
                  <button
                    className="breadcrumb-item"
                    onClick={() => browsePath(pathUpTo)}
                    style={{ fontWeight: i === breadcrumbs.length - 1 ? 700 : 400 }}
                  >
                    {seg}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Error */}
          {browseError && (
            <div className="card" style={{ borderLeft: '4px solid var(--danger)', marginBottom: 16 }}>
              <p style={{ color: 'var(--danger)', fontSize: '0.88rem', marginBottom: 8 }}>
                <strong>Connection Error</strong>
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{browseError}</p>
              {(browseError.includes('401') || browseError.includes('Token') || browseError.includes('credentials')) ? (
                <div className="info-card" style={{ marginTop: 12, padding: 16 }}>
                  <h4>Azure Client Secret May Be Expired</h4>
                  <ol style={{ paddingLeft: 18, fontSize: '0.85rem', lineHeight: 1.8 }}>
                    <li>Go to <a href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noopener noreferrer">Azure Portal &rarr; App Registrations</a></li>
                    <li>Select your app (Client ID: 5dd33a61...)</li>
                    <li>Go to <strong>Certificates &amp; secrets</strong></li>
                    <li>Create a <strong>New client secret</strong></li>
                    <li>Copy the new secret value and update <code>MICROSOFT_CLIENT_SECRET</code> in your <code>.env</code> file</li>
                    <li>Restart the server</li>
                  </ol>
                  <p style={{ fontSize: '0.82rem', marginTop: 8 }}>
                    Also ensure <strong>Application permissions</strong> (not Delegated) are granted:{' '}
                    <code>Files.Read.All</code>, <code>Sites.Read.All</code> with admin consent.
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* Loading */}
          {browseLoading && (
            <div className="loading"><div className="spinner" /></div>
          )}

          {/* Folder/file listing */}
          {!browseLoading && !browseError && (
            folderItems.length === 0 ? (
              <div className="empty-state">
                <h3>Empty folder</h3>
                <p>This folder has no files or subfolders.</p>
              </div>
            ) : (
              <div className="doc-file-list">
                {folderItems.map(item => (
                  <div
                    key={item.id}
                    className={`doc-file-row ${item.isFolder ? 'doc-folder-row' : ''}`}
                    onClick={() => {
                      if (item.isFolder) {
                        const newPath = currentPath ? `${currentPath}/${item.name}` : item.name;
                        browsePath(newPath);
                      }
                    }}
                  >
                    <div className="doc-file-icon">
                      {item.isFolder ? '\uD83D\uDCC1' : getFileIcon(item.name)}
                    </div>
                    <div className="doc-file-info">
                      <div className="doc-file-name">
                        {item.isFolder ? (
                          <span>{item.name}</span>
                        ) : (
                          <a
                            href={`/api/teams/file/${item.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                          >
                            {item.name}
                          </a>
                        )}
                      </div>
                      <div className="doc-file-meta">
                        {item.isFolder
                          ? `${item.childCount} item${item.childCount !== 1 ? 's' : ''}`
                          : formatSize(item.size)
                        }
                        <span className="doc-file-date">{formatDate(item.lastModified)}</span>
                      </div>
                    </div>
                    {item.isFile && item.webUrl && (
                      <a
                        href={item.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-secondary"
                        onClick={e => e.stopPropagation()}
                        title="Open in SharePoint"
                      >
                        Open &rarr;
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: LOCAL / SYNCED DOCUMENTS
          ═══════════════════════════════════════════════════════ */}
      {activeTab === 'local' && (
        <>
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
                    <th>Folder</th>
                    <th>Tags</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <span style={{ marginRight: 6 }}>{getFileIcon(doc.original_name)}</span>
                        <a href={`/api/documents/${doc.id}/file`} style={{ color: 'var(--info)', textDecoration: 'none' }}>
                          {doc.original_name}
                        </a>
                        {doc.teams_file_id && (
                          <span style={{ marginLeft: 6, fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>TEAMS</span>
                        )}
                      </td>
                      <td>{doc.file_type}</td>
                      <td>{formatSize(doc.file_size)}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.teams_folder || '\u2014'}</td>
                      <td>
                        {doc.tags ? doc.tags.split(',').map((t, i) => (
                          <span key={i} className="tag">{t.trim()}</span>
                        )) : '\u2014'}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{formatDate(doc.created_at)}</td>
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
                  {previewDoc.file_type} | {formatSize(previewDoc.file_size)}
                  {previewDoc.teams_file_id && ' | Synced from Teams'}
                  {previewDoc.teams_folder && ` | Folder: ${previewDoc.teams_folder}`}
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
        </>
      )}
    </div>
  );
}
