import React, { useState, useEffect } from 'react';
import { useApiFetch } from '../auth/apiFetch';

/* ── 2026 Federal Rates ─────────────────────────────────────────── */
const MILEAGE_RATE = 0.725;           // IRS standard mileage 2026
const MILEAGE_YEAR  = 2026;

// GS pay rates for STC compensation (2026 OPM base / 2,087 hrs)
const GS_RATES = {
  'GS-15 Step 1 (Chair)': {
    base: 60.56,       // $126,384 / 2087
    denver: 79.04,     // +30.52% Denver-Aurora locality
    restOfUS: 70.89,   // +17.06% Rest-of-US locality
  },
  'GS-14 Step 1 (Member)': {
    base: 51.48,       // $107,446 / 2087
    denver: 67.19,     // +30.52% Denver-Aurora locality
    restOfUS: 60.27,   // +17.06% Rest-of-US locality
  },
};

/* ── Main Component ──────────────────────────────────────────────── */
export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ from: '', to: '', category: '', status: '' });
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    vendor: '', amount: '', category: '', description: '', status: 'pending'
  });
  const [activeTab, setActiveTab] = useState('expenses');   // expenses | mileage | hours
  const apiFetch = useApiFetch();

  /* ── Mileage calculator state ──────────────────────────────────── */
  const [miles, setMiles] = useState('');
  const [mileDate, setMileDate] = useState(new Date().toISOString().split('T')[0]);
  const [mileDesc, setMileDesc] = useState('');
  const [mileTrips, setMileTrips] = useState([]);

  /* ── Hours calculator state ────────────────────────────────────── */
  const [hours, setHours] = useState('');
  const [hoursDate, setHoursDate] = useState(new Date().toISOString().split('T')[0]);
  const [hoursDesc, setHoursDesc] = useState('');
  const [selectedRate, setSelectedRate] = useState('GS-14 Step 1 (Member)');
  const [selectedLocality, setSelectedLocality] = useState('denver');
  const [hoursSessions, setHoursSessions] = useState([]);

  /* ── Tax line-item state (for receipt parsing) ─────────────────── */
  const [taxItems, setTaxItems] = useState([{ label: '', amount: '' }]);

  /* ── Data fetching ─────────────────────────────────────────────── */
  const fetchExpenses = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.category) params.set('category', filters.category);
    if (filters.status) params.set('status', filters.status);
    const q = params.toString();

    Promise.all([
      apiFetch(`/api/expenses${q ? '?' + q : ''}`).then(r => r.json()),
      apiFetch(`/api/expenses/summary${q ? '?' + q : ''}`).then(r => r.json())
    ])
      .then(([exp, sum]) => { setExpenses(exp); setSummary(sum); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchExpenses(); }, [filters, apiFetch]);

  /* ── Expense CRUD ──────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await apiFetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) })
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ date: new Date().toISOString().split('T')[0], vendor: '', amount: '', category: '', description: '', status: 'pending' });
      fetchExpenses();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    await apiFetch(`/api/expenses/${id}`, { method: 'DELETE' });
    fetchExpenses();
  };

  const handleExport = async (format) => {
    const params = new URLSearchParams();
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.category) params.set('category', filters.category);
    if (filters.status) params.set('status', filters.status);

    const res = await apiFetch('/api/expenses/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, ...Object.fromEntries(params) })
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense-report.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const categories = ['travel', 'mileage', 'meals', 'supplies', 'lodging', 'lodging-tax', 'fuel', 'parking', 'hours', 'other'];

  /* ── Save mileage trip as an expense ───────────────────────────── */
  const saveMileageExpense = async (trip) => {
    const res = await apiFetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: trip.date,
        vendor: 'Mileage Reimbursement',
        amount: trip.total,
        category: 'mileage',
        description: `${trip.miles} mi @ $${MILEAGE_RATE}/mi — ${trip.description}`,
        status: 'pending'
      })
    });
    if (res.ok) fetchExpenses();
    return res.ok;
  };

  /* ── Save hours session as an expense ──────────────────────────── */
  const saveHoursExpense = async (session) => {
    const res = await apiFetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: session.date,
        vendor: 'STC Compensation',
        amount: session.total,
        category: 'hours',
        description: `${session.hours}h @ $${session.rate.toFixed(2)}/hr (${session.gradeLabel}, ${session.localityLabel}) — ${session.description}`,
        status: 'pending'
      })
    });
    if (res.ok) fetchExpenses();
    return res.ok;
  };

  /* ── Save tax line items as expenses ───────────────────────────── */
  const saveTaxLineItems = async (items, parentDate, parentVendor) => {
    let saved = 0;
    for (const item of items) {
      if (!item.label || !item.amount) continue;
      const res = await apiFetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: parentDate || new Date().toISOString().split('T')[0],
          vendor: parentVendor || 'Tax/Fee',
          amount: parseFloat(item.amount),
          category: 'lodging-tax',
          description: item.label,
          status: 'pending'
        })
      });
      if (res.ok) saved++;
    }
    if (saved > 0) fetchExpenses();
    return saved;
  };

  /* ── Current hourly rate ───────────────────────────────────────── */
  const currentRate = GS_RATES[selectedRate]?.[selectedLocality] || 0;

  /* ══════════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════════ */
  return (
    <div>
      <div className="page-header">
        <h2>Expenses</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => handleExport('xlsx')}>Export XLSX</button>
          <button className="btn btn-secondary" onClick={() => handleExport('pdf')}>Export PDF</button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Expense'}
          </button>
        </div>
      </div>

      {/* ── Tab bar ────────────────────────────────────────────────── */}
      <div className="expense-tabs">
        <button className={`expense-tab ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>
          Expenses
        </button>
        <button className={`expense-tab ${activeTab === 'mileage' ? 'active' : ''}`} onClick={() => setActiveTab('mileage')}>
          Mileage Calculator
        </button>
        <button className={`expense-tab ${activeTab === 'hours' ? 'active' : ''}`} onClick={() => setActiveTab('hours')}>
          Hours / Compensation
        </button>
        <button className={`expense-tab ${activeTab === 'taxes' ? 'active' : ''}`} onClick={() => setActiveTab('taxes')}>
          Tax Line Items
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          TAB: EXPENSES (original view)
          ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'expenses' && (
        <>
          {summary && (
            <div className="grid-3" style={{ marginBottom: 16 }}>
              <div className="stat-card">
                <div className="stat-value">${(summary.grandTotal || 0).toFixed(2)}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{expenses.length}</div>
                <div className="stat-label">Expenses</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{summary.categories?.length || 0}</div>
                <div className="stat-label">Categories</div>
              </div>
            </div>
          )}

          <div className="filter-bar">
            <div className="form-group">
              <label>From</label>
              <input type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} />
            </div>
            <div className="form-group">
              <label>To</label>
              <input type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
                <option value="">All</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {showForm && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 12 }}>Add Expense</h4>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Vendor</label>
                    <input type="text" value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} placeholder="Vendor name" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Amount ($)</label>
                    <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
                </div>
                <button type="submit" className="btn btn-primary">Save Expense</button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <h3>No expenses</h3>
              <p>Add your first expense or extract from a receipt.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Vendor</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Receipt</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp.id}>
                      <td>{exp.date}</td>
                      <td>{exp.vendor || '\u2014'}</td>
                      <td style={{ fontWeight: 600 }}>${(exp.amount || 0).toFixed(2)}</td>
                      <td>{exp.category || '\u2014'}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.description || '\u2014'}</td>
                      <td>
                        {exp.receipt_name ? (
                          <a href={`/api/documents/${exp.document_id}/file`} style={{ color: 'var(--info)', fontSize: '0.8rem' }}>{exp.receipt_name}</a>
                        ) : '\u2014'}
                      </td>
                      <td><span className={`badge badge-${exp.status}`}>{exp.status}</span></td>
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(exp.id)}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB: MILEAGE CALCULATOR
          ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'mileage' && (
        <div className="tool-panel">
          <div className="card tool-card">
            <div className="tool-header">
              <h3>Mileage Reimbursement Calculator</h3>
              <span className="tool-badge">{MILEAGE_YEAR} IRS Rate: ${MILEAGE_RATE}/mile</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={mileDate} onChange={e => setMileDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Miles Driven</label>
                <input
                  type="number" step="0.1" min="0" placeholder="e.g. 120"
                  value={miles} onChange={e => setMiles(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Trip Description</label>
              <input
                type="text" placeholder="e.g. Denver to Haxtun roundtrip for STC meeting"
                value={mileDesc} onChange={e => setMileDesc(e.target.value)}
              />
            </div>

            {/* Live total */}
            <div className="calc-result">
              <div className="calc-result-label">Reimbursement</div>
              <div className="calc-result-value">
                ${miles ? (parseFloat(miles) * MILEAGE_RATE).toFixed(2) : '0.00'}
              </div>
              <div className="calc-result-detail">
                {miles ? `${parseFloat(miles).toFixed(1)} miles × $${MILEAGE_RATE}` : 'Enter miles above'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                className="btn btn-primary"
                disabled={!miles || parseFloat(miles) <= 0}
                onClick={() => {
                  const trip = {
                    date: mileDate,
                    miles: parseFloat(miles),
                    total: parseFloat((parseFloat(miles) * MILEAGE_RATE).toFixed(2)),
                    description: mileDesc || 'Mileage'
                  };
                  setMileTrips([trip, ...mileTrips]);
                  setMiles('');
                  setMileDesc('');
                }}
              >
                Add to Log
              </button>
              <button
                className="btn btn-success"
                disabled={!miles || parseFloat(miles) <= 0}
                onClick={async () => {
                  const trip = {
                    date: mileDate,
                    miles: parseFloat(miles),
                    total: parseFloat((parseFloat(miles) * MILEAGE_RATE).toFixed(2)),
                    description: mileDesc || 'Mileage'
                  };
                  const ok = await saveMileageExpense(trip);
                  if (ok) { setMiles(''); setMileDesc(''); }
                }}
              >
                Save as Expense
              </button>
            </div>
          </div>

          {/* Trip log */}
          {mileTrips.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h4 style={{ marginBottom: 8 }}>Trip Log (this session)</h4>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Date</th><th>Miles</th><th>Amount</th><th>Description</th><th></th></tr>
                  </thead>
                  <tbody>
                    {mileTrips.map((t, i) => (
                      <tr key={i}>
                        <td>{t.date}</td>
                        <td>{t.miles.toFixed(1)}</td>
                        <td style={{ fontWeight: 600 }}>${t.total.toFixed(2)}</td>
                        <td>{t.description}</td>
                        <td>
                          <button className="btn btn-sm btn-success" onClick={async () => {
                            const ok = await saveMileageExpense(t);
                            if (ok) setMileTrips(mileTrips.filter((_, j) => j !== i));
                          }}>Save</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Total</td>
                      <td style={{ fontWeight: 600 }}>{mileTrips.reduce((s, t) => s + t.miles, 0).toFixed(1)}</td>
                      <td style={{ fontWeight: 600 }}>${mileTrips.reduce((s, t) => s + t.total, 0).toFixed(2)}</td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Reference card */}
          <div className="card info-card" style={{ marginTop: 16 }}>
            <h4>Reference</h4>
            <ul style={{ paddingLeft: 18, fontSize: '0.85rem', lineHeight: 1.8 }}>
              <li><strong>${MILEAGE_RATE}/mile</strong> &mdash; {MILEAGE_YEAR} IRS standard business mileage rate</li>
              <li>Rate applies to personal vehicle use for official committee travel</li>
              <li>Keep a log of starting/ending odometer readings</li>
              <li>Tolls and parking are separate reimbursable expenses</li>
            </ul>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB: HOURS / COMPENSATION
          ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'hours' && (
        <div className="tool-panel">
          <div className="card tool-card">
            <div className="tool-header">
              <h3>STC Compensation Calculator</h3>
              <span className="tool-badge">2026 OPM GS Pay Scale</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>GS Grade</label>
                <select value={selectedRate} onChange={e => setSelectedRate(e.target.value)}>
                  {Object.keys(GS_RATES).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Locality</label>
                <select value={selectedLocality} onChange={e => setSelectedLocality(e.target.value)}>
                  <option value="base">Base (no locality)</option>
                  <option value="denver">Denver-Aurora, CO (+30.52%)</option>
                  <option value="restOfUS">Rest of US (+17.06%)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={hoursDate} onChange={e => setHoursDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Hours Worked</label>
                <input
                  type="number" step="0.25" min="0" placeholder="e.g. 8"
                  value={hours} onChange={e => setHours(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text" placeholder="e.g. State Committee meeting, Denver"
                value={hoursDesc} onChange={e => setHoursDesc(e.target.value)}
              />
            </div>

            {/* Live total */}
            <div className="calc-result">
              <div className="calc-result-label">Compensation</div>
              <div className="calc-result-value">
                ${hours ? (parseFloat(hours) * currentRate).toFixed(2) : '0.00'}
              </div>
              <div className="calc-result-detail">
                {hours
                  ? `${parseFloat(hours).toFixed(2)} hrs × $${currentRate.toFixed(2)}/hr`
                  : 'Enter hours above'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                className="btn btn-primary"
                disabled={!hours || parseFloat(hours) <= 0}
                onClick={() => {
                  const session = {
                    date: hoursDate,
                    hours: parseFloat(hours),
                    rate: currentRate,
                    total: parseFloat((parseFloat(hours) * currentRate).toFixed(2)),
                    gradeLabel: selectedRate,
                    localityLabel: selectedLocality === 'base' ? 'Base' : selectedLocality === 'denver' ? 'Denver' : 'Rest of US',
                    description: hoursDesc || 'STC work'
                  };
                  setHoursSessions([session, ...hoursSessions]);
                  setHours('');
                  setHoursDesc('');
                }}
              >
                Add to Log
              </button>
              <button
                className="btn btn-success"
                disabled={!hours || parseFloat(hours) <= 0}
                onClick={async () => {
                  const session = {
                    date: hoursDate,
                    hours: parseFloat(hours),
                    rate: currentRate,
                    total: parseFloat((parseFloat(hours) * currentRate).toFixed(2)),
                    gradeLabel: selectedRate,
                    localityLabel: selectedLocality === 'base' ? 'Base' : selectedLocality === 'denver' ? 'Denver' : 'Rest of US',
                    description: hoursDesc || 'STC work'
                  };
                  const ok = await saveHoursExpense(session);
                  if (ok) { setHours(''); setHoursDesc(''); }
                }}
              >
                Save as Expense
              </button>
            </div>
          </div>

          {/* Session log */}
          {hoursSessions.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h4 style={{ marginBottom: 8 }}>Hours Log (this session)</h4>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Date</th><th>Hours</th><th>Rate</th><th>Amount</th><th>Description</th><th></th></tr>
                  </thead>
                  <tbody>
                    {hoursSessions.map((s, i) => (
                      <tr key={i}>
                        <td>{s.date}</td>
                        <td>{s.hours.toFixed(2)}</td>
                        <td>${s.rate.toFixed(2)}/hr</td>
                        <td style={{ fontWeight: 600 }}>${s.total.toFixed(2)}</td>
                        <td>{s.description}</td>
                        <td>
                          <button className="btn btn-sm btn-success" onClick={async () => {
                            const ok = await saveHoursExpense(s);
                            if (ok) setHoursSessions(hoursSessions.filter((_, j) => j !== i));
                          }}>Save</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Total</td>
                      <td style={{ fontWeight: 600 }}>{hoursSessions.reduce((s, h) => s + h.hours, 0).toFixed(2)}</td>
                      <td></td>
                      <td style={{ fontWeight: 600 }}>${hoursSessions.reduce((s, h) => s + h.total, 0).toFixed(2)}</td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Rate reference */}
          <div className="card info-card" style={{ marginTop: 16 }}>
            <h4>2026 STC Compensation Rates</h4>
            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Base $/hr</th>
                    <th>Denver $/hr</th>
                    <th>Rest of US $/hr</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(GS_RATES).map(([label, rates]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>${rates.base.toFixed(2)}</td>
                      <td>${rates.denver.toFixed(2)}</td>
                      <td>${rates.restOfUS.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul style={{ paddingLeft: 18, fontSize: '0.85rem', lineHeight: 1.8, marginTop: 8 }}>
              <li>Chair compensated at <strong>GS-15 Step 1</strong>; Members at <strong>GS-14 Step 1</strong></li>
              <li>Denver-Aurora locality: <strong>+30.52%</strong> | Rest of US: <strong>+17.06%</strong></li>
              <li>STC members are intermittent federal employees paid hourly</li>
              <li>Hourly rate = annual salary &divide; 2,087 hours</li>
              <li>Source: <a href="https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/2026/general-schedule" target="_blank" rel="noopener noreferrer">OPM 2026 GS Pay Tables</a></li>
            </ul>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB: TAX LINE ITEMS
          ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'taxes' && (
        <div className="tool-panel">
          <div className="card tool-card">
            <div className="tool-header">
              <h3>Tax &amp; Fee Line Items</h3>
              <span className="tool-badge">Separate taxes for export</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Break out taxes, fees, and surcharges from hotel receipts or other bills into
              separate line items. Each item will be saved as its own expense entry for
              accurate export reporting.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label>Receipt Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Vendor / Hotel</label>
                <input
                  type="text" value={form.vendor}
                  onChange={e => setForm({ ...form, vendor: e.target.value })}
                  placeholder="e.g. Marriott Denver"
                />
              </div>
            </div>

            <div style={{ marginTop: 12, marginBottom: 12 }}>
              <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Tax / Fee Line Items</label>
              {taxItems.map((item, idx) => (
                <div key={idx} className="form-row" style={{ marginBottom: 6, alignItems: 'center' }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <input
                      type="text" placeholder="e.g. State Sales Tax, City Lodging Tax, Resort Fee"
                      value={item.label}
                      onChange={e => {
                        const updated = [...taxItems];
                        updated[idx].label = e.target.value;
                        setTaxItems(updated);
                      }}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <input
                      type="number" step="0.01" placeholder="$0.00"
                      value={item.amount}
                      onChange={e => {
                        const updated = [...taxItems];
                        updated[idx].amount = e.target.value;
                        setTaxItems(updated);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    style={{ marginTop: 0 }}
                    onClick={() => {
                      if (taxItems.length > 1) {
                        setTaxItems(taxItems.filter((_, i) => i !== idx));
                      }
                    }}
                    disabled={taxItems.length <= 1}
                  >
                    &times;
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 4 }}
                onClick={() => setTaxItems([...taxItems, { label: '', amount: '' }])}
              >
                + Add Line
              </button>
            </div>

            {/* Running total */}
            <div className="calc-result">
              <div className="calc-result-label">Total Taxes &amp; Fees</div>
              <div className="calc-result-value">
                ${taxItems.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0).toFixed(2)}
              </div>
              <div className="calc-result-detail">
                {taxItems.filter(it => it.label && it.amount).length} line item(s)
              </div>
            </div>

            <button
              className="btn btn-success"
              style={{ marginTop: 12 }}
              disabled={!taxItems.some(it => it.label && it.amount)}
              onClick={async () => {
                const count = await saveTaxLineItems(taxItems, form.date, form.vendor);
                if (count > 0) {
                  setTaxItems([{ label: '', amount: '' }]);
                  alert(`Saved ${count} tax/fee line item(s) as separate expenses.`);
                }
              }}
            >
              Save All as Separate Expenses
            </button>
          </div>

          {/* Common tax types reference */}
          <div className="card info-card" style={{ marginTop: 16 }}>
            <h4>Common Hotel Tax / Fee Types</h4>
            <ul style={{ paddingLeft: 18, fontSize: '0.85rem', lineHeight: 1.8 }}>
              <li><strong>State Sales Tax</strong> &mdash; Colorado state rate</li>
              <li><strong>City/County Lodging Tax</strong> &mdash; varies by municipality</li>
              <li><strong>Tourism/Marketing District Tax</strong> &mdash; some cities add this</li>
              <li><strong>Resort Fee / Amenity Fee</strong> &mdash; if charged</li>
              <li><strong>Parking (hotel)</strong> &mdash; if on the folio</li>
              <li><strong>Internet / Wi-Fi Fee</strong> &mdash; if separately charged</li>
              <li>Each type should be a separate line item for federal expense reporting</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
