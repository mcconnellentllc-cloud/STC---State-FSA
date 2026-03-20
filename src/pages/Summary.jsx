import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApiFetch } from '../auth/apiFetch';

/* ══════════════════════════════════════════════════════════════════
   MARCH 24, 2026 MEETING AGENDA — Structured from session packets
   ══════════════════════════════════════════════════════════════════ */
const AGENDA = [
  {
    section: 'Regular Session',
    items: [
      {
        num: '1',
        title: 'Call to Order / Roll Call',
        type: 'procedural',
        time: '~2 min',
        summary: 'Chair Donald Brown calls meeting to order. Verify quorum — all 5 STC members present (Brown, Mackey, McConnell, Petrocco, Raftopoulos). SED Jerry Sonnenberg and staff.',
        prep: null,
      },
      {
        num: '2',
        title: 'Approval of Minutes — February 10, 2026 Regular Session',
        type: 'motion',
        time: '~3 min',
        summary: 'Review and approve minutes from Feb 10 STC meeting. Key items covered: CRP signup announcement (Feb 12 launch), ELAP 150-day cap question, NW CO fence costs, RAP drought monitoring tool.',
        prep: 'Minutes should be in the "Minutes to Review" folder on OneDrive. Verify accuracy of all motions and votes recorded.',
      },
      {
        num: '3',
        title: 'Approval of Minutes — March 17, 2026 Special Session',
        type: 'motion',
        time: '~3 min',
        summary: 'Review and approve minutes from March 17 special meeting. Two motions passed: (1) cease administrative action letter to Otero/Crowley COC members, (2) grant CED authority for daily operations.',
        prep: 'Verify: vote counts recorded, names of all 5 COC members (Knapp, Walter Jr, Hanagan, Tecklenburg, Mason), regulatory citations (7 CFR 7.1(d), 7.6, 7.28). This is a personnel matter — minutes must be accurate.',
      },
      {
        num: '4',
        title: 'CRP Bent/Ebright STC Appeal — Agency Review',
        type: 'decision',
        time: '~15 min',
        summary: 'Exhibit 1: CRP appeal from Bent County. Ebright producer appealing a CRP contract decision. STC must review agency record and render a decision. This is a formal administrative appeal under 7 CFR Part 780.',
        prep: 'Review Exhibit 1 document (45.8 MB — substantial record). Understand the specific relief requested, FSA county office determination being appealed, and applicable CRP regulations. STC has authority to affirm, reverse, or modify the county committee decision.',
      },
      {
        num: '5',
        title: 'NAP NCT — 2026 All Crops, All Counties',
        type: 'review',
        time: '~10 min',
        summary: 'Review and approve 2026 NAP (Noninsured Crop Disaster Assistance Program) NCT (Normally Counted Tons/Yields) for all crops across all Colorado counties. This sets the baseline yields used to calculate NAP payments.',
        prep: 'Spreadsheet: "2026 NAP NCT All Crops All Counties dates and factors 2602." Verify yield data looks reasonable. Cross-reference with prior year NCTs. Note: Dec 2025 issue tracker flagged a clerical error where Honey NCT was recorded as Alfalfa — confirm this was corrected.',
      },
      {
        num: '6',
        title: 'Colorado District Employee Map',
        type: 'informational',
        time: '~5 min',
        summary: 'Review updated district employee map (dated March 4, 2026). Shows FSA staffing across Colorado districts. Context: FSA has had ~17% staffing losses since Jan 2025.',
        prep: 'Note which districts may be understaffed. This relates to the broader discussion about FSA staffing reductions and their impact on county office operations and CRP processing capacity.',
      },
      {
        num: '7',
        title: 'Otero/Crowley COC — Status Update & Reinstatement',
        type: 'motion',
        time: '~15 min',
        summary: 'Follow-up from March 17 special meeting. Confirm: (1) Letters delivered to all 5 COC members via email + USPS tracking, (2) Signed copies returned to Steve Niemann (Employee Relations), (3) CED notified of delegated authority, (4) Alisha Knapp 0 KB file issue resolved.',
        prep: 'Two motions needed: (1) Set effective date for COC reinstatement under 7 CFR § 7.23, (2) Rescind temporary CED delegation — clarify what reverts to COC vs. what CED retains. Per 7 CFR § 7.21, admin leave does not terminate terms. Per 7 CFR § 7.29, Deputy Administrator retains oversight — ceasing action should be reported.',
      },
      {
        num: '8',
        title: 'CRP Signup Status & General Signup 65',
        type: 'informational',
        time: '~10 min',
        summary: 'Update since Feb 12 launch: Continuous CRP first batch closed March 20. General Signup 65 open March 9–April 17 (competitive EBI ranking). 1.9M acres available of 27M cap. CO has ~2.96M acres enrolled, 62,037 expiring FY2026. $13/acre minimum ELIMINATED — some western CO rates as low as $1/acre.',
        prep: 'Decision: Does STC want to issue guidance to county offices on Signup 65 priorities? CRP authority expires Sept 30, 2026 without Farm Bill reauthorization — One Big Beautiful Bill Act did NOT reauthorize CRP.',
      },
      {
        num: '9',
        title: 'ELAP 150-Day Cap — Research Finding',
        type: 'decision',
        time: '~5 min',
        summary: 'RESOLVED from Feb 10: ELAP is a federal program — uniform nationwide. The 150-day grazing loss cap (7 CFR 1416.110) applies equally in CO, WY, UT. No state-specific differences. Updated rates via OBBBA: 75% weather/disease, 100% predation, 90% underserved.',
        prep: 'Decision: Accept finding and close, or recommend formal action to FSA Administrator/congressional delegation to extend the 150-day cap? Cap is regulatory (USDA could change it) but budget constraints are the barrier.',
      },
      {
        num: '10',
        title: 'NW Colorado Fence Costs — Research Report',
        type: 'decision',
        time: '~5 min',
        summary: '4-strand barbed wire: $20K–32K+/mile installed in NW CO. High-tensile alternative: 45% lower lifecycle cost. NRCS EQIP cost-share available (75–90%). Tariff impact: budget 10–15% above 2023 levels. Wildfire-driven demand increasing contractor wait times.',
        prep: 'Decision: Accept research as sufficient, or request specific local contractor quotes for identified projects? NRCS field offices in Craig, Steamboat Springs, Meeker, and Walden can provide scenario-specific rates.',
      },
      {
        num: '11',
        title: 'FSA Staffing & Farm Bill Discussion',
        type: 'discuss',
        time: '~10 min',
        summary: 'Two ongoing concerns: (1) FSA staffing losses (~17% since Jan 2025) impacting county office operations and program processing capacity. (2) CRP authority expires Sept 30, 2026 — no Farm Bill reauthorization in sight.',
        prep: 'Does STC want to take a formal position on either issue? Options: letter to FSA Administrator, recommendation to CO congressional delegation, or note concerns for the record.',
      },
      {
        num: '12',
        title: 'Other Business / Next Meeting Date',
        type: 'procedural',
        time: '~5 min',
        summary: 'Any items not on agenda. Set next meeting date. Confirm whether April meeting is needed.',
        prep: null,
      },
    ],
  },
  {
    section: 'Executive Session',
    items: [
      {
        num: 'E1',
        title: 'Executive Session — Personnel & Confidential Matters',
        type: 'executive',
        time: 'As needed',
        summary: 'Closed session for personnel matters, confidential program issues, and items requiring executive deliberation. Separate agenda and packet provided.',
        prep: 'Review Executive Session Agenda and Packet (separate documents). These are confidential and not part of the public record.',
      },
    ],
  },
];

