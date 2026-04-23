import React, { useState, useEffect, useCallback } from 'react';
import { useApiFetch } from '../auth/apiFetch';

// Heuristic: scan an appeal's advisoryNotes for explicit recusal language
// when a new member is being added. Surfaces a checkbox prompt so the admin
// can set recusals at the same time as account creation rather than missing
// them as a separate step.
const RECUSAL_HINT_RE = /\brecus/i;

export default function Settings() {
  const apiFetch = useApiFetch();
  const [testing, setTesting] = useState(false);

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

      <MembersSection apiFetch={apiFetch} />
      <AppealRecusalsSection apiFetch={apiFetch} />
      <FolderRecusalsSection apiFetch={apiFetch} />

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 16 }}>Microsoft SharePoint / OneDrive Access</h3>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
          SharePoint/OneDrive browsing, file downloads, and Excel export remain available.
          Background auto-sync is disabled — documents are parsed and published through the
          project workflow instead.
        </div>
        <button className="btn btn-secondary" onClick={testConnection} disabled={testing}>
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="card-title" style={{ marginBottom: 12 }}>Configuration Notes</h3>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <p><strong>SharePoint Folder:</strong> FSA - State Committee</p>
          <p><strong>Member-visible subfolder:</strong> Committee Shared</p>
          <p><strong>Supported file types:</strong> PDF, DOCX, XLSX, JPG, PNG</p>
          <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>
            Microsoft Entra owns identity, password, and MFA. Manage member sign-in at the{' '}
            <a href="https://entra.microsoft.com" target="_blank" rel="noopener noreferrer">Entra admin center</a>.
            Add a member here AFTER they have been invited as a B2B guest in Entra.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MEMBERS
   ───────────────────────────────────────────────────────────────────────────── */
