import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

// Aug 27, 2026 agenda × packet-page map. Page numbers are best estimates from
// the packet structure — editable inline in the UI; overrides persist to
// localStorage per user. Add new meetings by defining a second AGENDA entry
// keyed by meeting date; the route currently only wires 2026-08-27.
const AGENDAS = {
  '2026-08-27': {
    title: 'Aug 27, 2026',
    docs: {
      EXEC: { label: 'Exec Session Packet', pages: 925, tone: '#1E4A8A' },
      REG:  { label: 'Regular Session Packet', pages: null, tone: '#6D28D9' },
      EX1:  { label: 'Ex. 1 — Beeutiful Things AR', pages: 136, tone: '#D97706' },
    },
    sessions: [
      { session: 'Executive Session', start: '9:00 AM', items: [
        { n: '1',   t: 'Call to Order' },
        { n: '2',   t: 'Approve Executive Session Minutes — July 23, 2026', type: 'action', doc: 'EXEC', page: 1 },
        { n: '3',   t: 'ELAP Appeal — Elbert County — Beeutiful Things Inc.', type: 'action', doc: 'EXEC', page: 17, alt: 'Also in Ex. 1' },
        { n: '4a',  t: 'LFP — STO Employee 2026 Apps (Rader)', type: 'action', doc: 'EXEC', page: 36 },
        { n: '4b',  t: 'LFP — Kit Carson — Risk & Lease Review (8 farms flagged)', type: 'action', doc: 'EXEC', page: 37 },
        { n: '4c.1', t: 'Cure LFP — Brad Cure 2020 CCC-853', type: 'action', doc: 'EXEC', page: 37 },
        { n: '4c.2', t: 'Cure LFP — Eric Cure 2020 CCC-853', type: 'action', doc: 'EXEC', page: 75 },
        { n: '4c.3', t: 'Cure LFP — Denis & Victoria Cure 2020 CCC-853', type: 'action', doc: 'EXEC', page: 117 },
        { n: '4c.4', t: 'Cure LFP — Brad Cure 2021 CCC-853', type: 'action', doc: 'EXEC', page: 163 },
        { n: '4c.5', t: 'Cure LFP — Eric Cure 2021 CCC-853', type: 'action', doc: 'EXEC', page: 207 },
        { n: '4c.6', t: 'Cure LFP — 2020 & 2021 Eligibility + Leases + Policy', type: 'action', doc: 'EXEC', page: 251 },
        { n: '5',   t: 'NAP — SED Discussion on CEY', type: 'discussion', doc: 'EXEC', page: 440 },
        { n: '6a',  t: 'NAP — NCT General Pricing Guidelines for Fg Crops', type: 'action', doc: 'EXEC', page: 450 },
        { n: '6b',  t: 'NAP — 2027 NCT Colorado — 10 Crops Tabled from July', type: 'action', doc: 'EXEC', page: 470 },
        { n: '6c',  t: 'NAP — 2027 NCT Colorado — 3 new crops', type: 'action', doc: 'EXEC', page: 560 },
        { n: '6d',  t: 'NAP — Ouray Grass FME/RDT new crop request', type: 'action', doc: 'EXEC', page: 590 },
        { n: '7a.1', t: 'SDRP — 2024 M77 Ag LLC — Stage 2', type: 'action', doc: 'EXEC', page: 765 },
        { n: '7a.2', t: 'SDRP — 2025 M77 Ag LLC — Stage 2', type: 'action', doc: 'EXEC', page: 785 },
        { n: '7a.3', t: 'SDRP — 2024 McConnell Enterprise LLC — Stage 2', type: 'action', doc: 'EXEC', page: 805, recuse: true },
        { n: '7a.4', t: 'SDRP — 2024 Kyle McConnell — Stage 2', type: 'action', doc: 'EXEC', page: 825, recuse: true },
        { n: '8',   t: 'MASC — FSA-321 Equitable Relief — Kit Carson — Carlyle C James Trust', type: 'action', doc: 'EXEC', page: 855 },
        { n: '9a',  t: 'CRP — Cost Share Increase (July TABLED) — Baca — Schroder Red Angus', type: 'action', doc: 'EXEC', page: 870 },
        { n: '9b',  t: 'CRP — Producer Self-Certification Recommendation', type: 'action', doc: 'EXEC', page: 880 },
        { n: '10',  t: 'DMC — CCC-802 Dairy Dissolution — Weld — Peschel’s Dairy Inc.', type: 'action', doc: 'EXEC', page: 890 },
        { n: '11',  t: 'Otero COC Actions (Dara Belew) — separate file', type: 'action' },
        { n: '12',  t: 'Adjourn Executive Session' },
      ]},
      { session: 'Regular Session', start: '3:30 PM', items: [
        { n: '1',   t: 'Call to Order' },
        { n: '2',   t: 'Approve Regular Session Minutes — July 23, 2026', type: 'action', doc: 'REG', page: 1 },
        { n: '3',   t: 'State Executive Director Report', type: 'discussion', doc: 'REG', page: 15 },
        { n: '4',   t: 'District Director Reports', type: 'discussion', doc: 'REG', page: 20 },
        { n: '5',   t: 'Senior Leadership Reports', type: 'discussion', doc: 'REG', page: 30 },
        { n: '6',   t: 'NAP — Delegation: Designate DD as STC Representative', type: 'action', doc: 'REG', page: 40 },
        { n: '7',   t: 'EFRP — CSFS EFRP Implementation ($9M / 9 counties)', type: 'action', doc: 'REG', page: 50 },
        { n: '8',   t: 'ARC/PLC — 2025 DAFP Yield Solicitation (Safflower)', type: 'action', doc: 'REG', page: 80 },
        { n: '9',   t: 'State Committee Field Discussion Update', type: 'discussion' },
        { n: '10',  t: 'Adjourn Regular Session' },
      ]},
    ],
  },
};

