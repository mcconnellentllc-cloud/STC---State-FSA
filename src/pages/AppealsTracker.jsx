import React, { useState, useMemo } from 'react';

/* ══════════════════════════════════════════════════════════════════
   APPEALS TRACKER — Pending STC Appeal Cases
   Summarize, evaluate, and decide each appeal before the next meeting
   ══════════════════════════════════════════════════════════════════ */

const STATUS_OPTIONS = [
  { value: 'new', label: 'New — Not Reviewed', color: '#6c757d' },
  { value: 'reviewing', label: 'Under Review', color: '#ffc107' },
  { value: 'ready', label: 'Ready for Vote', color: '#17a2b8' },
  { value: 'decided', label: 'Decided', color: '#28a745' },
  { value: 'deferred', label: 'Deferred', color: '#fd7e14' },
];

const RECOMMENDATION_OPTIONS = [
  { value: '', label: '-- Not yet decided --', color: '#6c757d' },
  { value: 'uphold', label: 'Uphold COC Decision', color: '#dc3545' },
  { value: 'reverse', label: 'Reverse / Grant Appeal', color: '#28a745' },
  { value: 'remand', label: 'Remand to COC', color: '#fd7e14' },
  { value: 'modify', label: 'Modify Decision', color: '#17a2b8' },
];

const PROGRAM_TYPES = [
  'CRP', 'ARC/PLC', 'NAP', 'ELAP', 'LIP', 'LFP', 'FBA', 'EQIP/CSP',
  'Farm Loan', 'Conservation Compliance', 'Eligibility', 'Other'
];

const STARTER_APPEALS = [
  {
    id: 'ebright-crp',
    appellant: 'John & Stephanie Ebright',
    county: 'Bent',
    program: 'CRP',
    contractNumbers: '7 contracts',
    issue: 'Non-compliance determination — prescribed grazing plan violations; contract termination and refund demand',
    amountAtStake: null,
    dateFiled: '2026-02-15',
    deadlineToDecide: '2026-03-24',
    cocDecision: 'Terminate contracts; demand refund of prior payments with interest',
    appealBasis: 'Disputes finding of violation; argues grazing consistent with approved plan; procedural deficiencies in notice',
    keyEvidence: '386-page agency record; 15-event timeline; Exhibits 1-26',
    status: 'decided',
    recommendation: '',
    notes: 'Reviewed at March 24 meeting. See the Appeals page for full Case Brief. Decision recorded in meeting minutes.',
    priority: 'high',
  },
];

const PRIORITY_COLORS = {
  high: { bg: '#f8d7da', text: '#721c24', label: 'HIGH' },
  medium: { bg: '#fff3cd', text: '#856404', label: 'MEDIUM' },
  low: { bg: '#d1ecf1', text: '#0c5460', label: 'LOW' },
};

/* ── LocalStorage helpers ───────────────────────────────────────── */
const STORAGE_KEY = 'stc_pending_appeals';

function loadAppeals() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (err) {
    console.error('Failed to load appeals:', err);
  }
  return STARTER_APPEALS;
}