function MembersSection({ apiFetch }) {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await apiFetch('/api/admin/users');
      if (!r.ok) throw new Error(`Load failed (${r.status})`);
      setUsers(await r.json());
      setError(null);
    } catch (e) { setError(e.message); }
  }, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  const setActive = async (id, active) => {
    try {
      const r = await apiFetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active })
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || `Update failed (${r.status})`);
      }
      load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 className="card-title" style={{ margin: 0 }}>Committee Members</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ Add Member'}
        </button>
      </div>

      {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 8 }}>{error}</div>}

      {showAdd && (
        <AddMemberForm apiFetch={apiFetch} onCreated={() => { setShowAdd(false); load(); }} />
      )}

      {!users ? (
        <div className="loading"><div className="spinner" /></div>
      ) : (
        <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '6px 8px' }}>Name</th>
              <th style={{ padding: '6px 8px' }}>Email</th>
              <th style={{ padding: '6px 8px' }}>Role</th>
              <th style={{ padding: '6px 8px' }}>Last Login</th>
              <th style={{ padding: '6px 8px' }}>Status</th>
              <th style={{ padding: '6px 8px' }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderTop: '1px solid var(--border)', opacity: u.active ? 1 : 0.55 }}>
                <td style={{ padding: '8px' }}>{u.display_name}</td>
                <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '0.82rem' }}>{u.email}</td>
                <td style={{ padding: '8px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700,
                    background: u.role === 'admin' ? 'var(--accent)' : 'var(--bg)',
                    color: u.role === 'admin' ? '#fff' : 'var(--text-secondary)',
                    border: u.role === 'admin' ? 'none' : '1px solid var(--border)',
                  }}>{u.role}</span>
                </td>
                <td style={{ padding: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {u.last_login || '—'}
                </td>
                <td style={{ padding: '8px' }}>
                  {u.active ? <span style={{ color: 'var(--success)' }}>Active</span> : <span style={{ color: 'var(--text-muted)' }}>Inactive</span>}
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  {u.active ? (
                    <button className="btn btn-sm btn-secondary" onClick={() => setActive(u.id, false)}>Deactivate</button>
                  ) : (
                    <button className="btn btn-sm btn-success" onClick={() => setActive(u.id, true)}>Reactivate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AddMemberForm({ apiFetch, onCreated }) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Recusal-scan state: appeals whose advisoryNotes mention "recus*"
  const [appealsHints, setAppealsHints] = useState([]);
  const [checkedRecusals, setCheckedRecusals] = useState({}); // { appealId: true }

  useEffect(() => {
    apiFetch('/api/admin/appeals-summary')
      .then(r => r.ok ? r.json() : [])
      .then(list => {
        const hints = list.filter(a => RECUSAL_HINT_RE.test(a.advisoryNotes || ''));
        setAppealsHints(hints);
      })
      .catch(() => {});
  }, [apiFetch]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const r = await apiFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email, display_name: displayName, role })
      });
      const created = await r.json();
      if (!r.ok) throw new Error(created.error || `Add failed (${r.status})`);

      // For each checked recusal, create an appeal_recusal row tied to this user
      const checked = Object.entries(checkedRecusals).filter(([, v]) => v).map(([k]) => k);
      for (const appealId of checked) {
        const rr = await apiFetch('/api/admin/appeal-recusals', {
          method: 'POST',
          body: JSON.stringify({ appeal_id: appealId, user_id: created.id, reason: 'Set at member-add (advisoryNotes recusal flag)' })
        });
        if (!rr.ok) {
          const j = await rr.json().catch(() => ({}));
          console.warn(`Recusal on ${appealId} failed: ${j.error || rr.status}`);
        }
      }

      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} style={{
      background: 'var(--bg)', padding: 14, borderRadius: 6, marginBottom: 14, border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <label style={{ fontSize: '0.82rem' }}>
          Email
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="member@example.com"
            style={{ width: '100%', padding: '6px 10px', marginTop: 4, fontSize: '0.85rem', border: '1px solid var(--border)', borderRadius: 4 }}
          />
        </label>
        <label style={{ fontSize: '0.82rem' }}>
          Display name
          <input
            required value={displayName} onChange={e => setDisplayName(e.target.value)}
            placeholder="First Last"
            style={{ width: '100%', padding: '6px 10px', marginTop: 4, fontSize: '0.85rem', border: '1px solid var(--border)', borderRadius: 4 }}
          />
        </label>
      </div>
      <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: 10 }}>
        Role
        <select value={role} onChange={e => setRole(e.target.value)}
          style={{ marginLeft: 8, padding: '4px 8px', fontSize: '0.85rem', border: '1px solid var(--border)', borderRadius: 4 }}>
          <option value="member">member</option>
          <option value="admin">admin</option>
        </select>
      </label>

      {appealsHints.length > 0 && (
        <div style={{
          background: 'rgba(var(--warning-rgb, 240,173,78), 0.08)',
          borderLeft: '3px solid var(--warning, #f0ad4e)',
          padding: '10px 14px', borderRadius: '0 6px 6px 0', marginBottom: 12, fontSize: '0.84rem',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            Recusal flag in advisory notes ({appealsHints.length})
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 8 }}>
            These appeals' advisoryNotes mention recusal. Check any that should apply to this new member — recusal rows will be created automatically.
          </div>
          {appealsHints.map(a => (
            <label key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!checkedRecusals[a.id]}
                onChange={e => setCheckedRecusals(s => ({ ...s, [a.id]: e.target.checked }))}
                style={{ marginTop: 4 }}
              />
              <span>
                <strong>{a.caseId}</strong> — {a.title}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {a.advisoryNotes.slice(0, 200)}{a.advisoryNotes.length > 200 ? '…' : ''}
                </div>
              </span>
            </label>
          ))}
        </div>
      )}

      {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 8 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Add Member'}
        </button>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   APPEAL RECUSALS
   ───────────────────────────────────────────────────────────────────────────── */
function AppealRecusalsSection({ apiFetch }) {
  const [recusals, setRecusals] = useState(null);
  const [users, setUsers] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [rR, rU, rA] = await Promise.all([
        apiFetch('/api/admin/appeal-recusals'),
        apiFetch('/api/admin/users'),
        apiFetch('/api/admin/appeals-summary'),
      ]);
      setRecusals(await rR.json());
      setUsers((await rU.json()).filter(u => u.active));
      setAppeals(await rA.json());
      setError(null);
    } catch (e) { setError(e.message); }
  }, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  const revoke = async (id) => {
    if (!confirm('Revoke this recusal? The audit row stays; the recused member regains access.')) return;
    try {
      const r = await apiFetch(`/api/admin/appeal-recusals/${id}/revoke`, { method: 'PATCH' });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || `Revoke failed (${r.status})`);
      }
      load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 className="card-title" style={{ margin: 0 }}>Appeal Recusals</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ Add Recusal'}
        </button>
      </div>

      {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 8 }}>{error}</div>}

      {showAdd && (
        <AddAppealRecusalForm
          apiFetch={apiFetch}
          users={users}
          appeals={appeals}
          onCreated={() => { setShowAdd(false); load(); }}
        />
      )}

      {!recusals ? (
        <div className="loading"><div className="spinner" /></div>
      ) : recusals.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recusals on record.</p>
      ) : (
        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '6px 8px' }}>Member</th>
              <th style={{ padding: '6px 8px' }}>Appeal</th>
              <th style={{ padding: '6px 8px' }}>Reason</th>
              <th style={{ padding: '6px 8px' }}>Set</th>
              <th style={{ padding: '6px 8px' }}>State</th>
              <th style={{ padding: '6px 8px' }}></th>
            </tr>
          </thead>
          <tbody>
            {recusals.map(r => (
              <tr key={r.id} style={{ borderTop: '1px solid var(--border)', opacity: r.revoked_at ? 0.55 : 1 }}>
                <td style={{ padding: '6px 8px' }}>{r.user_display_name || r.user_email}</td>
                <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontSize: '0.78rem' }}>{r.appeal_id}</td>
                <td style={{ padding: '6px 8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.reason || '—'}</td>
                <td style={{ padding: '6px 8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.set_at}</td>
                <td style={{ padding: '6px 8px' }}>
                  {r.revoked_at
                    ? <span style={{ color: 'var(--text-muted)' }}>revoked</span>
                    : <span style={{ color: 'var(--danger)', fontWeight: 700 }}>ACTIVE</span>}
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                  {!r.revoked_at && <button className="btn btn-sm btn-secondary" onClick={() => revoke(r.id)}>Revoke</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AddAppealRecusalForm({ apiFetch, users, appeals, onCreated }) {
  const [userId, setUserId] = useState('');
  const [appealId, setAppealId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const r = await apiFetch('/api/admin/appeal-recusals', {
        method: 'POST',
        body: JSON.stringify({ user_id: parseInt(userId, 10), appeal_id: appealId, reason })
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || `Add failed (${r.status})`);
      }
      onCreated();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} style={{ background: 'var(--bg)', padding: 14, borderRadius: 6, marginBottom: 14, border: '1px solid var(--border)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginBottom: 10 }}>
        <label style={{ fontSize: '0.82rem' }}>
          Member
          <select required value={userId} onChange={e => setUserId(e.target.value)} style={{ width: '100%', padding: '6px 10px', marginTop: 4 }}>
            <option value="">— select —</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.display_name} ({u.email})</option>)}
          </select>
        </label>
        <label style={{ fontSize: '0.82rem' }}>
          Appeal
          <select required value={appealId} onChange={e => setAppealId(e.target.value)} style={{ width: '100%', padding: '6px 10px', marginTop: 4 }}>
            <option value="">— select —</option>
            {appeals.map(a => <option key={a.id} value={a.id}>{a.caseId} — {a.title}</option>)}
          </select>
        </label>
      </div>
      <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: 10 }}>
        Reason (optional)
        <input value={reason} onChange={e => setReason(e.target.value)}
          placeholder="e.g., family co-ownership of slaughter plant per June 12, 2025 minutes p.10"
          style={{ width: '100%', padding: '6px 10px', marginTop: 4, fontSize: '0.85rem', border: '1px solid var(--border)', borderRadius: 4 }}
        />
      </label>
      {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 8 }}>{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Recusal'}</button>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FOLDER RECUSALS  (folder_path is relative to Committee Shared)
   ───────────────────────────────────────────────────────────────────────────── */
function FolderRecusalsSection({ apiFetch }) {
  const [links, setLinks] = useState(null);
  const [appeals, setAppeals] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [rL, rA] = await Promise.all([
        apiFetch('/api/admin/folder-recusals'),
        apiFetch('/api/admin/appeals-summary'),
      ]);
      setLinks(await rL.json());
      setAppeals(await rA.json());
      setError(null);
    } catch (e) { setError(e.message); }
  }, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    if (!confirm('Remove this folder→appeal link? Recused members regain visibility into this folder.')) return;
    try {
      const r = await apiFetch(`/api/admin/folder-recusals/${id}`, { method: 'DELETE' });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || `Delete failed (${r.status})`);
      }
      load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 className="card-title" style={{ margin: 0 }}>Folder → Appeal Links</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ Add Folder Link'}
        </button>
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
        Tag a folder under <strong>Committee Shared</strong> with an appeal. Any member recused from that appeal cannot see the folder, navigate into it, or fetch files from underneath it.
      </div>

      {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 8 }}>{error}</div>}

      {showAdd && (
        <AddFolderLinkForm
          apiFetch={apiFetch}
          appeals={appeals}
          onCreated={() => { setShowAdd(false); load(); }}
        />
      )}

      {!links ? (
        <div className="loading"><div className="spinner" /></div>
      ) : links.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No folder links yet.</p>
      ) : (
        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '6px 8px' }}>Folder Path (under Committee Shared)</th>
              <th style={{ padding: '6px 8px' }}>Appeal</th>
              <th style={{ padding: '6px 8px' }}>Set</th>
              <th style={{ padding: '6px 8px' }}></th>
            </tr>
          </thead>
          <tbody>
            {links.map(l => (
              <tr key={l.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontSize: '0.82rem' }}>{l.folder_path}</td>
                <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontSize: '0.78rem' }}>{l.appeal_id}</td>
                <td style={{ padding: '6px 8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{l.set_at}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(l.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AddFolderLinkForm({ apiFetch, appeals, onCreated }) {
  const [folderPath, setFolderPath] = useState('');
  const [appealId, setAppealId] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const r = await apiFetch('/api/admin/folder-recusals', {
        method: 'POST',
        body: JSON.stringify({ folder_path: folderPath, appeal_id: appealId })
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || `Add failed (${r.status})`);
      }
      onCreated();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} style={{ background: 'var(--bg)', padding: 14, borderRadius: 6, marginBottom: 14, border: '1px solid var(--border)' }}>
      <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: 10 }}>
        Folder path under Committee Shared
        <input
          required value={folderPath} onChange={e => setFolderPath(e.target.value)}
          placeholder="April 2026/Appeals/Appeal 2"
          style={{ width: '100%', padding: '6px 10px', marginTop: 4, fontSize: '0.85rem', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 4 }}
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Path is relative to Committee Shared. Leading/trailing slashes are stripped automatically.
        </span>
      </label>
      <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: 10 }}>
        Appeal this folder is tied to
        <select required value={appealId} onChange={e => setAppealId(e.target.value)} style={{ width: '100%', padding: '6px 10px', marginTop: 4 }}>
          <option value="">— select —</option>
          {appeals.map(a => <option key={a.id} value={a.id}>{a.caseId} — {a.title}</option>)}
        </select>
      </label>
      {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 8 }}>{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Link'}</button>
    </form>
  );
}
