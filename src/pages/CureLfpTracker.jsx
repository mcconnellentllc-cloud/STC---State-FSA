import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import tracker from '../data/cure_lfp_tracker.json';

const C = {
  navy: '#0B1F3A', navyMid: '#122C52',
  gold: '#C8952A', goldLight: '#F5C842',
  cream: '#F7F4EE',
  slate: '#64748B', slateLight: '#94A3B8', border: '#D1D5DB',
  green: '#15803D', greenBg: '#DCFCE7',
  red: '#B91C1C', redBg: '#FEE2E2',
  orange: '#C2410C', orangeBg: '#FFEDD5',
  amber: '#D97706', amberBg: '#FEF3C7',
  blue: '#1A4A8A', blueBg: '#DBEAFE',
};
const mono = { fontFamily: "'IBM Plex Mono', 'Courier New', monospace" };
const serif = { fontFamily: "Georgia, 'Times New Roman', serif" };

const SEV = {
  blocker: { bg: C.redBg, c: C.red, label: 'BLOCKER' },
  warning: { bg: C.orangeBg, c: C.orange, label: 'WARNING' },
  info: { bg: C.blueBg, c: C.blue, label: 'INFO' },
};

function Badge({ bg, c, children, style = {} }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', background: bg, color: c, ...mono, ...style }}>
      {children}
    </span>
  );
}

function Section({ title, count, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 11, color: C.slate, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', ...mono, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${C.border}` }}>
        {title} {count !== undefined && <span style={{ color: C.gold }}>({count})</span>}
      </div>
      {children}
    </div>
  );
}