/* ── Past meeting followup tracker ── */
const FOLLOWUPS = [
  {
    meeting: 'March 17, 2026 — Special Meeting',
    items: [
      { text: 'Send cease administrative action letter to Otero/Crowley COC', done: true },
      { text: 'Grant CED authority for daily operations', done: true },
      { text: 'Document in official STC minutes', done: false },
    ],
  },
  {
    meeting: 'February 10, 2026 — Monthly Meeting',
    items: [
      { text: 'Follow up on CRP signup process (started Feb 12)', done: true },
      { text: 'Research ELAP state-by-state differences (CO, WY, UT)', done: true },
      { text: 'Gather NW CO fence cost quotes', done: true },
    ],
  },
];

const KEY_DATES = [
  { date: '2026-03-24', label: 'STC Meeting (Regular + Executive)', type: 'meeting' },
  { date: '2026-04-17', label: 'General CRP Signup 65 closes', type: 'deadline' },
  { date: '2026-09-30', label: 'CRP authority expires (no Farm Bill)', type: 'deadline' },
];

const SESSION_DOCS = [
  { name: 'Regular Session Agenda', size: '202.6 KB' },
  { name: 'Regular Session Packet', size: '84.0 MB' },
  { name: 'Executive Session Agenda', size: '174.0 KB' },
  { name: 'Executive Session Packet', size: '41.4 MB' },
  { name: '2026 NAP NCT All Crops All Counties', size: '279.9 KB' },
  { name: 'Colorado District Employee Map (March 4)', size: '566.8 KB' },
  { name: 'Exhibit 1 — CRP Bent/Ebright STC Appeal Agency Review', size: '45.8 MB' },
  { name: 'Minutes to Review (2 items)', size: 'Folder' },
];

