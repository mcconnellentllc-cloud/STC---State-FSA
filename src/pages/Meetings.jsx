import React, { useState, useEffect, useCallback } from 'react';
import { useApiFetch } from '../auth/apiFetch';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const NOTICE_TYPES = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'signup', label: 'Signup Period' },
  { value: 'travel', label: 'Travel' },
  { value: 'training', label: 'Training' },
  { value: 'other', label: 'Other' },
];

const TYPE_COLORS = {
  meeting: 'var(--accent)',
  deadline: 'var(--danger)',
  reminder: 'var(--warning, #f0ad4e)',
  signup: 'var(--success)',
  travel: 'var(--info)',
  training: '#9b59b6',
  other: 'var(--text-muted)',
};

// Pre-populated meeting data (kept as reference notes)
// Array of all meetings — supports multiple meetings per month
const allMeetings = [
  {
    monthKey: '2026-02',
    id: '2026-02-10',
    date: 'February 10, 2026',
    time: '9:00 AM MST',
    location: 'Federal Building 56, Denver, CO',
    type: 'STC Monthly Meeting',
    status: 'completed',
    calDay: 10,
    summary: 'First STC meeting for newly appointed committee. CRP signup announced beginning Feb 12. Discussion of ELAP coverage limitations and rangeland monitoring tools. Fence cost research for northwest Colorado operations.',
    detailedNotes: [
      {
        title: 'CRP (Conservation Reserve Program) signup beginning February 12, 2026',
        items: [
          'Announced by Jerry Sonnenberg, Colorado SED',
          'General CRP: competitive bid, ranked on environmental benefits',
          'Continuous CRP: first-come first-served, no competitive bidding',
          'Grassland CRP: preserving grasslands, sustainable grazing',
          'Contracts: 10\u201315 years',
          'Rental payments: 85% avg county rate (general), 90% (continuous)',
          'Cost-share: up to 50% of establishing conservation practices',
          '27 million acre statutory cap',
        ],
        link: { label: 'CRP Program Page', url: 'https://www.fsa.usda.gov/resources/programs/conservation-programs/conservation-reserve-program' },
      },
      {
        title: 'RAP (Rangeland Analysis Platform) discussed for drought monitoring',
        items: [
          'Free tool at rangelands.app',
          'Visualizes vegetation cover: annual grasses, perennial grasses, shrubs, trees, bare ground',
          '40+ years of satellite data (1984\u2013present)',
          'Updates every 16 days',
          'Developed by NRCS, BLM, University of Montana',
        ],
        link: { label: 'Rangeland Analysis Platform', url: 'https://rangelands.app' },
      },
      {
        title: 'ELAP (Emergency Livestock Assistance Program) coverage question',
        items: [
          'Kyle raised: "Why is ELAP not 365 days?"',
          'Finding: ELAP grazing loss payments capped at 150 days (increased from 90 by 2014 Farm Bill)',
          'Feed losses also capped at 150 days',
          'Covers losses NOT covered by LFP or LIP',
          'Payment rates: 60\u201375% (90% for socially disadvantaged/beginning/veteran)',
          'Notice of loss: within 30 days for livestock',
          'Application deadline: March 1 after program year',
          'Kyle asked about CO vs WY vs UT differences',
        ],
        link: { label: 'ELAP Program Page', url: 'https://www.fsa.usda.gov/resources/programs/emergency-assistance-livestock-honeybees-farm-raised-fish-elap' },
      },
      {
        title: 'Fence installation costs for northwest Colorado',
        items: [
          'Barbed wire (installed): $1\u2013$6 per linear foot',
          'National avg for 4\u20135 strand livestock: $3\u2013$6/ft',
          'Wire only: $0.05\u2013$0.15/ft per strand',
          'Roll (1,320 ft): $60\u2013$200',
          'Posts: T-posts $7.50\u2013$13.50, wood $10\u2013$40, steel $20\u2013$50',
          'High tensile wire mesh: ~$3.50/ft (4ft), ~$4.50/ft (8ft)',
          'Labor only: $0.50\u2013$1.75/ft',
        ],
      },
    ],
    decisions: [
      'Follow up on CRP signup process starting Feb 12',
      'Research state-by-state ELAP differences (CO, WY, UT)',
      'Gather local fence cost quotes for northwest CO operations',
    ],
    researchLinks: [
      { label: 'Jerry Sonnenberg Bio', url: 'https://www.fsa.usda.gov/about-fsa/fsa-leadership/jerry-sonnenberg' },
      { label: 'CRP Program', url: 'https://www.fsa.usda.gov/resources/programs/conservation-programs/conservation-reserve-program' },
      { label: 'CRP Continuous Enrollment', url: 'https://www.fsa.usda.gov/resources/programs/conservation-programs/conservation-reserve-program/crp-continuous-enrollment' },
      { label: 'Rangeland Analysis Platform', url: 'https://rangelands.app' },
      { label: 'ELAP', url: 'https://www.fsa.usda.gov/resources/programs/emergency-assistance-livestock-honeybees-farm-raised-fish-elap' },
      { label: 'ELAP Livestock Fact Sheet', url: 'https://www.fsa.usda.gov/sites/default/files/2025-06/FSA_ELAP_Livestock_FactSheet_2025e.pdf' },
      { label: 'Fence Post \u2014 Sonnenberg article', url: 'https://www.thefencepost.com/news/sonnenberg-tapped-to-lead-fsa/' },
    ],
  },
  {
    monthKey: '2026-03',
    id: '2026-03-17',
    date: 'March 17, 2026',
    time: '2:00 PM \u2013 3:30 PM MST',
    location: 'Virtual',
    type: 'STC Special Meeting',
    status: 'completed',
    calDay: 17,
    summary: 'Special meeting regarding Otero/Crowley County Committee (COC) members. STC moved and accepted to send a letter to cease administrative action and to grant authority to the County Executive Director (CED) to run daily operations. Meeting adjourned at 3:30 PM.',
    detailedNotes: [
      {
        title: 'Meeting Outcome \u2014 March 17, 2026 (2:00 PM \u2013 3:30 PM)',
        items: [
          'Meeting called to order at 2:00 PM MST',
          'STC reviewed and discussed the Administrative Leave Letters for the five Otero/Crowley COC members',
          'MOTION PASSED \u2014 STC moved and accepted to send a letter to cease administrative action against the Otero/Crowley COC members',
          'MOTION PASSED \u2014 STC moved and accepted to grant authority to the County Executive Director (CED) to run daily operations for the Otero/Crowley county office',
          'The CED now has delegated authority from the STC to manage day-to-day operations pending resolution of the COC matter',
          'Action to be documented in official STC minutes',
          'Next meeting: March 24, 2026 \u2014 agenda and details TBD',
          'Meeting adjourned at 3:30 PM MST',
        ],
      },
      {
        title: 'Otero/Crowley COC Administrative Leave Letters',
        items: [
          'Administrative Leave Letters prepared for 5 COC members: Alisha Knapp, Andrew Walter Jr, Charles Hanagan, Doug Tecklenburg, Zachary Mason',
          'Letters prepared by Steve Niemann, HR Specialist (Employee Relations), FPAC-FBC, AZ',
          'Forwarded to STC by Jerry Sonnenberg, Colorado Executive Director',
          'CC: Brandi May (ID), Kim Viers (MO), Rick Pinkston (DC)',
          'NOTE: The file for Alisha Knapp is 0 KB and may be empty/corrupted \u2014 verify before issuing',
        ],
      },
      {
        title: 'STC Authority \u2014 7 CFR Part 7 (Policy Compliance Enforcement)',
        items: [
          'This is a standard policy compliance action. When COC members do not follow policy, the STC has the authority to place them on administrative leave and recommend removal.',
          '\u00a7 7.1(d) \u2014 "No provision or delegation to a State or county committee will preclude the FSA Administrator, or designee, from determining any question arising under this part, or from reversing or modifying any determination made by a State or county committee."',
          '\u00a7 7.28(a) \u2014 "Adverse personnel actions involving any county committee member or alternate member, county executive director, or other county office employee will be taken for failing to perform the duties of their office, impeding the effectiveness of any program administered in the county, violating official instructions, or for misconduct."',
          '\u00a7 7.28(b) \u2014 "Any person whom FSA proposes to suspend or remove from office or employment must be given advance written notice of the reason for such action and must be advised of the right to reply to such a proposal and any right of further review and appeal if the person is removed or suspended."',
          'Administrative leave is NOT termination \u2014 it is a temporary removal from duties while matters are resolved. Removal is the expected next step if policy violations are confirmed.',
          'This is a confidential personnel/employee relations matter.',
        ],
        link: { label: '7 CFR Part 7 \u2014 County Committee Regulations', url: 'https://www.ecfr.gov/current/title-7/subtitle-A/part-7' },
      },
      {
        title: 'Vacancy & Replacement Policy \u2014 7 CFR \u00a7 7.14',
        items: [
          'When COC members are removed, their positions become vacancies that must be filled under 7 CFR \u00a7 7.14.',
          '\u00a7 7.14 \u2014 Option 1: Elected alternates fill vacancies automatically and assume the remainder of the unexpired term of the member who was replaced.',
          '\u00a7 7.14 \u2014 Option 2: If no alternate is available, a special election may be held to fill the vacancy.',
          '\u00a7 7.14 \u2014 Option 3: If no alternate is available, the State committee may designate a person to serve out the balance of the term of the vacant position.',
          '\u00a7 7.11 \u2014 "Alternates will serve, in the order of the number of votes received, as acting members of the county committee in case of the temporary absence of a member, or to become a member of the county committee in that same order elected in case of the resignation, disqualification, removal, or death of a member."',
          'An alternate serving as an acting member has the same duties, responsibilities, and authority as a regular member.',
        ],
        link: { label: '7 CFR \u00a7 7.14 \u2014 Vacancies', url: 'https://www.law.cornell.edu/cfr/text/7/7.14' },
      },
      {
        title: 'Disqualification from Future Service \u2014 7 CFR \u00a7 7.18',
        items: [
          'Members removed for cause are disqualified from running for or holding COC office again under \u00a7 7.18.',
          '\u00a7 7.18 \u2014 A person is ineligible to hold office as a county committee member or alternate if they have been "removed as a county committee member, alternate to any county office, or as an employee for: failure to perform the duties of the office; committing, attempting, or conspiring to commit fraud; incompetence; impeding the effectiveness of any program administered in the county; refusal to carry out or failure to comply with the Department\u2019s policy relating to equal opportunity and civil rights; or for violation of official instructions."',
          'This disqualification may be waived by the State committee or the Deputy Administrator.',
          'Separately, no person may serve more than 9 consecutive years (three 3-year terms). After a 1-year break in service, a former member may run again.',
        ],
        link: { label: '7 CFR \u00a7 7.18 \u2014 Eligibility Requirements', url: 'https://www.law.cornell.edu/cfr/text/7/7.18' },
      },
      {
        title: 'Required Actions After STC Approval',
        items: [
          'Chairperson Donald Brown signs the letters (digital or wet signature)',
          'Date of issuance MUST be reflected on the letter (currently dated March 17, 2026)',
          'Deliver signed letter to each COC member via email',
          'Have a CO-FSA employee (e.g., District Director) notify each COC member they received a letter',
          'Mail a copy via USPS with tracking (do NOT send certified/signature required)',
          'Return signed/dated letter + tracking confirmation to Steve Niemann (Employee Relations)',
          'Include this action in the STC minutes',
        ],
      },
      {
        title: 'Otero & Crowley Counties \u2014 Background',
        items: [
          'Otero County: Located in southeastern Colorado, county seat is La Junta. Agricultural area known for irrigated farming along the Arkansas River, cattle ranching, and melon/onion production',
          'Crowley County: Adjacent to Otero, county seat is Ordway. One of the least populated counties in Colorado, heavily agricultural with dryland farming and ranching',
          'The Otero/Crowley area is served by a combined FSA county office',
          'FSA COC members in this area serve local producers on farm program administration, disaster programs, and conservation',
          'COC members are elected by local producers and serve 3-year terms',
        ],
      },
    ],
    decisions: [
      'APPROVED \u2014 Motion to send letter to cease administrative action against the Otero/Crowley COC members (Knapp, Walter Jr, Hanagan, Tecklenburg, Mason)',
      'APPROVED \u2014 Motion to grant authority to the County Executive Director (CED) to run daily operations for the Otero/Crowley county office',
      'ACTION \u2014 Send cease administrative action letter',
      'ACTION \u2014 Notify CED of delegated authority for daily operations',
      'ACTION \u2014 Document this action in official STC meeting minutes',
      'NEXT MEETING \u2014 March 24, 2026',
    ],
    researchLinks: [
      { label: '7 CFR Part 7 \u2014 COC Regulations', url: 'https://www.ecfr.gov/current/title-7/subtitle-A/part-7' },
      { label: 'FSA County Committee Elections', url: 'https://www.fsa.usda.gov/coc' },
      { label: 'Colorado FSA State Office', url: 'https://www.fsa.usda.gov/state-offices/colorado' },
      { label: 'USDA Leave Administration Handbook', url: 'https://www.fsa.usda.gov/Internet/FSA_File/17-pm_r02_a04.pdf' },
      { label: 'USDA Administrative Leave Policy (DR 4060-630-002)', url: 'https://www.usda.gov/directives/dr-4060-630-002' },
      { label: 'FSA CRS Report on Committees', url: 'https://www.congress.gov/crs-product/R40179' },
      { label: '7 CFR \u00a7 7.28 \u2014 Removal from Office for Cause', url: 'https://www.ecfr.gov/current/title-7/subtitle-A/part-7/section-7.28' },
      { label: '7 CFR \u00a7 7.14 \u2014 Vacancies', url: 'https://www.law.cornell.edu/cfr/text/7/7.14' },
      { label: '7 CFR \u00a7 7.1 \u2014 Administration', url: 'https://www.ecfr.gov/current/title-7/subtitle-A/part-7/section-7.1' },
      { label: '7 CFR \u00a7 7.18 \u2014 Eligibility Requirements', url: 'https://www.law.cornell.edu/cfr/text/7/7.18' },
    ],
  },
  {
    monthKey: '2026-03',
    id: '2026-03-24',
    date: 'March 24, 2026',
    time: 'TBD',
    location: 'TBD',
    type: 'STC Meeting',
    status: 'upcoming',
    calDay: 24,
    summary: 'Follow-up on Feb 10 action items: ELAP state differences (resolved \u2014 federal program, uniform rules), CRP signup status (General Signup 64 open through Apr 17), NW Colorado fence costs (researched with local data). Otero/Crowley COC follow-up from March 17 special meeting.',
    detailedNotes: [
      {
        title: 'RESOLVED \u2014 ELAP State-by-State Differences (CO, WY, UT)',
        items: [
          'ANSWER: ELAP is a FEDERAL program administered uniformly nationwide under 7 CFR Part 1416. There are NO state-specific rules, payment rates, or day caps.',
          'The 150-day grazing loss cap applies equally in CO, WY, and UT \u2014 it is statutory, set by the 2014 Farm Bill (Agricultural Act of 2014)',
          'Payment rates are uniform: 60% of calculated value (75% for beginning/socially disadvantaged/veteran farmers \u2014 90% per some provisions)',
          'The only state-level variation is in USDA Secretarial disaster designations, which determine WHEN producers in a county become eligible \u2014 not HOW MUCH they receive',
          'Why not 365 days? Congress set the 150-day cap as a cost-control measure. Prior to the 2014 Farm Bill it was only 90 days. Expanding to 365 would require new legislation.',
          'Kyle\u2019s recommendation: If the STC believes 150 days is insufficient for Colorado\u2019s grazing season, the appropriate channel is a formal recommendation to the FSA Administrator or congressional delegation for Farm Bill amendment',
          'Recent ELAP changes: July 2024 interim rule added H5N1 (avian influenza) coverage; January 2025 rule simplified application deadlines',
          'Application deadline: 30 days after loss event for notice of loss; file application by January 30 following the program year',
        ],
        link: { label: 'ELAP Program Page', url: 'https://www.fsa.usda.gov/resources/programs/emergency-assistance-livestock-honeybees-farm-raised-fish-elap' },
      },
      {
        title: 'CRP Signup Status Update \u2014 Since Feb 12 Launch',
        items: [
          'Continuous CRP (CCRP): Signup opened Feb 12, 2026 \u2014 closes March 20, 2026 (first-come, first-served)',
          'General CRP Signup 64: Open March 9 \u2013 April 17, 2026 (competitive, ranked by Environmental Benefits Index)',
          'Grassland CRP: Signup dates TBD for 2026',
          'Acreage available: ~1.9 million acres for FY2026 enrollment. The 27 million acre statutory cap is nearly reached.',
          '2025 results: 1.78 million acres accepted nationwide; Colorado was a top-3 state for enrollment',
          'Colorado currently has ~2.96 million acres enrolled in CRP at an average rental rate of $23.77/acre',
          'IMPORTANT CHANGE: The $13/acre minimum rental rate was eliminated \u2014 some western counties now see rates as low as $1/acre. This may affect Colorado producer interest.',
          'Colorado-specific programs: CREP (Conservation Reserve Enhancement Program) for the Republican River Basin; SAFE LPC (State Acres for Wildlife Enhancement \u2014 Lesser Prairie Chicken)',
          'CRP authority extended ONLY through September 30, 2026 \u2014 depends on Farm Bill reauthorization. The One Big Beautiful Bill Act did NOT reauthorize CRP.',
          'FSA staffing losses (~17% workforce reduction) may slow enrollment processing \u2014 county offices are stretched thin',
          'STC should monitor: General Signup 64 EBI cutoff score (not yet released) will determine which Colorado offers are accepted',
        ],
        link: { label: 'CRP Program Page', url: 'https://www.fsa.usda.gov/resources/programs/conservation-programs/conservation-reserve-program' },
      },
      {
        title: 'NW Colorado Fence Installation Costs \u2014 Researched Data',
        items: [
          'Contractor-installed (NW Colorado, Moffat/Routt/Rio Blanco counties): $30,000\u2013$40,000 per mile ($5.68\u2013$7.58/linear foot)',
          'Materials only: $15,000\u2013$20,000 per mile ($2.84\u2013$3.79/linear foot) \u2014 prices have risen significantly since 2020',
          'National average for 4\u20135 strand barbed wire (installed): $3\u2013$6/linear foot; NW Colorado runs HIGHER due to terrain, remoteness, and labor availability',
          'Material costs: T-posts $7.50\u2013$13.50 each; wood posts $10\u2013$40 each; steel posts $20\u2013$50 each; barbed wire rolls (1,320 ft) $60\u2013$200',
          'Labor only (no materials): $0.50\u2013$1.75/linear foot nationally; NW Colorado likely $1.50\u2013$2.50/ft due to limited contractor availability',
          'High-tensile wire mesh alternative: ~$3.50/ft (4 ft height), ~$4.50/ft (8 ft height) \u2014 longer lifespan, lower maintenance',
          'NRCS EQIP cost-share: Up to 75% of eligible costs for qualifying conservation practices (Practice Standard 382 \u2014 Fence)',
          'EQIP payment rates for Colorado fencing are set by NRCS state office \u2014 producers should contact local NRCS for current scenario-specific rates',
          'Key factor: BLM and USFS allotment fencing in NW CO has additional permitting requirements that add cost and timeline',
        ],
      },
      {
        title: 'Otero/Crowley COC Follow-Up \u2014 Status Since March 17',
        items: [
          'March 17 actions: STC approved (1) cease administrative action letter and (2) CED authority for daily operations',
          'Follow-up needed: Confirm letters were signed by Chair Brown, delivered via email, and mailed via USPS with tracking',
          'Follow-up needed: Confirm return of signed/dated letter + tracking confirmation to Steve Niemann (Employee Relations)',
          'Follow-up needed: Confirm CED has been formally notified of delegated authority',
          'Procedural question: With administrative action ceased, are COC members fully reinstated or is there an interim status?',
          'Under 7 CFR \u00a7 7.14, if any member does not return, elected alternates fill vacancies automatically for remainder of term',
          'Under 7 CFR \u00a7 7.28, the STC retains authority to take future adverse action if policy violations recur',
          'Documentation: This action must be recorded in official STC minutes \u2014 confirm minutes from March 17 are complete',
          'Note: Alisha Knapp\u2019s administrative leave letter file was 0 KB (empty/corrupted) \u2014 verify this was resolved before delivery',
        ],
        link: { label: '7 CFR Part 7 \u2014 COC Regulations', url: 'https://www.ecfr.gov/current/title-7/subtitle-A/part-7' },
      },
    ],
    decisions: [
      'RULE ON: ELAP 150-day cap \u2014 Accept finding (federal/uniform) or recommend formal action to extend?',
      'RULE ON: CRP enrollment strategy \u2014 Any STC guidance to county offices on General Signup 64 priorities?',
      'RULE ON: Fence cost data \u2014 Accept research or request local contractor quotes for specific projects?',
      'CONFIRM: Otero/Crowley letters delivered, CED notified, March 17 minutes finalized',
      'CONFIRM: Alisha Knapp letter file issue resolved',
      'DISCUSS: CRP authority expiring Sept 30, 2026 \u2014 any STC position on Farm Bill reauthorization?',
      'DISCUSS: FSA staffing reductions impact on Colorado county offices',
    ],
    researchLinks: [
      { label: 'ELAP Program', url: 'https://www.fsa.usda.gov/resources/programs/emergency-assistance-livestock-honeybees-farm-raised-fish-elap' },
      { label: 'ELAP Fact Sheet', url: 'https://www.fsa.usda.gov/sites/default/files/2025-06/FSA_ELAP_Livestock_FactSheet_2025e.pdf' },
      { label: '7 CFR 1416 \u2014 ELAP Regulations', url: 'https://www.ecfr.gov/current/title-7/subtitle-B/chapter-XIV/subchapter-A/part-1416' },
      { label: '2014 Farm Bill (ELAP Provisions)', url: 'https://www.congress.gov/bill/113th-congress/house-bill/2642' },
      { label: 'CRP Program', url: 'https://www.fsa.usda.gov/resources/programs/conservation-programs/conservation-reserve-program' },
      { label: 'CRP Signup 64 Info', url: 'https://www.fsa.usda.gov/resources/programs/conservation-programs/conservation-reserve-program/crp-general-signup' },
      { label: 'Colorado CREP', url: 'https://www.fsa.usda.gov/resources/programs/conservation-programs/conservation-reserve-program/crp-conservation-reserve-enhancement' },
      { label: 'NRCS EQIP Colorado', url: 'https://www.nrcs.usda.gov/programs-initiatives/eqip-environmental-quality-incentives' },
      { label: '7 CFR Part 7 \u2014 COC Regulations', url: 'https://www.ecfr.gov/current/title-7/subtitle-A/part-7' },
      { label: '7 CFR \u00a7 7.28 \u2014 Removal for Cause', url: 'https://www.ecfr.gov/current/title-7/subtitle-A/part-7/section-7.28' },
    ],
  },
];

