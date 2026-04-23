import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApiFetch } from '../auth/apiFetch';

/* ══════════════════════════════════════════════════════════════════
   DOCUMENT URLS — set these in Render env (VITE_*) to wire clickable
   page references in the voting guide. Each URL should be a SharePoint
   web preview URL that supports the #page=N anchor (Graph webUrl works).
   When unset, page-ref chips render but are not clickable.
   ══════════════════════════════════════════════════════════════════ */
const DOC_URLS = {
  es: import.meta.env.VITE_ES_PACKET_URL || '',     // Executive Session Packet (E-items)
  rs: import.meta.env.VITE_RS_PACKET_URL || '',     // Regular Session Packet (R-items)
  exhibits: {
    1: import.meta.env.VITE_EXHIBIT_1_URL || '',
    2: import.meta.env.VITE_EXHIBIT_2_URL || '',
    5: import.meta.env.VITE_EXHIBIT_5_URL || '',
  },
};

// Derive the agenda packet type ('E' or 'R') from a voting-guide item title.
// Titles look like "E2: ..." / "R5: ...". Returns 'E' for E-items, 'R' for
// R-items, or null if the title doesn't match (no chip linkage in that case).
function agendaTypeFromTitle(title) {
  const m = (title || '').match(/^([ER])\d/);
  return m ? m[1] : null;
}

