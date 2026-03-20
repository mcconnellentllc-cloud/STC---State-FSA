import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApiFetch } from '../auth/apiFetch';

const PROGRAMS = ['CRP', 'NAP', 'ARCPLC', 'ELAP', 'LFP', 'Other'];
const ISSUE_TYPES = ['Admin Failure', 'Equitable Relief', 'Late Filing', 'Payment Waiver', 'Rate Dispute', 'Procedural Error', 'Other'];
const SEVERITIES = ['High', 'Medium', 'Low'];
const STATUSES = ['Open', 'Pending DAFP', 'Resolved', 'Monitoring'];
const DISTRICTS = ['Northwest', 'Northeast', 'Southeast', 'South Central', 'Southwest', 'Front Range', 'Statewide'];

const SEVERITY_COLORS = { High: 'var(--danger)', Medium: 'var(--warning, #f0ad4e)', Low: 'var(--success)' };
const STATUS_COLORS = { Open: 'var(--danger)', 'Pending DAFP': 'var(--warning, #f0ad4e)', Resolved: 'var(--success)', Monitoring: 'var(--info, #17a2b8)' };

function calcRiskScore(issues) {
  const severityWeight = { High: 40, Medium: 20, Low: 8 };
  const statusMult = { Open: 1.5, 'Pending DAFP': 1.5, Monitoring: 1.2, Resolved: 1.0 };
  return issues.reduce((sum, i) => sum + (severityWeight[i.severity] || 8) * (statusMult[i.status] || 1.0), 0);
}

/* ── Badge ── */
function Badge({ label, color }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: '0.75rem',
      fontWeight: 700, color: '#fff', background: color, whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

/* ── Stat Card ── */
function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: 8,
      padding: '16px 20px', flex: '1 1 150px', borderTop: `3px solid ${color || 'var(--accent)'}`,
    }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: color || 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* ── Add/Edit Modal ── */
function IssueFormModal({ issue, onSave, onCancel }) {
  const [form, setForm] = useState({
    date: issue?.date || new Date().toISOString().split('T')[0],
    session: issue?.session || '',
    county: issue?.county || '',
    program: issue?.program || 'CRP',
    issue_type: issue?.issue_type || 'Admin Failure',
    severity: issue?.severity || 'Medium',
    status: issue?.status || 'Open',
    ced: issue?.ced || '',
    employee: issue?.employee || '',
    description: issue?.description || '',
    notes: issue?.notes || '',
    district: issue?.district || '',
  });

  const handleSubmit = (e) => { e.preventDefault(); onSave(form); };
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
    }} onClick={onCancel}>
      <div style={{
        background: 'var(--card-bg, #fff)', borderRadius: 10, padding: 24, width: '100%',
        maxWidth: 640, maxHeight: '90vh', overflow: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginBottom: 16 }}>{issue ? 'Edit Issue' : 'Add New Issue'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Date *</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Session</label>
              <input type="text" value={form.session} onChange={e => set('session', e.target.value)} placeholder="e.g. 2025-12" />
            </div>
            <div className="form-group">
              <label>County *</label>
              <input type="text" value={form.county} onChange={e => set('county', e.target.value)} required placeholder="e.g. Moffat" />
            </div>
            <div className="form-group">
              <label>District</label>
              <select value={form.district} onChange={e => set('district', e.target.value)}>
                <option value="">Select...</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Program</label>
              <select value={form.program} onChange={e => set('program', e.target.value)}>
                {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Issue Type</label>
              <select value={form.issue_type} onChange={e => set('issue_type', e.target.value)}>
                {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Severity</label>
              <select value={form.severity} onChange={e => set('severity', e.target.value)}>
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>CED / Office</label>
              <input type="text" value={form.ced} onChange={e => set('ced', e.target.value)} placeholder="e.g. Moffat County FSA Office" />
            </div>
            <div className="form-group">
              <label>Employee</label>
              <input type="text" value={form.employee} onChange={e => set('employee', e.target.value)} placeholder="e.g. Hunter Cleveland" />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 8 }}>
            <label>Description *</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} required placeholder="Brief description of the issue..." />
          </div>
          <div className="form-group" style={{ marginTop: 8 }}>
            <label>Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional details, findings, actions taken..." />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary">{issue ? 'Save Changes' : 'Add Issue'}</button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Detail Modal ── */