function saveAppeals(appeals) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appeals));
  } catch (err) {
    console.error('Failed to save appeals:', err);
  }
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function AppealsTracker() {
  const [appeals, setAppeals] = useState(loadAppeals());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  function emptyForm() {
    return {
      appellant: '',
      county: '',
      program: 'CRP',
      contractNumbers: '',
      issue: '',
      amountAtStake: '',
      dateFiled: new Date().toISOString().split('T')[0],
      deadlineToDecide: '',
      cocDecision: '',
      appealBasis: '',
      keyEvidence: '',
      status: 'new',
      recommendation: '',
      notes: '',
      priority: 'medium',
    };
  }

  function persist(next) {
    setAppeals(next);
    saveAppeals(next);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      persist(appeals.map(a => a.id === editingId ? { ...form, id: editingId } : a));
    } else {
      const newAppeal = { ...form, id: `appeal-${Date.now()}` };
      persist([newAppeal, ...appeals]);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
  }

  function handleEdit(appeal) {
    setForm({ ...appeal });
    setEditingId(appeal.id);
    setShowForm(true);
  }

  function handleDelete(id) {
    if (!confirm('Delete this appeal from tracker?')) return;
    persist(appeals.filter(a => a.id !== id));
  }

  function updateStatus(id, status) {
    persist(appeals.map(a => a.id === id ? { ...a, status } : a));
  }

  function updateRecommendation(id, recommendation) {
    persist(appeals.map(a => a.id === id ? { ...a, recommendation } : a));
  }

  /* ── Filtering ───────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    return appeals.filter(a => {
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (filterProgram !== 'all' && a.program !== filterProgram) return false;
      return true;
    });
  }, [appeals, filterStatus, filterProgram]);

  /* ── Stats ───────────────────────────────────────────────────── */
  const stats = useMemo(() => ({
    total: appeals.length,
    new: appeals.filter(a => a.status === 'new').length,
    reviewing: appeals.filter(a => a.status === 'reviewing').length,
    ready: appeals.filter(a => a.status === 'ready').length,
    decided: appeals.filter(a => a.status === 'decided').length,
    highPriority: appeals.filter(a => a.priority === 'high' && a.status !== 'decided').length,
  }), [appeals]);

  const programs = [...new Set(appeals.map(a => a.program))];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Appeals Tracker</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Log, evaluate, and decide STC appeals before the next meeting
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm()); }}>
          + New Appeal
        </button>
      </div>

      {/* Stats Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ padding: '14px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats.total}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Appeals</div>
        </div>
        <div className="card" style={{ padding: '14px 18px', textAlign: 'center', borderLeft: '4px solid #6c757d' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#6c757d' }}>{stats.new}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>New / Unreviewed</div>
        </div>
        <div className="card" style={{ padding: '14px 18px', textAlign: 'center', borderLeft: '4px solid #ffc107' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#856404' }}>{stats.reviewing}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Under Review</div>
        </div>
        <div className="card" style={{ padding: '14px 18px', textAlign: 'center', borderLeft: '4px solid #17a2b8' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#17a2b8' }}>{stats.ready}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ready for Vote</div>
        </div>
        <div className="card" style={{ padding: '14px 18px', textAlign: 'center', borderLeft: '4px solid #28a745' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#28a745' }}>{stats.decided}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Decided</div>
        </div>
        <div className="card" style={{ padding: '14px 18px', textAlign: 'center', borderLeft: '4px solid #dc3545' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#dc3545' }}>{stats.highPriority}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>High Priority Open</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Filter:</span>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6 }}>
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6 }}>
          <option value="all">All Programs</option>
          {programs.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {appeals.length}
        </span>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingId(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700, maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Appeal' : 'New Appeal'}</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>X</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Appellant *</label>
                  <input type="text" required value={form.appellant} onChange={e => setForm({ ...form, appellant: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>County *</label>
                  <input type="text" required value={form.county} onChange={e => setForm({ ...form, county: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Program *</label>
                  <select required value={form.program} onChange={e => setForm({ ...form, program: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border)' }}>
                    {PROGRAM_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border)' }}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Contract/Case Numbers</label>
                  <input type="text" value={form.contractNumbers} onChange={e => setForm({ ...form, contractNumbers: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Amount at Stake ($)</label>
                  <input type="number" step="0.01" value={form.amountAtStake || ''} onChange={e => setForm({ ...form, amountAtStake: e.target.value ? parseFloat(e.target.value) : null })} style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Date Appeal Filed</label>
                  <input type="date" value={form.dateFiled} onChange={e => setForm({ ...form, dateFiled: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>STC Decision Deadline</label>
                  <input type="date" value={form.deadlineToDecide} onChange={e => setForm({ ...form, deadlineToDecide: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border)' }} />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Issue / Dispute *</label>
                <textarea required rows={2} value={form.issue} onChange={e => setForm({ ...form, issue: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border)', fontFamily: 'inherit' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>COC Decision (being appealed)</label>
                <textarea rows={2} value={form.cocDecision} onChange={e => setForm({ ...form, cocDecision: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border)', fontFamily: 'inherit' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Appellant's Basis for Appeal</label>
                <textarea rows={2} value={form.appealBasis} onChange={e => setForm({ ...form, appealBasis: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border)', fontFamily: 'inherit' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Key Evidence / Documents</label>
                <textarea rows={2} value={form.keyEvidence} onChange={e => setForm({ ...form, keyEvidence: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border)', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border)' }}>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>My Recommendation</label>
                  <select value={form.recommendation} onChange={e => setForm({ ...form, recommendation: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border)' }}>
                    {RECOMMENDATION_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Notes / Rationale</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border)', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Appeal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appeals List */}
      {filtered.length === 0 ? (
        <div className="empty-state card" style={{ padding: 40, textAlign: 'center' }}>
          <h3>No appeals yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Click "+ New Appeal" to log your first pending appeal case.</p>
        </div>
      ) : (
        filtered.map(a => {
          const statusOpt = STATUS_OPTIONS.find(s => s.value === a.status) || STATUS_OPTIONS[0];
          const recOpt = RECOMMENDATION_OPTIONS.find(r => r.value === a.recommendation) || RECOMMENDATION_OPTIONS[0];
          const priorityColors = PRIORITY_COLORS[a.priority] || PRIORITY_COLORS.medium;
          const isExpanded = expandedId === a.id;
          const daysUntilDeadline = a.deadlineToDecide
            ? Math.ceil((new Date(a.deadlineToDecide) - new Date()) / (1000 * 60 * 60 * 24))
            : null;

          return (
            <div key={a.id} className="card" style={{ marginBottom: 12, borderLeft: `4px solid ${statusOpt.color}`, padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <h3 style={{ margin: 0 }}>{a.appellant}</h3>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700, background: priorityColors.bg, color: priorityColors.text }}>
                      {priorityColors.label}
                    </span>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600, background: '#e7f3ff', color: '#004085' }}>
                      {a.program}
                    </span>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary, #f0f0f0)' }}>
                      {a.county} County
                    </span>
                    {daysUntilDeadline !== null && a.status !== 'decided' && (
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700,
                        background: daysUntilDeadline < 0 ? '#f8d7da' : daysUntilDeadline < 7 ? '#fff3cd' : '#d1ecf1',
                        color: daysUntilDeadline < 0 ? '#721c24' : daysUntilDeadline < 7 ? '#856404' : '#0c5460' }}>
                        {daysUntilDeadline < 0 ? `OVERDUE ${Math.abs(daysUntilDeadline)}d` : `${daysUntilDeadline}d to decide`}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    <strong>Issue:</strong> {a.issue}
                  </div>
                  {a.amountAtStake && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                      <strong>Amount at stake:</strong> ${a.amountAtStake.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                  {a.contractNumbers && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <strong>Contracts:</strong> {a.contractNumbers}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <select value={a.status} onChange={e => updateStatus(a.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: 4, fontSize: '0.8rem', border: `2px solid ${statusOpt.color}`, fontWeight: 600, color: statusOpt.color }}>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <select value={a.recommendation} onChange={e => updateRecommendation(a.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: 4, fontSize: '0.8rem', border: `1px solid ${recOpt.color}`, color: recOpt.color, fontWeight: 600 }}>
                    {RECOMMENDATION_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-sm btn-secondary" onClick={() => setExpandedId(isExpanded ? null : a.id)}>
                  {isExpanded ? 'Hide Details' : 'Show Details'}
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(a)}>Edit</button>
                <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(a.id)} style={{ color: '#dc3545' }}>Delete</button>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 14, padding: 14, background: 'var(--bg-secondary, #f8f9fa)', borderRadius: 6, fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {a.cocDecision && <div style={{ marginBottom: 10 }}><strong>COC Decision:</strong> {a.cocDecision}</div>}
                  {a.appealBasis && <div style={{ marginBottom: 10 }}><strong>Appeal Basis:</strong> {a.appealBasis}</div>}
                  {a.keyEvidence && <div style={{ marginBottom: 10 }}><strong>Key Evidence:</strong> {a.keyEvidence}</div>}
                  {a.dateFiled && <div style={{ marginBottom: 10 }}><strong>Filed:</strong> {a.dateFiled}</div>}
                  {a.deadlineToDecide && <div style={{ marginBottom: 10 }}><strong>Deadline:</strong> {a.deadlineToDecide}</div>}
                  {a.notes && <div style={{ marginBottom: 0 }}><strong>Notes:</strong> {a.notes}</div>}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Reference Footer */}
      <div className="card" style={{ marginTop: 20, padding: '14px 18px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <strong>Appeals Reference:</strong> 7 CFR Part 780 (FSA appeals) | 7 CFR Part 11 (NAD) | 7 CFR Part 1410 (CRP) |
        {' '}See <a href="/appeals-training" style={{ color: 'var(--primary)' }}>Appeals Training</a> for full procedural reference.
        <br />
        <strong>30-day rule:</strong> Participant must file within 30 days of written notice. Reconsideration decision restarts the 30-day clock.
        <br />
        <strong>Data note:</strong> Appeals stored in browser localStorage. Data persists between visits on this device.
      </div>
    </div>
  );
}
