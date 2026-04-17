/**
 * Appeals.jsx
 * Drop into your React app. Requires React Router v6.
 *
 * Routes handled:
 *   /appeals              → AppealsIndex
 *   /appeals/:id          → AppealDetail
 *   /appeals/new          → NewAppealForm
 *   /appeals-tracker      → <Navigate to="/appeals" />
 *
 * Persistence: localStorage key "fsa_appeals_v1"
 * Pending wiring: [PENDING DATA] markers throughout for exhibits, calculator URL, notify list
 */

import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, useNavigate, useParams, Navigate } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────────────────────
   SEED DATA — Ebright fully populated from rate_justification.json
   ───────────────────────────────────────────────────────────────────────────── */
const SEED_APPEALS = [
  {
    id: "EX-1-2026-EBRIGHT",
    caseId: "EX-1",
    title: "CRP Appeal — Bent County",
    appellants: "John Ebright & Stepanie Ebright",
    county: "Bent",
    program: "CRP",
    presenter: "Corey Pelton, Agricultural Program Chief",
    meetingTimeMin: 90,
    status: "OPEN",
    guestsAtMeeting: true,
    dateCreated: "2026-03-24",
    issueSummary:
      "John and Stepanie Ebright are appealing a CRP noncompliance determination by Bent County COC across 7 contracts. The COC determined overgrazing occurred based on stubble height violations and absence of required grazing records. The Ebrights dispute the determination.",
    fullText:
      "Bent County COC issued a noncompliance determination against John and Stepanie Ebright covering CRP contracts 11101 (Tract 751), 11075 (Tract 772), 11115 (Tract 2386), 11071 (Tract 4297), 11116 (Tract 2396), 11117 (Tract 4328), and 11114 (Tract 4034). The determination cited: (1) stubble height measurements below the 4–6 inch minimum required under each contract's 528 CRP Grasslands Prescribed Grazing Plan; (2) failure to provide grazing records when requested by the county office. The COC assessed refunds and placed contracts in violation status. The Ebrights filed a timely appeal. This matter comes before the STC as EX-1 on the March 24, 2026 Executive Session agenda with 90 minutes allocated. The Ebrights are guests and are present only for this item.",
    theGood: [
      "Absence of grazing records cuts both ways — FSA cannot definitively prove actual head count without records",
      "Contract 11117/Tract 4328 has two 528 plans on file with no written FSA determination of which plan governed — creates ambiguity in the standard of compliance",
      "Prior STC (Dec 2025) granted equitable relief in Moffat County CRP misaction case — direct precedent exists for relief",
      "Stubble height documented post-grazing only — no pre-grazing baseline on file, making it a non-controlled comparison",
      "90-minute STC allocation signals full hearing expected, not rubber stamp",
      "Producers managing 2,400+ acres under CRP across 7 contracts demonstrates substantial good-faith program participation",
    ],
    theBad: [
      "Producers signed all 528 plans — they acknowledged and accepted the stocking rate limits in writing",
      "Grazing records were never provided when requested — direct noncompliance with conservation plan requirements regardless of grazing outcome",
      "Noncompliance letter documents specific acres per field across multiple contracts with no producer rebuttal on record",
      "Contract 11101/Tract 751 528 plan data still not fully recovered — gap in agency record unresolved",
      "Stubble height violation was documented by FSA in the field — physical evidence of noncompliance exists independent of record dispute",
    ],
    redFlags: [
      { type: "PROCEDURAL", text: "Were producers given adequate advance notice of the spot check methodology and measurement standards to be applied?" },
      { type: "DOCUMENTATION", text: "Stubble height measured post-grazing only with no pre-grazing baseline. A single post-grazing measurement is not a controlled comparison and may not meet evidentiary standard for a noncompliance determination." },
      { type: "PROCEDURAL", text: "Two 528 plans on file for Contract 11117/Tract 4328 with no written FSA determination of which plan was operative. You cannot cite noncompliance against a standard that has not been formally established in writing." },
      { type: "REGULATORY", text: "If the controlling 528 plan for any contract was not clearly established prior to the grazing season, the noncompliance finding for that contract may be administratively defective and vulnerable to NAD reversal." },
      { type: "DUE PROCESS", text: "Contract 11101/Tract 751 528 plan data is missing from the agency record. A noncompliance determination cannot stand if the operative standard of compliance cannot be produced." },
    ],
    commonSense: [
      "Seven contracts across a large multi-parcel operation. One year of missing records does not establish a pattern of willful violation.",
      "The relevant question is whether the land shows actual damage consistent with overgrazing. Vegetation monitoring and range condition data should be primary evidence — not head count inference from absence of records.",
      "The stocking rates across these contracts are conservative relative to the acreage. A producer managing 2,400+ CRP acres is unlikely to be systematically violating all 7 contracts simultaneously.",
      "The ambiguity in the operative 528 plan for the largest contract (11117, 1,047 acres) is a structural problem in the agency record that should have been resolved before any noncompliance determination was issued.",
    ],
    resolutionOptions: [
      {
        label: "Grant Full Relief",
        description: "Reinstate all 7 contracts. Waive all refunds. Find agency record insufficient to support determination.",
        fsaRisk: "Sets precedent for relief without producers providing required grazing records",
        appellantRisk: "None if granted",
        nadRisk: "HIGH — dual 528 plan ambiguity and missing agency record items are defensible grounds for NAD reversal if denied",
      },
      {
        label: "Grant Partial Relief",
        description: "Reinstate contracts where agency record is deficient (minimum: 11117 and 11101). Negotiate refund only on contracts with clean, unambiguous documentation.",
        fsaRisk: "Moderate — requires contract-by-contract analysis at STC level",
        appellantRisk: "Refund on remaining contracts",
        nadRisk: "MEDIUM",
      },
      {
        label: "Table — Require Documentation",
        description: "30-day window for producers to submit any available grazing records, operator logs, or third-party corroboration before final determination.",
        fsaRisk: "Low — protects agency from premature determination",
        appellantRisk: "If records cannot be produced, denial is harder to appeal",
        nadRisk: "LOW",
      },
      {
        label: "Refer to Mediation",
        description: "Refer case to Colorado FSA mediation program before STC renders determination.",
        fsaRisk: "Low — preserves all options",
        appellantRisk: "Low — right to appeal preserved if mediation fails",
        nadRisk: "LOW",
      },
      {
        label: "Deny — Document Thoroughly",
        description: "Deny relief. Document STC reasoning addressing every red flag. Build complete record for NAD.",
        fsaRisk: "HIGH NAD reversal risk if dual 528 plan issue and missing agency record items not explicitly addressed in STC decision text",
        appellantRisk: "Must escalate to NAD",
        nadRisk: "HIGH",
      },
    ],
    contracts: [
      { contract: "11101", tract: "751", acres: null, maxHead: null, daysPlanned: null, totalAUDs: null, note: "[PENDING DATA] 528 plan Page 3 not recovered from file split" },
      { contract: "11075", tract: "772", acres: 312.07, maxHead: 10, daysPlanned: 180, totalAUDs: 1778.799 },
      { contract: "11115", tract: "2386", acres: 306.29, maxHead: 11, daysPlanned: 120, totalAUDs: 1286.418 },
      { contract: "11071", tract: "4297", acres: 306.29, maxHead: 9, daysPlanned: 180, totalAUDs: 1470.192 },
      { contract: "11116", tract: "2396", acres: 158.80, maxHead: 5, daysPlanned: 120, totalAUDs: 666.96 },
      { contract: "11117", tract: "4328", acres: 1047.81, maxHead: 41, daysPlanned: 120, totalAUDs: 5029.488, note: "Two 528 plans on file. Plan A: 3 head/30 days (small fields). Plan B operative: 41 head/120 days all 1047.81 ac." },
      { contract: "11114", tract: "4034", acres: 315.35, maxHead: 11, daysPlanned: 120, totalAUDs: 1324.47 },
    ],
    advisoryNotes: "",
    voteRecorded: null,
    exhibits: [], // [PENDING DATA] — OneDrive IDs / file hashes TBD
    calculatorUrl: null, // [PENDING DATA] — URL or component name of compliance calculator
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   PERSISTENCE
   ───────────────────────────────────────────────────────────────────────────── */
const STORAGE_KEY = "fsa_appeals_v1";

function loadAppeals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return SEED_APPEALS;
}

function saveAppeals(appeals) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appeals));
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
   VOTE ACTION BOX
   ───────────────────────────────────────────────────────────────────────────── */
