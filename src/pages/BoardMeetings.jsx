import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import registry from "../data/meetings_registry.json";
import july23 from "../data/meeting_2026-07-23_index.json";
import aug27 from "../data/meeting_2026-08-27_index.json";

const MEETING_DATA = {
  "2026-07-23": july23,
  "2026-08-27": aug27,
};

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
const mono = { fontFamily: "'IBM Plex Mono', 'Courier New', monospace" };
const serif = { fontFamily: "Georgia, 'Times New Roman', serif" };

const SEV = {
  blocker:      { bg: C.redBg,    c: C.red,    label: "BLOCKER" },
  data_quality: { bg: C.amberBg,  c: C.amber,  label: "DATA QUALITY" },
  warning:      { bg: C.orangeBg, c: C.orange, label: "WARNING" },
  info:         { bg: "#DBEAFE",  c: "#1E40AF", label: "INFO" },
};

const TYPE_BG = {
  action:       { bg: C.greenBg,  c: C.green,  label: "ACTION" },
  procedural:   { bg: "#F3F4F6",  c: C.slate,  label: "PROCEDURAL" },
  report:       { bg: "#DBEAFE",  c: "#1E40AF", label: "REPORT" },
  discussion:   { bg: C.purpleBg, c: C.purple, label: "DISCUSSION" },
  informational:{ bg: C.amberBg,  c: C.amber,  label: "INFO" },
  exhibit:      { bg: "#F3F4F6",  c: C.slate,  label: "EXHIBIT" },
};

function Badge({ bg, c, children, style = {} }) {
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", background: bg, color: c, ...mono, ...style }}>{children}</span>;
}

function normalizeType(actionType) {
  if (!actionType) return "procedural";
  const s = actionType.toLowerCase();
  if (s.includes("action")) return "action";
  if (s.includes("procedural")) return "procedural";
  if (s.includes("report") || s.includes("oral") || s.includes("written")) return "report";
  if (s.includes("discussion")) return "discussion";
  if (s.includes("informational")) return "informational";
  if (s.includes("exhibit")) return "exhibit";
  return "procedural";
}

function fmtDate(iso) {
  if (!iso) return "TBD";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function SectionTitle({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.navy, marginBottom: 10, paddingBottom: 5, borderBottom: `2px solid ${C.border}`, ...mono }}>{children}</div>;
}

