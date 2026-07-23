import { useState, useEffect } from "react";
import seedData from "../data/appeals_seed.json";

const STORAGE_KEY = "fsa_appeals_v2";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return seedData;
}

function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
}

const C = {
  navy: "#0B1F3A", navyMid: "#122C52",
  blue: "#1A4A8A",
  gold: "#C8952A", goldLight: "#F5C842",
  cream: "#F7F4EE",
  slate: "#64748B", slateLight: "#94A3B8", border: "#D1D5DB",
  green: "#15803D", greenBg: "#DCFCE7",
  red: "#B91C1C", redBg: "#FEE2E2",
  orange: "#C2410C", orangeBg: "#FFEDD5",
  amber: "#D97706", amberBg: "#FEF3C7",
  purple: "#6D28D9", purpleBg: "#EDE9FE",
};

const PROG = {
  CRP:  { bg: "#D1FAE5", c: "#065F46" },
  NAP:  { bg: "#DBEAFE", c: "#1E40AF" },
  LDP:  { bg: "#FEF3C7", c: "#92400E" },
  EFRP: { bg: "#F3E8FF", c: "#5B21B6" },
  OTHER:{ bg: "#F3F4F6", c: "#374151" },
};

const STAT = {
  "OPEN":         { bg: "#FEE2E2", c: "#B91C1C" },
  "PENDING DATA": { bg: "#FEF3C7", c: "#D97706" },
  "READY":        { bg: "#DCFCE7", c: "#15803D" },
  "RESOLVED":     { bg: "#F3F4F6", c: "#64748B" },
  "TABLED":       { bg: "#EDE9FE", c: "#6D28D9" },
};

const FLAG = {
  "PROCEDURAL":   { bg: "#FFEDD5", c: "#C2410C" },
  "DOCUMENTATION":{ bg: "#FEF3C7", c: "#D97706" },
  "REGULATORY":   { bg: "#FEE2E2", c: "#B91C1C" },
  "DUE PROCESS":  { bg: "#EDE9FE", c: "#6D28D9" },
  "STATUTORY":    { bg: "#FDF2F8", c: "#9D174D" },
};

const mono  = { fontFamily: "'IBM Plex Mono', 'Courier New', monospace" };
const serif = { fontFamily: "Georgia, 'Times New Roman', serif" };

const VOTE_OPTIONS = [
  { label: "Grant Full Relief",    color: C.green  },
  { label: "Grant Partial Relief", color: C.blue   },
  { label: "Table — Request Docs", color: C.amber  },
  { label: "Refer to Mediation",   color: C.purple },
  { label: "Deny",                 color: C.red    },
];

function Badge({ bg, c, children, style = {} }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", background: bg, color: c, ...mono, ...style }}>
      {children}
    </span>
  );
}
function StatusBadge({ status }) { const s = STAT[status] || STAT["PENDING DATA"]; return <Badge bg={s.bg} c={s.c}>{status}</Badge>; }
function ProgBadge({ program }) { const p = PROG[program] || PROG.OTHER; return <Badge bg={p.bg} c={p.c}>{program}</Badge>; }
function FlagBadge({ type }) { const f = FLAG[type] || { bg: C.slateLight, c: C.navy }; return <Badge bg={f.bg} c={f.c} style={{ marginRight: 8, flexShrink: 0 }}>{type}</Badge>; }

function SectionTitle({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.navy, marginBottom: 10, paddingBottom: 5, borderBottom: `2px solid ${C.border}`, ...mono }}>{children}</div>;
}