function ApplicationCard({ app, expanded, onToggle }) {
  const statusColor = app.status.startsWith('ACTIVE') ? C.amber : C.slate;
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderLeft: `4px solid ${statusColor}`, borderRadius: 6, marginBottom: 10 }}>
      <div onClick={onToggle} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ background: C.navy, color: C.goldLight, borderRadius: 4, padding: '3px 10px', fontSize: 11, fontWeight: 700, ...mono, minWidth: 90, textAlign: 'center' }}>{app.id}</span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, ...serif }}>{app.producer} — {app.crop_year}</div>
          <div style={{ fontSize: 11, color: C.slate, marginTop: 2 }}>{app.status}</div>
        </div>
        {app.packet_page_range && <Badge bg="#F3F4F6" c={C.slate}>pp. {app.packet_page_range}</Badge>}
        <span style={{ color: C.slate, fontSize: 12, ...mono }}>{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div style={{ background: '#F8FAFC', padding: '14px 18px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12, fontSize: 12 }}>
            <div><strong style={{ color: C.slate, ...mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Signed</strong><br /><span style={mono}>{app.signed_date}</span></div>
            <div><strong style={{ color: C.slate, ...mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>FSA received</strong><br /><span style={mono}>{app.received_by_fsa}</span></div>
          </div>

          {app.sto_recommended_adjustments && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: C.slate, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, ...mono }}>STO Recommended Adjustments</div>
              {typeof app.sto_recommended_adjustments === 'string' ? (
                <div style={{ fontSize: 12.5, color: C.navy, lineHeight: 1.6, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 4, padding: '8px 12px' }}>{app.sto_recommended_adjustments}</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {Object.entries(app.sto_recommended_adjustments).map(([k, v]) => (
                    <div key={k} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 4, padding: '8px 12px' }}>
                      <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, ...mono, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{k.replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: 12.5, color: C.navy, lineHeight: 1.6 }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, marginBottom: 10 }}>
            {app.missing_documentation?.length > 0 && (
              <div style={{ background: C.redBg, border: `1px solid ${C.red}`, borderLeft: `3px solid ${C.red}`, borderRadius: 4, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, color: C.red, fontWeight: 700, ...mono, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Missing Documentation ({app.missing_documentation.length})</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11.5, color: C.navy, lineHeight: 1.6 }}>
                  {app.missing_documentation.map((m, i) => <li key={i} style={{ marginBottom: 3 }}>{m}</li>)}
                </ul>
              </div>
            )}
            {app.legal_issues?.length > 0 && (
              <div style={{ background: C.amberBg, border: `1px solid ${C.amber}`, borderLeft: `3px solid ${C.amber}`, borderRadius: 4, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, color: C.amber, fontWeight: 700, ...mono, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Legal Issues ({app.legal_issues.length})</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11.5, color: C.navy, lineHeight: 1.6 }}>
                  {app.legal_issues.map((m, i) => <li key={i} style={{ marginBottom: 3 }}>{m}</li>)}
                </ul>
              </div>
            )}
          </div>

          {app.safe_middle_posture && (
            <div style={{ background: C.greenBg, border: `1px solid ${C.green}`, borderLeft: `3px solid ${C.green}`, borderRadius: 4, padding: '10px 14px' }}>
              <div style={{ fontSize: 10, color: C.green, fontWeight: 700, ...mono, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Safe Middle Posture</div>
              <div style={{ fontSize: 12.5, color: C.navy, lineHeight: 1.6 }}>{app.safe_middle_posture}</div>
            </div>
          )}

          {(app.nad_risk_if_denied || app.nad_risk_if_approved) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, marginTop: 10 }}>
              {app.nad_risk_if_denied && <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 4, padding: '8px 12px', fontSize: 12 }}><strong style={{ ...mono, fontSize: 10, color: C.slate, textTransform: 'uppercase', letterSpacing: '0.06em' }}>NAD risk if DENIED</strong><br /><span style={{ color: C.navy }}>{app.nad_risk_if_denied}</span></div>}
              {app.nad_risk_if_approved && <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 4, padding: '8px 12px', fontSize: 12 }}><strong style={{ ...mono, fontSize: 10, color: C.slate, textTransform: 'uppercase', letterSpacing: '0.06em' }}>NAD risk if APPROVED</strong><br /><span style={{ color: C.navy }}>{app.nad_risk_if_approved}</span></div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CureLfpTracker() {
  const [expandedApp, setExpandedApp] = useState(null);
  const [expandedIssue, setExpandedIssue] = useState(null);
  const t = tracker;

  return (
    <div style={{ background: C.cream, minHeight: '100vh' }}>
      <div style={{ background: C.navy, padding: '11px 28px', color: C.goldLight, fontSize: 12, ...mono, letterSpacing: '0.08em' }}>
        COLORADO STC · CURE LFP SERIES TRACKER
      </div>
      <div style={{ background: C.navyMid, padding: '28px 28px 24px', borderBottom: `4px solid ${C.gold}` }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <Link to="/appeals" style={{ color: C.goldLight, fontSize: 12, textDecoration: 'none', ...mono }}>← Appeals</Link>
          <div style={{ color: C.goldLight, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', ...mono, marginTop: 12, marginBottom: 6 }}>
            Case Tracker · Kit Carson County · 1-LFP Par. 4A
          </div>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: '0 0 10px', ...serif }}>Cure LFP Series — Missing Docs & Issues</h1>
          <div style={{ color: C.slateLight, fontSize: 12, ...mono }}>Last updated: {t.last_updated} · {t.applications.length} applications · Parent appeal: <Link to="/appeals" style={{ color: C.goldLight }}>{t.parent_appeal_ref}</Link></div>
        </div>
      </div>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.gold}`, borderRadius: 6, padding: '14px 18px', marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: C.slate, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', ...mono, marginBottom: 6 }}>Case Summary</div>
          <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.7 }}>{t.case_summary}</div>
        </div>

        <Section title="Key Participants">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
            {Object.entries(t.lead_counsel).map(([role, name]) => (
              <div key={role} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 4, padding: '8px 12px' }}>
                <div style={{ fontSize: 10, color: C.slate, fontWeight: 700, ...mono, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{role.replace(/_/g, ' ')}</div>
                <div style={{ fontSize: 13, color: C.navy, marginTop: 2 }}>{name}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Key Dates">
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 4, padding: '10px 14px' }}>
            {Object.entries(t.key_dates).map(([k, v]) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 10, padding: '4px 0', fontSize: 12 }}>
                <span style={{ color: C.slate, ...mono, fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.06em' }}>{k.replace(/_/g, ' ')}</span>
                <span style={{ color: C.navy }}>{v}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Applications (click to expand)" count={t.applications.length}>
          {t.applications.map(app => (
            <ApplicationCard key={app.id} app={app} expanded={expandedApp === app.id} onToggle={() => setExpandedApp(expandedApp === app.id ? null : app.id)} />
          ))}
        </Section>

        <Section title="Cross-Cutting Issues (click to expand)" count={t.cross_cutting_issues.length}>
          {t.cross_cutting_issues.map(iss => {
            const sev = SEV[iss.severity] || SEV.info;
            const open = expandedIssue === iss.id;
            return (
              <div key={iss.id} style={{ background: '#fff', border: `1px solid ${sev.c}`, borderLeft: `4px solid ${sev.c}`, borderRadius: 6, marginBottom: 10 }}>
                <div onClick={() => setExpandedIssue(open ? null : iss.id)} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Badge bg={sev.bg} c={sev.c}>{sev.label}</Badge>
                  <div style={{ flex: 1, minWidth: 200, fontSize: 13.5, fontWeight: 700, color: C.navy, ...serif }}>{iss.topic}</div>
                  {iss.status && <Badge bg="#F3F4F6" c={C.slate}>{iss.status}</Badge>}
                  <span style={{ color: C.slate, fontSize: 12, ...mono }}>{open ? '▲' : '▼'}</span>
                </div>
                {open && (
                  <div style={{ background: '#F8FAFC', padding: '12px 18px', borderTop: `1px solid ${C.border}`, fontSize: 12.5, color: C.navy, lineHeight: 1.7 }}>
                    <p style={{ marginTop: 0 }}>{iss.detail}</p>
                    {iss.exception_f1740 && <p><strong>F1740 exception:</strong> {iss.exception_f1740}</p>}
                    {iss.exception_f7488_2020 && <p><strong>F7488 (2020) exception:</strong> {iss.exception_f7488_2020}</p>}
                    {iss.defensible_late_file_reasons && (
                      <div><strong>Defensible late-file reasons:</strong>
                        <ul>{iss.defensible_late_file_reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
                      </div>
                    )}
                    {iss.acceptable_evidence_byrd_could_produce && (
                      <div><strong>Acceptable evidence Byrd could produce:</strong>
                        <ul>{iss.acceptable_evidence_byrd_could_produce.map((r, i) => <li key={i}>{r}</li>)}</ul>
                      </div>
                    )}
                    {iss.stc_minute_language_recommended && <p><strong>Suggested STC minute language:</strong> <em>{iss.stc_minute_language_recommended}</em></p>}
                    {iss.action_needed && <p style={{ background: C.blueBg, border: `1px solid ${C.blue}`, borderRadius: 4, padding: '8px 12px', margin: '8px 0 0' }}><strong style={{ color: C.blue }}>Action needed:</strong> {iss.action_needed}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </Section>

        <Section title="Outstanding Items Before STC Vote" count={t.outstanding_items_before_vote.length}>
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 4, padding: '14px 18px' }}>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: C.navy, lineHeight: 1.8 }}>
              {t.outstanding_items_before_vote.map((item, i) => <li key={i} style={{ marginBottom: 4 }}>{item}</li>)}
            </ul>
          </div>
        </Section>

        <Section title="Documents Referenced">
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 4, padding: '12px 16px', fontSize: 12, color: C.navy, lineHeight: 1.8 }}>
            {t.documents_referenced.map((doc, i) => <div key={i} style={{ padding: '3px 0' }}>📄 {doc}</div>)}
          </div>
        </Section>
      </div>
    </div>
  );
}