function AgendaItem({ item, session }) {
  const [open, setOpen] = useState(false);
  const t = normalizeType(item.action_type);
  const typeCfg = TYPE_BG[t];
  const kf = item.key_facts;
  const hasBody = !!(kf || item.note || item.flags?.length);
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderLeft: t === "action" ? `4px solid ${C.green}` : `4px solid ${C.border}`, borderRadius: 6, marginBottom: 8 }}>
      <div onClick={() => hasBody && setOpen(!open)} style={{ padding: "10px 14px", cursor: hasBody ? "pointer" : "default", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ background: C.navy, color: C.goldLight, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, ...mono, minWidth: 32, textAlign: "center" }}>{item.number}</span>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.navy, ...serif, lineHeight: 1.35 }}>{item.title}</div>
          {item.presenter && <div style={{ fontSize: 11, color: C.slate, marginTop: 2 }}>🎙 {item.presenter}</div>}
        </div>
        <Badge bg={typeCfg.bg} c={typeCfg.c}>{typeCfg.label}</Badge>
        {item.time_allotted_min > 0 && <Badge bg="#F3F4F6" c={C.slate}>{item.time_allotted_min} min</Badge>}
        {hasBody && <span style={{ color: C.slate, fontSize: 12, ...mono }}>{open ? "▲" : "▼"}</span>}
      </div>
      {open && hasBody && (
        <div style={{ background: "#F8FAFC", padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
          {item.note && <div style={{ background: C.amberBg, border: `1px solid ${C.amber}`, borderRadius: 4, padding: "6px 10px", marginBottom: 10, fontSize: 12, color: C.navy }}>⚠ {item.note}</div>}
          {kf && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, marginBottom: 8 }}>
              {Object.entries(kf).map(([k, v]) => {
                if (k === "source") return null;
                const val = Array.isArray(v) ? (<ul style={{ margin: 0, paddingLeft: 16 }}>{v.map((li, i) => <li key={i} style={{ fontSize: 11.5, color: C.navy, lineHeight: 1.5, marginBottom: 3 }}>{li}</li>)}</ul>)
                          : typeof v === "object" && v !== null ? (<div style={{ fontSize: 11, color: C.navy, ...mono }}>{Object.entries(v).map(([k2, v2]) => <div key={k2}>{k2}: {String(v2)}</div>)}</div>)
                          : (<div style={{ fontSize: 12, color: C.navy, lineHeight: 1.5 }}>{String(v)}</div>);
                return (
                  <div key={k} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 4, padding: "7px 10px" }}>
                    <div style={{ fontSize: 9, color: C.slate, fontWeight: 700, ...mono, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{k.replace(/_/g, " ")}</div>
                    {val}
                  </div>
                );
              })}
            </div>
          )}
          {kf?.source && <div style={{ fontSize: 10, color: C.slate, ...mono, marginTop: 4 }}>📄 {kf.source.file} — pp.{kf.source.pages}</div>}
          {item.flags?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {item.flags.map((f, i) => <div key={i} style={{ fontSize: 11, color: C.orange, marginTop: 3 }}>⚠ {f}</div>)}
            </div>
          )}
          {item.documents?.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ fontSize: 11, color: C.slate, cursor: "pointer", ...mono }}>Documents ({item.documents.length})</summary>
              <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                {item.documents.map((d, i) => (
                  <div key={i} style={{ fontSize: 11, color: C.navy, ...mono, background: "#fff", padding: "5px 8px", borderRadius: 3, border: `1px solid ${C.border}` }}>
                    <span style={{ color: d.text_layer === "scanned_no_text" ? C.red : d.text_layer === "partial" ? C.amber : C.green, fontWeight: 700 }}>[{d.text_layer || "?"}]</span>{" "}
                    {d.doc_type}{d.label ? ` — ${d.label}` : ""}
                    {d.packet_pages && <span style={{ color: C.slate }}> · pp.{d.packet_pages.start}-{d.packet_pages.end}</span>}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function MeetingDetail({ date }) {
  const data = MEETING_DATA[date];
  const meta = registry.meetings.find(m => m.date === date);
  const nav = useNavigate();
  if (!meta) return <NotFound date={date} />;

  if (!data) {
    return (
      <div style={{ background: C.cream, minHeight: "100vh" }}>
        <TopBar />
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "40px 20px" }}>
          <h1 style={{ ...serif, color: C.navy, fontSize: 26, margin: "0 0 8px" }}>{meta.title}</h1>
          <div style={{ color: C.slate, fontSize: 13, marginBottom: 20 }}>{fmtDate(meta.date)} · {meta.location}</div>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: 24 }}>
            <Badge bg={C.amberBg} c={C.amber}>NOT YET PARSED</Badge>
            <p style={{ marginTop: 12, color: C.navy, lineHeight: 1.7 }}>
              This meeting's packets have not been parsed into structured data yet.
              {meta.note && <><br /><br /><strong>Available notes:</strong> {meta.note}</>}
            </p>
            {meta.hasAppeals && meta.appealsRef?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <SectionTitle>Related Appeals</SectionTitle>
                {meta.appealsRef.map(id => (
                  <Link key={id} to="/appeals" style={{ display: "inline-block", marginRight: 8, marginBottom: 6, color: C.blue, fontSize: 12, ...mono, textDecoration: "underline" }}>{id}</Link>
                ))}
              </div>
            )}
            <button onClick={() => nav("/board-meetings")} style={{ marginTop: 20, background: C.blue, color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", ...mono }}>← Back to meetings</button>
          </div>
        </div>
      </div>
    );
  }

  const m = data.meeting;
  const priorMtg = meta.priorMeetingRef ? registry.meetings.find(x => x.date === meta.priorMeetingRef) : null;

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <TopBar />
      <div style={{ background: C.navyMid, padding: "28px 28px 24px", borderBottom: `4px solid ${C.gold}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Link to="/board-meetings" style={{ color: C.goldLight, fontSize: 12, textDecoration: "none", ...mono }}>← All Meetings</Link>
          <div style={{ color: C.goldLight, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", ...mono, marginTop: 12, marginBottom: 6 }}>
            Colorado FSA · State Technical Committee
          </div>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: "0 0 10px", ...serif }}>{meta.title}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            <span style={{ color: C.slateLight, fontSize: 13, ...mono }}>📅 {fmtDate(m.meeting_date)}</span>
            <span style={{ color: C.slateLight, fontSize: 13, ...mono }}>📍 {m.location}</span>
            {m.phone_conference && <span style={{ color: C.slateLight, fontSize: 13, ...mono }}>📞 {m.phone_conference}</span>}
          </div>
          {priorMtg && (
            <div style={{ marginTop: 10, fontSize: 12 }}>
              <span style={{ color: C.slateLight, ...mono }}>Prior meeting: </span>
              <Link to={`/board-meetings/${priorMtg.date}`} style={{ color: C.goldLight, textDecoration: "underline" }}>{priorMtg.title}</Link>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>
        {m.committee_members?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionTitle>Committee Members</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {m.committee_members.map(name => <Badge key={name} bg="#fff" c={C.navy} style={{ border: `1px solid ${C.border}`, fontSize: 11 }}>{name}</Badge>)}
            </div>
          </div>
        )}

        {data.flags?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionTitle>Data-Quality Flags ({data.flags.length})</SectionTitle>
            {data.flags.map(f => {
              const sev = SEV[f.severity] || SEV.info;
              return (
                <div key={f.id} style={{ background: "#fff", border: `1px solid ${sev.c}`, borderLeft: `4px solid ${sev.c}`, borderRadius: 6, padding: "10px 14px", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Badge bg={sev.bg} c={sev.c}>{sev.label}</Badge>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.navy, ...mono }}>{f.id}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.navy, lineHeight: 1.6 }}>{f.summary}</div>
                  {f.rule && <div style={{ fontSize: 10, color: C.slate, marginTop: 4, ...mono }}>{f.rule}</div>}
                </div>
              );
            })}
          </div>
        )}

        {m.sessions.map(sess => (
          <div key={sess.session} style={{ marginBottom: 32 }}>
            <div style={{ background: C.navy, color: "#fff", padding: "10px 16px", borderRadius: "6px 6px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", ...mono }}>{sess.session}</span>
              <span style={{ fontSize: 11, color: C.slateLight, ...mono }}>starts {sess.start_time}</span>
            </div>
            <div style={{ padding: 12, background: "#fff", border: `1px solid ${C.border}`, borderTop: "none", borderRadius: "0 0 6px 6px" }}>
              {sess.agenda_items.map(item => <AgendaItem key={item.number} item={item} session={sess.session} />)}
            </div>
          </div>
        ))}

        {data.ocr_todo?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionTitle>OCR Queue ({data.ocr_todo.length})</SectionTitle>
            <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 6, padding: 12 }}>
              {data.ocr_todo.map((t, i) => (
                <div key={i} style={{ padding: "6px 0", borderBottom: i < data.ocr_todo.length - 1 ? `1px solid ${C.border}` : "none", fontSize: 12, color: C.navy }}>
                  <span style={{ ...mono, color: C.amber, marginRight: 8 }}>pp.{t.pages.start}-{t.pages.end}</span>
                  {t.content}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.source_documents?.length > 0 && (
          <details style={{ marginBottom: 24 }}>
            <summary style={{ fontSize: 12, color: C.slate, cursor: "pointer", ...mono }}>Source Documents ({data.source_documents.length})</summary>
            <div style={{ marginTop: 8, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 6, padding: 12 }}>
              {data.source_documents.map((d, i) => (
                <div key={i} style={{ padding: "4px 0", fontSize: 11, color: C.navy, ...mono }}>
                  📄 {d.file_name} <span style={{ color: C.slate }}>({d.pages} pp) — {d.role}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div style={{ background: C.navy, padding: "11px 28px", color: C.goldLight, fontSize: 12, ...mono, letterSpacing: "0.08em" }}>
      COLORADO STC · BOARD MEETINGS
    </div>
  );
}

function MeetingsIndex() {
  const meetings = [...registry.meetings].sort((a, b) => b.date.localeCompare(a.date));
  const upcoming = meetings.filter(m => m.status === "upcoming");
  const past = meetings.filter(m => m.status !== "upcoming");
  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <TopBar />
      <div style={{ background: C.navy, padding: "28px 28px 24px", borderBottom: `4px solid ${C.gold}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ color: C.goldLight, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", ...mono, marginBottom: 6 }}>
            Colorado FSA · State Technical Committee
          </div>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: 0, ...serif }}>Board Meetings</h1>
        </div>
      </div>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>
        {upcoming.length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <SectionTitle>Upcoming</SectionTitle>
            {upcoming.map(m => <MeetingCard key={m.date} m={m} />)}
          </div>
        )}
        <SectionTitle>Past Meetings</SectionTitle>
        {past.map(m => <MeetingCard key={m.date} m={m} />)}
      </div>
    </div>
  );
}

