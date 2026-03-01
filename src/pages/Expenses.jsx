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

/* ── Actual withholding rate from Feb 2026 pay ─────────────────── */
// Feb: 16 hrs × $67.19 = $1,075.04 gross → $833.75 net = 22.4% withheld
const ACTUAL_WITHHOLDING_RATE = 0.2244;   // FICA 7.65% + fed ~10.4% + CO 4.4%

// Net hourly rates (what you actually take home per hour)
const NET_RATES = {
  'GS-15 Step 1 (Chair)': {
    base: +(60.56 * (1 - 0.2244)).toFixed(2),
    denver: +(79.04 * (1 - 0.2244)).toFixed(2),
    restOfUS: +(70.89 * (1 - 0.2244)).toFixed(2),
  },
  'GS-14 Step 1 (Member)': {
    base: +(51.48 * (1 - 0.2244)).toFixed(2),
    denver: +(67.19 * (1 - 0.2244)).toFixed(2),
    restOfUS: +(60.27 * (1 - 0.2244)).toFixed(2),
  },
};

/* ── FY2026 GSA Per Diem Rates ─────────────────────────────────── */
const PER_DIEM = {
  denver: { mie: 92.00, lodging: 165.00, mieFirstLast: 69.00 },  // Denver-Aurora NSA
  standard: { mie: 68.00, lodging: 110.00, mieFirstLast: 51.00 }, // Standard CONUS
};

