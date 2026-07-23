import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApiFetch } from '../auth/apiFetch';
import EntryEditor from '../components/EntryEditor';

/* ── Static Reference Entries ────────────────────────────────────── */
const PINNED_ENTRIES = [
  {
    id: 'march-24-meeting-otero-delegation',
    pinned: true,
    date: '2026-03-24',
    title: 'STC Meeting — Special Session: Otero County Delegation Authorization',
    location: 'Colorado STC Meeting',
    tags: 'meeting, special-session, otero-county, delegation, motion, COC',
    source: 'Live Meeting — March 24, 2026',
    content: `COLORADO STC MEETING — MARCH 24, 2026

OPENING: Special Session — Otero County Official Business

MOTION:
Motion to confirm and authorize the Otero County delegation to affirm the STC to handle affairs on behalf of Otero County.

This motion delegates authority from the Otero County COC to the State Committee (STC) to manage and administer Otero County FSA affairs during the period in which COC members are on administrative leave.

CONTEXT:
- Follows the March 17, 2026 special meeting where Chairperson Donald Brown signed Administrative Leave Letters for Otero/Crowley COC members
- Under 7 CFR Part 7, the STC has authority to oversee county operations when the COC is unable to perform duties
- This delegation ensures continuity of FSA program administration in Otero County

STATUS: Motion made — awaiting second, discussion, and vote.

─────────────────────────────────────────────
REGULAR SESSION
─────────────────────────────────────────────

Chairman Donald Brown called the regular session to order at 9:15 AM.

AGENDA ITEM: Approval of Sonnenberg Report
- Executive Director Jerry Sonnenberg's report presented for approval.
- Status: Awaiting motion/vote.

─────────────────────────────────────────────
AGENDA ITEM: FBA Program — Colorado Payment Status
─────────────────────────────────────────────

QUESTION RAISED: What percentage of Colorado's FBA program has been paid? Over $117,000,000 has been paid.

RESEARCH FINDINGS:
- National FBA Program: $11 billion in one-time bridge payments ($12B total with specialty crops)
- Enrollment period: Feb 23 – April 17, 2026; payments began Feb 28, 2026
- Top states by projected payments: TX ($1.1B), IA ($893M), KS ($888M), IL ($832M)
- Western states (including CO) receive a smaller share (~10% of $11B split among western/northeast states)
- Colorado's key eligible crops: Wheat ($39.35/acre), Corn ($44.36/acre), Sorghum ($48.11/acre)

COLORADO ANALYSIS:
- If $117M has been paid to Colorado producers, that represents approximately 1.06% of the $11B national FBA program
- Enrollment is still open through April 17, 2026 — final Colorado total expected to be higher
- Payment cap: $155,000 per producer / AGI limit: $900,000
- Exact Colorado percentage of eligible acres paid vs. remaining requires FSA weekly state disbursement data
- Recommended source: FSA weekly state-by-state payment tracker or CO FSA State Office

STATUS: Question noted — exact percentage to be confirmed via FSA disbursement reports.

─────────────────────────────────────────────
AGENDA ITEM: Travel Budget — Overspent
─────────────────────────────────────────────

REPORTED: The travel budget is overspent.

ACTION TAKEN:
- No more State Committee travel authorized.
- All future STC meetings will be conducted via Zoom.
- Effective immediately.

─────────────────────────────────────────────
RECESS called at 10:55 AM.
─────────────────────────────────────────────

─────────────────────────────────────────────
ACTION ITEM — APRIL MEETING PREP
─────────────────────────────────────────────

EMAIL FROM JONATHAN WEISHAAR (received during recess):
Subject: STC Cost Share Rates to Review

Hunter Cleveland has prepared tables for STC review before the April meeting:
1. CRP Cost Share Rates — 50% cost share
2. EFRP (Emergency Forest Restoration Program) Cost Share Rates — 75% cost share

Tables are available in Box for review.
ACTION: STC members to review CRP and EFRP cost share rate tables prior to April meeting and be prepared to vote on approval.

NOTE: Meeting in recess. Additional agenda items and actions will be recorded when session resumes.`,
  },
  {
    id: 'appeals-training-april-8',
    pinned: true,
    date: '2026-04-08',
    title: 'Appeals Training — STC Members',
    location: 'Virtual / Zoom',
    tags: 'training, appeals, NAD, CRP, procedures',
    source: 'STC Training Session — April 8, 2026',
    content: `APPEALS TRAINING — APRIL 8, 2026 (MORNING SESSION)

TRAINING NOTES:
(To be recorded during session)

─────────────────────────────────────────────
TOPICS TO COVER:
─────────────────────────────────────────────

- NAD (National Appeals Division) appeal procedures
- STC role and authority in appeals process
- Evidence review and record-building
- Hearing procedures and participant roles
- Timeline requirements and deadlines
- CRP appeal case studies (reference: Ebright appeal from March 24 meeting)
- 7 CFR Part 780 — Appeals regulations
- Best practices for STC deliberation on appeal cases

─────────────────────────────────────────────
NOTES:
─────────────────────────────────────────────

(Live notes will be added during the training session)`,
  },
  {
    id: 'july-23-stc-meeting',
    pinned: true,
    date: '2026-07-23',
    title: 'STC Meeting — July 23, 2026',
    location: 'Virtual Meeting via Teams · (970) 812-0909 ID: 434618184#',
    tags: 'meeting, STC, july, ARC-PLC, CRP, ECP, NAP, NCT, action-items',
    source: 'Anticipated — July 23, 2026 (packets parsed 07/15)',
    content: `COLORADO STC MEETING — JULY 23, 2026
Regular Session convenes 9:00 AM · Executive Session 10:30 AM
Guests: None scheduled · Recusals: None in the July 23 record

─────────────────────────────────────────────
COMMITTEE MEMBERS (from June 24, 2026 minutes)
─────────────────────────────────────────────
· Don Brown, Chairperson
· Kyle McConnell
· Steve Raftopoulos
· Joe Petrocco
· Darrell Mackey
(Project references "six STC members" — sixth not enumerated in available sources.)

═════════════════════════════════════════════
REGULAR SESSION — 9:00 AM
═════════════════════════════════════════════

1. Call to Order
2. Approve Regular Session Minutes — June 25, 2026  [Cindy Vukasin] (ACTION)
   ⚠ Agenda cites Jun 25; corpus contains Jun 24 minutes — confirm date.
3. State Executive Director Report (10 min) — Jerry Sonnenberg (oral + written)
4. District Director Reports (20 min)
   D1 Scott Brase · D2 Jon Weishaar (oral) · D3 Woody Woods · D4 Sam Montoya
5. Senior Leadership Reports (10 min)
   Kim Lacy (Acting FL Chief) · Cindy Vukasin & Corey Pelton (FP Chiefs) · Jon Weishaar (DSED, oral)
6. ARC/PLC — 2025 DAFP Yield Solicitation (30 min) — Doug Andresen  [ACTION]
   Approve missing 2025 county yields as presented (corn, flaxseed, grain sorghum,
   peanuts, sunflower seed; Exhibit 1 also includes soybeans).
   Authority: 1-ARCPLC ¶134; benchmark = Olympic average of 5 crop years 2019-2023.
7. State Committee Field Discussion Update
8. Adjourn Regular Session

═════════════════════════════════════════════
EXECUTIVE SESSION — 10:30 AM
═════════════════════════════════════════════

1. Call to Order
2. Approve Executive Session Minutes — June 25, 2026  [Cindy Vukasin] (ACTION)
3. CRP — Cost Share Increase — Baca County — Schroder Red Angus (10 min) — Hunter Cleveland  [ACTION]
   Contract 12006 · Tract 6810 · 125.94 ac · Grassland CRP Signup 203 · signed 08/04/2021
   Component COCRP6577 (Water Well >300-600 ft), extent 400 ft
   FY2022 max payable: $19.50/ft (100% = $39.00/ft) → cost share requested at that rate = $7,800.00
   Actual: $107.07/ft · $42,828.66 total
   STO recommends increased rate of $107/ft; recommend to DAFP
   Authority: 2-CRP (Rev. 6) ¶509
   ⚠ Cost-figure discrepancy: DR says $42,828.66; COC letter (scanned) says "roughly $46,668.00 on the well alone" — reconcile before vote.

4a. ECP — Rio Blanco — Eleanor Carter (10 min) — Hunter Cleveland  [ACTION]
    Disaster: Elk Fire (14,518 ac) + Lee Fire (137,755 ac), both 08/02/2025, lightning
    Rio Blanco COC convened 06/04/2026; STC recommends approval to DAFP
    Authority: Notice ECP-101 (≤$250K COC / $250,001-$400K STC / >$400K ECP-PM)

4b. ECP — Rio Blanco — Mike Lopez (10 min) — Hunter Cleveland  [ACTION]
    Same disaster basis and authority as 4a.

5a. NAP — NCT General Pricing Guidelines for Fg crops (10 min) — Janae Rader  [ACTION]
    Set guide/standard on Fg pricing.
    AMP = Olympic average of 5 most recent crop years; benchmark NASS CO (CASS)
    all-other-hay price $165.00 (2024). Alfalfa & AGM stay on RMA forage policy.

5b. NAP — 2027 NCT Colorado (10 min) — Janae Rader  [ACTION]
    Accept 2027 NCT data as presented for each crop (unless flagged):
    · Apples (0054)     · Apricots (0326)   · Cherries (0128)    · Garlic (0423)
    · Grapes (0053)     · Honey (1190)      · Hops (0138)        · Peaches (0034)
    · Pears (0144)      · Triticale (0158) [multiple STC changes — see index]
    ⚠ Cherries DR body says code 1028 (vs 0128 in header/tables) — flag NAP-CHERRY-CODE
    ⚠ Grapes DR says "44 types of Cherries" (should read Grapes) — flag NAP-GRAPE-TYPO
    ⚠ Hops DR dated 08.05.25, references 2026 record, no explicit action line — flag NAP-HOPS-DR

5c. NAP — New Crop Request — Las Animas — Beans PNT De Ir (5 min) — Janae Rader  [ACTION]
    Add Beans-pinto (PNT), dry edible (De), irrigated (Ir) for 2026+ in Las Animas (code 0047)
    STO recommends: PP 0.63 · UH 0.80 · organic 0.65 · trans 0.65 · FPD 06/20 · NHD 10/31 · ACD 03/15
    Yields: 2021 1079 · 2022 1079 · 2023 1079 · 2024 1179 · 2025 1179
    AMP: $0.28/lb conventional & transitional; $0.56/lb organic (= RMA/FCIC)
    COC requested PP 0.50; STO leaves 0.63 (COC 0.50 appears based on RMA PP coverage level, not a PP factor).

5d. NAP — Annual grasses RAN & SUD — PP, UH, FPD (5 min) — Janae Rader  [ACTION]
    SUD: PP 0.50 / UH 0.75 (Fg) · PP 0.50 / UH 1.00 (Gz) · FPD 6/15 or 07/15 by county
    RAN: PP 0.77 / UH 0.93 (Fg) · PP 0.77 / UH 1.00 (Gz) · FPD 10/15 (16 counties)
    Origin: Dolores County COC requested FPD for Sudan.

5e. NAP Concern — Montezuma — Memo to STC — Cindy Vukasin  (DISCUSSION)
    Montezuma COC requests review of CEY / Carrying-Capacity methodology.
    Background: NCT software uses last 7 years, Olympic average of last 5.

6. Adjourn Executive Session

─────────────────────────────────────────────
PRE-MEETING ACTION ITEMS
─────────────────────────────────────────────

□ Review Executive Session Packet — 476 pages (Discussion Records are all text-searchable; 217 pages of supporting exhibits are scanned images requiring OCR)
□ Review Regular Session Packet — 28 pages
□ Review SED July report (separate 3-page file)
□ Review 2026 LFP Triggered Counties list (12 pp)
□ Confirm minutes date (June 24 vs June 25, 2026) with Cindy Vukasin before item 2

─────────────────────────────────────────────
DATA-QUALITY FLAGS TO RAISE
─────────────────────────────────────────────

1. Baca/Schroder CRP cost figures — DR $42,828.66 vs COC letter "~$46,668.00" — need reconciliation before vote (item 3)
2. Cherries crop code — DR body 1028 vs header/tables 0128 (item 5b Cherries)
3. Grapes DR typo — "44 types of Cherries" should read Grapes (item 5b Grapes)
4. Hops DR — dated 08.05.25, references 2026 record, sits in 2027 packet, no explicit action line (item 5b Hops)
5. Two inserted exhibits (Montezuma minutes Feb 3, 2026 at pp.328-355; closing-date review pp.356-360) — not itemized on July 23 agenda at those locations
6. Prior minutes date mismatch (June 25 on agenda vs June 24 in corpus)

─────────────────────────────────────────────
DATA FILES ON SITE
─────────────────────────────────────────────

· src/data/meeting_2026-07-23_shell.json — agenda + guests + recusals
· src/data/meeting_2026-07-23_index.json — full packet index, key facts, OCR queue

(Live notes will be added during the meeting.)`,
  },
  {
    id: 'april-stc-meeting',
    pinned: false,
    date: '2026-04-23',
    title: 'STC Meeting — April 23, 2026 (past)',
    location: 'Virtual / Zoom',
    tags: 'meeting, STC, april, CRP, EFRP, cost-share, appeals',
    source: 'Anticipated — April 2026',
    content: `COLORADO STC MEETING — APRIL 2026
(Date TBD — will update when scheduled)

─────────────────────────────────────────────
ANTICIPATED AGENDA ITEMS
─────────────────────────────────────────────

1. APPROVAL OF MARCH 24 MEETING MINUTES

2. CRP COST SHARE RATES — REVIEW & VOTE
   - Hunter Cleveland prepared rate tables (50% cost share)
   - 49 total components: 4 retired, 2 new for 2026
   - Tables available in Box AND on PFA site (/cost-share-rates)
   - Key increases: water wells (+120-370%), burning (+270%), fencing (+50-100%)
   - STC to approve/modify rates for Colorado

3. EFRP COST SHARE RATES — REVIEW & VOTE
   - Emergency Forest Restoration Program (75% cost share)
   - 29 total components: 14 new items added for 2026
   - Hunter Cleveland prepared rate tables
   - Tables available in Box AND on PFA site (/cost-share-rates)
   - Significant new items: flood sediment removal, site prep, conservation cover

4. OTERO/CROWLEY COUNTY UPDATE
   - Status of COC administrative leave
   - County operations continuity report
   - Any actions needed under delegation authority

5. FBA PROGRAM UPDATE
   - Updated Colorado payment figures (enrollment closed April 17)
   - Final state percentage of $11B national program
   - Producer participation numbers

6. TRAVEL BUDGET STATUS
   - All meetings via Zoom (no STC travel authorized)
   - Budget reconciliation update

7. EBRIGHT CRP APPEAL — FOLLOW-UP
   - Status of appeal decision from March 24 session
   - Any outstanding actions

8. EXECUTIVE DIRECTOR REPORT — Jerry Sonnenberg

─────────────────────────────────────────────
PRE-MEETING ACTION ITEMS
─────────────────────────────────────────────

□ Review CRP cost share rate tables — Box or PFA /cost-share-rates (Hunter Cleveland)
□ Review EFRP cost share rate tables — Box or PFA /cost-share-rates (Hunter Cleveland)
□ Review March 24 meeting minutes when distributed
□ Complete appeals training (April 8)

─────────────────────────────────────────────
NOTES:
─────────────────────────────────────────────

(Will be updated as agenda is finalized and meeting occurs)`,
  },
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