// Build lookup: monthKey -> first meeting (for calendar highlighting)
const meetingsData = {};
allMeetings.forEach(m => {
  if (!meetingsData[m.monthKey]) meetingsData[m.monthKey] = m;
});

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function MeetingCard({ meeting, monthLabel }) {
  if (!meeting) {
    return (
      <div className="meeting-card upcoming">
        <div className="meeting-header">
          <div className="meeting-date">{monthLabel} 2026</div>
          <span className="badge badge-upcoming">Upcoming</span>
        </div>
        <div className="meeting-empty">
          No meeting notes yet. Meeting details will be added as they are scheduled.
        </div>
      </div>
    );
  }

  return (
    <div className={`meeting-card ${meeting.status}`}>
      <div className="meeting-header">
        <div className="meeting-date">{meeting.date}</div>
        <span className={`badge badge-${meeting.status}`}>{meeting.status === 'completed' ? 'Completed' : 'Upcoming'}</span>
      </div>
      <div className="meeting-meta">
        <span>{meeting.time}</span>
        <span>{meeting.location}</span>
        <span>{meeting.type}</span>
      </div>
      <div className="meeting-summary">{meeting.summary}</div>
      {meeting.detailedNotes && (
        <details className="meeting-expandable">
          <summary>Detailed Notes</summary>
          <div className="expandable-content">
            {meeting.detailedNotes.map((section, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <strong>{section.title}</strong>
                <ul>{section.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
                {section.link && (
                  <div style={{ marginTop: 4 }}>
                    <a href={section.link.url} target="_blank" rel="noopener noreferrer">{section.link.label} &rarr;</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
      {meeting.decisions && (
        <details className="meeting-expandable" open>
          <summary>Decisions &amp; Action Items</summary>
          <div className="expandable-content">
            <ul>{meeting.decisions.map((d, i) => (
              <li key={i}>{d}</li>
            ))}</ul>
          </div>
        </details>
      )}
      {meeting.researchLinks && (
        <details className="meeting-expandable">
          <summary>Research &amp; Links</summary>
          <div className="expandable-content">
            <ul>{meeting.researchLinks.map((link, i) => (
              <li key={i}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a></li>
            ))}</ul>
          </div>
        </details>
      )}
    </div>
  );
}

/* ── Calendar Notice Form ──────────────────────────────────────── */
function NoticeForm({ notice, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: notice?.title || '',
    date: notice?.date || new Date().toISOString().split('T')[0],
    notice_type: notice?.notice_type || 'meeting',
    location: notice?.location || '',
    description: notice?.description || '',
    all_day: notice?.all_day !== false,
    start_time: notice?.start_time || '09:00',
    end_time: notice?.end_time || '17:00',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 20, marginBottom: 16 }}>
      <h4 style={{ marginBottom: 12 }}>{notice ? 'Edit Notice' : 'Add Calendar Notice'}</h4>
      <div className="form-grid-2">
        <div className="form-group">
          <label>Title *</label>
          <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label>Date *</label>
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select value={form.notice_type} onChange={e => setForm(f => ({ ...f, notice_type: e.target.value }))}>
            {NOTICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Location</label>
          <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g., Federal Building 56, Denver" />
        </div>
      </div>
      <div className="form-group" style={{ marginTop: 8 }}>
        <label>Description</label>
        <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Additional details..." />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.all_day} onChange={e => setForm(f => ({ ...f, all_day: e.target.checked }))} />
          All Day
        </label>
        {!form.all_day && (
          <>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem' }}>Start</label>
              <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem' }}>End</label>
              <input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
            </div>
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="submit" className="btn btn-primary">{notice ? 'Save Changes' : 'Add Notice'}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN MEETINGS PAGE
   ══════════════════════════════════════════════════════════════════ */
export default function Meetings() {
  const [activeTab, setActiveTab] = useState('calendar'); // calendar | meetings
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const apiFetch = useApiFetch();

  // Calendar notices state
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editNotice, setEditNotice] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);

  const today = new Date();
  const calDays = getCalendarDays(calYear, calMonth);
  const monthKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
  const currentMeeting = meetingsData[monthKey];
  const monthMeetings = allMeetings.filter(m => m.monthKey === monthKey);
  const meetingDays = monthMeetings.map(m => m.calDay);

  // Fetch calendar notices
  const fetchNotices = useCallback(async () => {
    setLoadingNotices(true);
    try {
      const res = await apiFetch(`/api/calendar?year=${calYear}`);
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoadingNotices(false);
    }
  }, [apiFetch, calYear]);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  // Get notices for a specific day
  const getNoticesForDay = (day) => {
    if (!day) return [];
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return notices.filter(n => n.date === dateStr);
  };

  // Get notices for current month
  const monthNotices = notices.filter(n => n.date?.startsWith(monthKey));

  const handleSaveNotice = async (form) => {
    try {
      const url = editNotice ? `/api/calendar/${editNotice.id}` : '/api/calendar';
      const method = editNotice ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowForm(false);
        setEditNotice(null);
        fetchNotices();
      }
    } catch (err) {
      console.error('Save notice error:', err);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!confirm('Delete this calendar notice?')) return;
    try {
      await apiFetch(`/api/calendar/${id}`, { method: 'DELETE' });
      fetchNotices();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleExportToTeams = async () => {
    setExporting(true);
    setExportResult(null);
    try {
      const res = await apiFetch('/api/teams/export-excel', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setExportResult({ success: true, ...data });
      } else {
        setExportResult({ success: false, error: data.error });
      }
    } catch (err) {
      setExportResult({ success: false, error: err.message });
    } finally {
      setExporting(false);
    }
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const months2026 = MONTH_NAMES.map((name, i) => {
    const key = `2026-${String(i + 1).padStart(2, '0')}`;
    return { label: name, data: meetingsData[key] || null };
  });

  return (
    <div>
      <div className="page-header">
        <h2>Meetings &amp; Calendar</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditNotice(null); }}>
            + Add Notice
          </button>
          <button className="btn btn-secondary" onClick={handleExportToTeams} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export to Teams'}
          </button>
        </div>
      </div>

      {/* Export result banner */}
      {exportResult && (
        <div className="card" style={{ marginBottom: 16, padding: '12px 20px', borderLeft: `4px solid ${exportResult.success ? 'var(--success)' : 'var(--danger)'}` }}>
          {exportResult.success ? (
            <div>
              <strong style={{ color: 'var(--success)' }}>Exported!</strong>{' '}
              <span style={{ fontSize: '0.88rem' }}>{exportResult.message}</span>
              {exportResult.webUrl && (
                <a href={exportResult.webUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 12 }}>
                  Open in SharePoint &rarr;
                </a>
              )}
            </div>
          ) : (
            <div>
              <strong style={{ color: 'var(--danger)' }}>Export failed:</strong>{' '}
              <span style={{ fontSize: '0.88rem' }}>{exportResult.error}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab bar */}
      <div className="expense-tabs">
        <button className={`expense-tab ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
          Calendar &amp; Notices
        </button>
        <button className={`expense-tab ${activeTab === 'meetings' ? 'active' : ''}`} onClick={() => setActiveTab('meetings')}>
          Meeting Notes
        </button>
      </div>

      {/* ═══════ TAB: CALENDAR & NOTICES ═══════ */}
      {activeTab === 'calendar' && (
        <div>
          {/* Notice form */}
          {showForm && (
            <NoticeForm
              notice={editNotice}
              onSave={handleSaveNotice}
              onCancel={() => { setShowForm(false); setEditNotice(null); }}
            />
          )}

          {/* Calendar grid */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="cal-controls">
              <button onClick={prevMonth}>&larr;</button>
              <span className="cal-month-label">{MONTH_NAMES[calMonth]} {calYear}</span>
              <button onClick={nextMonth}>&rarr;</button>
            </div>
            <div className="meetings-calendar">
              {DAY_NAMES.map(d => <div key={d} className="cal-header">{d}</div>)}
              {calDays.map((day, i) => {
                if (day === null) return <div key={`e${i}`} className="cal-day empty" />;
                const isToday = calYear === today.getFullYear() && calMonth === today.getMonth() && day === today.getDate();
                const isMeeting = meetingDays.includes(day);
                const dayNotices = getNoticesForDay(day);
                const hasNotice = dayNotices.length > 0;
                const isSelected = selectedDay === day;

                let cls = 'cal-day';
                if (isToday) cls += ' today';
                if (isMeeting) cls += ' has-meeting';
                if (hasNotice) cls += ' has-notice';
                if (isSelected) cls += ' selected';

                return (
                  <div
                    key={day}
                    className={cls}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
                    {day}
                    {hasNotice && (
                      <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 2 }}>
                        {dayNotices.slice(0, 3).map((n, j) => (
                          <span key={j} style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: TYPE_COLORS[n.notice_type] || 'var(--accent)',
                            display: 'inline-block'
                          }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected day detail */}
          {selectedDay && (
            <div className="card" style={{ marginBottom: 16, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ margin: 0 }}>
                  {MONTH_NAMES[calMonth]} {selectedDay}, {calYear}
                </h4>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    setEditNotice(null);
                    setShowForm(true);
                    // Pre-fill date if adding on a selected day
                    // The form will use the default date, but let's close selected view
                  }}
                >
                  + Add on this day
                </button>
              </div>
              {getNoticesForDay(selectedDay).length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No notices for this day.</p>
              ) : (
                getNoticesForDay(selectedDay).map(n => (
                  <div key={n.id} className="notice-card" style={{ borderLeft: `4px solid ${TYPE_COLORS[n.notice_type] || 'var(--accent)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong>{n.title}</strong>
                        <span className="notice-type-badge" style={{ background: TYPE_COLORS[n.notice_type] || 'var(--accent)', marginLeft: 8 }}>
                          {NOTICE_TYPES.find(t => t.value === n.notice_type)?.label || n.notice_type}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => { setEditNotice(n); setShowForm(true); }}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteNotice(n.id)}>Del</button>
                      </div>
                    </div>
                    {n.location && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>{n.location}</div>}
                    {!n.all_day && n.start_time && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {n.start_time}{n.end_time ? ` \u2013 ${n.end_time}` : ''}
                      </div>
                    )}
                    {n.description && <div style={{ fontSize: '0.88rem', marginTop: 6 }}>{n.description}</div>}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Upcoming notices list */}
          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ marginBottom: 12 }}>{MONTH_NAMES[calMonth]} {calYear} Notices</h4>
            {loadingNotices ? (
              <div className="loading"><div className="spinner" /></div>
            ) : monthNotices.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No notices this month. Click "+ Add Notice" to create one.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {monthNotices.map(n => (
                  <div key={n.id} className="notice-card" style={{ borderLeft: `4px solid ${TYPE_COLORS[n.notice_type] || 'var(--accent)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong>{n.title}</strong>
                        <span className="notice-type-badge" style={{ background: TYPE_COLORS[n.notice_type] || 'var(--accent)', marginLeft: 8 }}>
                          {NOTICE_TYPES.find(t => t.value === n.notice_type)?.label || n.notice_type}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: 8 }}>{n.date}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => { setEditNotice(n); setShowForm(true); }}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteNotice(n.id)}>Del</button>
                      </div>
                    </div>
                    {n.location && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>{n.location}</div>}
                    {!n.all_day && n.start_time && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {n.start_time}{n.end_time ? ` \u2013 ${n.end_time}` : ''}
                      </div>
                    )}
                    {n.description && <div style={{ fontSize: '0.88rem', marginTop: 6 }}>{n.description}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ TAB: MEETING NOTES ═══════ */}
      {activeTab === 'meetings' && (
        <div>
          <div className="card-header" style={{ marginBottom: 16 }}>
            <span className="card-title" style={{ fontSize: '1.15rem' }}>2026 STC Meetings</span>
          </div>
          {/* Show all meetings with data (newest first) */}
          {[...allMeetings].reverse().map(m => (
            <MeetingCard key={m.id} meeting={m} monthLabel={m.date?.split(',')[0]?.replace(/\s+\d+/, '') || m.monthKey} />
          ))}
          {/* Show future months without meetings as placeholders (skip Jan, Feb, and months with meetings) */}
          {months2026.slice(3).filter(m => !m.data).map((m, i) => (
            <MeetingCard key={`future-${i}`} meeting={null} monthLabel={m.label} />
          ))}
        </div>
      )}
    </div>
  );
}
