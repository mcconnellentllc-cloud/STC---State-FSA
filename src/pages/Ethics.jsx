import React, { useState } from 'react';

/* ── OGE 450 Filing Info ───────────────────────────────────────── */
const FILING_INFO = {
  filingUrl: 'https://fd.intelliworxit.com/client/auth/welcome',
  username: 'kyle@togoag.com',
  ethicsEmail: 'ethics-fpc@usda.gov',
  ethicsAdvisors: 'https://www.usda.gov/oe/ethics-advisors',
  dueDate: '2026-03-13',
  formType: 'OGE Form 450 — Confidential Financial Disclosure Report',
  filingType: 'New Entrant Report',
};

const WORK_INFO = {
  positionTitle: 'State Committee Member',
  gradePay: 'GS-14 Step 1',
  department: 'United States Department of Agriculture (USDA)',
  branch: 'Farm Production and Conservation (FPAC) — Farm Service Agency (FSA), Colorado State Office',
  addressCountry: 'United States',
  addressStreet: 'Denver Federal Center, Building 56',
  addressSuite: 'Room 2760',
  addressCity: 'Denver',
  addressState: 'Colorado',
  addressZip: '80225-0426',
  workPhone: '720-544-2876',
  appointmentDate: '01/13/2026',
};

/* ── 2026 OGE-450 Filing Record ──────────────────────────────── */
const FILING_RECORD = {
  submittedDate: '2026-03-13',
  reportingPeriod: 'New Entrant (as of filing date)',
  formVersion: 'OGE Form 450 (08/2024)',
  assets: [
    {
      name: 'Togo Ag',
      location: 'Haxtun, CO',
      description: 'Retail Ag Inputs and Farm Fresh Beef',
      heldBy: 'Joint (by others)',
      underlyingAssets: 'Cash',
      stillHeld: true,
    },
    {
      name: 'M77 Ag',
      location: 'Haxtun, CO',
      description: 'Production Agriculture',
      heldBy: 'Joint',
      underlyingAssets: 'Cash',
      stillHeld: true,
    },
    {
      name: 'McConnell Enterprises',
      location: 'Haxtun, CO',
      description: 'Retail Ag Input Sales',
      heldBy: 'Joint',
      underlyingAssets: 'Cash',
      stillHeld: true,
    },
    {
      name: 'AcreProfit',
      location: 'Haxtun, CO',
      description: 'Agriculture',
      heldBy: 'Self',
      underlyingAssets: 'Cash',
      stillHeld: true,
    },
  ],
  spouseIncome: [
    {
      employer: 'Northeast Boces',
      location: 'Haxtun, CO',
      type: 'Salary',
    },
  ],
  liabilities: [],
  outsidePositions: [
    { organization: 'M77 Ag', location: 'Haxtun, CO', position: 'Member' },
    { organization: 'McConnell Enterprises', location: 'Haxtun, CO', position: 'Member' },
    { organization: 'Togo Ag', location: 'Haxtun, CO', position: 'Member' },
    { organization: 'AcreProfit', location: 'Haxtun, CO', position: 'Owner' },
  ],
  agreements: [],
  payments: [
    {
      date: '03/02/2026',
      source: 'US Department of Agriculture',
      description: 'STC Meeting Pay (net)',
      amount: 833.75,
      type: 'Deposit',
    },
    {
      date: '03/02/2026',
      source: 'Federal Travel Payments',
      description: 'Travel Reimbursement (mileage & per diem)',
      amount: 491.91,
      type: 'Deposit',
    },
  ],
};