function Panel({ color, label, icon, children }) {
  const palette = {
    green:  { border: C.green,  header: C.green,  bg: C.greenBg  },
    red:    { border: C.red,    header: C.red,    bg: C.redBg    },
    orange: { border: C.orange, header: C.orange, bg: C.orangeBg },
    blue:   { border: C.blue,   header: C.blue,   bg: "#EFF6FF"  },
    amber:  { border: C.amber,  header: C.amber,  bg: C.amberBg  },
    purple: { border: C.purple, header: C.purple, bg: C.purpleBg },
  };
  const p = palette[color] || palette.blue;
  return (
    <div style={{ border: `1px solid ${p.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ background: p.header, padding: "9px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", ...mono }}>{label}</span>
      </div>
      <div style={{ background: p.bg, padding: "14px 16px" }}>{children}</div>
    </div>
  );
}

function Bullet({ color, children }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
      <span style={{ flexShrink: 0, marginTop: 7, width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
      <span style={{ fontSize: 14, lineHeight: 1.75, color: C.navy }}>{children}</span>
    </div>
  );
}

function ContractTable({ contracts }) {
  if (!contracts?.length) return null;
  const known = contracts.filter(c => c.acres != null);
  const totAc = known.reduce((s, c) => s + c.acres, 0);
  const totHd = known.reduce((s, c) => s + (c.maxHead || 0), 0);
  return (
    <div style={{ overflowX: "auto", marginBottom: 8 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, ...mono }}>
        <thead>
          <tr style={{ background: C.navy }}>
            {["Contract","Tract","Acres","Max Head","Days","Total AUDs","Notes"].map(h => (
              <th key={h} style={{ padding: "7px 11px", textAlign: "left", fontWeight: 700, fontSize: 11, letterSpacing: "0.05em", color: "#fff", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contracts.map((c, i) => (
            <tr key={c.contract} style={{ background: i % 2 === 0 ? "#F8FAFC" : "#fff", borderBottom: `1px solid ${C.border}` }}>
              <td style={{ padding: "7px 11px", fontWeight: 700, color: C.blue }}>{c.contract}</td>
              <td style={{ padding: "7px 11px" }}>{c.tract}</td>
              <td style={{ padding: "7px 11px" }}>{c.acres != null ? c.acres.toFixed(2) : <span style={{ color: C.amber }}>—</span>}</td>
              <td style={{ padding: "7px 11px" }}>{c.maxHead ?? <span style={{ color: C.amber }}>—</span>}</td>
              <td style={{ padding: "7px 11px" }}>{c.daysPlanned ?? <span style={{ color: C.amber }}>—</span>}</td>
              <td style={{ padding: "7px 11px" }}>{c.totalAUDs != null ? c.totalAUDs.toFixed(3) : <span style={{ color: C.amber }}>—</span>}</td>
              <td style={{ padding: "7px 11px", fontSize: 11, color: c.note?.startsWith("[PENDING") ? C.amber : C.slate }}>{c.note || "—"}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: C.navyMid, color: "#fff", fontWeight: 700 }}>
            <td colSpan={2} style={{ padding: "7px 11px", fontSize: 11 }}>TOTALS (excl. pending)</td>
            <td style={{ padding: "7px 11px" }}>{totAc.toFixed(2)}</td>
            <td style={{ padding: "7px 11px" }}>{totHd} head</td>
            <td colSpan={3} style={{ padding: "7px 11px", fontSize: 11, color: C.slateLight }}>
              {totHd > 0 ? `${(totAc / totHd).toFixed(1)} ac/head avg` : "—"}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function CropInfoBox({ info }) {
  if (!info) return null;
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.slate, letterSpacing: "0.08em", textTransform: "uppercase", ...mono, marginBottom: 10 }}>Crop / Coverage Detail</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 9 }}>
        {Object.entries(info).map(([k, v]) => (
          <div key={k} style={{ background: "#F8FAFC", borderRadius: 5, padding: "8px 10px" }}>
            <div style={{ fontSize: 9, color: C.slate, fontWeight: 700, ...mono, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{k}</div>
            <div style={{ fontSize: 12, color: C.navy, lineHeight: 1.5 }}>{String(v)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VoteBox({ appeal, onVote }) {
  const [confirming, setConfirming] = useState(null);
  return (
    <div style={{ background: C.navy, borderRadius: 10, padding: "20px 24px" }}>
      <div style={{ color: C.goldLight, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", ...mono, marginBottom: 4 }}>STC VOTE — {appeal.caseId}</div>
      <div style={{ color: C.slateLight, fontSize: 13, marginBottom: 14 }}>{appeal.appellants} · {appeal.program} · {appeal.county} County</div>
      {appeal.voteRecorded && (
        <div style={{ background: C.greenBg, border: `1px solid ${C.green}`, borderRadius: 5, padding: "7px 12px", marginBottom: 12, color: C.green, fontWeight: 700, fontSize: 13, ...mono }}>
          ✓ Vote Recorded: {appeal.voteRecorded}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {VOTE_OPTIONS.map(opt => (
          <button key={opt.label} onClick={() => setConfirming(opt)} style={{ background: opt.color, color: "#fff", border: "none", borderRadius: 6, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", ...mono }}>
            {opt.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 8, color: "#475569", fontSize: 11, ...mono }}>[PENDING] Notification list not configured — votes saved locally only</div>
      {confirming && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, maxWidth: 420, width: "90%", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: 11, color: C.slate, letterSpacing: "0.1em", textTransform: "uppercase", ...mono, marginBottom: 8 }}>Confirm Vote</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 10, ...serif }}>{confirming.label}</div>
            <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.6, marginBottom: 20 }}>
              {appeal.caseId} — {appeal.appellants}<br />Vote saved locally. Distribution pending configuration.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { onVote(appeal.id, confirming.label); setConfirming(null); }} style={{ background: confirming.color, color: "#fff", border: "none", borderRadius: 6, padding: "11px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", ...mono }}>Confirm</button>
              <button onClick={() => setConfirming(null)} style={{ background: "#F3F4F6", color: C.navy, border: "none", borderRadius: 6, padding: "11px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", ...mono }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResolutionOptions({ options }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <SectionTitle>Resolution Options</SectionTitle>
      {options.map((opt, i) => (
        <div key={i} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
            <span style={{ background: C.navy, color: C.goldLight, borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, ...mono }}>{i + 1}</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.navy }}>{opt.label}</span>
          </div>
          <p style={{ fontSize: 13, color: C.navy, lineHeight: 1.75, margin: "0 0 10px" }}>{opt.description}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[["FSA Risk", opt.fsaRisk, C.red], ["Appellant Risk", opt.appellantRisk, C.amber], ["NAD Risk", opt.nadRisk, C.purple]].map(([label, val, color]) => (
              <div key={label} style={{ background: "#F8FAFC", borderRadius: 5, padding: "7px 10px" }}>
                <div style={{ fontSize: 9, color: C.slate, fontWeight: 700, ...mono, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 12, color, fontWeight: 600, lineHeight: 1.4 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AppealDetail({ appeal, onVote, onAdvisory, onArchive, onBack }) {
  const [fullTextOpen, setFullTextOpen] = useState(false);
  const [advisory, setAdvisory] = useState(appeal.advisoryNotes || "");
  useEffect(() => { setAdvisory(appeal.advisoryNotes || ""); }, [appeal.id]);

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <div style={{ background: C.navy, padding: "13px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.goldLight, fontSize: 13, cursor: "pointer", ...mono }}>← All Appeals</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusBadge status={appeal.status} />
          <button onClick={() => onArchive(appeal.id, !appeal.archived)} style={{ background: appeal.archived ? C.green : C.slate, color: "#fff", border: "none", borderRadius: 5, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", ...mono }}>
            {appeal.archived ? "Restore" : "Archive"}
          </button>
        </div>
      </div>

      <div style={{ background: C.navyMid, padding: "28px 28px 24px", borderBottom: `4px solid ${C.gold}` }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ color: C.goldLight, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", ...mono }}>{appeal.caseId} · {appeal.agendaItem}</span>
            <ProgBadge program={appeal.program} />
          </div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: "0 0 12px", ...serif, lineHeight: 1.2 }}>{appeal.title}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
            {[["👤", appeal.appellants], ["🎙", appeal.presenter], ["⏱", `${appeal.meetingTimeMin} min`], ["📅", appeal.meetingDate]].map(([icon, val]) => (
              <span key={icon} style={{ color: C.slateLight, fontSize: 13, ...mono }}>{icon} {val}</span>
            ))}
            {appeal.guestsAtMeeting && <span style={{ color: C.goldLight, fontSize: 13, fontWeight: 600 }}>⚠ Guests present</span>}
            {appeal.phoneJoin && <span style={{ color: C.slateLight, fontSize: 13 }}>📞 {appeal.phoneJoin}</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 20px" }}>
        <VoteBox appeal={appeal} onVote={onVote} />
        <div style={{ height: 28 }} />

        <div style={{ marginBottom: 24 }}>
          <SectionTitle>The Issue</SectionTitle>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: C.navy, margin: 0 }}>{appeal.issueSummary}</p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <SectionTitle>Full Case Text</SectionTitle>
          <button onClick={() => setFullTextOpen(!fullTextOpen)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 5, padding: "7px 14px", cursor: "pointer", fontSize: 13, ...mono, color: C.blue, marginBottom: fullTextOpen ? 10 : 0 }}>
            {fullTextOpen ? "▲ Collapse" : "▼ Show Full Text"}
          </button>
          {fullTextOpen && (
            <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 6, padding: 18, fontSize: 13.5, lineHeight: 1.8, color: C.navy, whiteSpace: "pre-wrap", marginTop: 4 }}>
              {appeal.fullText}
            </div>
          )}
        </div>

        {appeal.cropInfo && <CropInfoBox info={appeal.cropInfo} />}

        <Panel color="green" label="The Good — Arguments for Relief" icon="✓">
          {appeal.theGood.map((x, i) => <Bullet key={i} color={C.green}>{x}</Bullet>)}
        </Panel>
        <Panel color="red" label="The Bad — Arguments Against Relief" icon="✗">
          {appeal.theBad.map((x, i) => <Bullet key={i} color={C.red}>{x}</Bullet>)}
        </Panel>
        <Panel color="orange" label="Legal & Procedural Red Flags" icon="⚠">
          {appeal.redFlags.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", marginBottom: 14 }}>
              <FlagBadge type={f.type} />
              <span style={{ fontSize: 14, lineHeight: 1.75, color: C.navy }}>{f.text}</span>
            </div>
          ))}
        </Panel>
        <Panel color="blue" label="Where Common Sense Should Prevail" icon="⚖">
          {appeal.commonSense.map((x, i) => <p key={i} style={{ fontSize: 14, lineHeight: 1.8, color: C.navy, margin: "0 0 10px" }}>{x}</p>)}
        </Panel>

        <ResolutionOptions options={appeal.resolutionOptions} />

        {appeal.contracts?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionTitle>Contract Data</SectionTitle>
            <ContractTable contracts={appeal.contracts} />
            <div style={{ fontSize: 11, color: C.slate, ...mono, marginTop: 6 }}>[PENDING] Compliance calculator not yet linked</div>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <SectionTitle>Staff / Advisory Panel Notes</SectionTitle>
          <textarea
            value={advisory}
            onChange={e => setAdvisory(e.target.value)}
            onBlur={() => onAdvisory(appeal.id, advisory)}
            placeholder="Enter staff or advisory panel position here..."
            style={{ width: "100%", minHeight: 110, padding: 12, fontSize: 14, ...serif, color: C.navy, lineHeight: 1.7, border: `1px solid ${C.border}`, borderRadius: 7, background: "#fff", resize: "vertical", boxSizing: "border-box" }}
          />
          <div style={{ fontSize: 11, color: C.slate, ...mono, marginTop: 3 }}>Auto-saved on blur</div>
        </div>

        <VoteBox appeal={appeal} onVote={onVote} />
      </div>
    </div>
  );
}

function AppealIndex({ appeals, onSelect }) {
  const [view, setView] = useState("active");
  const visible = appeals.filter(a => view === "archived" ? a.archived : !a.archived);
  const openCount = appeals.filter(a => !a.archived && a.status === "OPEN").length;
  const archivedCount = appeals.filter(a => a.archived).length;

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <div style={{ background: C.navy, padding: "28px 28px 24px", borderBottom: `4px solid ${C.gold}` }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ color: C.goldLight, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", ...mono, marginBottom: 6 }}>
            Colorado FSA · State Technical Committee
          </div>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 14px", ...serif }}>Appeals</h1>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[["Total", appeals.length, "#fff"], ["Open", openCount, C.goldLight], ["Archived", archivedCount, C.slateLight]].map(([label, val, color]) => (
              <div key={label} style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color, ...mono }}>{val}</span>
                <span style={{ fontSize: 12, color: C.slateLight, ...mono }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 7, overflow: "hidden" }}>
            {["active", "archived"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "8px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", background: view === v ? C.navy : "transparent", color: view === v ? "#fff" : C.slate, ...mono, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {v === "active" ? "Active" : "Archived"}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: C.slate, ...serif, fontSize: 16 }}>No {view} appeals.</div>
        )}

        {visible.map(appeal => (
          <div key={appeal.id} onClick={() => onSelect(appeal.id)}
            style={{
              background: "#fff",
              border: `1px solid ${C.border}`,
              borderLeft: `5px solid ${appeal.status === "OPEN" ? C.red : appeal.status === "RESOLVED" ? C.green : C.amber}`,
              borderRadius: 8, padding: "18px 22px", cursor: "pointer",
              opacity: appeal.archived ? 0.65 : 1,
              marginBottom: 14,
              transition: "box-shadow 0.15s, transform 0.1s",
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6, marginBottom: 7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.slate, letterSpacing: "0.08em", ...mono }}>{appeal.caseId}</span>
                <StatusBadge status={appeal.status} />
                <ProgBadge program={appeal.program} />
                {appeal.voteRecorded && <Badge bg={C.greenBg} c={C.green}>✓ {appeal.voteRecorded}</Badge>}
                {appeal.archived && <Badge bg="#F3F4F6" c={C.slate}>ARCHIVED</Badge>}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 11, color: C.slate, ...mono }}>📅 {appeal.meetingDate || "TBD"}</span>
                <span style={{ fontSize: 11, color: C.slate, ...mono }}>⏱ {appeal.meetingTimeMin} min</span>
              </div>
            </div>
            <h2 style={{ color: C.navy, fontSize: 17, fontWeight: 700, margin: "0 0 5px", ...serif }}>{appeal.title}</h2>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: C.slate }}>👤 {appeal.appellants}</span>
              <span style={{ fontSize: 12, color: C.slate }}>📍 {appeal.county} County</span>
              <span style={{ fontSize: 12, color: C.slate }}>🎙 {appeal.presenter?.split(",")[0]}</span>
              {appeal.guestsAtMeeting && <span style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}>⚠ Guests attending</span>}
            </div>
            <p style={{ margin: 0, fontSize: 13, color: C.slate, lineHeight: 1.6 }}>
              {appeal.issueSummary.length > 200 ? appeal.issueSummary.slice(0, 200) + "…" : appeal.issueSummary}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Appeals() {
  const [appeals, setAppeals] = useState(() => load());
  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => { save(appeals); }, [appeals]);

  const selected = appeals.find(a => a.id === selectedId);
  const onVote = (id, vote) => setAppeals(prev => prev.map(a => a.id === id ? { ...a, voteRecorded: vote, status: "RESOLVED" } : a));
  const onAdvisory = (id, notes) => setAppeals(prev => prev.map(a => a.id === id ? { ...a, advisoryNotes: notes } : a));
  const onArchive = (id, archived) => setAppeals(prev => prev.map(a => a.id === id ? { ...a, archived, status: archived ? "RESOLVED" : a.status } : a));

  if (selected) return <AppealDetail appeal={selected} onVote={onVote} onAdvisory={onAdvisory} onArchive={onArchive} onBack={() => setSelectedId(null)} />;
  return <AppealIndex appeals={appeals} onSelect={setSelectedId} />;
}