// Parse text and return an array of strings + clickable chip elements for
// inline "Page ref: N", "Page refs N-M", and "Exhibit N" patterns. Page refs
// link to the appropriate session packet (E-items → ES Packet, R-items → RS
// Packet) at the right page via #page=N. Exhibit refs link to the exhibit
// file. Chips render as visible-but-not-clickable when the URL isn't
// configured in env.
function renderRefs(text, agendaType) {
  if (!text) return text;
  const REGEX = /(Page refs?:?\s*(\d+)(?:[–—\-]\d+)?)|(Exhibit\s+(\d+))/g;
  const parts = [];
  let last = 0;
  let m;
  while ((m = REGEX.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) {
      const pageNum = m[2];
      const baseUrl = agendaType === 'E' ? DOC_URLS.es : agendaType === 'R' ? DOC_URLS.rs : '';
      const href = baseUrl ? `${baseUrl}#page=${pageNum}` : null;
      parts.push(
        <RefChip key={`p-${m.index}`} icon="📄" label={m[1]} href={href} />
      );
    } else if (m[3]) {
      const exhNum = m[4];
      const href = DOC_URLS.exhibits[exhNum] || null;
      parts.push(
        <RefChip key={`e-${m.index}`} icon="📎" label={`Exhibit ${exhNum}`} href={href} />
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function RefChip({ icon, label, href }) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '1px 8px',
    margin: '0 2px',
    borderRadius: 10,
    fontSize: '0.78em',
    fontWeight: 600,
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    color: href ? 'var(--accent)' : 'var(--text-muted)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  };
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" style={baseStyle} title="Open at this page">
      <span>{icon}</span><span>{label}</span><span style={{ opacity: 0.7 }}>↗</span>
    </a>
  ) : (
    <span style={{ ...baseStyle, cursor: 'default' }} title="Document URL not configured (set VITE_ES_PACKET_URL / VITE_RS_PACKET_URL / VITE_EXHIBIT_N_URL)">
      <span>{icon}</span><span>{label}</span>
    </span>
  );
}


/* ══════════════════════════════════════════════════════════════════
   MARCH 24, 2026 MEETING AGENDA — Structured from session packets
   ══════════════════════════════════════════════════════════════════ */
const AGENDA = [
  {
    section: 'Regular Session — 1:00 PM',
    note: 'Denver Federal Center, Lakewood, CO 80225 OR Virtual via Teams | No guests scheduled',
    items: [
      {
        num: 'R1',
        title: 'Call to Order',
        type: 'procedural',
        time: '~2 min',
        summary: 'Chair Donald Brown calls meeting to order. Verify quorum — all 5 STC members present (Brown, Mackey, McConnell, Petrocco, Raftopoulos). SED Jerry Sonnenberg and staff.',
        prep: null,
      },
      {
        num: 'R2',
        title: 'State Executive Director Report',
        type: 'informational',
        time: '~10 min',
        summary: 'SED Jerry Sonnenberg provides state-level report. Page ref: 5.',
        prep: 'Review page 5 of the regular session packet for the SED written report.',
      },
      {
        num: 'R3',
        title: 'District Director Reports',
        type: 'informational',
        time: '~10 min',
        summary: 'District reports from all 4 districts. District 1: Scott Brase (written). District 2: Jon Weishaar (oral). District 3: Woody Woods (oral). District 4: Sam Montoya (oral).',
        prep: 'District 1 report is written — review in advance. Districts 2–4 will present orally. Note any staffing or program delivery concerns across districts.',
      },
      {
        num: 'R4',
        title: 'Senior Leadership Reports',
        type: 'informational',
        time: '~10 min',
        summary: 'Reports from: Kim Lacy (Acting Farm Loan Chief), Cindy Vukasin (Farm Program Chief, oral), Corey Pelton (Farm Program Chief), Jon Weishaar (DSED, oral).',
        prep: 'Listen for any emerging issues that may require STC action at a future meeting.',
      },
      {
        num: 'R5',
        title: 'County Committee Elections — Review of 2025 COC Election Reports',
        type: 'decision',
        time: '~10 min',
        summary: 'Presenter: Jon Weishaar, DSED. Review 2025 COC election reports. Page ref: 13. STC action required.',
        prep: 'Review election reports starting at page 13. Verify all elections were conducted properly and results are certified. Check for any contested elections or low-turnout concerns.',
      },
      {
        num: 'R6',
        title: 'County Committee SDA Advisor Appointments',
        type: 'decision',
        time: '~20 min',
        summary: 'Presenter: Jon Weishaar, DSED. STC to appoint 2026 Socially Disadvantaged (SDA) Advisors to county committees. Page ref: 119. STC action required.',
        prep: 'Review candidate list starting at page 119. SDA Advisors ensure underserved producers have representation. Verify all counties that need advisors have qualified candidates nominated.',
      },
      {
        num: 'R7a',
        title: 'NAP — 2025 Independent Assessment Grazing Losses',
        type: 'decision',
        time: '~5 min',
        summary: 'Presenter: Janae Rader, Farm Program Specialist. Review and take action on 2025 NAP independent assessment grazing losses. Page ref: 139. STC action required.',
        prep: 'Review grazing loss assessments starting at page 139. Verify the methodology and data support the loss determinations.',
      },
      {
        num: 'R7b',
        title: 'NAP — NCT Dates and Factors Data (Informational)',
        type: 'informational',
        time: '~5 min',
        summary: 'Presenter: Janae Rader. NCT dates and factors data uploaded into Box for STC review per prior request. Full dataset: 3,353 records across 64 counties and 73 crops. No action required.',
        prep: 'Data is now loaded into this app (see NCT Reference section below). 73 crops include grazing (AUD), grain (BU/CWT), forage (TON), and specialty crops. This is background for the Executive Session NCT crop table action (E4c).',
      },
      {
        num: 'R8',
        title: 'STC Policy and Delegation Review — 20 Program Areas',
        type: 'decision',
        time: '~150 min',
        summary: 'MAJOR ITEM: Comprehensive review of STC policies and delegations across 20 program areas. Presenters: Julie Sporhase, Doug Andresen, Janae Rader, Hunter Cleveland. Programs include: AFIDA (p.355), ERP (p.357), FSFL (p.361), Commodity Loans (p.369), Payment Limitation 5-PL (p.373) & 6-PL (p.377), MASC (p.381), SDRP (p.385), Common Management 1-CM (p.387) & 10-CM (p.391), Common Provisions 2-CP (p.393), OCCSP (p.403), NAP (p.407), LFP (p.579), TAP (p.747), WHIP+ (p.751), ECP (p.769), EFRP (p.771), ELAP (p.773), LIP (p.787).',
        prep: 'This is 2.5 hours of policy review. Key areas requiring decisions: DD delegations, SED/CED representative designations, double-cropping combinations, measurement service rates, NAP carrying capacity/grazing periods, ELAP eligible weather events and snow removal rates, LIP mortality rates and extreme temperature thresholds. Review each program section at the referenced pages before the meeting.',
      },
      {
        num: 'R9',
        title: 'State Committee Field Discussion Update',
        type: 'discuss',
        time: '~10 min',
        summary: 'Open discussion on field operations and any matters arising from district/leadership reports.',
        prep: null,
      },
      {
        num: 'R10',
        title: 'Adjourn Regular Session',
        type: 'procedural',
        time: '~2 min',
        summary: 'Motion to adjourn regular session.',
        prep: null,
      },
    ],
  },
  {
    section: 'Executive Session — 9:00 AM',
    note: 'Denver Federal Center, Lakewood, CO 80225 OR Virtual via Teams | Guests: John & Stephanie Ebright (CRP appeal item only)',
    items: [
      {
        num: 'E1',
        title: 'Call to Order — Open Executive Session',
        type: 'procedural',
        time: '~2 min',
        summary: 'Open Executive Session. Confirm quorum and note guests present (Ebrights for CRP appeal item only).',
        prep: null,
      },
      {
        num: 'E2',
        title: 'CRP Appeal — Bent County — John & Stephanie Ebright',
        type: 'executive',
        time: '~90 min',
        summary: 'Presenter: Corey Pelton, Agricultural Program Chief. STC to hear and render determination on CRP appeal filed by Bent County producers. Exhibit 1 (386 pages, 45.8 MB). 7 Grassland CRP contracts (11071, 11075, 11101, 11114, 11115, 11116, 11117) terminated by COC for noncompliance — no good faith effort to comply with grazing plans. See Case Brief section for full analysis.',
        prep: 'This is the main event — 90 minutes allocated. STC must AFFIRM, REVERSE, or MODIFY the Bent County COC determination. Review the Case Brief section below and Exhibit 1. Producers and their POA (Kris Demoss) will be present. Decision must be based on the administrative record.',
      },
      {
        num: 'E3a',
        title: 'Common Provisions — Reaffirmation: Not for NAP Prevent Plant',
        type: 'executive',
        time: '~20 min',
        summary: 'Presenter: Cindy Vukasin, Farm Program Chief. STC to formally reaffirm action taken between meetings on Not for NAP Prevent Plant determinations. Exhibit 2 (separate file). Page ref: 3.',
        prep: 'Review Exhibit 2. This is a reaffirmation of action already taken between meetings — verify the actions are properly documented and consistent with STC authority.',
      },
      {
        num: 'E3b',
        title: 'Not for NAP Prevent Plant Applications — Otero County (2 producers)',
        type: 'executive',
        time: '~10 min',
        summary: 'Presenter: Doug Andresen, Farm Program Specialist. Two individual applications: (1) Day (p.7), (2) Bender (p.19). STC action required on each.',
        prep: 'Review each application on the referenced pages. These are individual producer determinations — evaluate each on its own merits.',
      },
      {
        num: 'E4a',
        title: 'NAP — Reaffirmation: NAP Prevent Plant',
        type: 'executive',
        time: '~15 min',
        summary: 'Presenter: Cindy Vukasin, Farm Program Chief. STC to formally reaffirm action taken between meetings on NAP Prevent Plant determinations. Page ref: 43. Exhibit 5 (separate file).',
        prep: 'Review Exhibit 5 and page 43 of the packet. Another reaffirmation item — verify consistency with prior actions.',
      },
      {
        num: 'E4b',
        title: 'NAP — NCT Grazing Period & Carrying Capacity (Informational)',
        type: 'informational',
        time: '~15 min',
        summary: 'Presenter: Janae Rader, Farm Program Specialist. Informational presentation on NCT grazing period and carrying capacity data — requested by STC at a prior meeting. Page ref: 49. No action required.',
        prep: 'This is background data the STC requested. Listen and ask questions. This informs the NCT crop table action in the next item.',
      },
      {
        num: 'E4c',
        title: '2026 NCT Colorado — Crop Table Action (21 crops)',
        type: 'executive',
        time: '~25 min',
        summary: 'Presenter: Janae Rader, Farm Program Specialist. STC to take action on 2026 NCT data for 21 crops (subset of 73 total crops across 64 counties, 3,353 records): Beets (p.335), Broccoli (p.347), Cabbage (p.357), Cantaloupes (p.369), Carrots (p.389), Cauliflower (p.399), Corn (p.407), Crenshaw Melon (p.459), Cucumber (p.467), Eggplant (p.481), Flowers (p.489), Gourds (p.505), Greens (p.513), Herbs (p.539), Honeydew (p.553), Okra (p.567), Soybeans (p.575), Squash (p.589), Strawberries (p.615), Turnips (p.623), Watermelon (p.631).',
        prep: 'Review each crop\'s NCT data at the referenced pages. Full dataset loaded in NCT Reference section below. NOTE: No prior year data is in the source file — year-over-year comparison not possible from the spreadsheet alone. These 21 specialty crops are a subset of 73 total crops requiring individual STC action. Key data points per crop: NAP CEY (yield), market price, PP factor, UH factor, planting/harvest dates.',
      },
      {
        num: 'E5',
        title: 'CRP — Standard Payment Reduction Waiver — Payne Legacy LLC — El Paso County',
        type: 'executive',
        time: '~15 min',
        summary: 'Presenter: Hunter A. Cleveland, Farm Program Specialist. STC to act on Payne Legacy LLC request for standard payment reduction waiver in El Paso County. Page ref: 659.',
        prep: 'Review the waiver request starting at page 659. Evaluate whether the circumstances justify waiving the standard payment reduction. Check: what was the noncompliance, was there good faith, and does the waiver serve program objectives?',
      },
      {
        num: 'E6',
        title: 'Adjourn Executive Session',
        type: 'procedural',
        time: '~2 min',
        summary: 'Close Executive Session.',
        prep: null,
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
  { date: '2026-04-17', label: 'General CRP Signup 65 closes', type: 'deadline' },
  { date: '2026-04-23', label: 'STC Meeting (Appeals follow-up, Cost Share Rates)', type: 'meeting' },
  { date: '2026-09-30', label: 'CRP authority expires (no Farm Bill)', type: 'deadline' },
];

const SESSION_DOCS = [
  { name: 'Executive Session Agenda (9:00 AM)', size: '174.0 KB' },
  { name: 'Executive Session Packet', size: '41.4 MB' },
  { name: 'Regular Session Agenda (1:00 PM)', size: '202.6 KB' },
  { name: 'Regular Session Packet (787+ pages)', size: '84.0 MB' },
  { name: 'Exhibit 1 — CRP Bent/Ebright Appeal (386 pages)', size: '45.8 MB' },
  { name: 'Exhibit 2 — Not for NAP Prevent Plant Reaffirmation', size: 'Separate' },
  { name: 'Exhibit 5 — NAP Prevent Plant Reaffirmation', size: 'Separate' },
  { name: '2026 NAP NCT All Crops All Counties', size: '279.9 KB' },
  { name: 'NCT Dates and Factors Data (Box)', size: 'Box upload' },
  { name: 'Colorado District Employee Map (March 4)', size: '566.8 KB' },
];

/* ══════════════════════════════════════════════════════════════════
   VOTING GUIDE — Pros/Cons analysis for each decision item
   Like a voter pamphlet: what you're voting on, both sides, context.
   ══════════════════════════════════════════════════════════════════ */
const VOTING_GUIDE = [
  /* ── Executive Session Decision Items ── */
  {
    id: 'crp-appeal',
    title: 'E2: CRP Bent/Ebright Appeal — 7 Grassland Contracts Terminated',
    type: 'decision',
    motion: 'STC to render a decision on the Ebright CRP appeal: AFFIRM termination of all 7 contracts, REVERSE (find good faith — reduce to payment reduction), or MODIFY/REMAND to Bent County COC.',
    background: 'John & Stephanie Ebright appeal termination of 7 CRP Grassland contracts in Bent County. COC conducted 3 NRCS field visits (Jan 31–Mar 11, 2025) finding bare ground across all contracts, no 4"–6" stubble height, unmet species diversity, and no grazing records provided. COC determined no good faith twice (May 20 & Aug 5). 90 minutes allocated. Full refund of all payments + interest + liquidated damages required if affirmed.',
    pros: [
      'FOR AFFIRMING: Three independent NRCS field visits over 6 weeks consistently documented bare ground — strong evidence across all 7 contracts',
      'FOR AFFIRMING: Grazing records were required by signed 528 Plans and were NEVER provided — even after producers said they could',
      'FOR AFFIRMING: COC followed proper procedures and reviewed evidence twice, reaching the same conclusion each time',
      'FOR AFFIRMING: All 7 contracts across multiple tracts in the same condition — systematic non-compliance',
      'FOR REVERSING: Producers took corrective action — sold 40 head, moved remaining cattle',
      'FOR REVERSING: All field visits during dormant season (Jan–Mar) — grass may appear more degraded',
      'FOR REVERSING: Producers claim they never received Feb 10 letter requesting records',
      'FOR REVERSING: July 1 photos showed cover recovery during growing season',
      'FOR MODIFYING/REMAND: Dormant-season species diversity assessment has limitations — growing-season visit would strengthen record',
    ],
    cons: [
      'RISK OF AFFIRMING: Financial devastation — full refund of ALL payments + interest across 7 contracts',
      'RISK OF AFFIRMING: If NAD later reverses, it suggests STC missed the dormant-season concern',
      'RISK OF REVERSING: Sets precedent that overgrazing to bare ground = good faith if corrective action taken after discovery',
      'RISK OF REVERSING: Undermines Bent County COC enforcement credibility',
      'RISK OF MODIFYING: Delays resolution, keeps producers in limbo',
    ],
    recommendation: 'See the full Case Brief section below for detailed issue-by-issue analysis. KEY QUESTIONS: (1) Is stubble height measurable in dormant season? (Yes.) (2) Does post-discovery corrective action = good faith? (3) Were grazing records maintained? (Never provided.) (4) Was Feb 10 letter sent certified?',
  },
  {
    id: 'reaffirm-not-nap',
    title: 'E3a: Reaffirmation — Not for NAP Prevent Plant',
    type: 'decision',
    motion: 'Move to reaffirm STC action taken between meetings on Not for NAP Prevent Plant determinations.',
    background: 'Standard reaffirmation of action taken by STC between meetings. Presenter: Cindy Vukasin. Exhibit 2 (separate file). Page ref: 3.',
    pros: [
      'Actions already taken — reaffirmation formalizes the record',
      'Standard procedure to ratify between-meeting actions at the next regular meeting',
    ],
    cons: [
      'Verify the actions taken were within STC authority and properly documented',
      'If any action was improper, reaffirmation creates additional liability',
    ],
    recommendation: 'Review Exhibit 2 before meeting. Reaffirm unless specific concerns arise about the actions taken.',
  },
  {
    id: 'otero-nap-pp',
    title: 'E3b: Not for NAP Prevent Plant — Otero County (Day & Bender)',
    type: 'decision',
    motion: 'STC to act on two individual Not for NAP Prevent Plant applications from Otero County.',
    background: 'Two applications: (1) Producer Day (p.7), (2) Producer Bender (p.19). Presenter: Doug Andresen, Farm Program Specialist. 10 minutes allocated.',
    pros: [
      'Individual producer determinations — evaluate each on its merits',
      'Staff has reviewed and prepared recommendations',
    ],
    cons: [
      'Ensure determinations are consistent with prior STC actions on similar applications',
      'Otero County is the same county involved in the COC administrative action — ensure no perception of bias',
    ],
    recommendation: 'Review each application at the referenced pages. Act on the merits of each individual case.',
  },
  {
    id: 'reaffirm-nap-pp',
    title: 'E4a: Reaffirmation — NAP Prevent Plant',
    type: 'decision',
    motion: 'Move to reaffirm STC action taken between meetings on NAP Prevent Plant determinations.',
    background: 'Reaffirmation of between-meeting NAP Prevent Plant actions. Presenter: Cindy Vukasin. Page ref: 43. Exhibit 5 (separate file).',
    pros: [
      'Formalizes actions already taken — standard procedure',
      'Creates complete record of STC actions',
    ],
    cons: [
      'Review Exhibit 5 to verify all actions were proper',
    ],
    recommendation: 'Standard reaffirmation. Review Exhibit 5 and page 43 before voting.',
  },
  {
    id: 'nct-crops',
    title: 'E4c: 2026 NCT Colorado — 21 Crop Action Items',
    type: 'decision',
    motion: 'STC to approve 2026 NCT (Normally Counted Tons/Yields) data for 21 specialty crops across Colorado.',
    background: 'Presenter: Janae Rader. 21 specialty crops (subset of 73 total in the full 3,353-record NCT dataset) requiring individual STC action: Beets, Broccoli, Cabbage, Cantaloupes, Carrots, Cauliflower, Corn, Crenshaw Melon, Cucumber, Eggplant, Flowers, Gourds, Greens, Herbs, Honeydew, Okra, Soybeans, Squash, Strawberries, Turnips, Watermelon. Page refs 335–631. 25 minutes allocated. NOTE: Source file contains no prior year data for comparison.',
    pros: [
      'NCTs are prepared by staff using historical data — professional recommendation',
      'Timely approval needed for producers to have NAP coverage during growing season',
      'This item was informed by the E4b informational presentation on grazing periods and carrying capacity',
    ],
    cons: [
      'With 21 crops to review, ensure none have dramatic year-over-year changes without explanation — NOTE: source file has no prior year data, so staff should provide verbal comparison',
      'Any errors in NCTs directly affect disaster payment calculations for producers — key fields: NAP CEY, market price, PP factor, UH factor',
      'Review whether the Dec 2025 Honey/Alfalfa clerical error (from the county issues tracker) affects any of these specialty crops — Honeydew (p.553) IS on this list',
    ],
    recommendation: 'Review the page references for each crop before meeting. Flag any yields that changed significantly from prior year. Approve in bulk if all look reasonable, or pull specific crops for individual discussion.',
  },
  {
    id: 'crp-waiver',
    title: 'E5: CRP Payment Reduction Waiver — Payne Legacy LLC — El Paso County',
    type: 'decision',
    motion: 'STC to act on Payne Legacy LLC request for standard payment reduction waiver in El Paso County.',
    background: 'Presenter: Hunter A. Cleveland. CRP standard payment reduction waiver request. Page ref: 659. 15 minutes allocated.',
    pros: [
      'Waiver may be appropriate if circumstances justify it — evaluate on the merits',
      'Staff has reviewed and prepared the case for STC consideration',
    ],
    cons: [
      'Granting waivers sets precedent — ensure consistency with prior waiver decisions',
      'Consider whether the noncompliance that triggered the payment reduction was within the producer\'s control',
    ],
    recommendation: 'Review page 659 and supporting documentation. Key questions: What was the noncompliance? Was there good faith? Does the waiver serve program objectives? Compare with the Ebright case — ensure consistency in how STC evaluates good faith.',
  },
  /* ── Regular Session Decision Items ── */
  {
    id: 'coc-elections',
    title: 'R5: County Committee Elections — 2025 COC Election Reports',
    type: 'decision',
    motion: 'STC to review and accept 2025 COC election reports.',
    background: 'Presenter: Jon Weishaar, DSED. Review of all 2025 county committee election reports across Colorado. Page ref: 13. 10 minutes allocated.',
    pros: [
      'Election certification is a required STC function',
      'Reports have been compiled by staff and are ready for review',
    ],
    cons: [
      'Verify all elections were conducted in compliance with 7 CFR Part 7',
      'Check for any contested elections, low turnout, or procedural irregularities',
    ],
    recommendation: 'Review reports starting at page 13. Accept unless specific irregularities are identified.',
  },
  {
    id: 'sda-advisors',
    title: 'R6: SDA Advisor Appointments — 2026',
    type: 'decision',
    motion: 'STC to appoint 2026 Socially Disadvantaged (SDA) Advisors to county committees.',
    background: 'Presenter: Jon Weishaar, DSED. SDA Advisors provide representation for underserved producers on county committees. Page ref: 119. 20 minutes allocated.',
    pros: [
      'SDA Advisors ensure diverse perspectives in county-level program delivery',
      'Required by regulation — STC must make appointments',
      'Candidates have been nominated and vetted by staff',
    ],
    cons: [
      'Verify all counties that need advisors have qualified candidates',
      'Check that no conflicts of interest exist for proposed appointees',
    ],
    recommendation: 'Review candidate list at page 119. Appoint unless specific concerns arise about individual candidates.',
  },
  {
    id: 'nap-grazing',
    title: 'R7a: NAP — 2025 Independent Assessment Grazing Losses',
    type: 'decision',
    motion: 'STC to take action on 2025 NAP independent assessment grazing losses.',
    background: 'Presenter: Janae Rader. Review of 2025 NAP independent assessment data for grazing losses. Page ref: 139. 5 minutes allocated.',
    pros: [
      'Independent assessments provide objective data for loss determinations',
      'Staff has reviewed methodology and data',
    ],
    cons: [
      'Verify the assessment methodology is consistent with prior years',
      'Ensure loss determinations align with actual field conditions',
    ],
    recommendation: 'Review page 139. Approve if methodology and data are sound.',
  },
  {
    id: 'policy-delegation',
    title: 'R8: STC Policy and Delegation Review — 20 Program Areas',
    type: 'decision',
    motion: 'STC to review and update policies and delegations across 20 program areas.',
    background: 'MAJOR ITEM: 2.5 hours allocated. 4 presenters (Sporhase, Andresen, Rader, Cleveland) covering: AFIDA, ERP, FSFL, Commodity Loans, Payment Limitation (5-PL, 6-PL), MASC, SDRP, Common Management (1-CM, 10-CM), Common Provisions (2-CP), OCCSP, NAP, LFP, TAP, WHIP+, ECP, EFRP, ELAP, LIP. Pages 355–787.',
    pros: [
      'Annual policy review ensures delegations are current and appropriate',
      'Covers critical areas: DD delegations, SED/CED representative designations, program-specific parameters',
      'Staff has prepared updated recommendations for each area',
    ],
    cons: [
      'With 20 program areas, risk of rubber-stamping without adequate review',
      'Key substantive items embedded in the review: double-cropping combinations (2-CP), ELAP eligible weather events and snow removal rates, LIP mortality rates and extreme temperature thresholds, NAP carrying capacity',
      'Changes to delegations have real operational consequences for county offices',
    ],
    recommendation: 'Pre-read all sections. Focus discussion on substantive changes from prior year rather than unchanged items. Items most likely to require debate: NAP carrying capacity/grazing periods (p.407), ELAP eligible weather events (p.773), LIP extreme temperature thresholds (p.787), and double-cropping combinations (p.393).',
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
  const [nctSummary, setNctSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    Promise.all([
      apiFetch('/api/issues').then(r => r.ok ? r.json() : []).catch(() => []),
      apiFetch('/api/nct').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([issuesData, nctData]) => {
      setIssues(issuesData);
      setNctSummary(nctData);
    }).finally(() => setLoading(false));
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
        <h2>Meeting Agenda</h2>
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
            <h3 style={{ margin: 0 }}>Colorado STC Meeting — April 23, 2026</h3>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Appeals follow-up · Cost share rates · Otero/Crowley COC status | {daysUntil('2026-04-23')} days away · <Link to="/appeals" style={{ color: 'var(--accent)' }}>Full Appeals docket →</Link>
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
            background: section.section.includes('Executive') ? 'var(--danger)' : 'var(--accent)',
            color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            {section.section}
          </div>
          {section.note && (
            <div style={{ padding: '6px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              {section.note}
            </div>
          )}
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

      {/* ── Case Brief link card (Case Brief content lives on the Appeal detail page) ── */}
      <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '14px 20px', fontWeight: 700, fontSize: '0.95rem',
          background: 'linear-gradient(135deg, #8B0000 0%, #B22222 100%)',
          color: '#fff', letterSpacing: '0.5px',
        }}>
          CASE BRIEF — Ebright CRP Grassland Appeal
        </div>
        <div style={{ padding: '14px 20px' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
            Bent County | Contracts 11071, 11075, 11101, 11114, 11115, 11116, 11117 | STC Review
          </p>
          <Link
            to="/appeals/APPEAL-1-2026-EBRIGHT"
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            View full Case Brief →
          </Link>
        </div>
      </div>

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
          const agendaType = agendaTypeFromTitle(item.title);
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
                    <strong>Motion/Question:</strong> {renderRefs(item.motion, agendaType)}
                  </div>

                  {/* Background */}
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.7, marginBottom: 12 }}>
                    {renderRefs(item.background, agendaType)}
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
                          <span>{renderRefs(p, agendaType)}</span>
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
                          <span>{renderRefs(c, agendaType)}</span>
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
                    <strong>Analysis:</strong> {renderRefs(item.recommendation, agendaType)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── NCT Data Reference ── */}
      {nctSummary && (
        <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '12px 20px', fontWeight: 700, fontSize: '0.9rem',
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            2026 NAP NCT Reference — All Crops, All Counties
          </div>
          <div style={{ padding: '10px 20px 4px', fontSize: '0.78rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
            Source: {nctSummary.metadata?.sourceFile || 'NAP NCT Spreadsheet'} | As of: {nctSummary.metadata?.asOfDate || 'N/A'}
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 8, padding: '14px 20px', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
            {[
              { label: 'Counties', value: nctSummary.metadata?.totalCounties || nctSummary.summary?.countiesLoaded || 0, color: 'var(--accent)' },
              { label: 'Crops', value: nctSummary.metadata?.totalCrops || nctSummary.summary?.cropsLoaded || 0, color: 'var(--success)' },
              { label: 'Total Records', value: nctSummary.metadata?.totalRows || nctSummary.summary?.totalRecords || 0, color: 'var(--warning, #f0ad4e)' },
              { label: 'Grazing', value: nctSummary.summary?.grazingRecords || '—', color: '#9b59b6' },
              { label: 'Grain', value: nctSummary.summary?.grainRecords || '—', color: '#e67e22' },
              { label: 'Other', value: nctSummary.summary?.otherRecords || '—', color: 'var(--text-muted)' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: '1 1 80px', padding: '8px 12px', borderRadius: 6,
                background: 'var(--bg)', textAlign: 'center', minWidth: 80,
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Data notes */}
          <div
            style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}
            onClick={() => toggleItem('nct-notes')}
          >
            Data Notes & Field Mapping {expandedItems['nct-notes'] ? '\u25B2' : '\u25BC'}
          </div>
          {expandedItems['nct-notes'] && (
            <div style={{ padding: '0 20px 14px' }}>
              {nctSummary.metadata?.notes?.map((note, i) => (
                <div key={i} style={{ fontSize: '0.82rem', lineHeight: 1.6, padding: '2px 0', display: 'flex', gap: 6 }}>
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>&bull;</span>
                  <span>{note}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--bg)', borderRadius: 6, fontSize: '0.8rem' }}>
                <strong>Key Fields:</strong> county, crop, cropType, intendedUse (GZ/GR/FH), practice (I/N), unitOfMeasure, napCEY, marketPrice, ppFactor, uhFactor, animalAcres, grazingDays, finalPlantingDate, normalHarvestDate, applicationClosingDate, certifiedOrganicYieldFactor, transitionalYieldFactor
              </div>
            </div>
          )}

          {/* Meeting relevance callout */}
          <div style={{
            padding: '10px 20px 14px', borderTop: '1px solid var(--border)',
          }}>
            <div style={{
              background: 'rgba(var(--warning-rgb, 240,173,78), 0.08)',
              borderLeft: '3px solid var(--warning, #f0ad4e)',
              borderRadius: '0 6px 6px 0', padding: '10px 14px', fontSize: '0.84rem', lineHeight: 1.6,
            }}>
              <strong>Meeting Context:</strong> NCT data is referenced in 3 agenda items: <strong>R7a</strong> (NAP grazing loss assessments), <strong>R7b</strong> (NCT dates/factors informational), and <strong>E4c</strong> (21-crop action items requiring STC approval). The 21 Executive Session crops are a subset of these 73 total crops. Check that no NCT values show unexplained year-over-year changes before approving.
            </div>
          </div>
        </div>
      )}

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