const VOTE_BUTTONS = [
  { label: "Grant Full Relief", color: T.green, hoverColor: "#166534" },
  { label: "Grant Partial Relief", color: T.blue, hoverColor: "#1e3a8a" },
  { label: "Table — Request Documentation", color: T.amber, hoverColor: "#92400e" },
  { label: "Refer to Mediation", color: T.purple, hoverColor: "#4c1d95" },
  { label: "Deny", color: T.red, hoverColor: "#7f1d1d" },
];

function VoteActionBox({ appeal, onVote }) {
  const [confirming, setConfirming] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const handleClick = (btn) => setConfirming(btn);

  const handleConfirm = () => {
    onVote(appeal.id, confirming.label);
    setConfirming(null);
  };

  return (
    <div style={{
      background: T.navy,
      borderRadius: 10,
      padding: "20px 24px",
      position: "relative",
    }}>
      <div style={{
        color: T.goldLight,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        marginBottom: 6,
      }}>
        STC Vote — {appeal.caseId}
      </div>
      <div style={{ color: T.slateLight, fontSize: 13, marginBottom: 16 }}>
        {appeal.appellants} · {appeal.program} · {appeal.county} County
      </div>

      {appeal.voteRecorded && (
        <div style={{
          background: T.greenLight,
          border: `1px solid ${T.green}`,
          borderRadius: 6,
          padding: "8px 14px",
          marginBottom: 16,
          color: T.green,
          fontWeight: 700,
          fontSize: 13,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          ✓ Vote Recorded: {appeal.voteRecorded}
        </div>
      )}

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
      }}>
        {VOTE_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            onClick={() => handleClick(btn)}
            onMouseEnter={() => setHoveredBtn(btn.label)}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              background: hoveredBtn === btn.label ? btn.hoverColor : btn.color,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'IBM Plex Mono', monospace",
              cursor: "pointer",
              transition: "background 0.15s",
              letterSpacing: "0.03em",
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 10, color: "#64748B", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>
        [PENDING DATA] Notification list not configured — vote UI functional, submit is logged locally only
      </div>

      {/* Confirmation Modal */}
      {confirming && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 12,
            padding: 32,
            maxWidth: 460,
            width: "90%",
            boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              fontWeight: 700,
              color: T.slate,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}>
              Confirm Vote
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.navy, marginBottom: 12, fontFamily: "Georgia, serif" }}>
              {confirming.label}
            </div>
            <div style={{ fontSize: 14, color: T.slate, lineHeight: 1.6, marginBottom: 8 }}>
              <strong>Case:</strong> {appeal.caseId} — {appeal.appellants}
            </div>
            <div style={{ fontSize: 13, color: T.slate, lineHeight: 1.6, marginBottom: 24 }}>
              This vote will be recorded in localStorage. Distribution to staff pending notification list configuration.
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleConfirm}
                style={{
                  background: confirming.color,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "12px 28px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirming(null)}
                style={{
                  background: "#F3F4F6",
                  color: T.navy,
                  border: "none",
                  borderRadius: 6,
                  padding: "12px 28px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
   APPEAL DETAIL PAGE
   ───────────────────────────────────────────────────────────────────────────── */
function AppealDetail({ appeals, onVote, onUpdateAdvisory }) {
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
        {/* VOTE BOX — TOP */}
        <VoteActionBox appeal={appeal} onVote={onVote} />
        <div style={{ marginBottom: 28 }} />

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

        {/* 11. VOTE BOX — BOTTOM */}
        <VoteActionBox appeal={appeal} onVote={onVote} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ADD NEW APPEAL FORM
   ───────────────────────────────────────────────────────────────────────────── */
function NewAppealForm({ onAdd }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    caseId: "",
    title: "",
    appellants: "",
    county: "",
    program: "CRP",
    presenter: "",
    meetingTimeMin: 60,
    issueSummary: "",
  });

  const handleSubmit = () => {
    if (!form.caseId || !form.title || !form.appellants) {
      alert("Case ID, Title, and Appellants are required.");
      return;
    }
    const newAppeal = {
      ...form,
      id: `${form.caseId}-${Date.now()}`,
      meetingTimeMin: parseInt(form.meetingTimeMin) || 60,
      status: "PENDING DATA",
      guestsAtMeeting: false,
      dateCreated: new Date().toISOString().split("T")[0],
      fullText: "[PENDING DATA]",
      theGood: ["[PENDING DATA]"],
      theBad: ["[PENDING DATA]"],
      redFlags: [{ type: "PROCEDURAL", text: "[PENDING DATA]" }],
      commonSense: ["[PENDING DATA]"],
      resolutionOptions: [],
      contracts: [],
      advisoryNotes: "",
      voteRecorded: null,
      exhibits: [],
      calculatorUrl: null,
    };
    onAdd(newAppeal);
    navigate(`/appeals/${newAppeal.id}`);
  };

  const field = (label, key, type = "text", opts = {}) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 700, color: T.navy, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </label>
      {type === "select" ? (
        <select
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: "Georgia, serif", color: T.navy, background: "#fff" }}
        >
          {opts.options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={opts.placeholder || ""}
          style={{ width: "100%", minHeight: 80, padding: "10px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: "Georgia, serif", color: T.navy, resize: "vertical", boxSizing: "border-box" }}
        />
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={opts.placeholder || ""}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: "Georgia, serif", color: T.navy, boxSizing: "border-box" }}
        />
      )}
    </div>
  );

  return (
    <div style={{ background: T.cream, minHeight: "100vh" }}>
      <div style={{ background: T.navy, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/appeals" style={{ color: T.goldLight, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", textDecoration: "none" }}>← Back to Appeals</Link>
        <span style={{ color: "#fff", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" }}>NEW APPEAL</span>
      </div>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 24px" }}>
        <h1 style={{ fontFamily: "Georgia, serif", color: T.navy, fontSize: 26, marginBottom: 8 }}>Add New Appeal</h1>
        <p style={{ color: T.slate, fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
          Creates a skeleton case with <code style={{ background: "#F3F4F6", padding: "1px 5px", borderRadius: 3, fontSize: 12 }}>[PENDING DATA]</code> placeholders. Fill out the full case on the detail page after submission.
        </p>
        <div style={{ background: "#fff", borderRadius: 10, padding: 28, border: `1px solid ${T.border}` }}>
          {field("Case ID", "caseId", "text", { placeholder: "e.g. EX-2-2026" })}
          {field("Title", "title", "text", { placeholder: "e.g. CRP Appeal — Yuma County" })}
          {field("Appellant(s)", "appellants", "text", { placeholder: "Full names" })}
          {field("County", "county", "text", { placeholder: "Colorado county" })}
          {field("Program", "program", "select", { options: ["CRP", "NAP", "Common Provisions", "EFRP", "LFP", "TAP", "WHIP+", "ECP", "ELAP", "LIP", "Other"] })}
          {field("Presenter", "presenter", "text", { placeholder: "Name, Title" })}
          {field("Meeting Time (minutes)", "meetingTimeMin", "number")}
          {field("Issue Summary", "issueSummary", "textarea", { placeholder: "Plain language summary of what happened and what the appellant wants." })}
          <button
            onClick={handleSubmit}
            style={{
              background: T.blue, color: "#fff", border: "none", borderRadius: 6,
              padding: "13px 28px", fontSize: 14, fontWeight: 700,
              fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer",
              letterSpacing: "0.04em", width: "100%", marginTop: 8,
            }}
          >
            Create Appeal →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   APPEALS INDEX
   ───────────────────────────────────────────────────────────────────────────── */
function AppealsIndex({ appeals }) {
  const openCount = appeals.filter(a => a.status === "OPEN").length;
  const pendingCount = appeals.filter(a => a.status === "PENDING DATA").length;

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
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'IBM Plex Mono', monospace" }}>{s.val}</span>
                <span style={{ fontSize: 13, color: T.slateLight, fontFamily: "'IBM Plex Mono', monospace" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <Link
            to="/appeals/new"
            style={{
              background: T.blue, color: "#fff", textDecoration: "none",
              padding: "10px 20px", borderRadius: 6, fontSize: 13,
              fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.04em",
            }}
          >
            + Add New Appeal
          </Link>
        </div>

        {appeals.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: T.slate, fontFamily: "Georgia, serif", fontSize: 16 }}>
            No appeals on file.
          </div>
        )}

        {appeals.map(appeal => (
          <Link
            key={appeal.id}
            to={`/appeals/${appeal.id}`}
            style={{ textDecoration: "none", display: "block", marginBottom: 16 }}
          >
            <div style={{
              background: "#fff",
              border: `1px solid ${T.border}`,
              borderLeft: `5px solid ${appeal.status === "OPEN" ? T.red : appeal.status === "RESOLVED" ? T.green : T.amber}`,
              borderRadius: 8,
              padding: "20px 24px",
              transition: "box-shadow 0.15s, transform 0.1s",
              cursor: "pointer",
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 700, color: T.slate, letterSpacing: "0.08em" }}>{appeal.caseId}</span>
                  <StatusBadge status={appeal.status} />
                  {appeal.voteRecorded && (
                    <span style={{ background: T.greenLight, color: T.green, fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 3, fontFamily: "'IBM Plex Mono', monospace" }}>
                      ✓ {appeal.voteRecorded}
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.slate }}>⏱ {appeal.meetingTimeMin} min</span>
              </div>
              <h2 style={{ color: T.navy, fontSize: 18, fontWeight: 700, margin: "0 0 6px", fontFamily: "Georgia, serif" }}>{appeal.title}</h2>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: T.slate }}>👤 {appeal.appellants}</span>
                <span style={{ fontSize: 13, color: T.slate }}>📋 {appeal.program}</span>
                <span style={{ fontSize: 13, color: T.slate }}>📍 {appeal.county} County</span>
                {appeal.guestsAtMeeting && <span style={{ fontSize: 13, color: T.amber, fontWeight: 600 }}>⚠ Guests present</span>}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: T.slate, lineHeight: 1.6 }}>
                {appeal.issueSummary.length > 180 ? appeal.issueSummary.slice(0, 180) + "…" : appeal.issueSummary}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ROOT EXPORT — mount this in your router
   ───────────────────────────────────────────────────────────────────────────── */
export default function Appeals() {
  const [appeals, setAppeals] = useState(() => loadAppeals());

  useEffect(() => { saveAppeals(appeals); }, [appeals]);

  const handleVote = useCallback((id, vote) => {
    setAppeals(prev => prev.map(a => a.id === id ? { ...a, voteRecorded: vote, status: "RESOLVED" } : a));
  }, []);

  const handleUpdateAdvisory = useCallback((id, notes) => {
    setAppeals(prev => prev.map(a => a.id === id ? { ...a, advisoryNotes: notes } : a));
  }, []);

  const handleAdd = useCallback((newAppeal) => {
    setAppeals(prev => [...prev, newAppeal]);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<AppealsIndex appeals={appeals} />} />
      <Route path="/new" element={<NewAppealForm onAdd={handleAdd} />} />
      <Route path="/:id" element={<AppealDetail appeals={appeals} onVote={handleVote} onUpdateAdvisory={handleUpdateAdvisory} />} />
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