function MeetingCard({ m }) {
  return (
    <Link to={`/board-meetings/${m.date}`} style={{ textDecoration: "none", display: "block", marginBottom: 12 }}>
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderLeft: `5px solid ${m.status === "upcoming" ? C.gold : C.slate}`, borderRadius: 6, padding: "14px 18px", transition: "box-shadow 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,0,0,0.08)"}
        onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
          <div>
            <h3 style={{ margin: 0, color: C.navy, fontSize: 15, fontWeight: 700, ...serif }}>{m.title}</h3>
            <div style={{ marginTop: 4, fontSize: 12, color: C.slate }}>{fmtDate(m.date)} · {m.location}</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {m.hasAppeals && <Badge bg="#F3E8FF" c="#5B21B6">⚖ {m.appealsRef?.length || ""} appeals</Badge>}
            {m.actionCount > 0 && <Badge bg={C.greenBg} c={C.green}>{m.actionCount} actions</Badge>}
            {m.indexFile ? <Badge bg={C.greenBg} c={C.green}>✓ PARSED</Badge> : <Badge bg={C.amberBg} c={C.amber}>NOT PARSED</Badge>}
          </div>
        </div>
        {m.note && <div style={{ marginTop: 8, fontSize: 11.5, color: C.slate, lineHeight: 1.5 }}>{m.note}</div>}
      </div>
    </Link>
  );
}

function NotFound({ date }) {
  return (
    <div style={{ padding: 40, ...serif, color: C.navy, background: C.cream, minHeight: "100vh" }}>
      No meeting found for {date}. <Link to="/board-meetings" style={{ color: C.blue }}>← Back</Link>
    </div>
  );
}

export default function BoardMeetings() {
  const { date } = useParams();
  return date ? <MeetingDetail date={date} /> : <MeetingsIndex />;
}
