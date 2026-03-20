import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApiFetch } from '../auth/apiFetch';

/* ══════════════════════════════════════════════════════════════════
   EBRIGHT CRP APPEAL — CASE BRIEF (Exhibit 1, 386 pages)
   ══════════════════════════════════════════════════════════════════ */
const CASE_BRIEF = {
  title: 'Ebright CRP Grassland Appeal — Case Brief',
  caption: 'Bent County | Contracts 11071, 11075, 11101, 11114, 11115, 11116, 11117 | STC Review: March 24, 2026',
  parties: {
    appellants: 'John and Stephanie Ebright',
    poa: 'Kris Demoss (Power of Attorney)',
    county: 'Bent County FSA Office',
    cocMembers: 'Bent County Committee of Certification (COC)',
    program: 'Conservation Reserve Program (CRP) — Grassland Signups 204 & 206',
  },
  contracts: [
    { id: '11101', tract: '751', pages: '80–93' },
    { id: '11075', tract: '772', pages: '94–132' },
    { id: '11115', tract: '2386', pages: '133–146' },
    { id: '11071', tract: '4297', pages: '147–187' },
    { id: '11116', tract: '2396', pages: '188–233' },
    { id: '11117', tract: '4328', pages: '234–273' },
    { id: '11114', tract: '4034', pages: '274–284' },
  ],
  timeline: [
    { date: 'Signups 204 & 206', event: 'Ebrights offered and had Grassland CRP contracts accepted. CRP-1 contracts, NRCS Conservation Plans (CPA-1155), and 528 CRP Grasslands Prescribed Grazing Plans signed and filed timely.', type: 'neutral' },
    { date: 'Jan 31, 2025', event: 'NRCS field visit #1 conducted. Field worksheets indicated bare ground; status review sheets indicated contracts were grazed hard. Photos showed no height to grass.', type: 'agency' },
    { date: 'Feb 10, 2025', event: 'Bent County CED sent letter requesting producers\' grazing records required under the 528 Prescribed Grazing Plan. Producers later claim they never received this letter.', type: 'agency' },
    { date: 'Feb 26, 2025', event: 'NRCS field visit #2 conducted.', type: 'agency' },
    { date: 'Mar 11, 2025', event: 'NRCS field visit #3 conducted.', type: 'agency' },
    { date: 'Mar 18, 2025', event: 'Bent County COC Executive Session — initial review of noncompliance findings. (pp. 25)', type: 'agency' },
    { date: 'Apr 22, 2025', event: 'Bent County CED sent noncompliance letter informing producers their contracts were out of compliance with signed grazing plans. Gave 15 days to provide written explanation of good faith effort.', type: 'agency' },
    { date: 'May 5, 2025', event: 'Producers submitted written good-faith explanation letter to Bent County office.', type: 'producer' },
    { date: 'May 20, 2025', event: 'COC meeting: Reviewed NRCS status reviews, photos, 528 Grazing Plans, and producer\'s good faith letter. COC DETERMINED: (1) No good faith effort to maintain cover, (2) Failed to leave required 4"–6" stubble height, (3) Species diversity requirements not met (offered 30-point stand with 5 species/3 native grasses — not found in field), (4) Grazing records never provided.', type: 'decision' },
    { date: 'Jun 17, 2025', event: 'Two termination letters sent to producers notifying them of COC determination and contract termination.', type: 'agency' },
    { date: 'Jul 1, 2025', event: 'Producers took photographs of contract acreage showing representative cover samples.', type: 'producer' },
    { date: 'Jul 10, 2025', event: 'Producers requested COC reconsideration of the termination determination.', type: 'producer' },
    { date: 'Aug 5, 2025', event: 'COC reconsideration hearing — Ebrights and POA Kris Demoss attended. Producers stated: (1) did not receive Feb 10 letter, (2) could provide grazing records, (3) received 2 feet of snow in December, (4) sold 40 head of cattle, (5) moved others to another location. Provided July 1 photos. However, grazing records were never provided. COC UPHELD original determination — denied reconsideration.', type: 'decision' },
    { date: 'Sep 2, 2025', event: 'Final termination letter and reconsideration denial letter sent to producers.', type: 'agency' },
    { date: 'Mar 24, 2026', event: 'STC APPEAL HEARING — State Committee reviews full agency record.', type: 'stc' },
  ],
  issues: [
    {
      num: 1,
      question: 'Are the CRP contracts out of compliance with the terms and conditions?',
      agencyPosition: [
        'Three NRCS field visits (Jan 31, Feb 26, Mar 11) documented bare ground and no stubble height remaining',
        'CRP field worksheets indicated bare ground; status review sheets confirmed contracts were grazed hard',
        'Photos taken by NRCS showed no remaining grass height',
        'The 528 Grazing Plans required 4"–6" minimum stubble height as the indicator to remove livestock — this was not met',
        'Species diversity requirements (30-point stand, 5 species, minimum 3 native grasses) were not represented in the field',
        'Grazing records required by the 528 Prescribed Grazing Plan were never provided despite multiple requests',
      ],
      appellantPosition: [
        'Compliance review was conducted while grass was dormant (Jan–Mar) — did not reflect true cover condition during growing season',
        'Producers moved cattle to other locations after being notified of noncompliance',
        'Producers received 2 feet of snow in December which may have impacted grazing conditions',
        'Sold 40 head of cattle to reduce stocking pressure',
        'July 1, 2025 photos showed representative cover samples (taken during growing season)',
        'Claim they never received the February 10, 2025 letter requesting grazing records',
      ],
      regulation: '2-CRP (Rev.6) Par. 427 — Maintaining Approved Cover; Par. 603B — Examples of Noncompliance',
      analysis: 'The 528 Grazing Plans specifically state: "stubble height may be used as an indicator to remove livestock in introduced pasture or seeded stands with minimal diversity, minimal stubble height to remove livestock is 4-6 inches." Three independent NRCS field visits across a 6-week period documented no compliance with this requirement. The dormant-grass argument may have merit for species identification but does not explain the complete absence of stubble height.',
    },
    {
      num: 2,
      question: 'Did the appellants show a good faith effort to comply with the terms and conditions?',
      agencyPosition: [
        'COC reviewed all documentation and determined NO good faith effort on two separate occasions (May 20 and Aug 5)',
        'Grazing records — required to be kept each year for each pasture — were never provided despite being requested Feb 10 and again during the process',
        'Without grazing records, COC could not determine if producers followed recommended stocking rates in the conservation plan',
        'The extent of overgrazing (bare ground, no stubble) across ALL 7 contracts suggests systematic non-compliance, not an isolated incident',
        'Species diversity shortfall indicates the offered 30-point stand was never established or maintained',
      ],
      appellantPosition: [
        'Submitted written good faith explanation on May 5, 2025',
        'Took corrective action: sold 40 head, moved remaining cattle to other locations',
        'Claim they never received the Feb 10 letter requesting records — thus absence of records should not be held against them',
        'Provided photos from Jul 1, 2025 showing cover had recovered during growing season',
        'Environmental factors: 2 feet of snow in December created unusual conditions',
        'Attended reconsideration hearing with POA to present their case',
      ],
      regulation: '2-CRP (Rev.6) Par. 603A, 603D, 603E, 603F — Noncompliance and Good Faith Determinations',
      analysis: 'Good faith under Par. 603 requires COC to consider: (1) whether the participant submitted an explanation (they did — May 5 letter), (2) whether the noncompliance issue was corrected (partial — sold cattle and moved others, but grazing records were never produced). The COC considered all of this twice and twice determined no good faith. Key question for STC: Was the COC\'s determination reasonable given the evidence? The dormant-season timing of field visits is a legitimate concern, but 4"–6" stubble height should be measurable regardless of growth season.',
    },
    {
      num: 3,
      question: 'Was the termination of all 7 contracts the correct remedy?',
      agencyPosition: [
        'Under Par. 571A, COC must terminate ALL land under CRP-1 when participant is out of compliance on all land and COC determines no good faith effort',
        'All 7 contracts were found out of compliance — not just some',
        'Termination is mandatory ("must terminate"), not discretionary, when the conditions are met',
      ],
      appellantPosition: [
        'Termination of all 7 contracts is the most severe penalty',
        'Under Par. 574A, termination requires refund of ALL annual rental payments plus interest, ALL cost-share payments plus interest, CRP-SIP plus interest, PIP plus interest, and potentially liquidated damages',
        'The financial impact is substantial across 7 contracts and multiple tracts',
      ],
      regulation: '2-CRP (Rev.6) Par. 571A — Terminations; Par. 574A — Required Refunds',
      analysis: 'If all contracts were out of compliance and the COC\'s not-good-faith determination stands, Par. 571A makes termination mandatory — the COC had no discretion to impose a lesser remedy. The STC\'s decision therefore hinges on Issues 1 and 2. If STC finds good faith, Par. 603E allows a standard payment reduction instead of termination. If STC finds no good faith, the termination and full refund requirement under Par. 574A is mandatory.',
    },
    {
      num: 4,
      question: 'Were proper procedures followed by the county office?',
      agencyPosition: [
        'Feb 10 letter sent requesting grazing records',
        'Three NRCS field visits conducted (Jan 31, Feb 26, Mar 11)',
        'Apr 22 noncompliance letter gave 15-day response window per Par. 603D',
        'Producer explanation reviewed at May 20 COC meeting',
        'Termination notice sent Jun 17',
        'Reconsideration hearing held Aug 5 per producer request',
        'Final termination letter Sep 2',
      ],
      appellantPosition: [
        'Producers claim they never received the Feb 10 letter requesting grazing records',
        'If not received, producers were denied the opportunity to provide records before the noncompliance determination',
        'All field visits occurred during dormant season (Jan–Mar) — questions whether this provides an accurate assessment of cover condition',
      ],
      regulation: '2-CRP (Rev.6) Par. 603A, 603D — Noncompliance notification and determination procedures',
      analysis: 'The procedural sequence appears complete: notification, response opportunity, COC review, determination, reconsideration opportunity, and final determination. The Feb 10 letter claim is significant — if the letter was not received, the producers had no notice that records were being requested until the Apr 22 noncompliance letter. However, the 528 Grazing Plans themselves require that records be kept, so the obligation to maintain records existed independent of the Feb 10 letter. STC should examine whether the letter was sent certified/tracked.',
    },
    {
      num: 5,
      question: 'Does the timing of field visits (dormant season) affect the validity of the noncompliance finding?',
      agencyPosition: [
        'Stubble height (4"–6" minimum) should be measurable in any season — it is a physical measurement of remaining plant material, not dependent on active growth',
        'Three visits across 6 weeks (Jan 31 – Mar 11) showed consistent bare ground conditions',
        'Bare ground is an objective measure that is not season-dependent',
      ],
      appellantPosition: [
        'Species diversity (5 species, 3 native grasses) cannot be reliably assessed when grass is dormant',
        'Cover appearance in dormant season does not represent growing-season conditions',
        'July 1 photos show cover recovery during growing season',
      ],
      regulation: '2-CRP (Rev.6) Par. 427A — Practice Maintenance; 528 CRP Grasslands Prescribed Grazing Plan',
      analysis: 'This is the appellants\' strongest argument. While stubble height is season-independent (it measures what\'s physically there), species diversity assessment is more reliable during the growing season. However, the stubble height issue alone constitutes noncompliance — the 528 Plan explicitly sets 4"–6" as the indicator to remove livestock. The species diversity issue, while real, may be secondary to the stubble height violation. STC should weigh whether the July 1 photos are relevant to the noncompliance period or show recovery after livestock removal.',
    },
    {
      num: 6,
      question: 'What is the financial exposure to the appellants if termination is upheld?',
      agencyPosition: [
        'Per Par. 574A, termination requires refund of: all annual rental payments + interest, all cost-share payments + interest, CRP-SIP + interest, PIP + interest, and liquidated damages per Par. 577',
        'Liquidated damages = 25% of rental rate x acres in violation (Par. 10 of CRP-1 Appendix)',
        'All 7 contracts, all tracts are subject to full refund',
      ],
      appellantPosition: [
        'The cumulative financial impact across 7 contracts covering tracts 751, 772, 2386, 4297, 2396, 4328, and 4034 is severe',
        'This includes every payment received since contract inception plus interest',
      ],
      regulation: '2-CRP (Rev.6) Par. 574A — Required Refunds; CRP-1 Appendix Par. 10 — Liquidated Damages',
      analysis: 'The exact dollar amounts are in the contract-specific supporting documentation (pp. 80–284) for each CRP-1. If STC upholds, the full refund is mandatory. If STC reverses to good-faith, Par. 603E limits the penalty to a standard payment reduction on affected acres not exceeding the annual rental payment for the year of violation — a dramatically different financial outcome. This is the practical stakes of the STC\'s decision.',
    },
  ],
  stcOptions: [
    {
      option: 'AFFIRM — Uphold Bent County COC Determination',
      effect: 'All 7 contracts terminated. Producers must refund all annual rental payments, cost-share, SIP, PIP, plus interest and liquidated damages across all contracts.',
      basis: 'COC followed proper procedures; three NRCS field visits documented bare ground; grazing records never provided; COC reviewed the evidence twice and reached the same conclusion.',
      risk: 'Producer\'s only recourse is NAD appeal. If NAD reverses, it suggests STC missed procedural or substantive errors.',
    },
    {
      option: 'REVERSE — Find Good Faith, Overturn Termination',
      effect: 'Contracts reinstated. COC must assess a standard payment reduction per Par. 603E (not to exceed annual rental for the year of violation). No refund of prior payments. Producers advised subsequent violations may result in termination.',
      basis: 'Producers took corrective action (sold 40 head, moved cattle); dormant-season visits may not reflect true cover condition; producers submitted written explanation and attended reconsideration hearing; Feb 10 letter may not have been received.',
      risk: 'Could strain relationship with Bent County COC. Sets precedent that overgrazing without records can receive good-faith determination. Other producers may interpret this as lenient enforcement.',
    },
    {
      option: 'MODIFY — Partial Remedy or Remand',
      effect: 'Examples: (1) Remand to COC with instructions to conduct a growing-season field visit before terminating, (2) Find good faith on some contracts but not others, (3) Direct COC to consider the dormant-season timing in their determination.',
      basis: 'The dormant-season field visit concern has merit for species diversity assessment. The record may be incomplete without a growing-season evaluation. Remand allows the county to build a more complete record.',
      risk: 'Delays resolution. Producer remains in limbo. May appear indecisive. Partial treatment of 7 identical-situation contracts creates inconsistency.',
    },
  ],
  keyEvidence: [
    { item: '528 Grazing Plans (all 7 contracts)', note: 'Signed by producers — establishes: 4"–6" stubble height requirement, stocking rate recommendations, and obligation to keep grazing records each year for each pasture' },
    { item: 'NRCS Field Visit Reports (Jan 31, Feb 26, Mar 11)', note: 'Three independent visits across 6 weeks — CRP field worksheets show bare ground, status review sheets show hard grazing, photos show no remaining grass height' },
    { item: 'Producer Good Faith Letter (May 5, 2025)', note: 'Written explanation provided within the 15-day window — contents should be in the record (pp. 33–45)' },
    { item: 'Producer Photos (Jul 1, 2025)', note: 'Representative cover samples taken during growing season — shows recovery after livestock removal. KEY QUESTION: Does post-removal recovery demonstrate good faith or just that grass grows back when not overgrazed?' },
    { item: 'COC Executive Minutes (Mar 18, May 20, Aug 5)', note: 'Three separate COC meetings documenting the review process and both determinations (pp. 25, 26–32, 285–290)' },
    { item: 'Grazing Records', note: 'NEVER PROVIDED — despite being required by the 528 Plans, requested Feb 10, and producers stating at Aug 5 hearing they could provide them' },
    { item: 'CRP-1 Contracts & NRCS-CPA-1155 Plans', note: 'Signed contracts and conservation plans for all 7 contracts (pp. 337–369) — establish the specific terms and conditions being enforced' },
  ],
};

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
        time: '~30 min',
        summary: 'Exhibit 1 (386 pages): John & Stephanie Ebright appeal termination of ALL 7 Grassland CRP contracts (11071, 11075, 11101, 11114, 11115, 11116, 11117) by Bent County COC. COC found no good faith effort to comply with grazing plans — contracts overgrazed to bare ground, no 4"–6" stubble height maintained, species diversity requirements unmet, grazing records never provided. Producers argue: dormant-season field visits, took corrective action, never received Feb 10 records request. Full case brief available below.',
        prep: 'CRITICAL DECISION: STC must affirm, reverse, or modify. If affirmed: full refund of all payments + interest + liquidated damages on all 7 contracts. If reversed (good faith found): only a standard payment reduction. See detailed Case Brief section below for complete issue analysis, timeline, and STC options.',
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
    title: 'CRP Bent/Ebright Appeal — 7 Grassland Contracts Terminated',
    type: 'decision',
    motion: 'STC to render a decision on the Ebright CRP appeal: AFFIRM termination of all 7 contracts, REVERSE (find good faith — reduce to payment reduction), or MODIFY/REMAND to Bent County COC.',
    background: 'John & Stephanie Ebright appeal termination of 7 CRP Grassland contracts (11071, 11075, 11101, 11114, 11115, 11116, 11117) in Bent County. COC conducted 3 NRCS field visits (Jan 31–Mar 11, 2025) finding bare ground across all contracts, no 4"–6" stubble height, unmet species diversity, and no grazing records provided. COC determined no good faith twice (May 20 & Aug 5). Full refund of all payments + interest + liquidated damages required if affirmed.',
    pros: [
      'FOR AFFIRMING: Three independent NRCS field visits over 6 weeks consistently documented bare ground and hard grazing — strong evidence across all 7 contracts',
      'FOR AFFIRMING: Grazing records were required by the signed 528 Plans and were NEVER provided — even after producers said at the Aug 5 hearing they could provide them',
      'FOR AFFIRMING: COC followed proper procedures: notification, 15-day response window, producer letter review, determination, reconsideration hearing, final determination',
      'FOR AFFIRMING: The overgrazing was not isolated — ALL 7 contracts across multiple tracts were in the same condition, suggesting systematic non-compliance',
      'FOR REVERSING: Producers took corrective action — sold 40 head, moved remaining cattle, submitted good faith letter within 15-day window',
      'FOR REVERSING: All field visits occurred during dormant season (Jan–Mar) — dormant grass may appear more degraded than growing-season conditions warrant',
      'FOR REVERSING: Producers claim they never received Feb 10 letter requesting records — if true, they were not put on notice until Apr 22',
      'FOR REVERSING: July 1 photos showed cover recovery during growing season — suggests grass was present but dormant during winter visits',
      'FOR MODIFYING/REMAND: Dormant-season species diversity assessment has legitimate limitations — a growing-season field visit would strengthen the record',
    ],
    cons: [
      'RISK OF AFFIRMING: Financial devastation — producers must refund ALL payments + interest + cost-share + SIP + PIP + liquidated damages across 7 contracts',
      'RISK OF AFFIRMING: If NAD later reverses, it suggests STC missed the dormant-season timing concern',
      'RISK OF REVERSING: Sets precedent that overgrazing to bare ground without records = good faith if corrective action taken after discovery',
      'RISK OF REVERSING: Undermines Bent County COC\'s enforcement credibility — they reviewed this twice',
      'RISK OF MODIFYING: Delays resolution, keeps producer in limbo, may appear indecisive',
    ],
    recommendation: 'KEY QUESTIONS: (1) Is 4"–6" stubble height measurable in dormant season? (Yes — it\'s a physical measurement, not growth-dependent.) (2) Does corrective action after noncompliance discovery constitute good faith? (Par. 603D requires both explanation AND correction before COC decides.) (3) Were grazing records maintained? (Never provided, even after hearing promise.) (4) Was Feb 10 letter sent certified? (Check record.) See the full Case Brief section below for detailed issue-by-issue analysis.',
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

      {/* ── CASE BRIEF: Ebright CRP Appeal ── */}
      <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '14px 20px', fontWeight: 700, fontSize: '0.95rem',
          background: 'linear-gradient(135deg, #8B0000 0%, #B22222 100%)',
          color: '#fff', letterSpacing: '0.5px',
        }}>
          CASE BRIEF — {CASE_BRIEF.title}
        </div>
        <div style={{ padding: '10px 20px 4px', fontSize: '0.82rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
          {CASE_BRIEF.caption}
        </div>

        {/* Parties */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Parties & Program</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px', fontSize: '0.85rem' }}>
            <div><strong>Appellants:</strong> {CASE_BRIEF.parties.appellants}</div>
            <div><strong>POA:</strong> {CASE_BRIEF.parties.poa}</div>
            <div><strong>County Office:</strong> {CASE_BRIEF.parties.county}</div>
            <div><strong>Program:</strong> {CASE_BRIEF.parties.program}</div>
          </div>
        </div>

        {/* Contracts table */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>7 Contracts at Issue</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CASE_BRIEF.contracts.map(c => (
              <div key={c.id} style={{
                padding: '6px 12px', borderRadius: 6, fontSize: '0.82rem',
                background: 'var(--bg)', border: '1px solid var(--border)',
              }}>
                <strong>{c.id}</strong> <span style={{ color: 'var(--text-muted)' }}>Tract {c.tract}</span> <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>pp.{c.pages}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div
            style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 10, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', cursor: 'pointer' }}
            onClick={() => toggleItem('cb-timeline')}
          >
            Timeline of Events {expandedItems['cb-timeline'] ? '\u25B2' : '\u25BC'}
          </div>
          {expandedItems['cb-timeline'] && (
            <div style={{ position: 'relative', paddingLeft: 20 }}>
              <div style={{ position: 'absolute', left: 6, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
              {CASE_BRIEF.timeline.map((evt, i) => (
                <div key={i} style={{ position: 'relative', paddingBottom: 12, paddingLeft: 16 }}>
                  <div style={{
                    position: 'absolute', left: -2, top: 4, width: 10, height: 10, borderRadius: '50%',
                    background: evt.type === 'decision' ? 'var(--danger)' : evt.type === 'producer' ? 'var(--success)' : evt.type === 'stc' ? 'var(--accent)' : 'var(--warning, #f0ad4e)',
                    border: '2px solid var(--card-bg, #fff)',
                  }} />
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: evt.type === 'decision' ? 'var(--danger)' : evt.type === 'stc' ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {evt.date}
                  </div>
                  <div style={{ fontSize: '0.84rem', lineHeight: 1.6 }}>{evt.event}</div>
                </div>
              ))}
            </div>
          )}
          {!expandedItems['cb-timeline'] && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              15 events from contract signup through March 24, 2026 STC hearing. Click to expand.
            </div>
          )}
        </div>

        {/* Issues */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 10, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
            Issues for STC Determination ({CASE_BRIEF.issues.length})
          </div>
          {CASE_BRIEF.issues.map((issue) => {
            const isExp = expandedItems['cb-issue-' + issue.num];
            return (
              <div key={issue.num} style={{
                marginBottom: 8, borderRadius: 6, border: '1px solid var(--border)', overflow: 'hidden',
              }}>
                <div
                  style={{
                    padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 10,
                    background: isExp ? 'rgba(var(--danger-rgb, 220,53,69), 0.03)' : 'var(--bg)',
                  }}
                  onClick={() => toggleItem('cb-issue-' + issue.num)}
                >
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: '50%', fontSize: '0.75rem', fontWeight: 800,
                    background: 'var(--danger)', color: '#fff', flexShrink: 0,
                  }}>{issue.num}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{issue.question}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{issue.regulation}</div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isExp ? '\u25B2' : '\u25BC'}</span>
                </div>
                {isExp && (
                  <div style={{ padding: '0 14px 14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      <div style={{
                        background: 'rgba(var(--warning-rgb, 240,173,78), 0.06)',
                        borderLeft: '3px solid var(--warning, #f0ad4e)',
                        borderRadius: '0 6px 6px 0', padding: '10px 12px',
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--warning, #f0ad4e)', marginBottom: 6, textTransform: 'uppercase' }}>Agency Position (COC)</div>
                        {issue.agencyPosition.map((p, j) => (
                          <div key={j} style={{ fontSize: '0.82rem', lineHeight: 1.5, padding: '2px 0', display: 'flex', gap: 6 }}>
                            <span style={{ color: 'var(--warning, #f0ad4e)', flexShrink: 0, fontWeight: 700 }}>&bull;</span>
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{
                        background: 'rgba(var(--accent-rgb, 0,123,255), 0.06)',
                        borderLeft: '3px solid var(--accent)',
                        borderRadius: '0 6px 6px 0', padding: '10px 12px',
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--accent)', marginBottom: 6, textTransform: 'uppercase' }}>Appellant Position (Ebright)</div>
                        {issue.appellantPosition.map((p, j) => (
                          <div key={j} style={{ fontSize: '0.82rem', lineHeight: 1.5, padding: '2px 0', display: 'flex', gap: 6 }}>
                            <span style={{ color: 'var(--accent)', flexShrink: 0, fontWeight: 700 }}>&bull;</span>
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(var(--danger-rgb, 220,53,69), 0.05)',
                      borderLeft: '3px solid var(--danger)',
                      borderRadius: '0 6px 6px 0', padding: '10px 12px', fontSize: '0.84rem', lineHeight: 1.6,
                    }}>
                      <strong>Analysis:</strong> {issue.analysis}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* STC Decision Options */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 10, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
            STC Decision Options
          </div>
          {CASE_BRIEF.stcOptions.map((opt, i) => (
            <div key={i} style={{
              marginBottom: 10, padding: '12px 14px', borderRadius: 6,
              background: i === 0 ? 'rgba(var(--danger-rgb, 220,53,69), 0.04)' : i === 1 ? 'rgba(40, 167, 69, 0.04)' : 'rgba(var(--accent-rgb, 0,123,255), 0.04)',
              border: `1px solid ${i === 0 ? 'rgba(220,53,69,0.2)' : i === 1 ? 'rgba(40,167,69,0.2)' : 'rgba(0,123,255,0.2)'}`,
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 6 }}>{opt.option}</div>
              <div style={{ fontSize: '0.82rem', lineHeight: 1.6, marginBottom: 4 }}><strong>Effect:</strong> {opt.effect}</div>
              <div style={{ fontSize: '0.82rem', lineHeight: 1.6, marginBottom: 4 }}><strong>Basis:</strong> {opt.basis}</div>
              <div style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--danger)' }}><strong>Risk:</strong> {opt.risk}</div>
            </div>
          ))}
        </div>

        {/* Key Evidence */}
        <div style={{ padding: '14px 20px' }}>
          <div
            style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 10, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', cursor: 'pointer' }}
            onClick={() => toggleItem('cb-evidence')}
          >
            Key Evidence in the Record ({CASE_BRIEF.keyEvidence.length} items) {expandedItems['cb-evidence'] ? '\u25B2' : '\u25BC'}
          </div>
          {expandedItems['cb-evidence'] && CASE_BRIEF.keyEvidence.map((ev, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, padding: '8px 0',
              borderBottom: i < CASE_BRIEF.keyEvidence.length - 1 ? '1px solid var(--border)' : 'none',
              fontSize: '0.84rem',
            }}>
              <span style={{ fontWeight: 700, flexShrink: 0, minWidth: 200 }}>{ev.item}</span>
              <span style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ev.note}</span>
            </div>
          ))}
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
