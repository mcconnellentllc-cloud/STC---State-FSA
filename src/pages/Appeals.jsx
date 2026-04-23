/**
 * Appeals.jsx
 * Drop into your React app. Requires React Router v6.
 *
 * Routes handled:
 *   /appeals              → AppealsIndex
 *   /appeals/:id          → AppealDetail
 *   /appeals-tracker      → <Navigate to="/appeals" />
 *
 * Persistence: localStorage key "fsa_appeals_v1"
 * Pending wiring: [PENDING DATA] markers throughout for exhibits, calculator URL, notify list
 */

import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { useApiFetch } from "../auth/apiFetch";

/* ─────────────────────────────────────────────────────────────────────────────
   MEETING CONTEXT — upcoming April 23, 2026 STC meeting
   ───────────────────────────────────────────────────────────────────────────── */
const NEXT_MEETING = {
  date: "2026-04-23",
  dateLabel: "April 23, 2026",
  label: "Colorado STC Meeting",
  location: "Virtual via Teams (no STC travel authorized)",
  notes: "Appeals carried over from March 24 session, cost-share rate actions, and Otero/Crowley COC status are the primary agenda items.",
};

/* ─────────────────────────────────────────────────────────────────────────────
   DATA SOURCE — appeals are fetched from /api/appeals (see Appeals() component
   below). The server returns the recusal-filtered list for the current user.
   Local edits to advisoryNotes are cached in localStorage under STORAGE_KEY;
   server-side edit sync lands in a later PR.
   ───────────────────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────────
   LOCAL EDIT CACHE
   localStorage now holds only per-appeal advisoryNotes overrides keyed by id.
   The full appeal records come from /api/appeals. Legacy EX-/REF- entries
   from the previous hardcoded SEED_APPEALS are discarded on first load by
   runLegacyMigration().
   ───────────────────────────────────────────────────────────────────────────── */
const STORAGE_KEY = "fsa_appeals_v2";

function runLegacyMigration() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.some(a => /^(EX|REF)-/.test(a?.id || ""))) {
      localStorage.removeItem(STORAGE_KEY);
      console.log("Appeals: cleared legacy localStorage (EX-/REF- ids).");
    }
  } catch (_) {}
}

function loadAdvisoryOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return Object.fromEntries(
        parsed
          .filter(a => a && a.id && typeof a.advisoryNotes === "string")
          .map(a => [a.id, a.advisoryNotes])
      );
    }
    if (parsed && typeof parsed === "object") return parsed;
  } catch (_) {}
  return {};
}

function saveAdvisoryOverride(id, notes) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let map = {};
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && !Array.isArray(parsed) && typeof parsed === "object") {
          map = parsed;
        }
      } catch (_) {}
    }
    map[id] = notes;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (_) {}
}

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
   ───────────────────────────────────────────────────────────────────────────── */
const T = {
  navy: "#0B1F3A",
  navyMid: "#122C52",
  blue: "#1A4A8A",
  blueBright: "#2563EB",
  blueAccent: "#3B82F6",
  gold: "#C8952A",
  goldLight: "#F5C842",
  cream: "#F7F4EE",
  offWhite: "#FAFAF8",
  slate: "#64748B",
  slateLight: "#94A3B8",
  border: "#D1D5DB",
  green: "#15803D",
  greenLight: "#DCFCE7",
  red: "#B91C1C",
  redLight: "#FEE2E2",
  orange: "#C2410C",
  orangeLight: "#FFEDD5",
  amber: "#D97706",
  amberLight: "#FEF3C7",
  purple: "#6D28D9",
  purpleLight: "#EDE9FE",
};

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED UI PRIMITIVES
   ───────────────────────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  OPEN: { bg: T.redLight, color: T.red, label: "OPEN" },
  "PENDING DATA": { bg: T.amberLight, color: T.amber, label: "PENDING DATA" },
  READY: { bg: T.greenLight, color: T.green, label: "READY" },
  RESOLVED: { bg: "#F3F4F6", color: T.slate, label: "RESOLVED" },
  TABLED: { bg: T.purpleLight, color: T.purple, label: "TABLED" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["PENDING DATA"];
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.08em",
      background: cfg.bg,
      color: cfg.color,
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      {cfg.label}
    </span>
  );
}

const FLAG_CONFIG = {
  PROCEDURAL: { bg: T.orangeLight, color: T.orange },
  DOCUMENTATION: { bg: T.amberLight, color: T.amber },
  REGULATORY: { bg: T.redLight, color: T.red },
  "DUE PROCESS": { bg: T.purpleLight, color: T.purple },
  STATUTORY: { bg: "#FDF2F8", color: "#9D174D" },
};

