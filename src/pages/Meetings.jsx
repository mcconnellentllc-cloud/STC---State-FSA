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

/* ── AI Research Widget for Action Items ─────────────────────── */
function ActionItemAI({ actionItem, meetingContext, apiFetch }) {
  const [expanded, setExpanded] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleAsk = async (customQ) => {
    const q = customQ || question || actionItem;
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer('');
    try {
      const res = await apiFetch('/api/ai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, context: meetingContext || '' })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Research request failed');
      }
      const data = await res.json();
      setAnswer(data.answer || 'No response received.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answer).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="action-item-block">
      <div className="action-item-row">
        <span className="action-item-text">{actionItem}</span>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => {
            if (!expanded) {
              setExpanded(true);
              if (!answer) handleAsk(actionItem);
            } else {
              setExpanded(!expanded);
            }
          }}
        >
          {expanded ? 'Hide' : 'Ask Claude'}
        </button>
      </div>
      {expanded && (
        <div className="ai-research-panel">
          <div className="ai-research-input">
            <input
              type="text"
              placeholder="Ask a follow-up or refine the question..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && question.trim()) handleAsk(); }}
            />
            <button className="btn btn-primary btn-sm" onClick={() => handleAsk()} disabled={loading || !question.trim()}>
              {loading ? 'Researching...' : 'Ask'}
            </button>
          </div>
          {loading && <div className="ai-research-loading"><div className="spinner" /><span>Claude is researching this...</span></div>}
          {error && <div className="ai-research-error">{error}</div>}
          {answer && !loading && (
            <div className="ai-research-answer">
              <div className="ai-answer-header">
                <span>Claude's Research</span>
                <button className={`btn btn-sm ${copied ? 'btn-success' : 'btn-secondary'}`} onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
              <div className="ai-answer-body">{answer}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MeetingCard({ meeting, monthLabel, apiFetch }) {
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

  const meetingContext = [
    `Meeting: ${meeting.date} - ${meeting.type}`,
    meeting.summary,
    ...(meeting.detailedNotes || []).map(n => `${n.title}: ${n.items.join('; ')}`)
  ].join('\n');

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
            {meeting.decisions.map((d, i) => (
              <ActionItemAI key={i} actionItem={d} meetingContext={meetingContext} apiFetch={apiFetch} />
            ))}
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
  const meetingDay = currentMeeting?.calDay;

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
                const isMeeting = day === meetingDay;
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
          <MeetingCard meeting={months2026[1].data} monthLabel="February" apiFetch={apiFetch} />
          <MeetingCard meeting={months2026[0].data} monthLabel="January" apiFetch={apiFetch} />
          {months2026.slice(2).map((m, i) => (
            <MeetingCard key={i + 2} meeting={m.data} monthLabel={m.label} apiFetch={apiFetch} />
          ))}
        </div>
      )}
    </div>
  );
}