const DISCLOSURE_GUIDE = [
  {
    part: 'Part I',
    title: 'Assets & Income',
    threshold: 'Report assets/income sources over $1,000 in value or that generated over $200 in income',
    items: [
      'Farm/ranch operations and land holdings',
      'ToGo Ag business interests',
      'McConnell Ent LLC interests',
      'Stocks, bonds, mutual funds, retirement accounts (individual holdings over $1,000)',
      'Rental property or real estate investments',
      'USDA program payments received (CRP, ARC/PLC, ELAP, etc.)',
      'Crop insurance indemnities',
      'STC compensation (GS-14, ~$1,075/meeting gross) — this is your federal salary, usually excluded',
    ],
    notes: 'Diversified mutual funds and your federal salary are generally exempt. Focus on individual stocks, business interests, and farm program payments that could create conflicts with FSA decisions.',
  },
  {
    part: 'Part II',
    title: 'Liabilities',
    threshold: 'Report debts over $10,000 owed to any single creditor (excluding mortgage on personal residence)',
    items: [
      'Farm operating loans / lines of credit',
      'Equipment financing',
      'Land mortgages (other than personal residence)',
      'FSA direct or guaranteed loans (important — FSA conflict)',
      'Commodity Credit Corporation (CCC) loans',
    ],
    notes: 'If you have any FSA direct or guaranteed loans, these must be disclosed as they directly relate to your oversight role.',
  },
  {
    part: 'Part III',
    title: 'Outside Positions',
    threshold: 'Report positions held with any outside entity (paid or unpaid)',
    items: [
      'ToGo Ag — owner/operator (or applicable title)',
      'McConnell Ent LLC — member/manager',
      'Colorado Corn Growers Association — board member',
      'Any other farm organization boards',
      'Any other business entities or partnerships',
    ],
    notes: 'Include all positions regardless of compensation. Board memberships in agricultural organizations are especially relevant to STC work.',
  },
  {
    part: 'Part IV',
    title: 'Agreements or Arrangements',
    threshold: 'Report agreements for future employment, leave of absence, or continuation of payments',
    items: [
      'Any agreements with prior employers',
      'Consulting arrangements',
      'Partnership agreements that continue during federal service',
    ],
    notes: 'Most STC members won\'t have much here unless they have formal arrangements with their farm operations that relate to their federal role.',
  },
  {
    part: 'Part V',
    title: 'Gifts & Travel Reimbursements',
    threshold: 'Report gifts/travel reimbursements from non-federal sources over $415 (2026)',
    items: [
      'Travel paid by agricultural organizations',
      'Speaking fees or honoraria',
      'Gifts from entities doing business with FSA',
      'Conference attendance paid by non-federal sources',
    ],
    notes: 'Federal travel reimbursement from USDA does not need to be reported here. This is only for non-federal sources.',
  },
];

/* ── Copy helper ───────────────────────────────────────────────── */
function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <tr>
      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</td>
      <td>{value}</td>
      <td style={{ width: 60 }}>
        <button
          className={`btn btn-sm ${copied ? 'btn-success' : 'btn-secondary'}`}
          onClick={handleCopy}
          style={{ fontSize: '0.75rem', padding: '2px 8px' }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </td>
    </tr>
  );
}