/* ══════════════════════════════════════════════════════════════════
   VOTING GUIDE — Pros/Cons analysis for each decision item
   Like a voter pamphlet: what you're voting on, both sides, context.
   ══════════════════════════════════════════════════════════════════ */
const VOTING_GUIDE = [
  {
    id: 'minutes-feb',
    title: 'Approval of February 10 Minutes',
    type: 'motion',
    motion: 'Move to approve the minutes of the February 10, 2026 Regular Session as presented.',
    background: 'Standard procedural vote. Minutes document the Feb 10 meeting covering CRP signup announcement, ELAP questions, RAP tool discussion, and fence cost research assignments.',
    pros: [
      'Minutes have been available for review since Feb 10',
      'Standard practice to approve at next regular meeting',
      'No known disputes about the record',
    ],
    cons: [
      'Members should verify their statements are accurately recorded',
      'Any corrections must be made before approval — changes after are more difficult',
    ],
    recommendation: 'Routine approval unless a member identifies a specific correction needed.',
  },
  {
    id: 'minutes-mar17',
    title: 'Approval of March 17 Special Meeting Minutes',
    type: 'motion',
    motion: 'Move to approve the minutes of the March 17, 2026 Special Session as presented.',
    background: 'The March 17 special meeting addressed the Otero/Crowley COC administrative action. Two motions were passed: cease admin action and grant CED authority. This is a personnel/employee relations matter — minute accuracy is critical.',
    pros: [
      'Documenting the STC actions promptly establishes the official record',
      'Required for the cease-action to be fully documented per 7 CFR § 7.30',
      'Needed before reinstatement motions can be considered (establishes the baseline)',
    ],
    cons: [
      'Must verify vote counts and all regulatory citations (7 CFR 7.1(d), 7.6, 7.28) are correctly reflected',
      'Any inaccuracy in personnel action documentation could create legal exposure',
      'If the 0 KB Alisha Knapp file issue is not noted in minutes, should it be?',
    ],
    recommendation: 'Approve after careful review. Ensure vote counts, member names, and regulatory citations are exact. This is a federal personnel record.',
  },
  {
    id: 'crp-appeal',
    title: 'CRP Bent/Ebright Appeal Decision',
    type: 'decision',
    motion: 'STC to render a decision on the Ebright CRP appeal from Bent County — affirm, reverse, or modify the county committee determination.',
    background: 'A Bent County producer (Ebright) is appealing a CRP contract decision made by the county committee. Under 7 CFR Part 780, the STC has authority to review and decide administrative appeals of county committee actions. The record is extensive (45.8 MB exhibit).',
    pros: [
      'FOR AFFIRMING: County committee is closest to the facts and local conditions; deference to their judgment preserves the system',
      'FOR AFFIRMING: Overturning sets a precedent that may encourage more appeals',
      'FOR REVERSING/MODIFYING: If procedural errors occurred, correcting them protects producer rights and program integrity',
      'FOR REVERSING/MODIFYING: STC oversight is the exact purpose of the appeal process — rubber-stamping undermines it',
    ],
    cons: [
      'RISK OF AFFIRMING: If the county made an error, affirming it means the producer\'s only recourse is NAD (National Appeals Division) — more costly and adversarial',
      'RISK OF REVERSING: Could strain relationship with Bent County COC/CED',
      'RISK OF MODIFYING: Partial remedies can create ambiguity in implementation',
    ],
    recommendation: 'Decision must be based on the administrative record (Exhibit 1). Review for: (1) Were proper procedures followed? (2) Is the determination supported by evidence? (3) Was the correct regulation applied? Personal knowledge of parties should not influence — decide on the record.',
  },
  {
    id: 'nap-nct',
    title: '2026 NAP NCT Approval — All Crops, All Counties',
    type: 'decision',
    motion: 'Move to approve the 2026 NAP NCT (Normally Counted Tons/Yields) for all crops across all Colorado counties.',
    background: 'NCTs establish the baseline yields used to calculate NAP disaster payments. If yields are set too high, producers get less in payments (harder to show a loss). Too low, and payments are overly generous. The Dec 2025 session flagged a clerical error — Honey NCT section was recorded as Alfalfa.',
    pros: [
      'NCTs are prepared by professional staff using historical yield data and NASS statistics',
      'Timely approval ensures NAP coverage is available for the growing season',
      'Counties need approved NCTs to process applications',
    ],
    cons: [
      'Verify the Dec 2025 Honey/Alfalfa clerical error has been corrected in this version',
      'Any yield that seems out of line with actual production should be questioned — producers rely on these numbers',
      'Approving without review means STC is signing off on data they haven\'t examined',
    ],
    recommendation: 'Approve after confirming: (1) Honey NCT clerical error from Dec 2025 is corrected, (2) No counties show dramatic unexplained yield changes from prior year, (3) Staff has validated the data.',
  },
  {
    id: 'otero-reinstate',
    title: 'Otero/Crowley COC Reinstatement — Set Effective Date',
    type: 'motion',
    motion: 'Move to set [DATE] as the effective date for the Otero/Crowley County Committee to resume full authority under 7 CFR § 7.23.',
    background: 'On March 17, the STC ceased administrative action against 5 COC members (Knapp, Walter Jr, Hanagan, Tecklenburg, Mason). Per 7 CFR § 7.21, admin leave does not terminate their terms. The STC must now formally restore their authority. The CED has been operating under temporary STC delegation since March 17.',
    pros: [
      'FOR IMMEDIATE REINSTATEMENT: Restores normal operations quickly; extended CED-only authority is an anomaly not intended to be permanent',
      'FOR IMMEDIATE REINSTATEMENT: Demonstrates STC confidence in the resolution of the underlying issue',
      'FOR IMMEDIATE REINSTATEMENT: COC members have been elected by local producers — prolonging their exclusion undermines the democratic process',
    ],
    cons: [
      'FOR DELAYED REINSTATEMENT: Allows time to confirm all deliverables are complete (letters, notifications to DC)',
      'FOR DELAYED REINSTATEMENT: Gives CED transition time to hand off delegated functions',
      'RISK: Per 7 CFR § 7.1(d), FSA Administrator can reverse STC decisions — if DC has concerns about reinstatement timing, acting too quickly could be overridden',
      'RISK: Per 7 CFR § 7.29, Deputy Administrator has oversight — have they been consulted?',
    ],
    recommendation: 'Set effective date only after confirming all March 17 action items are complete (letters delivered, Niemann notified, reporting chain informed). Consider whether a brief delay (e.g., effective April 1) provides cleaner transition. The motion should specify exactly what authority is restored.',
  },
  {
    id: 'ced-delegation',
    title: 'Rescind Temporary CED Delegation',
    type: 'motion',
    motion: 'Move to rescind the temporary delegation of authority to the Otero/Crowley CED for supervisory and approval functions, effective [DATE].',
    background: 'On March 17, the STC granted the CED authority to run daily operations while the COC was on admin leave. With reinstatement, the STC must clarify what reverts to the COC and what the CED retains as standard operating authority.',
    pros: [
      'Clean separation: COC resumes all 7 CFR § 7.23 duties (program approvals, certifications, CED supervision)',
      'Restores normal chain of authority — COC supervises CED, not vice versa',
      'Eliminates ambiguity about who has authority for what',
    ],
    cons: [
      'If rescission is too abrupt, pending actions or approvals in progress could fall through cracks',
      'CED may have started processes under delegated authority that need to be completed or formally handed over',
      'If COC-CED relationship is strained, immediate full reversion could create friction',
    ],
    recommendation: 'Should be paired with the reinstatement motion (same effective date). Specify: COC resumes supervisory, approval, and policy functions. CED retains standard day-to-day operational authority per normal FSA structure.',
  },
  {
    id: 'elap-cap',
    title: 'ELAP 150-Day Cap — Accept Finding or Recommend Action',
    type: 'decision',
    motion: 'Option A: Accept the research finding that ELAP is uniform nationwide and close the item. Option B: Direct staff to prepare a formal STC recommendation to the FSA Administrator to extend the 150-day cap.',
    background: 'Kyle raised at the Feb 10 meeting: "Why is ELAP not 365 days?" Research confirmed the 150-day cap (7 CFR 1416.110) is a federal regulatory limit, not statutory. USDA could change it without Congress, but budget is the constraint. ELAP is a gap-fill program, not primary safety net.',
    pros: [
      'FOR ACCEPTING (Option A): The question is answered — no state differences exist. ELAP works as designed (gap-fill program). Saves STC time on an issue it cannot unilaterally change.',
      'FOR RECOMMENDING (Option B): Colorado ranchers face real grazing losses beyond 150 days. The cap is regulatory — USDA has authority to change it. STC has standing to make formal recommendations. Advocacy is part of the STC role.',
      'FOR RECOMMENDING (Option B): Could be combined with congressional delegation outreach for greater impact',
    ],
    cons: [
      'AGAINST ACCEPTING: Closes the door on an issue that affects Colorado producers. STC\'s value is partly in advocating for the state.',
      'AGAINST RECOMMENDING: A recommendation that goes nowhere wastes political capital. Budget constraints make an increase unlikely. Could distract from more actionable items.',
      'AGAINST RECOMMENDING: The 2025 ELAP application deadline has already passed (March 1, 2026) — any change would be forward-looking only',
    ],
    recommendation: 'Consider a middle path: Accept the finding for the record, but direct a letter to the FSA Administrator noting Colorado\'s concern about the 150-day cap and requesting consideration in the next rulemaking cycle. Low cost, establishes STC\'s position.',
  },
  {
    id: 'crp-strategy',
    title: 'CRP General Signup 65 — STC Guidance to County Offices',
    type: 'decision',
    motion: 'Does the STC want to issue guidance or priorities to county offices regarding General Signup 65 (open through April 17)?',
    background: 'General Signup 65 is competitive (EBI-ranked). Colorado has 2.96M acres enrolled, 62,037 expiring FY2026. The $13/acre minimum was eliminated — western CO rates dropped to $1/acre. SE Colorado is a National Priority Area. CRP authority expires Sept 30, 2026 without Farm Bill reauthorization.',
    pros: [
      'FOR ISSUING GUIDANCE: County offices may benefit from STC priorities (e.g., focus on expiring contracts, dust bowl region, lesser prairie chicken habitat)',
      'FOR ISSUING GUIDANCE: With only 1.9M acres available and highly competitive enrollment, strategic guidance could help Colorado maximize accepted acres',
      'FOR ISSUING GUIDANCE: Demonstrates STC is actively engaged in program delivery',
    ],
    cons: [
      'AGAINST ISSUING GUIDANCE: CRP is a federal program with national EBI ranking — STC guidance doesn\'t change the competitive scoring',
      'AGAINST ISSUING GUIDANCE: County offices know their local conditions better than STC',
      'AGAINST ISSUING GUIDANCE: Could be perceived as interference if guidance conflicts with national priorities',
    ],
    recommendation: 'If guidance is issued, keep it informational rather than directive: remind offices of the Sept 30 CRP expiration risk, highlight the SE CO priority area bonus, and encourage outreach to producers with expiring contracts. Don\'t try to influence EBI scoring.',
  },
  {
    id: 'fence-costs',
    title: 'NW Colorado Fence Costs — Accept or Request More Data',
    type: 'decision',
    motion: 'Accept the fence cost research as sufficient, or direct staff to obtain specific local contractor quotes.',
    background: 'Research found: $20K–32K+/mile installed in NW CO for 4-strand barbed wire. High-tensile alternative has 45% lower lifecycle cost. NRCS EQIP offers 75–90% cost-share. Steel tariffs adding 10–15%. 2025 wildfires increased contractor demand.',
    pros: [
      'FOR ACCEPTING: Research is comprehensive — national data, local rancher quotes, tariff impact, EQIP rates all covered. Sufficient for STC to understand the landscape.',
      'FOR REQUESTING MORE: Specific project-level quotes would be actionable. NRCS field offices in Craig/Steamboat/Meeker could provide scenario-specific rates. CSU Extension maintains contractor lists.',
    ],
    cons: [
      'AGAINST ACCEPTING: If a specific STC member or constituent has a fencing project, general research may not be granular enough',
      'AGAINST REQUESTING MORE: STC is not a procurement office — getting into specific project quotes may exceed the committee\'s role',
    ],
    recommendation: 'Accept the research. If any member needs project-specific quotes, they can contact NRCS field offices directly. STC\'s role was to understand the cost landscape, which this research achieves.',
  },
  {
    id: 'crp-expiration',
    title: 'CRP Authority Expiring Sept 30, 2026 — STC Position',
    type: 'discuss',
    motion: 'Does the STC want to take a formal position on CRP authority expiration and Farm Bill reauthorization?',
    background: 'CRP authorization expires September 30, 2026. The One Big Beautiful Bill Act did NOT reauthorize CRP. Without Farm Bill action, no new CRP contracts can be offered after that date. Colorado has 2.96 million acres enrolled — third-highest state.',
    pros: [
      'FOR TAKING A POSITION: Colorado is a top-3 CRP state — STC has strong standing to advocate. CRP expiration would devastate SE Colorado (dust bowl region). Letter to congressional delegation is low-cost, high-signal.',
      'FOR TAKING A POSITION: Demonstrating STC engagement on Farm Bill issues is part of the committee\'s advisory role',
      'FOR TAKING A POSITION: National Farm Bill coalition efforts are ongoing — adding STC\'s voice strengthens the case',
    ],
    cons: [
      'AGAINST: Farm Bill politics are complex — STC position could be seen as partisan. STC is an administrative body, not a lobbying group.',
      'AGAINST: Congressional delegation is already aware of CRP importance to Colorado',
      'AGAINST: STC position is advisory only — limited practical impact',
    ],
    recommendation: 'Consider a factual letter (not political) to the CO congressional delegation stating: (1) Colorado has 2.96M acres enrolled, (2) 62,037 acres expiring FY2026, (3) CRP is critical for soil conservation in SE CO dust bowl region, (4) STC urges timely reauthorization. Keep it fact-based and non-partisan.',
  },
  {
    id: 'staffing',
    title: 'FSA Staffing Reductions — STC Concerns',
    type: 'discuss',
    motion: 'Does the STC want to formally note concerns about FSA staffing reductions and their impact on Colorado county offices?',
    background: 'FSA has lost approximately 17% of staff since January 2025. This affects county office capacity to process CRP signups, disaster payments, and routine program administration. The Colorado District Employee Map (March 4, 2026) shows current staffing levels.',
    pros: [
      'FOR NOTING CONCERNS: STC has a duty to ensure programs are effectively administered in Colorado. Staffing directly affects this.',
      'FOR NOTING CONCERNS: Creates an official record that STC identified the risk — important if processing delays affect producers',
      'FOR NOTING CONCERNS: Producer complaints about service delays may be traceable to staffing — documenting STC awareness is prudent',
    ],
    cons: [
      'AGAINST: Staffing decisions are made at the federal/Administrator level — STC has no authority over personnel numbers',
      'AGAINST: Could be perceived as criticism of USDA leadership if made too forcefully',
      'AGAINST: Staffing is a nationwide issue, not Colorado-specific — STC adding concerns may not move the needle',
    ],
    recommendation: 'Note concerns for the record in the minutes rather than issuing a formal letter. State factually: STC reviewed the district employee map, noted the ~17% reduction, and expressed concern about impacts on CRP signup processing, disaster program timeliness, and general county office operations. This creates the paper trail without overstepping.',
  },
];

