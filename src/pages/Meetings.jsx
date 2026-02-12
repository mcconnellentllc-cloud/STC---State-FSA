import React, { useState } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Pre-populated meeting data
const meetingsData = {
  '2026-02': {
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
};

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
        <span className={`badge badge-${meeting.status}`}>
          {meeting.status === 'completed' ? 'Completed' : 'Upcoming'}
        </span>
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
                <ul>
                  {section.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
                {section.link && (
                  <div style={{ marginTop: 4 }}>
                    <a href={section.link.url} target="_blank" rel="noopener noreferrer">
                      {section.link.label} &rarr;
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </details>
      )}

      {meeting.decisions && (
        <details className="meeting-expandable">
          <summary>Decisions &amp; Action Items</summary>
          <div className="expandable-content">
            <ul>
              {meeting.decisions.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </details>
      )}

      {meeting.researchLinks && (
        <details className="meeting-expandable">
          <summary>Research &amp; Links</summary>
          <div className="expandable-content">
            <ul>
              {meeting.researchLinks.map((link, i) => (
                <li key={i}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}
    </div>
  );
}

export default function Meetings() {
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(1); // February = 1 (0-indexed)

  const today = new Date();
  const calDays = getCalendarDays(calYear, calMonth);
  const monthKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
  const currentMeeting = meetingsData[monthKey];

  // Determine meeting days for the calendar
  const meetingDay = currentMeeting?.calDay;

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  // Generate all 12 months of 2026 for meeting cards
  const months2026 = MONTH_NAMES.map((name, i) => {
    const key = `2026-${String(i + 1).padStart(2, '0')}`;
    return { label: name, data: meetingsData[key] || null };
  });

  return (
    <div>
      <div className="page-header">
        <h2>Meetings</h2>
      </div>

      {/* Calendar */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Calendar</span>
        </div>
        <div className="cal-controls">
          <button onClick={prevMonth}>&larr;</button>
          <span className="cal-month-label">{MONTH_NAMES[calMonth]} {calYear}</span>
          <button onClick={nextMonth}>&rarr;</button>
        </div>
        <div className="meetings-calendar">
          {DAY_NAMES.map(d => (
            <div key={d} className="cal-header">{d}</div>
          ))}
          {calDays.map((day, i) => {
            if (day === null) return <div key={`e${i}`} className="cal-day empty" />;
            const isToday = calYear === today.getFullYear() && calMonth === today.getMonth() && day === today.getDate();
            const isMeeting = day === meetingDay;
            let cls = 'cal-day';
            if (isToday) cls += ' today';
            if (isMeeting) cls += ' has-meeting';
            return <div key={day} className={cls}>{day}</div>;
          })}
        </div>
      </div>

      {/* Meeting cards for 2026 */}
      <div className="card-header" style={{ marginBottom: 16 }}>
        <span className="card-title" style={{ fontSize: '1.15rem' }}>2026 STC Meetings</span>
      </div>

      {/* Show February first (the populated one), then Jan, then March-December */}
      <MeetingCard meeting={months2026[1].data} monthLabel="February" />
      <MeetingCard meeting={months2026[0].data} monthLabel="January" />
      {months2026.slice(2).map((m, i) => (
        <MeetingCard key={i + 2} meeting={m.data} monthLabel={m.label} />
      ))}
    </div>
  );
}