const C = {
  navy: '#0B1F3A', navyMid: '#122C52',
  gold: '#C8952A', goldLt: '#F5C842',
  cream: '#F7F4EE', paper: '#FBFAF6',
  ink: '#0F172A', ink2: '#334155',
  mute: '#64748B', muteLt: '#94A3B8',
  rule: '#D8D2C4', rule2: '#E7E3D6',
  panel: '#ffffff', panel2: '#F6F3EB',
  blue: '#1E4A8A',
  green: '#15803D', greenLt: '#DCFCE7',
  red: '#B91C1C', redLt: '#FEE2E2',
  amber: '#D97706', amberLt: '#FEF3C7',
  purple: '#6D28D9', purpleLt: '#EDE9FE',
};
const mono = { fontFamily: "'IBM Plex Mono', 'Courier New', monospace", fontVariantNumeric: 'tabular-nums' };
const serif = { fontFamily: "Georgia, 'Times New Roman', serif" };

function storageKey(date) { return `meeting_follow_${date}_v1`; }

export default function MeetingFollow() {
  const { date } = useParams();
  const meetingDate = date || '2026-08-27';
  const meeting = AGENDAS[meetingDate];

  const [docs, setDocs] = useState(() => {
    const out = {};
    if (meeting) Object.entries(meeting.docs).forEach(([k, v]) => { out[k] = { ...v, url: null, name: null }; });
    return out;
  });
  const [activeDoc, setActiveDoc] = useState('EXEC');
  const [activeKey, setActiveKey] = useState('0-1');
  const [done, setDone] = useState({});
  const [pageOverrides, setPageOverrides] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [now, setNow] = useState(() => new Date());
  const iframeRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(meetingDate));
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.done) setDone(parsed.done);
      if (parsed.pageOverrides) setPageOverrides(parsed.pageOverrides);
      if (parsed.activeDoc) setActiveDoc(parsed.activeDoc);
      if (parsed.activeKey) setActiveKey(parsed.activeKey);
    } catch (_) {}
  }, [meetingDate]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(meetingDate), JSON.stringify({ done, pageOverrides, activeDoc, activeKey }));
    } catch (_) {}
  }, [done, pageOverrides, activeDoc, activeKey, meetingDate]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const findItem = useCallback((key) => {
    if (!key || !meeting) return null;
    const [si, ii] = key.split('-').map(Number);
    return meeting.sessions[si]?.items[ii] || null;
  }, [meeting]);

  const activeItem = findItem(activeKey);

  useEffect(() => {
    if (!activeItem) return;
    const p = pageOverrides[activeKey] ?? activeItem.page;
    if (activeItem.doc) setActiveDoc(activeItem.doc);
    if (p) setCurrentPage(p);
  }, [activeKey, activeItem, pageOverrides]);

  useEffect(() => {
    const doc = docs[activeDoc];
    if (!doc?.url || !iframeRef.current) return;
    iframeRef.current.src = `${doc.url}#page=${currentPage}&view=FitH&toolbar=1`;
  }, [activeDoc, currentPage, docs]);

  const activate = (si, ii) => setActiveKey(`${si}-${ii}`);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (!activeKey || !meeting) return;
      let [si, ii] = activeKey.split('-').map(Number);
      if (e.key === 'ArrowDown' || e.key === 'j') {
        ii++;
        if (ii >= meeting.sessions[si].items.length) { si++; ii = 0; }
        if (meeting.sessions[si]) { activate(si, ii); e.preventDefault(); }
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        ii--;
        if (ii < 0) { si--; if (meeting.sessions[si]) ii = meeting.sessions[si].items.length - 1; }
        if (meeting.sessions[si] && ii >= 0) { activate(si, ii); e.preventDefault(); }
      } else if (e.key === ' ') {
        setDone(d => ({ ...d, [activeKey]: !d[activeKey] }));
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeKey, meeting]);

  const onFilePick = (key, file) => {
    if (!file) return;
    setDocs(d => {
      const prev = d[key];
      if (prev.url) URL.revokeObjectURL(prev.url);
      return { ...d, [key]: { ...prev, url: URL.createObjectURL(file), name: file.name } };
    });
    setActiveDoc(key);
  };

  if (!meeting) {
    return (
      <div style={{ padding: 40, ...serif, color: C.navy }}>
        <p>No follow-along agenda configured for {meetingDate}.</p>
        <Link to="/board-meetings" style={{ color: C.blue }}>← Board Meetings</Link>
      </div>
    );
  }

  const activePage = pageOverrides[activeKey] ?? activeItem?.page ?? null;
  const doc = docs[activeDoc];

  const clockText = (() => {
    const hh = now.getHours(), mm = now.getMinutes();
    const h12 = ((hh + 11) % 12) + 1;
    const ampm = hh < 12 ? 'AM' : 'PM';
    return `${h12}:${String(mm).padStart(2, '0')} ${ampm}`;
  })();

  return (
    <div style={{ background: C.cream, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ background: C.navy, color: '#fff', padding: '10px 20px', borderBottom: `3px solid ${C.gold}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <Link to={`/board-meetings/${meetingDate}`} style={{ ...mono, color: C.goldLt, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>← STC · {meeting.title}</Link>
          <h1 style={{ ...serif, margin: 0, fontSize: 18, color: '#fff' }}>Agenda × Packet — Live Follow</h1>
        </div>
        <div style={{ ...mono, fontSize: 12, color: C.goldLt }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginRight: 8 }}>{clockText}</span>
          {activeItem ? `on Item ${activeItem.n}` : 'no item selected'}
        </div>
      </div>

      {/* Body split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gridTemplateRows: 'auto 1fr', flex: 1, minHeight: 0 }}>
        {/* Agenda column */}
        <aside style={{ gridRow: '1 / 3', gridColumn: '1 / 2', background: C.panel, borderRight: `1px solid ${C.rule}`, overflowY: 'auto' }}>
          {meeting.sessions.map((sess, si) => (
            <div key={si}>
              <div style={{ ...mono, padding: '10px 14px 6px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold, background: C.panel2, borderBottom: `1px solid ${C.rule}`, position: 'sticky', top: 0, zIndex: 2 }}>
                {sess.session}<span style={{ color: C.mute, fontWeight: 500, marginLeft: 8 }}>{sess.start}</span>
              </div>
              {sess.items.map((it, ii) => {
                const key = `${si}-${ii}`;
                const isActive = activeKey === key;
                const isDone = !!done[key];
                const pg = pageOverrides[key] ?? it.page;
                const docKey = it.doc;
                const docTone = docKey ? meeting.docs[docKey]?.tone : C.mute;
                return (
                  <div
                    key={key}
                    onClick={() => activate(si, ii)}
                    style={{
                      display: 'grid', gridTemplateColumns: '46px 1fr auto', gap: 8, alignItems: 'start',
                      padding: '9px 14px', borderBottom: `1px solid ${C.rule2}`, cursor: 'pointer',
                      background: isActive ? 'linear-gradient(90deg, rgba(200,149,42,0.14), transparent)' : 'transparent',
                      boxShadow: isActive ? `inset 3px 0 0 ${C.gold}` : 'none',
                      opacity: isDone ? 0.55 : 1,
                      ...(it.recuse ? { background: 'rgba(185,28,28,0.06)' } : {}),
                    }}
                  >
                    <div style={{ ...mono, fontSize: 12, fontWeight: 700, color: isActive ? C.gold : C.navy, textAlign: 'right', textDecoration: isDone ? 'line-through' : 'none' }}>{it.n}</div>
                    <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.45, fontWeight: 500 }}>
                      {it.recuse && <span style={{ ...mono, display: 'inline-block', padding: '1px 6px', background: C.redLt, color: C.red, borderRadius: 3, fontSize: 9.5, fontWeight: 700, marginRight: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Recuse</span>}
                      {it.type === 'action' && <span style={{ ...mono, display: 'inline-block', padding: '1px 6px', background: C.greenLt, color: C.green, borderRadius: 3, fontSize: 9.5, fontWeight: 700, marginRight: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Act</span>}
                      {it.type === 'discussion' && <span style={{ ...mono, display: 'inline-block', padding: '1px 6px', background: C.amberLt, color: C.amber, borderRadius: 3, fontSize: 9.5, fontWeight: 700, marginRight: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Disc</span>}
                      {it.t}
                      {it.alt && <div style={{ ...mono, fontSize: 10.5, color: C.mute, marginTop: 3 }}>{it.alt}</div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      <input
                        type="number" min={1} step={1}
                        value={pg ?? ''} placeholder="—"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const v = parseInt(e.target.value);
                          setPageOverrides(o => ({ ...o, [key]: Number.isFinite(v) ? v : null }));
                        }}
                        style={{
                          width: 48, padding: '2px 6px', background: C.paper,
                          border: `1px solid ${C.rule}`, borderRadius: 3, textAlign: 'right',
                          ...mono, fontSize: 11, color: C.ink,
                        }}
                      />
                      {docKey && <span style={{ ...mono, fontSize: 9, letterSpacing: '0.05em', color: docTone, textTransform: 'uppercase' }}>{docKey === 'EXEC' ? 'Exec' : docKey === 'REG' ? 'Reg' : 'Ex1'}</span>}
                      <label style={{ display: 'inline-flex', alignItems: 'center', fontSize: 9, color: C.mute, gap: 3, marginTop: 2 }} onClick={(e) => e.stopPropagation()}>
                        done <input type="checkbox" checked={isDone} onChange={(e) => setDone(d => ({ ...d, [key]: e.target.checked }))} style={{ accentColor: C.gold, transform: 'scale(1.15)' }} />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </aside>

        {/* Tabs */}
        <div style={{ gridColumn: '2 / 3', gridRow: '1 / 2', display: 'flex', gap: 2, background: C.panel2, borderBottom: `1px solid ${C.rule}`, padding: '6px 12px 0', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {Object.entries(meeting.docs).map(([k, d]) => {
            const isActive = activeDoc === k;
            const loaded = !!docs[k]?.url;
            return (
              <div
                key={k}
                onClick={() => setActiveDoc(k)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px 9px',
                  background: isActive ? C.paper : C.panel,
                  border: `1px solid ${isActive ? C.gold : C.rule}`,
                  borderBottom: isActive ? `1px solid ${C.paper}` : `1px solid ${C.rule}`,
                  borderRadius: '6px 6px 0 0',
                  color: isActive ? C.navy : C.mute,
                  cursor: 'pointer',
                  fontSize: 12.5, fontWeight: 600,
                  marginBottom: isActive ? -1 : 0,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: loaded ? C.green : C.muteLt, flexShrink: 0 }} />
                <span title={d.label} style={{ maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.label}</span>
                <span style={{ ...mono, fontSize: 10, color: loaded ? C.green : C.mute, letterSpacing: '0.04em' }}>{loaded ? (docs[k].name || 'loaded').slice(0, 20) : 'not loaded'}</span>
                <label style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 7px', background: C.gold, color: C.navy, borderRadius: 3, ...mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Load
                  <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => onFilePick(k, e.target.files[0])} />
                </label>
              </div>
            );
          })}
        </div>

        {/* Viewer */}
        <main style={{ gridColumn: '2 / 3', gridRow: '2 / 3', background: C.cream, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {activeItem?.recuse && (
            <div style={{ padding: '10px 16px', background: C.redLt, color: C.red, borderBottom: `1px solid ${C.red}`, fontSize: 12.5 }}>
              <strong>RECUSAL — do not participate.</strong> Personal financial interest.
            </div>
          )}
          <div style={{ padding: '8px 16px', background: C.paper, borderBottom: `1px solid ${C.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ ...serif, fontWeight: 700, fontSize: 14, color: C.navy }}>
              {activeItem ? `Item ${activeItem.n} · ${activeItem.t}` : 'No item'}
              {activePage && <span style={{ color: C.mute, fontWeight: 400, marginLeft: 8, ...mono, fontSize: 11 }}>p. {activePage}</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, ...mono, fontSize: 11, color: C.mute }}>
                <span>Page</span>
                <input
                  type="number" min={1} step={1}
                  value={currentPage} placeholder="—"
                  onChange={(e) => { const p = parseInt(e.target.value); if (Number.isFinite(p)) setCurrentPage(p); }}
                  style={{ width: 60, padding: '4px 6px', background: C.paper, border: `1px solid ${C.rule}`, borderRadius: 3, textAlign: 'right', ...mono, fontSize: 12, color: C.ink }}
                />
                {doc?.pages && <span>/ {doc.pages}</span>}
              </div>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={{ background: 'transparent', color: C.navy, border: `1px solid ${C.rule}`, borderRadius: 3, padding: '4px 10px', ...mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>◀ Back</button>
              <button onClick={() => setCurrentPage(p => p + 1)} style={{ background: 'transparent', color: C.navy, border: `1px solid ${C.rule}`, borderRadius: 3, padding: '4px 10px', ...mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Fwd ▶</button>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, position: 'relative', background: C.paper }}>
            {!doc?.url && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
                <div style={{ maxWidth: 460, padding: 32, border: `2px dashed ${C.rule}`, borderRadius: 12, background: C.panel }}>
                  <h3 style={{ ...serif, margin: '0 0 8px', fontSize: 18, color: C.navy }}>Load your packet PDFs</h3>
                  <p style={{ color: C.mute, fontSize: 13, margin: '0 0 16px', lineHeight: 1.6 }}>
                    Click <strong>Load</strong> on each tab above and pick the corresponding PDF from your device. Files stay in this browser — nothing uploads. Then click any agenda item on the left to jump.
                  </p>
                  <p style={{ ...mono, fontSize: 11, color: C.muteLt, margin: 0, lineHeight: 1.6 }}>
                    Default page numbers are estimates — edit any of them inline in the agenda if a page is off. Overrides save for this session.
                  </p>
                </div>
              </div>
            )}
            <iframe ref={iframeRef} title="packet" style={{ width: '100%', height: '100%', border: 0, background: C.paper, display: doc?.url ? 'block' : 'none' }} />
          </div>
        </main>
      </div>
    </div>
  );
}
