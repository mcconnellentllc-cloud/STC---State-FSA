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