const TYPE_COLORS = {
  procedural: 'var(--text-muted)',
  motion: 'var(--accent)',
  decision: 'var(--warning, #f0ad4e)',
  review: 'var(--info, #17a2b8)',
  informational: 'var(--success)',
  discuss: '#9b59b6',
  executive: 'var(--danger)',
};

function daysUntil(dateStr) {
  const d = new Date(dateStr + 'T23:59:59');
  return Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
}

export default function Summary() {
  const apiFetch = useApiFetch();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    apiFetch('/api/issues')
      .then(r => r.ok ? r.json() : [])
      .then(setIssues)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiFetch]);

  const openIssues = useMemo(() =>
    issues.filter(i => i.status === 'Open' || i.status === 'Pending DAFP' || i.status === 'Monitoring'),
    [issues]
  );

  const highSeverity = useMemo(() =>
    issues.filter(i => i.severity === 'High' && i.status !== 'Resolved'),
    [issues]
  );

  const toggleItem = (num) => setExpandedItems(prev => ({ ...prev, [num]: !prev[num] }));

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h2>Summary of Events</h2>
      </div>

      {/* ── Meeting Banner ── */}
      <div className="card" style={{
        marginBottom: 20, padding: '20px 24px',
        borderLeft: '4px solid var(--accent)',
        background: 'linear-gradient(135deg, var(--card-bg, #fff) 0%, rgba(var(--accent-rgb, 0,123,255), 0.03) 100%)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
              Next Meeting
            </div>
            <h3 style={{ margin: 0 }}>Colorado STC Meeting — March 24, 2026</h3>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Regular Session + Executive Session | {daysUntil('2026-03-24')} days away
            </div>
          </div>
          <Link to="/meetings" className="btn btn-secondary">Full Meeting Notes</Link>
        </div>
      </div>

      {/* ── At a Glance ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 1 120px', padding: '14px 18px', borderTop: '3px solid var(--accent)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{AGENDA[0].items.length}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Agenda Items</div>
        </div>
        <div className="card" style={{ flex: '1 1 120px', padding: '14px 18px', borderTop: '3px solid var(--warning, #f0ad4e)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning, #f0ad4e)' }}>
            {AGENDA[0].items.filter(i => i.type === 'decision').length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Decisions Needed</div>
        </div>
        <div className="card" style={{ flex: '1 1 120px', padding: '14px 18px', borderTop: '3px solid var(--accent)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
            {AGENDA[0].items.filter(i => i.type === 'motion').length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Motions Required</div>
        </div>
        <div className="card" style={{ flex: '1 1 120px', padding: '14px 18px', borderTop: '3px solid var(--danger)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>{openIssues.length}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Open Issues</div>
        </div>
      </div>

      {/* ── Meeting Agenda with Prep Notes ── */}
      {AGENDA.map((section, si) => (
        <div key={si} className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '12px 20px', fontWeight: 700, fontSize: '0.9rem',
            background: section.section === 'Executive Session' ? 'var(--danger)' : 'var(--accent)',
            color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            {section.section}
          </div>
          {section.items.map((item, i) => {
            const expanded = expandedItems[item.num];
            return (
              <div key={item.num} style={{
                borderBottom: i < section.items.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div
                  style={{
                    padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12,
                    background: expanded ? 'rgba(var(--accent-rgb, 0,123,255), 0.03)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => toggleItem(item.num)}
                >
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem',
                    fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: 2, minWidth: 22, textAlign: 'center',
                    background: TYPE_COLORS[item.type] || 'var(--text-muted)',
                  }}>{item.type}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                      {item.num}. {item.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {item.summary.slice(0, 120)}{item.summary.length > 120 && !expanded ? '...' : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {item.time}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {expanded ? '\u25B2' : '\u25BC'}
                  </span>
                </div>
                {expanded && (
                  <div style={{ padding: '0 20px 16px 52px', fontSize: '0.88rem', lineHeight: 1.7 }}>
                    <div style={{
                      background: 'var(--bg)', borderRadius: 6, padding: '12px 16px', marginBottom: item.prep ? 8 : 0,
                    }}>
                      {item.summary}
                    </div>
                    {item.prep && (
                      <div style={{
                        background: 'rgba(var(--warning-rgb, 240,173,78), 0.08)',
                        borderLeft: '3px solid var(--warning, #f0ad4e)',
                        borderRadius: '0 6px 6px 0', padding: '10px 14px', fontSize: '0.85rem',
                      }}>
                        <strong>Prep:</strong> {item.prep}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* ── Voting Guide — Pros & Cons ── */}
      <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '12px 20px', fontWeight: 700, fontSize: '0.9rem',
          background: 'var(--warning, #f0ad4e)', color: '#fff',
          textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          Voting Guide — What You're Deciding & Both Sides
        </div>
        <div style={{ padding: '12px 20px 4px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Analysis of each decision, motion, and discussion item. Click to expand pros/cons and staff recommendation.
        </div>
        {VOTING_GUIDE.map((item, i) => {
          const expanded = expandedItems['vote-' + item.id];
          return (
            <div key={item.id} style={{ borderBottom: i < VOTING_GUIDE.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div
                style={{
                  padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12,
                  background: expanded ? 'rgba(var(--warning-rgb, 240,173,78), 0.04)' : 'transparent',
                }}
                onClick={() => toggleItem('vote-' + item.id)}
              >
                <span style={{
                  display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem',
                  fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: 2,
                  background: item.type === 'motion' ? 'var(--accent)' : item.type === 'decision' ? 'var(--warning, #f0ad4e)' : '#9b59b6',
                }}>{item.type}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {item.background.slice(0, 100)}{!expanded && item.background.length > 100 ? '...' : ''}
                  </div>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                  {expanded ? '\u25B2' : '\u25BC'}
                </span>
              </div>
              {expanded && (
                <div style={{ padding: '0 20px 16px 52px' }}>
                  {/* Motion text */}
                  <div style={{
                    background: 'var(--bg)', borderRadius: 6, padding: '10px 14px',
                    fontSize: '0.85rem', marginBottom: 12, fontStyle: 'italic',
                  }}>
                    <strong>Motion/Question:</strong> {item.motion}
                  </div>

                  {/* Background */}
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.7, marginBottom: 12 }}>
                    {item.background}
                  </div>

                  {/* Pros & Cons side by side */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      background: 'rgba(40, 167, 69, 0.06)', borderLeft: '3px solid var(--success)',
                      borderRadius: '0 6px 6px 0', padding: '10px 14px',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--success)', marginBottom: 6 }}>
                        ARGUMENTS FOR
                      </div>
                      {item.pros.map((p, j) => (
                        <div key={j} style={{ fontSize: '0.82rem', lineHeight: 1.6, padding: '3px 0', display: 'flex', gap: 6 }}>
                          <span style={{ color: 'var(--success)', flexShrink: 0 }}>+</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{
                      background: 'rgba(220, 53, 69, 0.06)', borderLeft: '3px solid var(--danger)',
                      borderRadius: '0 6px 6px 0', padding: '10px 14px',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--danger)', marginBottom: 6 }}>
                        ARGUMENTS AGAINST / RISKS
                      </div>
                      {item.cons.map((c, j) => (
                        <div key={j} style={{ fontSize: '0.82rem', lineHeight: 1.6, padding: '3px 0', display: 'flex', gap: 6 }}>
                          <span style={{ color: 'var(--danger)', flexShrink: 0 }}>&ndash;</span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div style={{
                    background: 'rgba(var(--accent-rgb, 0,123,255), 0.06)',
                    borderLeft: '3px solid var(--accent)',
                    borderRadius: '0 6px 6px 0', padding: '10px 14px', fontSize: '0.85rem',
                  }}>
                    <strong>Analysis:</strong> {item.recommendation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Session Documents ── */}
      <div className="card" style={{ marginBottom: 20, padding: 20 }}>
        <h4 style={{ marginBottom: 12 }}>Session Documents (OneDrive)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {SESSION_DOCS.map((doc, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px', background: 'var(--bg)', borderRadius: 6, fontSize: '0.85rem',
            }}>
              <span style={{ fontWeight: 500 }}>{doc.name}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 8 }}>{doc.size}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Open County Issues for Meeting ── */}
      {openIssues.length > 0 && (
        <div className="card" style={{ marginBottom: 20, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ margin: 0 }}>Open County Issues ({openIssues.length})</h4>
            <Link to="/issues" className="btn btn-sm btn-secondary">Full Tracker</Link>
          </div>
          {openIssues.map(issue => (
            <div key={issue.id} style={{
              padding: '10px 0',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {issue.county} — {issue.program}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700, color: '#fff',
                    background: issue.severity === 'High' ? 'var(--danger)' : issue.severity === 'Medium' ? 'var(--warning, #f0ad4e)' : 'var(--success)',
                  }}>{issue.severity}</span>
                  <span style={{
                    padding: '2px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700, color: '#fff',
                    background: issue.status === 'Open' ? 'var(--danger)' : issue.status === 'Pending DAFP' ? 'var(--warning, #f0ad4e)' : 'var(--info, #17a2b8)',
                  }}>{issue.status}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{issue.description}</div>
              {issue.notes && (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>
                  {issue.notes.slice(0, 150)}{issue.notes.length > 150 ? '...' : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Key Dates ── */}
      <div className="card" style={{ marginBottom: 20, padding: 20 }}>
        <h4 style={{ marginBottom: 12 }}>Key Dates</h4>
        {KEY_DATES.map((kd, i) => {
          const days = daysUntil(kd.date);
          const isPast = days < 0;
          const isUrgent = days >= 0 && days <= 7;
          return (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: i < KEY_DATES.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div>
                <span style={{
                  display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: 10,
                  background: kd.type === 'meeting' ? 'var(--accent)' : 'var(--danger)',
                }} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{kd.label}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: 12 }}>{kd.date}</span>
              </div>
              <span style={{
                fontSize: '0.82rem', fontWeight: 700,
                color: isPast ? 'var(--text-muted)' : isUrgent ? 'var(--danger)' : 'var(--text-secondary)',
              }}>
                {isPast ? 'Passed' : days === 0 ? 'TODAY' : `${days}d`}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Past Meeting Followups ── */}
      <div className="card" style={{ marginBottom: 20, padding: 20 }}>
        <h4 style={{ marginBottom: 12 }}>Past Meeting Followups</h4>
        {FOLLOWUPS.map((fu, fi) => (
          <div key={fi} style={{ marginBottom: fi < FOLLOWUPS.length - 1 ? 16 : 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 6, color: 'var(--text-secondary)' }}>
              {fu.meeting}
            </div>
            {fu.items.map((item, j) => (
              <div key={j} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: '0.85rem',
              }}>
                <span style={{
                  width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 800, color: '#fff',
                  background: item.done ? 'var(--success)' : 'var(--warning, #f0ad4e)',
                }}>{item.done ? '\u2713' : '!'}</span>
                <span style={{
                  textDecoration: item.done ? 'line-through' : 'none',
                  color: item.done ? 'var(--text-muted)' : 'var(--text)',
                }}>{item.text}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ── Quick Navigation ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 20 }}>
        {[
          { label: 'Meetings', icon: '\uD83D\uDCC5', to: '/meetings' },
          { label: 'County Issues', icon: '\u26A0', to: '/issues' },
          { label: 'Contacts', icon: '\uD83D\uDC65', to: '/contacts' },
          { label: 'Documents', icon: '\uD83D\uDCC4', to: '/documents' },
          { label: 'Expenses', icon: '\uD83D\uDCB2', to: '/expenses' },
          { label: 'Journal', icon: '\u270E', to: '/journal' },
        ].map((ql, i) => (
          <Link key={i} to={ql.to} className="card" style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
            textDecoration: 'none', color: 'var(--text)', fontSize: '0.88rem', fontWeight: 500,
          }}>
            <span style={{ fontSize: '1.1rem' }}>{ql.icon}</span>
            <span>{ql.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