/* ── Main Component ────────────────────────────────────────────── */
export default function Ethics() {
  const now = new Date();
  const due = new Date(FILING_INFO.dueDate + 'T23:59:59');
  const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;
  const isUrgent = daysLeft <= 3 && !isOverdue;

  return (
    <div>
      <div className="page-header">
        <h2>Ethics &amp; OGE 450</h2>
      </div>

      {/* Deadline banner */}
      <div className="card" style={{
        marginBottom: 20,
        padding: '16px 24px',
        borderLeft: `4px solid ${isOverdue ? 'var(--danger)' : isUrgent ? 'var(--warning, #f0ad4e)' : 'var(--success)'}`,
        background: isOverdue ? 'rgba(220,53,69,0.06)' : isUrgent ? 'rgba(240,173,78,0.06)' : undefined,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
              {FILING_INFO.formType}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              {FILING_INFO.filingType} &mdash; Due: <strong>{FILING_INFO.dueDate}</strong>
              {isOverdue
                ? <span style={{ color: 'var(--danger)', marginLeft: 8, fontWeight: 700 }}>OVERDUE by {Math.abs(daysLeft)} day(s)</span>
                : <span style={{ color: isUrgent ? 'var(--warning, #f0ad4e)' : 'var(--success)', marginLeft: 8, fontWeight: 600 }}>{daysLeft} day(s) remaining</span>
              }
            </div>
          </div>
          <a
            href={FILING_INFO.filingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            File OGE 450 &rarr;
          </a>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 8 }}>
          Username: <strong>{FILING_INFO.username}</strong> &mdash;
          Password: <em>on GTK spreadsheet</em> &mdash;
          Questions: <a href={`mailto:${FILING_INFO.ethicsEmail}`}>{FILING_INFO.ethicsEmail}</a> &mdash;
          <a href={FILING_INFO.ethicsAdvisors} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 4 }}>Ethics Advisors List</a>
        </div>
      </div>

      {/* ── 2026 OGE-450 Filing Record ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="card-title">2026 OGE-450 Filing Record</span>
          <span style={{
            background: 'var(--success)',
            color: '#fff',
            padding: '3px 10px',
            borderRadius: 12,
            fontSize: '0.78rem',
            fontWeight: 700,
          }}>
            SUBMITTED {FILING_RECORD.submittedDate}
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          {FILING_RECORD.formVersion} &mdash; {FILING_RECORD.reportingPeriod}
        </p>

        {/* Part I: Assets */}
        <details className="meeting-expandable" open>
          <summary>
            <strong>Part I: Privately Held Trades or Businesses</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 8 }}>
              {FILING_RECORD.assets.length} reported
            </span>
          </summary>
          <div className="expandable-content">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Description</th>
                    <th>Location</th>
                    <th>Held By</th>
                    <th>Underlying</th>
                    <th>Still Held</th>
                  </tr>
                </thead>
                <tbody>
                  {FILING_RECORD.assets.map((a, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{a.name}</td>
                      <td>{a.description}</td>
                      <td>{a.location}</td>
                      <td>{a.heldBy}</td>
                      <td>{a.underlyingAssets}</td>
                      <td>{a.stillHeld ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>

        {/* Part I: Spouse Earned Income */}
        <details className="meeting-expandable" open>
          <summary>
            <strong>Part I: Spouse Earned Income</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 8 }}>
              {FILING_RECORD.spouseIncome.length} reported
            </span>
          </summary>
          <div className="expandable-content">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Employer</th><th>Location</th><th>Type</th></tr>
                </thead>
                <tbody>
                  {FILING_RECORD.spouseIncome.map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{s.employer}</td>
                      <td>{s.location}</td>
                      <td>{s.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>

        {/* Part II: Liabilities */}
        <details className="meeting-expandable">
          <summary>
            <strong>Part II: Liabilities</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 8 }}>
              None reported
            </span>
          </summary>
          <div className="expandable-content">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No reportable liabilities over $10,000.
            </p>
          </div>
        </details>

        {/* Part III: Outside Positions */}
        <details className="meeting-expandable" open>
          <summary>
            <strong>Part III: Outside Positions</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 8 }}>
              {FILING_RECORD.outsidePositions.length} reported
            </span>
          </summary>
          <div className="expandable-content">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Organization</th><th>Location</th><th>Position</th></tr>
                </thead>
                <tbody>
                  {FILING_RECORD.outsidePositions.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{p.organization}</td>
                      <td>{p.location}</td>
                      <td>{p.position}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>

        {/* Part IV: Agreements */}
        <details className="meeting-expandable">
          <summary>
            <strong>Part IV: Agreements or Arrangements</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 8 }}>
              None reported
            </span>
          </summary>
          <div className="expandable-content">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No reportable agreements or arrangements.
            </p>
          </div>
        </details>

        {/* STC Payments Received */}
        <details className="meeting-expandable" open>
          <summary>
            <strong>STC Payments Received</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 8 }}>
              {FILING_RECORD.payments.length} deposits &mdash; ${FILING_RECORD.payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)} total
            </span>
          </summary>
          <div className="expandable-content">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {FILING_RECORD.payments.map((p, i) => (
                    <tr key={i}>
                      <td>{p.date}</td>
                      <td style={{ fontWeight: 600 }}>{p.source}</td>
                      <td>{p.description}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>
                        ${p.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700, borderTop: '2px solid var(--border)' }}>
                    <td colSpan={3} style={{ textAlign: 'right' }}>Total Deposited</td>
                    <td style={{ textAlign: 'right', color: 'var(--success)' }}>
                      ${FILING_RECORD.payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div style={{
              background: 'rgba(var(--info-rgb, 23,162,184), 0.08)',
              borderRadius: 6,
              padding: '10px 14px',
              marginTop: 8,
              fontSize: '0.85rem',
            }}>
              <strong>Note:</strong> STC meeting gross pay is ~$1,075 (GS-14 Step 1, 8 hrs). Net deposit of $833.75 reflects federal/state tax withholding. Travel reimbursement of $491.91 covers mileage and per diem — non-taxable.
            </div>
          </div>
        </details>
      </div>

      {/* Work Information — copy-paste ready */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">Work Information (Page 1)</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
          Click "Copy" next to any field to copy the value to your clipboard, then paste it into the OGE 450 form.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Field</th><th>Value</th><th></th></tr>
            </thead>
            <tbody>
              <CopyField label="Position/Title" value={WORK_INFO.positionTitle} />
              <CopyField label="Grade/Pay Band" value={WORK_INFO.gradePay} />
              <CopyField label="Department or Agency" value={WORK_INFO.department} />
              <CopyField label="Branch/Unit" value={WORK_INFO.branch} />
              <CopyField label="Country" value={WORK_INFO.addressCountry} />
              <CopyField label="Street Address" value={WORK_INFO.addressStreet} />
              <CopyField label="Suite/Room" value={WORK_INFO.addressSuite} />
              <CopyField label="City" value={WORK_INFO.addressCity} />
              <CopyField label="State" value={WORK_INFO.addressState} />
              <CopyField label="Zip Code" value={WORK_INFO.addressZip} />
              <CopyField label="Work Phone" value={WORK_INFO.workPhone} />
              <CopyField label="Date of Appointment" value={WORK_INFO.appointmentDate} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclosure Guide */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">What to Report &mdash; STC Member Guide</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          As an STC member, you oversee FSA programs. The OGE 450 ensures your personal financial
          interests don't conflict with program decisions. Below is a guide to what's typically
          reported for each part of the form.
        </p>

        {DISCLOSURE_GUIDE.map((section, i) => (
          <details key={i} className="meeting-expandable" open={i < 2}>
            <summary>
              <strong>{section.part}: {section.title}</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                {section.threshold}
              </span>
            </summary>
            <div className="expandable-content">
              <ul style={{ paddingLeft: 18, lineHeight: 1.8 }}>
                {section.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
              <div style={{
                background: 'rgba(var(--info-rgb, 23,162,184), 0.08)',
                borderRadius: 6,
                padding: '10px 14px',
                marginTop: 8,
                fontSize: '0.85rem',
              }}>
                <strong>Note:</strong> {section.notes}
              </div>
            </div>
          </details>
        ))}
      </div>

      {/* Key conflict areas for STC */}
      <div className="card info-card" style={{ marginBottom: 20 }}>
        <h4>Key Conflict Areas for STC Members</h4>
        <ul style={{ paddingLeft: 18, fontSize: '0.85rem', lineHeight: 1.8 }}>
          <li><strong>CRP:</strong> If you or family members have CRP contracts, disclose the land and rental payments</li>
          <li><strong>ARC/PLC:</strong> If enrolled, disclose — you help oversee county committee decisions on these</li>
          <li><strong>ELAP/LFP/LIP:</strong> If you've received disaster payments, disclose</li>
          <li><strong>FSA Loans:</strong> Any direct or guaranteed FSA loans are a significant conflict area</li>
          <li><strong>Crop Insurance:</strong> While administered by RMA not FSA, large indemnities may be relevant</li>
          <li><strong>Ag Organizations:</strong> Board positions on groups that lobby USDA on FSA programs</li>
          <li>When in doubt, <strong>disclose it</strong> — your ethics official can determine if it's a conflict</li>
        </ul>
      </div>

      {/* Filing tips */}
      <div className="card info-card">
        <h4>Filing Instructions Reminder</h4>
        <ol style={{ paddingLeft: 18, fontSize: '0.85rem', lineHeight: 2 }}>
          <li>Log in at <a href={FILING_INFO.filingUrl} target="_blank" rel="noopener noreferrer">{FILING_INFO.filingUrl}</a> with username <strong>{FILING_INFO.username}</strong></li>
          <li>Complete all sections (Personal Info, Work Info, Parts I&ndash;V)</li>
          <li>Click <strong>"Review My Answers"</strong> when done</li>
          <li>Click <strong>"Review and Submit My Forms"</strong></li>
          <li>Click <strong>"Sign &amp; Submit My Forms"</strong></li>
          <li>Enter your password and click <strong>"Submit"</strong></li>
          <li>You should see <strong>"That's It"</strong> — then log out</li>
          <li>You'll receive a confirmation email</li>
        </ol>
        <p style={{ fontSize: '0.85rem', marginTop: 8 }}>
          Need an extension? Email <a href={`mailto:${FILING_INFO.ethicsEmail}`}>{FILING_INFO.ethicsEmail}</a> <strong>before</strong> the due date.
        </p>
      </div>
    </div>
  );
}
