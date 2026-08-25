import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import registry from "../data/meetings_registry.json";
import july23 from "../data/meeting_2026-07-23_index.json";
import aug27 from "../data/meeting_2026-08-27_index.json";

const MEETING_DATA = { "2026-07-23": july23, "2026-08-27": aug27 };
const STORAGE_KEY = "fsa_board_actions_v1";

const C = {
  navy: "#0B1F3A", navyMid: "#122C52",
  blue: "#1A4A8A",
  gold: "#C8952A", goldLight: "#F5C842",
  cream: "#F7F4EE",
  slate: "#64748B", slateLight: "#94A3B8", border: "#D1D5DB",
  green: "#15803D", greenBg: "#DCFCE7",
  red: "#B91C1C", redBg: "#FEE2E2",
  amber: "#D97706", amberBg: "#FEF3C7",
  purple: "#6D28D9", purpleBg: "#EDE9FE",
};
const mono = { fontFamily: "'IBM Plex Mono', 'Courier New', monospace" };
const serif = { fontFamily: "Georgia, 'Times New Roman', serif" };

const OUTCOMES = [
  { key: "PENDING",         label: "Pending",         bg: "#F3F4F6",  c: C.slate  },
  { key: "APPROVED",        label: "Approved",        bg: C.greenBg,  c: C.green  },
  { key: "APPROVED_MODIFIED", label: "Approved (modified)", bg: C.greenBg, c: C.green },
  { key: "DENIED",          label: "Denied",          bg: C.redBg,    c: C.red    },
  { key: "TABLED",          label: "Tabled",          bg: C.purpleBg, c: C.purple },
  { key: "WITHDRAWN",       label: "Withdrawn",       bg: "#F3F4F6",  c: C.slate  },
];

function fmtDate(iso) {
  if (!iso) return "TBD";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function loadOutcomes() {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (_) {}
  return {};
}
function saveOutcomes(map) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); } catch (_) {}
}

function collectActions() {
  const out = [];
  registry.meetings.forEach(meta => {
    const data = MEETING_DATA[meta.date];
    if (!data) {
      if (meta.hasAppeals && meta.appealsRef) {
        meta.appealsRef.forEach(id => out.push({
          key: `${meta.date}::appeal::${id}`,
          date: meta.date,
          meetingTitle: meta.title,
          session: "Executive",
          num: "—",
          title: `Appeal: ${id}`,
          presenter: "",
          program: "Appeal",
          isAppeal: true,
          appealId: id,
        }));
      }
      return;
    }
    data.meeting.sessions.forEach(sess => {
      sess.agenda_items.forEach(item => {
        const t = String(item.action_type || "").toLowerCase();
        if (!t.includes("action")) return;
        if (String(item.title).toLowerCase().startsWith("call to order")) return;
        if (String(item.title).toLowerCase().startsWith("adjourn")) return;
        out.push({
          key: `${meta.date}::${sess.session}::${item.number}`,
          date: meta.date,
          meetingTitle: meta.title,
          session: sess.session,
          num: item.number,
          title: item.title,
          presenter: item.presenter || "",
          program: item.program || "",
          keyFacts: item.key_facts,
          flags: item.flags,
        });
      });
    });
  });
  return out;
}

function Badge({ bg, c, children }) {
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", background: bg, color: c, ...mono }}>{children}</span>;
}