function FlagBadge({ type }) {
  const cfg = FLAG_CONFIG[type] || { bg: T.slateLight, color: T.navy };
  return (
    <span style={{
      display: "inline-block",
      padding: "1px 8px",
      borderRadius: 3,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.06em",
      background: cfg.bg,
      color: cfg.color,
      fontFamily: "'IBM Plex Mono', monospace",
      marginRight: 8,
      flexShrink: 0,
    }}>
      {type}
    </span>
  );
}

function SectionPanel({ color, label, icon, children }) {
  const panelColors = {
    green: { border: T.green, header: T.green, bg: T.greenLight },
    red: { border: T.red, header: T.red, bg: T.redLight },
    orange: { border: T.orange, header: T.orange, bg: T.orangeLight },
    blue: { border: T.blue, header: T.blue, bg: "#EFF6FF" },
    gold: { border: T.gold, header: T.gold, bg: "#FFFBEB" },
    purple: { border: T.purple, header: T.purple, bg: T.purpleLight },
  };
  const c = panelColors[color] || panelColors.blue;
  return (
    <div style={{
      border: `1px solid ${c.border}`,
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: 20,
    }}>
      <div style={{
        background: c.header,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{
          color: "#fff",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          {label}
        </span>
      </div>
      <div style={{ background: c.bg, padding: "14px 16px" }}>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MEETING OUTCOME (read-only display of voteRecorded; no voting UI)
   Voting UI was removed per ethics scope — deliberation happens in noticed
   committee session per 7 CFR 780.14(f). voteRecorded field stays in the data
   model for CED post-meeting entry; this block renders it read-only when set.
   ───────────────────────────────────────────────────────────────────────────── */
function MeetingOutcome({ appeal }) {
  if (!appeal.voteRecorded) return null;
  return (
    <div style={{
      background: T.greenLight,
      border: `1px solid ${T.green}`,
      borderRadius: 8,
      padding: "14px 20px",
      color: T.green,
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 13,
      fontWeight: 700,
    }}>
      <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, opacity: 0.85 }}>
        Meeting outcome — {appeal.caseId}
      </div>
      <div>{appeal.voteRecorded}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CONTRACT TABLE (Ebright-specific, graceful for other CRP appeals)
   ───────────────────────────────────────────────────────────────────────────── */
function ContractTable({ contracts }) {
  if (!contracts || contracts.length === 0) return null;
  const knownContracts = contracts.filter(c => c.acres);
  const totalAcres = knownContracts.reduce((s, c) => s + (c.acres || 0), 0);
  const totalHead = knownContracts.reduce((s, c) => s + (c.maxHead || 0), 0);

  return (
    <div style={{ overflowX: "auto", marginTop: 8 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }}>
        <thead>
          <tr style={{ background: T.navy, color: "#fff" }}>
            {["Contract", "Tract", "Acres", "Max Head", "Days Planned", "Total AUDs", "Notes"].map(h => (
              <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, fontSize: 11, letterSpacing: "0.06em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contracts.map((c, i) => (
            <tr key={c.contract} style={{ background: i % 2 === 0 ? "#F8FAFC" : "#fff", borderBottom: `1px solid ${T.border}` }}>
              <td style={{ padding: "8px 12px", fontWeight: 700, color: T.blue }}>{c.contract}</td>
              <td style={{ padding: "8px 12px" }}>{c.tract}</td>
              <td style={{ padding: "8px 12px" }}>{c.acres != null ? c.acres.toFixed(2) : <span style={{ color: T.amber }}>—</span>}</td>
              <td style={{ padding: "8px 12px" }}>{c.maxHead != null ? c.maxHead : <span style={{ color: T.amber }}>—</span>}</td>
              <td style={{ padding: "8px 12px" }}>{c.daysPlanned != null ? c.daysPlanned : <span style={{ color: T.amber }}>—</span>}</td>
              <td style={{ padding: "8px 12px" }}>{c.totalAUDs != null ? c.totalAUDs.toFixed(3) : <span style={{ color: T.amber }}>—</span>}</td>
              <td style={{ padding: "8px 12px", fontSize: 11, color: c.note?.startsWith("[PENDING") ? T.amber : T.slate }}>{c.note || "—"}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: T.navyMid, color: "#fff", fontWeight: 700 }}>
            <td colSpan={2} style={{ padding: "8px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>TOTALS (excl. pending)</td>
            <td style={{ padding: "8px 12px" }}>{totalAcres.toFixed(2)}</td>
            <td style={{ padding: "8px 12px" }}>{totalHead} head</td>
            <td colSpan={3} style={{ padding: "8px 12px", fontSize: 11, color: T.slateLight }}>
              {(totalAcres / totalHead).toFixed(1)} ac/head avg
            </td>
          </tr>
        </tfoot>
      </table>
      <div style={{ marginTop: 8, fontSize: 11, color: T.slate, fontFamily: "'IBM Plex Mono', monospace" }}>
        [PENDING DATA] Compliance calculator link not yet configured
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CASE BRIEF SUMMARY — parties + program + applications at a glance.
   Renders at the top of the appeal detail page. Data pulls from existing
   fields; structured Issues-for-STC-Determination + Timeline are scoped for
   a later PR when the schema gets dedicated fields.
   ───────────────────────────────────────────────────────────────────────────── */
function CaseBriefSummary({ appeal }) {
  const contracts = appeal.contracts || [];
  const decided = contracts.filter(c => c.status === "DISAPPROVED" || c.status === "APPROVED");
  return (
    <div style={{
      background: "#FEF3C7",
      border: `1px solid ${T.gold}`,
      borderLeft: `5px solid ${T.gold}`,
      borderRadius: 8,
      padding: "14px 18px",
      marginBottom: 28,
    }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: T.navy,
        marginBottom: 10,
      }}>
        Case Brief
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: T.navy }}>
        <div><strong>Appellants:</strong> {appeal.appellants}</div>
        <div><strong>Program:</strong> {appeal.program} &middot; <strong>County:</strong> {appeal.county}</div>
        {appeal.presenter && <div><strong>Presenter:</strong> {appeal.presenter}</div>}
        {contracts.length > 0 && (
          <div style={{ marginTop: 6 }}>
            <strong>{decided.length || contracts.length} applications at issue</strong>
            {decided.length > 0 && (
              <span style={{ color: T.slate, marginLeft: 6 }}>
                ({decided.filter(c => c.status === "DISAPPROVED").length} disapproved, {decided.filter(c => c.status === "APPROVED").length} approved)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ISSUES FOR STC DETERMINATION — numbered, collapsible, with handbook citations
   and side-by-side agency vs appellant positions. Renders only when the
   appeal has at least one issue defined. Schema: appeal.issues[] = [{
     num, question, regulation, agencyPosition[], appellantPosition[], analysis
   }]
   ───────────────────────────────────────────────────────────────────────────── */
function IssuesForDetermination({ appeal }) {
  const issues = appeal.issues || [];
  const [openIssue, setOpenIssue] = useState(null);
  if (issues.length === 0) return null;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={styles.sectionTitle}>Issues for STC Determination ({issues.length})</div>
      {issues.map((issue) => {
        const isOpen = openIssue === issue.num;
        return (
          <div key={issue.num} style={{
            marginBottom: 8,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            overflow: "hidden",
            background: "#fff",
          }}>
            <button
              onClick={() => setOpenIssue(isOpen ? null : issue.num)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px 16px",
                background: isOpen ? "#FEF3C7" : "#fff",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 26, height: 26,
                borderRadius: "50%",
                background: T.gold,
                color: "#fff",
                fontWeight: 800,
                fontSize: 13,
                flexShrink: 0,
                fontFamily: "'IBM Plex Mono', monospace",
              }}>{issue.num}</span>
              <span style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: T.navy, lineHeight: 1.5 }}>
                  {issue.question}
                </div>
                {issue.regulation && (
                  <div style={{ fontSize: 12, color: T.slate, marginTop: 3, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {issue.regulation}
                  </div>
                )}
              </span>
              <span style={{ fontSize: 13, color: T.slate, alignSelf: "center" }}>{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && (
              <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}` }}>
                {(issue.agencyPosition?.length > 0 || issue.appellantPosition?.length > 0) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div style={{
                      background: T.amberLight,
                      borderLeft: `3px solid ${T.amber}`,
                      borderRadius: "0 6px 6px 0",
                      padding: "10px 12px",
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 11, color: T.amber, textTransform: "uppercase", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" }}>
                        Agency Position
                      </div>
                      {(issue.agencyPosition || []).map((p, j) => (
                        <div key={j} style={{ fontSize: 13, lineHeight: 1.6, padding: "2px 0", display: "flex", gap: 6 }}>
                          <span style={{ color: T.amber, fontWeight: 700 }}>•</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{
                      background: "#DBEAFE",
                      borderLeft: `3px solid ${T.blue}`,
                      borderRadius: "0 6px 6px 0",
                      padding: "10px 12px",
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 11, color: T.blue, textTransform: "uppercase", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" }}>
                        Appellant Position
                      </div>
                      {(issue.appellantPosition || []).map((p, j) => (
                        <div key={j} style={{ fontSize: 13, lineHeight: 1.6, padding: "2px 0", display: "flex", gap: 6 }}>
                          <span style={{ color: T.blue, fontWeight: 700 }}>•</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {issue.analysis && (
                  <div style={{
                    background: "#FEE2E2",
                    borderLeft: `3px solid ${T.red}`,
                    borderRadius: "0 6px 6px 0",
                    padding: "10px 12px",
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: T.navy,
                  }}>
                    <strong style={{ color: T.red }}>Analysis:</strong> {issue.analysis}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CASE FILE RESEARCH — renders appeal.caseFileResearch[] as clickable chips.
   Each item links to the source document at the right page via `#page=N`
   anchors. Hidden when the array is empty.
   Shape: { type: 'exhibit'|'handbook'|'minutes'|'cfr', title, citation,
            pageRef, url, sourceDocId, displayLabel }
   ───────────────────────────────────────────────────────────────────────────── */
const RESEARCH_TYPE_ICON = {
  exhibit: "📄",
  handbook: "📖",
  minutes: "🗒",
  cfr: "§",
};

function CaseFileResearch({ appeal }) {
  const items = appeal.caseFileResearch || [];
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={styles.sectionTitle}>Case File Research</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((item, i) => {
          const label = item.displayLabel || item.title
            || (item.citation ? `${item.citation}${item.pageRef ? ` — p. ${item.pageRef}` : ""}` : "Source");
          const icon = RESEARCH_TYPE_ICON[item.type] || "📎";
          const chipBody = (
            <>
              <span style={{ marginRight: 6 }}>{icon}</span>
              <span>{label}</span>
              {item.url && <span style={{ marginLeft: 6, opacity: 0.7 }}>↗</span>}
            </>
          );
          const baseStyle = {
            display: "inline-flex",
            alignItems: "center",
            background: "#fff",
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            padding: "6px 12px",
            fontSize: 13,
            color: T.navy,
            fontFamily: "'IBM Plex Mono', monospace",
            textDecoration: "none",
          };
          return item.url ? (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={baseStyle} title={item.citation || ""}>
              {chipBody}
            </a>
          ) : (
            <span key={i} style={{ ...baseStyle, cursor: "default" }} title={item.citation || ""}>
              {chipBody}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   APPEAL DETAIL PAGE
   ───────────────────────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────────────────────
   FIELD OBSERVATIONS — photo-evidence grid for site visits tied to an appeal.
   Fetches /api/appeals/:id/observations on mount. Hidden when there are no
   observations (common state until admin uploads). Includes an inline
   Lightbox for full-size viewing.
   ───────────────────────────────────────────────────────────────────────────── */
function Lightbox({ src, caption, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!src) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', padding: 20, cursor: 'pointer',
      }}
    >
      <img
        src={src}
        alt={caption || ''}
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '92vw', maxHeight: '84vh', objectFit: 'contain', cursor: 'default', background: '#fff' }}
      />
      {caption && (
        <div style={{ color: '#fff', fontSize: 13, marginTop: 12, maxWidth: '80vw', textAlign: 'center' }}>
          {caption}
        </div>
      )}
      <div style={{ color: '#bbb', fontSize: 11, marginTop: 6, fontFamily: "'IBM Plex Mono', monospace" }}>
        click anywhere or press Esc to close
      </div>
    </div>
  );
}

function FieldObservations({ appealId }) {
  const apiFetch = useApiFetch();
  const [obs, setObs] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/api/appeals/${appealId}/observations`)
      .then(r => (r.ok ? r.json() : []))
      .then(data => { if (!cancelled) setObs(data); })
      .catch(() => { if (!cancelled) setObs([]); });
    return () => { cancelled = true; };
  }, [apiFetch, appealId]);

  if (!obs || obs.length === 0) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={styles.sectionTitle}>Field Observations — Photo Evidence</div>
      {obs.map(o => {
        const planned = o.planned_max != null ? ` / ${o.planned_max} planned` : '';
        return (
          <div key={o.id} style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: 14, marginBottom: 12, background: '#fff' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'baseline', marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>
                {o.visit_date || 'Undated visit'}
              </div>
              {(o.contract_id || o.tract) && (
                <div style={{ fontSize: 12, color: T.slate, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {o.contract_id && `Contract ${o.contract_id}`}
                  {o.contract_id && o.tract && ' · '}
                  {o.tract && `Tract ${o.tract}`}
                </div>
              )}
              {o.cattle_count != null && (
                <div style={{ fontSize: 12, color: T.slate, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {o.cattle_count} head observed{planned}
                </div>
              )}
              {o.exhibit && (
                <div style={{ fontSize: 11, color: T.amber, fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {o.exhibit}
                </div>
              )}
            </div>
            {o.stubble_condition && (
              <div style={{ fontSize: 13, color: T.navy, lineHeight: 1.6, marginBottom: 10 }}>
                <strong>Condition:</strong> {o.stubble_condition}
              </div>
            )}
            {o.notes && (
              <div style={{ fontSize: 12, color: T.slate, lineHeight: 1.6, marginBottom: 10, fontStyle: 'italic' }}>
                {o.notes}
              </div>
            )}
            {o.photos && o.photos.length > 0 && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 8, marginTop: 6,
              }}>
                {o.photos.map(p => {
                  const url = `/api/exhibits/${p.file_path}`;
                  const caption = [p.label, p.description, p.notes].filter(Boolean).join(' — ');
                  return (
                    <button
                      key={p.id}
                      onClick={() => setLightbox({ src: url, caption })}
                      style={{
                        position: 'relative', padding: 0, border: `1px solid ${T.border}`, borderRadius: 6,
                        background: '#fff', cursor: 'pointer', overflow: 'hidden',
                      }}
                      title={caption || p.label || ''}
                    >
                      <img
                        src={url}
                        alt={p.label || ''}
                        loading="lazy"
                        style={{ display: 'block', width: '100%', height: 100, objectFit: 'cover' }}
                      />
                      <div style={{
                        fontSize: 10, padding: '4px 6px',
                        fontFamily: "'IBM Plex Mono', monospace", color: T.slate,
                        borderTop: `1px solid ${T.border}`, textAlign: 'left', background: '#fff',
                      }}>
                        {p.is_marker_card ? '📋 ' : ''}{p.label || 'photo'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {lightbox && (
        <Lightbox src={lightbox.src} caption={lightbox.caption} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

function AppealDetail({ appeals, onUpdateAdvisory }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const appeal = appeals.find(a => a.id === id);
  const [fullTextOpen, setFullTextOpen] = useState(false);
  const [advisory, setAdvisory] = useState(appeal?.advisoryNotes || "");

  useEffect(() => {
    if (appeal) setAdvisory(appeal.advisoryNotes || "");
  }, [appeal]);

  if (!appeal) return (
    <div style={{ padding: 40, fontFamily: "Georgia, serif", color: T.navy }}>
      Appeal not found. <Link to="/appeals" style={{ color: T.blue }}>← Back to Appeals</Link>
    </div>
  );

  const styles = {
    page: { background: T.cream, minHeight: "100vh", fontFamily: "Georgia, serif" },
    topBar: {
      background: T.navy,
      padding: "14px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backLink: { color: T.goldLight, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", textDecoration: "none", letterSpacing: "0.04em" },
    header: { background: T.navyMid, padding: "32px 32px 28px", borderBottom: `4px solid ${T.gold}` },
    caseTag: { color: T.goldLight, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 },
    title: { color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.2 },
    meta: { display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" },
    metaItem: { color: T.slateLight, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" },
    body: { maxWidth: 900, margin: "0 auto", padding: "32px 24px" },
    sectionTitle: {
      fontSize: 13,
      fontFamily: "'IBM Plex Mono', monospace",
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: T.navy,
      marginBottom: 10,
      paddingBottom: 6,
      borderBottom: `2px solid ${T.border}`,
    },
    bullet: { fontSize: 14, lineHeight: 1.7, color: T.navy, display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 },
    bulletDot: { flexShrink: 0, marginTop: 5, width: 6, height: 6, borderRadius: "50%" },
  };

  return (
    <div style={styles.page}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <Link to="/appeals" style={styles.backLink}>← All Appeals</Link>
        <StatusBadge status={appeal.status} />
      </div>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={styles.caseTag}>{appeal.caseId} · {appeal.program} · {appeal.county} County</div>
          <h1 style={styles.title}>{appeal.title}</h1>
          <div style={styles.meta}>
            <span style={styles.metaItem}>👤 {appeal.appellants}</span>
            <span style={styles.metaItem}>🎙 {appeal.presenter}</span>
            <span style={styles.metaItem}>⏱ {appeal.meetingTimeMin} min allocated</span>
            {appeal.guestsAtMeeting && <span style={{ ...styles.metaItem, color: T.goldLight }}>⚠ Guests present at meeting</span>}
          </div>
        </div>
      </div>

      <div style={styles.body}>
        {/* Meeting outcome (read-only; shows only if voteRecorded is set) */}
        {appeal.voteRecorded && (
          <>
            <MeetingOutcome appeal={appeal} />
            <div style={{ marginBottom: 28 }} />
          </>
        )}

        {/* 0. CASE BRIEF SUMMARY */}
        <CaseBriefSummary appeal={appeal} />

        {/* 0b. ISSUES FOR STC DETERMINATION (renders only when issues[] is non-empty) */}
        <IssuesForDetermination appeal={appeal} />

        {/* 1. PLAIN LANGUAGE SUMMARY */}
        <div style={{ marginBottom: 28 }}>
          <div style={styles.sectionTitle}>The Issue</div>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: T.navy, margin: 0 }}>{appeal.issueSummary}</p>
        </div>

        {/* 2. FULL CASE TEXT */}
        <div style={{ marginBottom: 28 }}>
          <div style={styles.sectionTitle}>Full Case Text</div>
          <button
            onClick={() => setFullTextOpen(!fullTextOpen)}
            style={{
              background: "none", border: `1px solid ${T.border}`, borderRadius: 6,
              padding: "8px 16px", cursor: "pointer", fontSize: 13,
              fontFamily: "'IBM Plex Mono', monospace", color: T.blue,
              marginBottom: fullTextOpen ? 12 : 0,
            }}
          >
            {fullTextOpen ? "▲ Collapse" : "▼ Show Full Text"}
          </button>
          {fullTextOpen && (
            <div style={{
              background: "#fff", border: `1px solid ${T.border}`, borderRadius: 6,
              padding: 20, fontSize: 14, lineHeight: 1.8, color: T.navy,
            }}>
              {appeal.fullText}
            </div>
          )}
        </div>

        {/* 3. THE GOOD */}
        <SectionPanel color="green" label="The Good — Arguments for Relief" icon="✓">
          {appeal.theGood.map((item, i) => (
            <div key={i} style={styles.bullet}>
              <div style={{ ...styles.bulletDot, background: T.green }} />
              <span style={{ fontSize: 14, lineHeight: 1.7 }}>{item}</span>
            </div>
          ))}
        </SectionPanel>

        {/* 4. THE BAD */}
        <SectionPanel color="red" label="The Bad — Arguments Against Relief" icon="✗">
          {appeal.theBad.map((item, i) => (
            <div key={i} style={styles.bullet}>
              <div style={{ ...styles.bulletDot, background: T.red }} />
              <span style={{ fontSize: 14, lineHeight: 1.7 }}>{item}</span>
            </div>
          ))}
        </SectionPanel>

        {/* 5. RED FLAGS */}
        <SectionPanel color="orange" label="Legal & Procedural Red Flags" icon="⚠">
          {appeal.redFlags.map((flag, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 14 }}>
              <FlagBadge type={flag.type} />
              <span style={{ fontSize: 14, lineHeight: 1.7, color: T.navy }}>{flag.text}</span>
            </div>
          ))}
        </SectionPanel>

        {/* 6. COMMON SENSE */}
        <SectionPanel color="blue" label="Where Common Sense Should Prevail" icon="⚖">
          {appeal.commonSense.map((item, i) => (
            <p key={i} style={{ fontSize: 14, lineHeight: 1.8, color: T.navy, margin: "0 0 10px" }}>{item}</p>
          ))}
        </SectionPanel>

        {/* 7. RESOLUTION OPTIONS */}
        <div style={{ marginBottom: 28 }}>
          <div style={styles.sectionTitle}>Resolution Options</div>
          {appeal.resolutionOptions.map((opt, i) => (
            <div key={i} style={{
              background: "#fff",
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: 18,
              marginBottom: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{
                  background: T.navy, color: T.goldLight,
                  borderRadius: "50%", width: 24, height: 24,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, fontFamily: "'IBM Plex Mono', monospace",
                  flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontWeight: 700, fontSize: 15, color: T.navy }}>{opt.label}</span>
              </div>
              <p style={{ fontSize: 13, color: T.navy, lineHeight: 1.7, margin: "0 0 10px" }}>{opt.description}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { label: "FSA Risk", value: opt.fsaRisk, color: T.red },
                  { label: "Appellant Risk", value: opt.appellantRisk, color: T.amber },
                  { label: "NAD Reversal Risk", value: opt.nadRisk, color: T.purple },
                ].map(r => (
                  <div key={r.label} style={{ background: "#F8FAFC", borderRadius: 6, padding: "8px 12px" }}>
                    <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: T.slate, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: r.color, fontWeight: 600, lineHeight: 1.5 }}>{r.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 8. CONTRACT TABLE (CRP only) */}
        {appeal.contracts && appeal.contracts.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={styles.sectionTitle}>Contract Data</div>
            <ContractTable contracts={appeal.contracts} />
          </div>
        )}

        {/* 9. EXHIBITS */}
        <div style={{ marginBottom: 28 }}>
          <div style={styles.sectionTitle}>Supporting Documents</div>
          {appeal.exhibits && appeal.exhibits.length > 0 ? (
            appeal.exhibits.map((ex, i) => (
              <div key={i} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 6, padding: 12, marginBottom: 8 }}>
                {ex.name}
              </div>
            ))
          ) : (
            <div style={{
              background: T.amberLight, border: `1px solid ${T.amber}`,
              borderRadius: 6, padding: "10px 16px",
              fontSize: 13, color: T.amber,
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              [PENDING DATA] — Exhibit file links not yet configured. OneDrive IDs / file hashes TBD.
            </div>
          )}
        </div>

        {/* 9b. CASE FILE RESEARCH */}
        <CaseFileResearch appeal={appeal} />

        {/* 9c. FIELD OBSERVATIONS — photo evidence from site visits */}
        <FieldObservations appealId={appeal.id} />

        {/* 10. ADVISORY NOTES */}
        <div style={{ marginBottom: 28 }}>
          <div style={styles.sectionTitle}>Staff / Advisory Panel Notes</div>
          <textarea
            value={advisory}
            onChange={e => setAdvisory(e.target.value)}
            onBlur={() => onUpdateAdvisory(appeal.id, advisory)}
            placeholder="Enter staff or advisory panel position here..."
            style={{
              width: "100%", minHeight: 120, padding: 14, fontSize: 14,
              fontFamily: "Georgia, serif", color: T.navy, lineHeight: 1.7,
              border: `1px solid ${T.border}`, borderRadius: 8,
              background: "#fff", resize: "vertical", boxSizing: "border-box",
            }}
          />
          <div style={{ fontSize: 11, color: T.slate, fontFamily: "'IBM Plex Mono', monospace", marginTop: 4 }}>
            Auto-saved on blur
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ORDERING — logical sort for the appeals docket
   Status priority: OPEN (needs decision) → READY → PENDING DATA → TABLED → RESOLVED.
   Inside the same status bucket, the `priority` field (lower = earlier) governs,
   then meeting time allocation (longer first), then dateCreated.
   ───────────────────────────────────────────────────────────────────────────── */
const STATUS_SORT_RANK = {
  OPEN: 0,
  READY: 1,
  "PENDING DATA": 2,
  TABLED: 3,
  RESOLVED: 4,
};

function sortAppeals(list) {
  return [...list].sort((a, b) => {
    const statusA = STATUS_SORT_RANK[a.status] ?? 99;
    const statusB = STATUS_SORT_RANK[b.status] ?? 99;
    if (statusA !== statusB) return statusA - statusB;
    const prA = a.priority ?? 50;
    const prB = b.priority ?? 50;
    if (prA !== prB) return prA - prB;
    const tA = a.meetingTimeMin || 0;
    const tB = b.meetingTimeMin || 0;
    if (tA !== tB) return tB - tA;
    return (b.dateCreated || "").localeCompare(a.dateCreated || "");
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   APPEALS INDEX
   ───────────────────────────────────────────────────────────────────────────── */
function AppealsIndex({ appeals }) {
  const ordered = sortAppeals(appeals);
  const openCount = appeals.filter(a => a.status === "OPEN").length;
  const pendingCount = appeals.filter(a => a.status === "PENDING DATA").length;
  const resolvedCount = appeals.filter(a => a.status === "RESOLVED").length;
  const aprilDocket = ordered.filter(a => a.meetingDate === NEXT_MEETING.date && a.status === "OPEN");
  const totalAprilMinutes = aprilDocket.reduce((s, a) => s + (a.meetingTimeMin || 0), 0);

  return (
    <div style={{ background: T.cream, minHeight: "100vh" }}>
      {/* Page Header */}
      <div style={{ background: T.navy, padding: "32px 32px 28px", borderBottom: `4px solid ${T.gold}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ color: T.goldLight, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
            Colorado FSA State Technical Committee
          </div>
          <h1 style={{ color: "#fff", fontSize: 30, fontWeight: 800, margin: "0 0 16px", fontFamily: "Georgia, serif" }}>
            Appeals
          </h1>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              { label: "Total Cases", val: appeals.length, color: "#fff" },
              { label: "Open", val: openCount, color: T.goldLight },
              { label: "Pending Data", val: pendingCount, color: T.slateLight },
              { label: "Resolved", val: resolvedCount, color: T.slateLight },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'IBM Plex Mono', monospace" }}>{s.val}</span>
                <span style={{ fontSize: 13, color: T.slateLight, fontFamily: "'IBM Plex Mono', monospace" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* April 23 Meeting Banner */}
      <div style={{
        background: "#fff",
        borderBottom: `1px solid ${T.border}`,
        padding: "20px 24px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{
            background: T.gold, color: "#fff",
            padding: "10px 14px", borderRadius: 6,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
            flexShrink: 0,
          }}>
            Next Meeting
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 800, color: T.navy, marginBottom: 4 }}>
              {NEXT_MEETING.label} — {NEXT_MEETING.dateLabel}
            </div>
            <div style={{ fontSize: 13, color: T.slate, marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>
              {NEXT_MEETING.location}
            </div>
            <div style={{ fontSize: 14, color: T.navy, lineHeight: 1.6, marginBottom: 8 }}>
              {NEXT_MEETING.notes}
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: T.slate }}>
              <span><strong style={{ color: T.navy }}>{aprilDocket.length}</strong> open appeal{aprilDocket.length === 1 ? "" : "s"} on docket</span>
              <span><strong style={{ color: T.navy }}>{totalAprilMinutes}</strong> min allocated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div style={{
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            color: T.slate,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            Sorted: Open → Ready → Pending → Resolved, then priority
          </div>
        </div>

        {appeals.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: T.slate, fontFamily: "Georgia, serif", fontSize: 16 }}>
            No appeals on file.
          </div>
        )}

        {ordered.map(appeal => {
          const borderColor =
            appeal.status === "OPEN" ? T.red
            : appeal.status === "RESOLVED" ? T.green
            : appeal.status === "PENDING DATA" ? T.amber
            : appeal.status === "TABLED" ? T.purple
            : T.slate;
          return (
          <Link
            key={appeal.id}
            to={`/appeals/${appeal.id}`}
            style={{ textDecoration: "none", display: "block", marginBottom: 16 }}
          >
            <div style={{
              background: "#fff",
              border: `1px solid ${T.border}`,
              borderLeft: `5px solid ${borderColor}`,
              borderRadius: 8,
              padding: "20px 24px",
              transition: "box-shadow 0.15s, transform 0.1s",
              cursor: "pointer",
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 700, color: T.slate, letterSpacing: "0.08em" }}>{appeal.caseId}</span>
                  <StatusBadge status={appeal.status} />
                  {appeal.meetingDate === NEXT_MEETING.date && appeal.status === "OPEN" && (
                    <span style={{ background: T.gold, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 3, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em" }}>
                      APR 23 DOCKET
                    </span>
                  )}
                  {appeal.priorHearing && appeal.status === "OPEN" && (
                    <span style={{ background: "#EFF6FF", color: T.blue, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 3, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em" }}>
                      CARRY-OVER FROM {appeal.priorHearing}
                    </span>
                  )}
                  {appeal.voteRecorded && (
                    <span style={{ background: T.greenLight, color: T.green, fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 3, fontFamily: "'IBM Plex Mono', monospace" }}>
                      ✓ {appeal.voteRecorded}
                    </span>
                  )}
                </div>
                {appeal.meetingTimeMin > 0 && (
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.slate }}>⏱ {appeal.meetingTimeMin} min</span>
                )}
              </div>
              <h2 style={{ color: T.navy, fontSize: 18, fontWeight: 700, margin: "0 0 6px", fontFamily: "Georgia, serif" }}>{appeal.title}</h2>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: T.slate }}>👤 {appeal.appellants}</span>
                <span style={{ fontSize: 13, color: T.slate }}>📋 {appeal.program}</span>
                <span style={{ fontSize: 13, color: T.slate }}>📍 {appeal.county} County</span>
                {appeal.presenter && appeal.presenter !== "Reference only — no presenter" && (
                  <span style={{ fontSize: 13, color: T.slate }}>🎙 {appeal.presenter}</span>
                )}
                {appeal.guestsAtMeeting && <span style={{ fontSize: 13, color: T.amber, fontWeight: 600 }}>⚠ Guests present</span>}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: T.slate, lineHeight: 1.6 }}>
                {appeal.issueSummary.length > 240 ? appeal.issueSummary.slice(0, 240) + "…" : appeal.issueSummary}
              </p>
            </div>
          </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ROOT EXPORT — mount this in your router
   ───────────────────────────────────────────────────────────────────────────── */
export default function Appeals() {
  const apiFetch = useApiFetch();
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    runLegacyMigration();
    const overrides = loadAdvisoryOverrides();
    apiFetch("/api/appeals")
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load appeals (${r.status})`);
        return r.json();
      })
      .then(data => {
        const merged = data.map(a =>
          overrides[a.id] !== undefined ? { ...a, advisoryNotes: overrides[a.id] } : a
        );
        setAppeals(merged);
      })
      .catch(err => {
        console.error("Load appeals failed:", err);
        setError(err.message || "Failed to load appeals");
      })
      .finally(() => setLoading(false));
  }, [apiFetch]);

  const handleUpdateAdvisory = useCallback((id, notes) => {
    setAppeals(prev => prev.map(a => a.id === id ? { ...a, advisoryNotes: notes } : a));
    saveAdvisoryOverride(id, notes);
  }, []);

  if (loading) {
    return <div className="loading" style={{ padding: 40, textAlign: "center" }}><div className="spinner" /></div>;
  }
  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--danger)" }}>
        <h3>Could not load appeals</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{error}</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<AppealsIndex appeals={appeals} />} />
      <Route path="/:id" element={<AppealDetail appeals={appeals} onUpdateAdvisory={handleUpdateAdvisory} />} />
    </Routes>
  );
}

/**
 * In your main App.jsx router, add:
 *
 *   import Appeals from "./Appeals";
 *
 *   <Route path="/appeals/*" element={<Appeals />} />
 *   <Route path="/appeals-tracker" element={<Navigate to="/appeals" replace />} />
 */