function IssueDetailModal({ issue, onClose, onSave, onDelete }) {
  const [status, setStatus] = useState(issue.status);
  const [notes, setNotes] = useState(issue.notes);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ status, notes });
    setSaving(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--card-bg, #fff)', borderRadius: 10, padding: 24, width: '100%',
        maxWidth: 640, maxHeight: '90vh', overflow: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>{issue.county} — {issue.program}</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            <Badge label={issue.severity} color={SEVERITY_COLORS[issue.severity]} />
            <Badge label={issue.status} color={STATUS_COLORS[issue.status]} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', fontSize: '0.88rem', marginBottom: 16 }}>
          <div><strong>Date:</strong> {issue.date}</div>
          <div><strong>Session:</strong> {issue.session}</div>
          <div><strong>Issue Type:</strong> {issue.issue_type}</div>
          <div><strong>District:</strong> {issue.district}</div>
          <div><strong>CED / Office:</strong> {issue.ced}</div>
          <div><strong>Employee:</strong> {issue.employee}</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <strong>Description</strong>
          <div style={{ marginTop: 4, fontSize: '0.9rem', lineHeight: 1.6, background: 'var(--bg)', padding: 12, borderRadius: 6 }}>
            {issue.description}
          </div>
        </div>

        <div className="form-group">
          <label><strong>Status</strong></label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ marginTop: 8 }}>
          <label><strong>Notes</strong></label>
          <textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-danger" style={{ marginLeft: 'auto' }} onClick={() => {
            if (confirm('Delete this issue? This cannot be undone.')) onDelete();
          }}>Delete</button>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12 }}>
          Created: {issue.created_at ? new Date(issue.created_at).toLocaleString() : '—'} | Updated: {issue.updated_at ? new Date(issue.updated_at).toLocaleString() : '—'}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN ISSUES PAGE
   ══════════════════════════════════════════════════════════════════ */