/* ── Actual Income Received ────────────────────────────────────── */
const MEETING_INCOME = [
  {
    month: 'February 2026',
    meetingDate: '2026-02-10',
    location: 'Federal Building 56, Denver, CO',
    depositDate: '2026-03-02',
    payments: [
      { type: 'salary', label: 'FED SAL (AGRI TREAS 310)', amount: 833.75, description: 'STC compensation — net after withholdings' },
      { type: 'travel', label: 'Federal Travel Payment', amount: 491.91, description: 'Mileage, per diem, and lodging reimbursement' },
    ],
    notes: 'First STC meeting for newly appointed committee. Haxtun → Denver roundtrip.',
  },
];

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

  /* ── Income analysis state ───────────────────────────────────── */
  const [incomeHours, setIncomeHours] = useState('16');
  const [incomeGrade, setIncomeGrade] = useState('GS-14 Step 1 (Member)');
  const [incomeLocality, setIncomeLocality] = useState('denver');
  const [incomeMiles, setIncomeMiles] = useState('356');

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
  const currentNetRate = NET_RATES[selectedRate]?.[selectedLocality] || 0;

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
        <button className={`expense-tab ${activeTab === 'income' ? 'active' : ''}`} onClick={() => setActiveTab('income')}>
          Income &amp; Actuals
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

            {/* Live total — gross + net */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div className="calc-result" style={{ flex: 1, minWidth: 180 }}>
                <div className="calc-result-label">Gross Pay</div>
                <div className="calc-result-value">
                  ${hours ? (parseFloat(hours) * currentRate).toFixed(2) : '0.00'}
                </div>
                <div className="calc-result-detail">
                  {hours
                    ? `${parseFloat(hours).toFixed(2)} hrs × $${currentRate.toFixed(2)}/hr`
                    : 'Enter hours above'}
                </div>
              </div>
              <div className="calc-result" style={{ flex: 1, minWidth: 180 }}>
                <div className="calc-result-label">Est. Take-Home</div>
                <div className="calc-result-value" style={{ color: 'var(--success)' }}>
                  ${hours ? (parseFloat(hours) * currentNetRate).toFixed(2) : '0.00'}
                </div>
                <div className="calc-result-detail">
                  {hours
                    ? `${parseFloat(hours).toFixed(2)} hrs × $${currentNetRate.toFixed(2)}/hr net (~${(ACTUAL_WITHHOLDING_RATE * 100).toFixed(1)}% withheld)`
                    : 'Based on Feb 2026 actual withholdings'}
                </div>
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
                    <tr><th>Date</th><th>Hours</th><th>Gross Rate</th><th>Gross</th><th>Est. Net</th><th>Description</th><th></th></tr>
                  </thead>
                  <tbody>
                    {hoursSessions.map((s, i) => {
                      const netTotal = +(s.total * (1 - ACTUAL_WITHHOLDING_RATE)).toFixed(2);
                      return (
                        <tr key={i}>
                          <td>{s.date}</td>
                          <td>{s.hours.toFixed(2)}</td>
                          <td>${s.rate.toFixed(2)}/hr</td>
                          <td style={{ fontWeight: 600 }}>${s.total.toFixed(2)}</td>
                          <td style={{ fontWeight: 600, color: 'var(--success)' }}>${netTotal.toFixed(2)}</td>
                          <td>{s.description}</td>
                          <td>
                            <button className="btn btn-sm btn-success" onClick={async () => {
                              const ok = await saveHoursExpense(s);
                              if (ok) setHoursSessions(hoursSessions.filter((_, j) => j !== i));
                            }}>Save</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Total</td>
                      <td style={{ fontWeight: 600 }}>{hoursSessions.reduce((s, h) => s + h.hours, 0).toFixed(2)}</td>
                      <td></td>
                      <td style={{ fontWeight: 600 }}>${hoursSessions.reduce((s, h) => s + h.total, 0).toFixed(2)}</td>
                      <td style={{ fontWeight: 600, color: 'var(--success)' }}>${(hoursSessions.reduce((s, h) => s + h.total, 0) * (1 - ACTUAL_WITHHOLDING_RATE)).toFixed(2)}</td>
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
                    <th>Base</th>
                    <th>Denver</th>
                    <th>Rest of US</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(GS_RATES).map(([label, rates]) => (
                    <tr key={label}>
                      <td>{label} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(gross)</span></td>
                      <td>${rates.base.toFixed(2)}</td>
                      <td>${rates.denver.toFixed(2)}</td>
                      <td>${rates.restOfUS.toFixed(2)}</td>
                    </tr>
                  ))}
                  {Object.entries(NET_RATES).map(([label, rates]) => (
                    <tr key={`net-${label}`} style={{ color: 'var(--success)' }}>
                      <td>{label.replace(' (Chair)', '').replace(' (Member)', '')} <span style={{ fontSize: '0.75rem' }}>(net)</span></td>
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
              <li>Net rates based on Feb 2026 actual: <strong>~{(ACTUAL_WITHHOLDING_RATE * 100).toFixed(1)}% withheld</strong> (FICA 7.65% + fed ~10.4% + CO 4.4%)</li>
              <li>STC members are intermittent federal employees paid hourly</li>
              <li>Hourly rate = annual salary &divide; 2,087 hours</li>
              <li>Travel reimbursement is <strong>tax-free</strong> on top of compensation</li>
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
      {/* ════════════════════════════════════════════════════════════════
          TAB: INCOME & ACTUALS
          ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'income' && (
        <div className="tool-panel">
          {MEETING_INCOME.map((meeting, mi) => {
            const salaryPay = meeting.payments.find(p => p.type === 'salary');
            const travelPay = meeting.payments.find(p => p.type === 'travel');
            const totalIncome = meeting.payments.reduce((s, p) => s + p.amount, 0);

            // Salary analysis
            const gsRate = GS_RATES[incomeGrade]?.[incomeLocality] || 0;
            const hrs = parseFloat(incomeHours) || 0;
            const estimatedGross = hrs * gsRate;
            const deductions = estimatedGross - (salaryPay?.amount || 0);
            const deductionPct = estimatedGross > 0 ? (deductions / estimatedGross) * 100 : 0;
            const netHourly = hrs > 0 ? (salaryPay?.amount || 0) / hrs : 0;

            // Travel breakdown
            const mi2 = parseFloat(incomeMiles) || 0;
            const mileageEst = mi2 * MILEAGE_RATE;
            const travelTotal = travelPay?.amount || 0;
            const travelRemainder = travelTotal - mileageEst;

            // Per diem estimate (Denver meeting with overnight)
            const perDiem = PER_DIEM.denver;
            const lodgingEst = perDiem.lodging;
            const mieEst = perDiem.mieFirstLast; // 75% for first/last day
            const travelEstTotal = mileageEst + lodgingEst + mieEst;
            const travelDiff = travelTotal - travelEstTotal;

            return (
              <div key={mi}>
                {/* Payment summary */}
                <div className="card tool-card">
                  <div className="tool-header">
                    <h3>{meeting.month} — Payments Received</h3>
                    <span className="tool-badge">Deposited {meeting.depositDate}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                    Meeting: {meeting.meetingDate} &mdash; {meeting.location}
                  </p>

                  <div className="grid-3" style={{ marginBottom: 16 }}>
                    <div className="stat-card">
                      <div className="stat-value" style={{ color: 'var(--success)' }}>
                        ${(salaryPay?.amount || 0).toFixed(2)}
                      </div>
                      <div className="stat-label">Salary (Net)</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value" style={{ color: 'var(--info)' }}>
                        ${(travelPay?.amount || 0).toFixed(2)}
                      </div>
                      <div className="stat-label">Travel Reimb.</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">
                        ${totalIncome.toFixed(2)}
                      </div>
                      <div className="stat-label">Total Received</div>
                    </div>
                  </div>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr><th>Payment</th><th>Amount</th><th>Description</th></tr>
                      </thead>
                      <tbody>
                        {meeting.payments.map((p, pi) => (
                          <tr key={pi}>
                            <td style={{ fontWeight: 600 }}>{p.label}</td>
                            <td style={{ fontWeight: 600, color: 'var(--success)' }}>${p.amount.toFixed(2)}</td>
                            <td style={{ fontSize: '0.85rem' }}>{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {meeting.notes && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
                      {meeting.notes}
                    </p>
                  )}
                </div>

                {/* Salary / compensation analysis */}
                <div className="card tool-card" style={{ marginTop: 16 }}>
                  <div className="tool-header">
                    <h3>Salary Rate Analysis</h3>
                    <span className="tool-badge">Back-calculate from actual pay</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                    Adjust hours and rate below to match your actual work time and see how the
                    estimated gross compares to your net deposit of <strong>${(salaryPay?.amount || 0).toFixed(2)}</strong>.
                  </p>

                  <div className="form-row">
                    <div className="form-group">
                      <label>GS Grade</label>
                      <select value={incomeGrade} onChange={e => setIncomeGrade(e.target.value)}>
                        {Object.keys(GS_RATES).map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Locality</label>
                      <select value={incomeLocality} onChange={e => setIncomeLocality(e.target.value)}>
                        <option value="base">Base (no locality)</option>
                        <option value="denver">Denver-Aurora, CO (+30.52%)</option>
                        <option value="restOfUS">Rest of US (+17.06%)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Hours Worked</label>
                      <input
                        type="number" step="0.5" min="0" placeholder="e.g. 16"
                        value={incomeHours} onChange={e => setIncomeHours(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="table-wrap" style={{ marginTop: 12 }}>
                    <table>
                      <tbody>
                        <tr>
                          <td>Gross hourly rate</td>
                          <td style={{ fontWeight: 600 }}>${gsRate.toFixed(2)}/hr</td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{incomeGrade}, {incomeLocality === 'denver' ? 'Denver' : incomeLocality === 'restOfUS' ? 'Rest of US' : 'Base'}</td>
                        </tr>
                        <tr>
                          <td>Estimated gross pay</td>
                          <td style={{ fontWeight: 600 }}>${estimatedGross.toFixed(2)}</td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{hrs} hrs &times; ${gsRate.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Actual net received</td>
                          <td style={{ fontWeight: 600, color: 'var(--success)' }}>${(salaryPay?.amount || 0).toFixed(2)}</td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Deposited {meeting.depositDate}</td>
                        </tr>
                        <tr style={{ borderTop: '2px solid var(--border)' }}>
                          <td>Withholdings (est.)</td>
                          <td style={{ fontWeight: 600, color: deductions > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                            {deductions > 0 ? `-$${deductions.toFixed(2)}` : '$0.00'}
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {deductionPct > 0 ? `~${deductionPct.toFixed(1)}% effective rate (FICA + fed + state)` : '—'}
                          </td>
                        </tr>
                        <tr>
                          <td>Effective net hourly</td>
                          <td style={{ fontWeight: 600, color: 'var(--accent)' }}>${netHourly.toFixed(2)}/hr</td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>What you actually take home per hour</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {estimatedGross > 0 && deductions > 0 && (
                    <div className="card info-card" style={{ marginTop: 12 }}>
                      <h4>Withholding Estimate Breakdown</h4>
                      <ul style={{ paddingLeft: 18, fontSize: '0.85rem', lineHeight: 1.8 }}>
                        <li><strong>FICA (Social Security + Medicare):</strong> ~${(estimatedGross * 0.0765).toFixed(2)} (7.65% of ${estimatedGross.toFixed(2)})</li>
                        <li><strong>Federal income tax:</strong> ~${(deductions - estimatedGross * 0.0765 - estimatedGross * 0.044).toFixed(2)} (withholding per W-4)</li>
                        <li><strong>Colorado state tax:</strong> ~${(estimatedGross * 0.044).toFixed(2)} (4.4% flat rate)</li>
                        <li><strong>Total estimated:</strong> ~${(estimatedGross * 0.0765 + (deductions - estimatedGross * 0.0765 - estimatedGross * 0.044) + estimatedGross * 0.044).toFixed(2)} vs actual ${deductions.toFixed(2)}</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Travel analysis */}
                <div className="card tool-card" style={{ marginTop: 16 }}>
                  <div className="tool-header">
                    <h3>Travel Reimbursement Breakdown</h3>
                    <span className="tool-badge">Tax-free reimbursement</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                    Travel reimbursement of <strong>${travelTotal.toFixed(2)}</strong> is not subject to income tax.
                    Adjust round-trip miles to see the breakdown.
                  </p>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Round-trip Miles</label>
                      <input
                        type="number" step="1" min="0" placeholder="e.g. 340"
                        value={incomeMiles} onChange={e => setIncomeMiles(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="table-wrap" style={{ marginTop: 12 }}>
                    <table>
                      <thead>
                        <tr><th>Component</th><th>Estimated</th><th>Notes</th></tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Mileage ({mi2} mi &times; ${MILEAGE_RATE})</td>
                          <td style={{ fontWeight: 600 }}>${mileageEst.toFixed(2)}</td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>IRS standard rate</td>
                        </tr>
                        <tr>
                          <td>Lodging (1 night, Denver Feb)</td>
                          <td style={{ fontWeight: 600 }}>${lodgingEst.toFixed(2)}</td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>GSA FY2026 Denver rate</td>
                        </tr>
                        <tr>
                          <td>M&amp;IE (75% partial day)</td>
                          <td style={{ fontWeight: 600 }}>${mieEst.toFixed(2)}</td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Denver M&amp;IE $92/day, first/last = 75%</td>
                        </tr>
                        <tr style={{ borderTop: '2px solid var(--border)' }}>
                          <td style={{ fontWeight: 600 }}>Estimated total</td>
                          <td style={{ fontWeight: 600 }}>${travelEstTotal.toFixed(2)}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Actual received</td>
                          <td style={{ fontWeight: 600, color: 'var(--success)' }}>${travelTotal.toFixed(2)}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>Difference</td>
                          <td style={{ fontWeight: 600, color: Math.abs(travelDiff) < 10 ? 'var(--success)' : 'var(--warning, #f0ad4e)' }}>
                            {travelDiff >= 0 ? '+' : ''}{travelDiff.toFixed(2)}
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {Math.abs(travelDiff) < 10
                              ? 'Estimates very close to actual'
                              : 'Adjust miles or check if additional per diem days apply'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Overall summary */}
                <div className="card info-card" style={{ marginTop: 16 }}>
                  <h4>{meeting.month} — Summary</h4>
                  <div className="table-wrap" style={{ marginTop: 8 }}>
                    <table>
                      <thead>
                        <tr><th></th><th>Estimated</th><th>Actual</th><th>Diff</th></tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Compensation (gross)</td>
                          <td>${estimatedGross.toFixed(2)}</td>
                          <td style={{ color: 'var(--success)' }}>${(salaryPay?.amount || 0).toFixed(2)} net</td>
                          <td style={{ fontSize: '0.82rem' }}>~${deductions.toFixed(2)} withheld ({deductionPct.toFixed(1)}%)</td>
                        </tr>
                        <tr>
                          <td>Travel</td>
                          <td>${travelEstTotal.toFixed(2)}</td>
                          <td style={{ color: 'var(--success)' }}>${travelTotal.toFixed(2)}</td>
                          <td style={{ color: Math.abs(travelDiff) < 10 ? 'var(--success)' : 'var(--warning, #f0ad4e)' }}>
                            {travelDiff >= 0 ? '+' : ''}{travelDiff.toFixed(2)}
                          </td>
                        </tr>
                        <tr style={{ borderTop: '2px solid var(--border)' }}>
                          <td style={{ fontWeight: 600 }}>Total deposited</td>
                          <td></td>
                          <td style={{ fontWeight: 600, color: 'var(--success)' }}>${totalIncome.toFixed(2)}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <ul style={{ paddingLeft: 18, fontSize: '0.85rem', lineHeight: 1.8, marginTop: 8 }}>
                    <li><strong>Net hourly rate:</strong> ${netHourly.toFixed(2)}/hr (after all withholdings)</li>
                    <li><strong>Travel reimbursement:</strong> Tax-free — this is dollar-for-dollar what you keep</li>
                    <li>Salary withholdings include FICA (7.65%), federal income tax, and Colorado state tax (4.4%)</li>
                    <li>STC members are intermittent employees — no FEHB or TSP deductions</li>
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