export default function BoardActions() {
  const actions = useMemo(() => collectActions(), []);
  const [outcomes, setOutcomes] = useState(() => loadOutcomes());
  const [filter, setFilter] = useState("all");
  const [meetingFilter, setMeetingFilter] = useState("all");

  useEffect(() => { saveOutcomes(outcomes); }, [outcomes]);

  const setOutcome = (key, val) => setOutcomes(prev => ({ ...prev, [key]: { ...(prev[key] || {}), outcome: val, updatedAt: new Date().toISOString() } }));
  const setNote = (key, val) => setOutcomes(prev => ({ ...prev, [key]: { ...(prev[key] || {}), note: val } }));

  const filtered = actions.filter(a => {
    const o = outcomes[a.key]?.outcome || "PENDING";
    if (filter !== "all" && o !== filter) return false;
    if (meetingFilter !== "all" && a.date !== meetingFilter) return false;
    return true;
  });

  const stats = actions.reduce((acc, a) => {
    const o = outcomes[a.key]?.outcome || "PENDING";
    acc[o] = (acc[o] || 0) + 1;
    return acc;
  }, {});
  const meetings = [...new Set(actions.map(a => a.date))].sort((a, b) => b.localeCompare(a));

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <div style={{ background: C.navy, padding: "11px 28px", color: C.goldLight, fontSize: 12, ...mono, letterSpacing: "0.08em" }}>
        COLORADO STC · BOARD ACTIONS LOG
      </div>
      <div style={{ background: C.navy, padding: "28px 28px 24px", borderBottom: `4px solid ${C.gold}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ color: C.goldLight, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", ...mono, marginBottom: 6 }}>Colorado FSA · State Technical Committee</div>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 14px", ...serif }}>Board Actions</h1>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <span style={{ color: "#fff", fontSize: 20, fontWeight: 800, ...mono }}>{actions.length}<span style={{ fontSize: 11, color: C.slateLight, marginLeft: 5 }}>total</span></span>
            {OUTCOMES.map(o => stats[o.key] > 0 && (
              <span key={o.key} style={{ color: o.c === C.slate ? "#fff" : "#fff", fontSize: 20, fontWeight: 800, ...mono }}>
                {stats[o.key] || 0}<span style={{ fontSize: 11, color: C.slateLight, marginLeft: 5 }}>{o.label.toLowerCase()}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 20px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 10, color: C.slate, ...mono, marginBottom: 3, textTransform: "uppercase" }}>Meeting</label>
            <select value={meetingFilter} onChange={e => setMeetingFilter(e.target.value)} style={{ padding: "6px 10px", border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 12, ...mono, color: C.navy }}>
              <option value="all">All meetings</option>
              {meetings.map(d => <option key={d} value={d}>{fmtDate(d)}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, color: C.slate, ...mono, marginBottom: 3, textTransform: "uppercase" }}>Outcome</label>
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: "6px 10px", border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 12, ...mono, color: C.navy }}>
              <option value="all">All outcomes</option>
              {OUTCOMES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: C.slate, ...serif, fontSize: 15 }}>No actions match the current filter.</div>}

        {filtered.map(a => {
          const rec = outcomes[a.key] || {};
          const outcome = rec.outcome || "PENDING";
          const outCfg = OUTCOMES.find(o => o.key === outcome) || OUTCOMES[0];
          return (
            <div key={a.key} style={{ background: "#fff", border: `1px solid ${C.border}`, borderLeft: `4px solid ${outCfg.c}`, borderRadius: 6, padding: "12px 16px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <Link to={`/board-meetings/${a.date}`} style={{ fontSize: 11, color: C.blue, textDecoration: "none", ...mono }}>{fmtDate(a.date)}</Link>
                    <span style={{ fontSize: 10, color: C.slate, ...mono }}>·</span>
                    <span style={{ fontSize: 11, color: C.slate, ...mono }}>{a.session} #{a.num}</span>
                    {a.program && <Badge bg="#DBEAFE" c="#1E40AF">{a.program}</Badge>}
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: C.navy, ...serif, lineHeight: 1.4, marginBottom: 4 }}>{a.title}</div>
                  {a.presenter && <div style={{ fontSize: 11, color: C.slate }}>🎙 {a.presenter}</div>}
                  {a.isAppeal && <div style={{ marginTop: 4 }}><Link to="/appeals" style={{ fontSize: 11, color: C.purple, ...mono }}>→ View appeal detail</Link></div>}
                  {a.flags?.length > 0 && a.flags.map((f, i) => <div key={i} style={{ fontSize: 10.5, color: C.amber, marginTop: 3, ...mono }}>⚠ {typeof f === "string" ? f : f.summary}</div>)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, minWidth: 180 }}>
                  <select value={outcome} onChange={e => setOutcome(a.key, e.target.value)}
                    style={{ padding: "5px 8px", border: `1px solid ${outCfg.c}`, borderRadius: 4, fontSize: 11, ...mono, color: outCfg.c, fontWeight: 700, background: outCfg.bg }}>
                    {OUTCOMES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                  </select>
                  {rec.updatedAt && <span style={{ fontSize: 9, color: C.slate, ...mono }}>updated {new Date(rec.updatedAt).toLocaleDateString()}</span>}
                </div>
              </div>
              <textarea value={rec.note || ""} onChange={e => setNote(a.key, e.target.value)} placeholder="Notes / motion / vote count..." style={{ width: "100%", marginTop: 8, minHeight: 42, padding: 8, fontSize: 12, ...serif, color: C.navy, lineHeight: 1.6, border: `1px solid ${C.border}`, borderRadius: 4, background: "#F8FAFC", resize: "vertical", boxSizing: "border-box" }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