export default function Issues() {
  const apiFetch = useApiFetch();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailIssue, setDetailIssue] = useState(null);
  const [countyFilter, setCountyFilter] = useState('');

  // Filters
  const [filterProgram, setFilterProgram] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchText, setSearchText] = useState('');

  // Sorting
  const [sortCol, setSortCol] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const fetchIssues = useCallback(async () => {
    try {
      const res = await apiFetch('/api/issues');
      if (res.ok) setIssues(await res.json());
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  // ── Stats ──
  const stats = useMemo(() => {
    const highRisk = new Set(issues.filter(i => i.severity === 'High' && i.status !== 'Resolved').map(i => i.county)).size;
    const open = issues.filter(i => i.status === 'Open' || i.status === 'Pending DAFP').length;
    const adminFail = issues.filter(i => i.issue_type === 'Admin Failure').length;
    const resolved = issues.filter(i => i.status === 'Resolved').length;
    return { highRisk, open, adminFail, resolved, total: issues.length };
  }, [issues]);

  // ── County risk scores ──
  const countyScores = useMemo(() => {
    const byCounty = {};
    issues.forEach(i => {
      if (!byCounty[i.county]) byCounty[i.county] = [];
      byCounty[i.county].push(i);
    });
    return Object.entries(byCounty)
      .map(([county, items]) => ({ county, score: calcRiskScore(items), count: items.length }))
      .sort((a, b) => b.score - a.score);
  }, [issues]);

  const maxScore = Math.max(...countyScores.map(c => c.score), 1);

  // ── Filtered + sorted issues ──
  const filtered = useMemo(() => {
    let list = [...issues];
    if (countyFilter) list = list.filter(i => i.county === countyFilter);
    if (filterProgram) list = list.filter(i => i.program === filterProgram);
    if (filterType) list = list.filter(i => i.issue_type === filterType);
    if (filterSeverity) list = list.filter(i => i.severity === filterSeverity);
    if (filterStatus) list = list.filter(i => i.status === filterStatus);
    if (searchText) {
      const q = searchText.toLowerCase();
      list = list.filter(i =>
        (i.description || '').toLowerCase().includes(q) ||
        (i.county || '').toLowerCase().includes(q) ||
        (i.notes || '').toLowerCase().includes(q) ||
        (i.ced || '').toLowerCase().includes(q) ||
        (i.employee || '').toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const av = a[sortCol] || '';
      const bv = b[sortCol] || '';
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [issues, countyFilter, filterProgram, filterType, filterSeverity, filterStatus, searchText, sortCol, sortDir]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  // ── CRUD ──
  const handleAdd = async (form) => {
    try {
      await apiFetch('/api/issues', { method: 'POST', body: JSON.stringify(form) });
      setShowAddModal(false);
      fetchIssues();
    } catch (err) { console.error('Add issue error:', err); }
  };

  const handleUpdate = async (id, changes) => {
    try {
      await apiFetch(`/api/issues/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });
      setDetailIssue(null);
      fetchIssues();
    } catch (err) { console.error('Update issue error:', err); }
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/issues/${id}`, { method: 'DELETE' });
      setDetailIssue(null);
      fetchIssues();
    } catch (err) { console.error('Delete issue error:', err); }
  };

  const clearFilters = () => {
    setCountyFilter(''); setFilterProgram(''); setFilterType('');
    setFilterSeverity(''); setFilterStatus(''); setSearchText('');
  };

  const hasFilters = countyFilter || filterProgram || filterType || filterSeverity || filterStatus || searchText;

  const SortHeader = ({ col, label }) => (
    <th style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }} onClick={() => handleSort(col)}>
      {label} {sortCol === col ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}
    </th>
  );

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h2>County Issues</h2>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add Issue</button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard label="High Risk Counties" value={stats.highRisk} color="var(--danger)" />
        <StatCard label="Open Issues" value={stats.open} color="var(--warning, #f0ad4e)" />
        <StatCard label="Admin Failures" value={stats.adminFail} color="var(--info, #17a2b8)" />
        <StatCard label="Resolved" value={stats.resolved} color="var(--success)" />
        <StatCard label="Total Issues" value={stats.total} />
      </div>

      {/* ── County Risk Chart ── */}
      <div className="card" style={{ marginBottom: 20, padding: 20 }}>
        <h4 style={{ marginBottom: 12 }}>County Risk Scores</h4>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
          Score = Severity (High=40, Med=20, Low=8) x Status (Open/Pending=1.5x, Monitoring=1.2x, Resolved=1.0x). Click a bar to filter.
        </div>
        {countyScores.map(({ county, score, count }) => (
          <div
            key={county}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, cursor: 'pointer' }}
            onClick={() => setCountyFilter(countyFilter === county ? '' : county)}
          >
            <div style={{
              width: 90, fontSize: '0.82rem', fontWeight: countyFilter === county ? 700 : 500,
              textAlign: 'right', flexShrink: 0, color: countyFilter === county ? 'var(--accent)' : 'var(--text)',
            }}>{county}</div>
            <div style={{ flex: 1, height: 22, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${(score / maxScore) * 100}%`, height: '100%', borderRadius: 4,
                background: score >= 40 ? 'var(--danger)' : score >= 20 ? 'var(--warning, #f0ad4e)' : 'var(--success)',
                transition: 'width 0.3s',
              }} />
            </div>
            <div style={{ width: 50, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {score} ({count})
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="card" style={{ marginBottom: 20, padding: '12px 20px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)} style={{ fontSize: '0.85rem' }}>
            <option value="">All Programs</option>
            {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ fontSize: '0.85rem' }}>
            <option value="">All Types</option>
            {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} style={{ fontSize: '0.85rem' }}>
            <option value="">All Severities</option>
            {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ fontSize: '0.85rem' }}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            type="text" placeholder="Search issues..." value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ flex: '1 1 180px', fontSize: '0.85rem', minWidth: 150 }}
          />
          {hasFilters && (
            <button className="btn btn-sm btn-secondary" onClick={clearFilters}>Clear</button>
          )}
        </div>
        {countyFilter && (
          <div style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--accent)' }}>
            Filtered by county: <strong>{countyFilter}</strong>
            <button className="btn btn-sm btn-secondary" onClick={() => setCountyFilter('')} style={{ marginLeft: 8 }}>Clear</button>
          </div>
        )}
      </div>

      {/* ── Issues Table ── */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <SortHeader col="date" label="Date" />
                <SortHeader col="county" label="County" />
                <SortHeader col="program" label="Program" />
                <SortHeader col="issue_type" label="Type" />
                <th>Description</th>
                <SortHeader col="severity" label="Severity" />
                <SortHeader col="status" label="Status" />
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                  {hasFilters ? 'No issues match your filters.' : 'No issues tracked yet.'}
                </td></tr>
              ) : filtered.map(issue => (
                <tr key={issue.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{issue.date}</td>
                  <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{issue.county}</td>
                  <td style={{ fontSize: '0.85rem' }}>{issue.program}</td>
                  <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{issue.issue_type}</td>
                  <td style={{ fontSize: '0.85rem', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {issue.description}
                  </td>
                  <td><Badge label={issue.severity} color={SEVERITY_COLORS[issue.severity]} /></td>
                  <td><Badge label={issue.status} color={STATUS_COLORS[issue.status]} /></td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => setDetailIssue(issue)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '8px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
          Showing {filtered.length} of {issues.length} issues
        </div>
      </div>

      {/* ── Modals ── */}
      {showAddModal && (
        <IssueFormModal
          onSave={handleAdd}
          onCancel={() => setShowAddModal(false)}
        />
      )}
      {detailIssue && (
        <IssueDetailModal
          issue={detailIssue}
          onClose={() => setDetailIssue(null)}
          onSave={(changes) => handleUpdate(detailIssue.id, changes)}
          onDelete={() => handleDelete(detailIssue.id)}
        />
      )}
    </div>
  );
}
