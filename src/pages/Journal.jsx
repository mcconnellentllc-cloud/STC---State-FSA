import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApiFetch } from '../auth/apiFetch';
import EntryEditor from '../components/EntryEditor';

/* ── Static Reference Entries ────────────────────────────────────── */
const PINNED_ENTRIES = [
  {
    id: 'upcoming-otero-crowley',
    pinned: true,
    date: '2026-03-17',
    title: 'Special Meeting: Otero/Crowley COC Administrative Leave Letters',
    location: 'Virtual / TBD',
    tags: 'special-meeting, otero-county, crowley-county, COC, employee-relations',
    source: 'Email — Jerry Sonnenberg / Steve Niemann',
    content: `UPCOMING: Monday, March 17, 2026 at 2:00 PM

PURPOSE:
The STC is meeting in special session to authorize Chairperson Donald Brown to sign Administrative Leave Letters for the members of the Otero/Crowley County Committee (COC). These letters were prepared by Steve Niemann (HR Specialist, Employee Relations, FPAC-FBC) and forwarded by Colorado Executive Director Jerry Sonnenberg.

KEY ACTION ITEMS:
1. STC reviews the Administrative Leave Letters for accuracy
2. Chairperson Donald Brown signs the letters (digital or wet signature)
3. Date of issuance must be reflected on the letter (currently dated March 17, 2026)
4. This action must be included in the STC minutes

DISTRIBUTION REQUIREMENTS (after signing):
- Deliver signed letter to each COC member via email
- Have a CO-FSA employee (e.g., District Director) notify each COC member that they have received a letter
- Mail a copy to each member via USPS with tracking (do NOT send certified/signature required)
- Return signed/dated letter + tracking confirmation to Employee Relations (Steve Niemann)

CHAIN OF COMMUNICATION:
- Steve Niemann (HR Specialist, Employee Relations) -> Jerry Sonnenberg (CO Executive Director) -> STC
- CC: Brandi May (ID), Kim Viers (MO), Rick Pinkston (DC)
- Contact Steve Niemann with any questions: (816) 926-6448 / steve.niemann@usda.gov

ATTENDEES (STC Members):
- Donald Brown (Chair) — dpbrown@anchorfarms.net
- Kyle McConnell
- Darrell Mackey — darrellmackey1976@gmail.com
- Joe Petrocco — joe@petroccofarms.com
- Steve Raftopoulos — straft@msn.com
- Jonathan Weishaar (FSA Staff) — jonathan.weishaar@usda.gov

OTERO/CROWLEY COC MEMBERS RECEIVING ADMINISTRATIVE LEAVE LETTERS:
(from files uploaded 3/15/2026)
1. Alisha Knapp — FILE IS 0 KB / APPEARS EMPTY OR CORRUPTED - flag to Jerry Sonnenberg
2. Andrew Walter Jr — Letter ready (47.4 KB)
3. Charles Hanagan — Letter ready (47.4 KB)
4. Doug Tecklenburg — Letter ready (47.5 KB)
5. Zachary Mason — Letter ready (47.4 KB)

ACTION: Verify the Alisha Knapp file is not corrupted before Monday. Contact Jerry Sonnenberg or Steve Niemann if a replacement file is needed.

STC AUTHORITY — 7 CFR PART 7 (POLICY COMPLIANCE ENFORCEMENT):
Removal of a county committee is a standard practice when committees do not follow policy. The STC has the authority under 7 CFR Part 7 to place members on administrative leave and proceed with removal.

§ 7.28(a) — "Adverse personnel actions involving any county committee member or alternate member, county executive director, or other county office employee will be taken for failing to perform the duties of their office, impeding the effectiveness of any program administered in the county, violating official instructions, or for misconduct."

§ 7.28(b) — "Any person whom FSA proposes to suspend or remove from office or employment must be given advance written notice of the reason for such action and must be advised of the right to reply to such a proposal and any right of further review and appeal if the person is removed or suspended."

§ 7.1(d) — "No provision or delegation to a State or county committee will preclude the FSA Administrator, or designee, from determining any question arising under this part, or from reversing or modifying any determination made by a State or county committee."

Administrative leave is NOT termination — it is a temporary removal from duties while matters are resolved. Removal is the expected next step if policy violations are confirmed.

VACANCY & REPLACEMENT POLICY — 7 CFR § 7.14:
When COC members are removed, their positions become vacancies filled under § 7.14:
1. Elected alternates fill vacancies automatically and assume the remainder of the unexpired term.
2. If no alternate is available, a special election may be held.
3. If no alternate is available, the State committee may designate a person to serve out the balance of the term.

§ 7.11 — "Alternates will serve, in the order of the number of votes received, as acting members of the county committee in case of the temporary absence of a member, or to become a member of the county committee in that same order elected in case of the resignation, disqualification, removal, or death of a member."

DISQUALIFICATION FROM FUTURE SERVICE — 7 CFR § 7.18:
Members removed for cause are disqualified from running for or holding COC office again. Under § 7.18, a person is ineligible if they have been "removed as a county committee member, alternate to any county office, or as an employee for: failure to perform the duties of the office; committing, attempting, or conspiring to commit fraud; incompetence; impeding the effectiveness of any program administered in the county; refusal to carry out or failure to comply with the Department's policy relating to equal opportunity and civil rights; or for violation of official instructions."

This disqualification may only be waived by the State committee or the Deputy Administrator.

NOTE: Letters should already be on appropriate letterhead. If edits are needed, contact Steve Niemann before issuing. This is a confidential personnel/employee relations matter.`,
  },
  {
    id: 'douglas-factors',
    pinned: false,
    date: '2026-03-16',
    title: 'Douglas Factors — Framework for Federal Disciplinary Penalty Determination',
    location: 'Reference / Legal',
    tags: 'douglas-factors, discipline, penalty, MSPB, employee-relations, COC, otero-crowley',
    source: 'Douglas v. Veterans Administration, 5 MSPR 280 (MSPB 1981)',
    content: `THE DOUGLAS FACTORS — BRIEF SUMMARY

The Douglas Factors are 12 criteria established by the Merit Systems Protection Board (MSPB) in Douglas v. Veterans Administration, 5 MSPR 280 (1981). Federal agencies must consider these factors when determining the appropriate penalty for employee misconduct or performance issues. They apply to adverse actions against federal employees, including removal, suspension, and demotion.

RELEVANCE TO OTERO/CROWLEY COC ACTION:
While COC members are elected officials (not traditional federal employees), the Douglas Factors provide the accepted federal framework for evaluating whether a proposed penalty is reasonable and consistent. Employee Relations (Steve Niemann, FPAC-FBC) would reference these factors when recommending adverse action under 7 CFR § 7.28.

THE 12 DOUGLAS FACTORS:

1. NATURE AND SERIOUSNESS OF THE OFFENSE
   How serious is the misconduct? Does it relate to the employee's duties, position, or the agency's mission? The more directly the offense undermines the agency's mission, the more serious.

2. EMPLOYEE'S JOB LEVEL AND TYPE OF EMPLOYMENT
   Employees in positions of trust or authority are held to a higher standard. COC members carry fiduciary and programmatic responsibilities for FSA program administration.

3. PAST DISCIPLINARY RECORD
   Prior offenses, warnings, or corrective actions. A pattern of misconduct supports a more severe penalty; a clean record may mitigate.

4. PAST WORK RECORD (LENGTH OF SERVICE)
   Overall performance history and years of service. Long, satisfactory service can be a mitigating factor.

5. EFFECT ON THE EMPLOYEE'S ABILITY TO PERFORM
   Does the misconduct impair the employee's ability to carry out their duties? If trust is broken or the working relationship is damaged, this weighs toward removal.

6. CONSISTENCY OF THE PENALTY
   Is the proposed penalty consistent with how similar offenses have been handled for other employees in the agency? Disparate treatment can be grounds for reversal.

7. CONSISTENCY WITH THE TABLE OF PENALTIES
   Does the penalty align with the agency's published table of penalties or guidelines? Agencies typically have internal guidance on standard ranges.

8. NOTORIETY OF THE OFFENSE / IMPACT ON AGENCY REPUTATION
   Did the misconduct become known to the public or other employees? Offenses that embarrass the agency or undermine public confidence weigh toward stricter penalties.

9. CLARITY OF NOTICE
   Was the employee clearly on notice that the conduct was wrong? Were rules, policies, and expectations communicated? Lack of notice can mitigate.

10. POTENTIAL FOR REHABILITATION
    Is there reason to believe the employee will correct the behavior? Willingness to accept responsibility and change is mitigating; denial or repeated offenses are aggravating.

11. MITIGATING CIRCUMSTANCES
    Any other factors that argue for a lesser penalty — personal hardship, unusual stress, provocation, management contributing to the problem, etc.

12. ADEQUACY AND EFFECTIVENESS OF ALTERNATIVE SANCTIONS
    Could a lesser penalty (reprimand, short suspension, reassignment) adequately address the problem? Removal should not be the default if a lesser action would be effective.

KEY PRINCIPLES:
- The agency bears the burden of showing the penalty is reasonable.
- Not all factors will be relevant in every case.
- The penalty must "promote the efficiency of the service."
- The MSPB can mitigate (reduce) a penalty if the agency fails to properly weigh these factors.
- Employees have the right to respond to proposed actions and raise Douglas Factors in their defense (consistent with 7 CFR § 7.28(b) due process requirements).

PRACTICAL APPLICATION FOR STC:
When reviewing the Otero/Crowley COC administrative leave letters, the STC should be aware that these factors inform the Employee Relations recommendation. If a COC member challenges the action, the MSPB or reviewing authority will evaluate whether the Douglas Factors were properly considered.`,
  },
];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedPinned, setExpandedPinned] = useState({});
  const navigate = useNavigate();
  const apiFetch = useApiFetch();

  const fetchEntries = (q = '') => {
    setLoading(true);
    const url = q ? `/api/entries?search=${encodeURIComponent(q)}` : '/api/entries';
    apiFetch(url)
      .then(r => r.json())
      .then(setEntries)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEntries(); }, [apiFetch]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEntries(search);
  };

  const handleSave = async (data) => {
    const res = await apiFetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      setShowEditor(false);
      fetchEntries();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Journal</h2>
        <button className="btn btn-primary" onClick={() => setShowEditor(true)}>+ New Entry</button>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search entries..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">Search</button>
      </form>

      {showEditor && (
        <div className="modal-overlay" onClick={() => setShowEditor(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Journal Entry</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowEditor(false)}>X</button>
            </div>
            <EntryEditor onSave={handleSave} onCancel={() => setShowEditor(false)} />
          </div>
        </div>
      )}

      {/* ── Pinned / Upcoming Entries ──────────────────────────────── */}
      {PINNED_ENTRIES.filter(e => e.pinned).map(entry => (
        <div key={entry.id} className="card" style={{ marginBottom: 16, borderLeft: '4px solid var(--warning, #f0ad4e)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <span style={{
                display: 'inline-block', padding: '2px 10px', borderRadius: 12,
                fontSize: '0.75rem', fontWeight: 700, marginBottom: 6,
                background: 'var(--warning-bg, #fff3cd)', color: 'var(--warning, #856404)',
              }}>UPCOMING</span>
              <h3 style={{ margin: 0 }}>{entry.title}</h3>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{entry.date}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
            {entry.location} &mdash; {entry.source}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {entry.tags.split(',').map((t, i) => (
              <span key={i} className="tag">{t.trim()}</span>
            ))}
          </div>
          {expandedPinned[entry.id] ? (
            <div>
              <pre style={{
                whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem',
                lineHeight: 1.7, margin: 0, padding: 16,
                background: 'var(--bg-secondary, #f8f9fa)', borderRadius: 8,
              }}>{entry.content}</pre>
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => setExpandedPinned(p => ({ ...p, [entry.id]: false }))}
              >Collapse</button>
            </div>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setExpandedPinned(p => ({ ...p, [entry.id]: true }))}
            >Show Full Details</button>
          )}
        </div>
      ))}

      {/* ── Reference Entries (non-pinned) ────────────────────────── */}
      {PINNED_ENTRIES.filter(e => !e.pinned).map(entry => (
        <div key={entry.id} className="card" style={{ marginBottom: 16, borderLeft: '4px solid var(--accent, #6c5ce7)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <span style={{
                display: 'inline-block', padding: '2px 10px', borderRadius: 12,
                fontSize: '0.75rem', fontWeight: 700, marginBottom: 6,
                background: 'var(--accent-bg, #e8e4fd)', color: 'var(--accent, #6c5ce7)',
              }}>REFERENCE</span>
              <h3 style={{ margin: 0 }}>{entry.title}</h3>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{entry.date}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
            {entry.location} &mdash; {entry.source}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {entry.tags.split(',').map((t, i) => (
              <span key={i} className="tag">{t.trim()}</span>
            ))}
          </div>
          {expandedPinned[entry.id] ? (
            <div>
              <pre style={{
                whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem',
                lineHeight: 1.7, margin: 0, padding: 16,
                background: 'var(--bg-secondary, #f8f9fa)', borderRadius: 8,
              }}>{entry.content}</pre>
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => setExpandedPinned(p => ({ ...p, [entry.id]: false }))}
              >Collapse</button>
            </div>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setExpandedPinned(p => ({ ...p, [entry.id]: true }))}
            >Show Full Details</button>
          )}
        </div>
      ))}

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <h3>No entries found</h3>
          <p>Create your first journal entry to get started.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Location</th>
                <th>Tags</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id} className="clickable-row" onClick={() => navigate(`/journal/${e.id}`)}>
                  <td>{e.date}</td>
                  <td style={{ fontWeight: 500 }}>{e.title}</td>
                  <td>{e.location || '\u2014'}</td>
                  <td>
                    {e.tags ? e.tags.split(',').map((t, i) => (
                      <span key={i} className="tag">{t.trim()}</span>
                    )) : '\u2014'}
                  </td>
                  <td>{e.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
