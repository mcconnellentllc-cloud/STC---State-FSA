import React, { useState, useEffect } from 'react';

/* ══════════════════════════════════════════════════════════════════
   ROBERTS RULES OF ORDER — Quick Reference
   Motions, hierarchy, debate rules, and voting thresholds
   ══════════════════════════════════════════════════════════════════ */

const PRIVILEGED = [
  { rank: 1, name: 'Fix Time to Adjourn', tag: 'HIGHEST', tagType: 'high' },
  { rank: 2, name: 'Adjourn', tag: 'Not debatable', tagType: 'note' },
  { rank: 3, name: 'Recess', tag: 'Amendable as to time', tagType: 'low' },
  { rank: 4, name: 'Question of Privilege', tag: 'Chair rules', tagType: 'note' },
  { rank: 5, name: 'Call for Orders of the Day', tag: 'No vote needed', tagType: 'low' },
];

const SUBSIDIARY = [
  { rank: 1, name: 'Lay on the Table', tag: 'HIGHEST', tagType: 'high' },
  { rank: 2, name: 'Previous Question', tag: '\u2154 vote required', tagType: 'note' },
  { rank: 3, name: 'Limit or Extend Debate', tag: '\u2154 vote required', tagType: 'note' },
  { rank: 4, name: 'Postpone to a Certain Time', tag: 'Debatable', tagType: 'low' },
  { rank: 5, name: 'Refer to Committee', tag: 'Debatable + amendable', tagType: 'low' },
  { rank: 6, name: 'Amend', tag: 'Debatable + amendable', tagType: 'low' },
  { rank: 7, name: 'Postpone Indefinitely', tag: 'LOWEST \u2014 kills motion', tagType: 'note' },
];

const VOTE_THRESHOLDS = [
  { motion: 'Most main motions', vote: 'Majority', type: 'majority' },
  { motion: 'Previous question', vote: 'Two-Thirds', type: 'twothirds' },
  { motion: 'Suspend the rules', vote: 'Two-Thirds', type: 'twothirds' },
  { motion: 'Limit or extend debate', vote: 'Two-Thirds', type: 'twothirds' },
  { motion: 'Objection to consideration', vote: 'Two-Thirds', type: 'twothirds' },
  { motion: 'Appeal decision of chair', vote: 'Majority', type: 'majority' },
  { motion: 'Reconsider', vote: 'Majority', type: 'majority' },
  { motion: 'Rescind', vote: 'Two-Thirds', type: 'twothirds' },
  { motion: 'Take from table', vote: 'Majority', type: 'majority' },
  { motion: 'Call for orders of the day', vote: 'No Vote', type: 'none' },
  { motion: 'Division of assembly', vote: 'No Vote', type: 'none' },
  { motion: 'Routine business', vote: 'Unanimous Consent', type: 'unanimous' },
];

const KEY_RULES = [
  { title: 'Tie Vote', desc: 'Motion FAILS. Chair may break tie only if they haven\'t yet voted.' },
  { title: 'Reconsider', desc: 'Only a member who voted on the WINNING side can make this motion.' },
  { title: 'Withdraw a Motion', desc: 'Before chair states it \u2014 no permission needed. After \u2014 unanimous consent required.' },
  { title: 'Speaking Limit', desc: 'Each member may speak TWICE per motion. 10 minutes per speech (standard).' },
  { title: 'Amendment Levels', desc: 'Maximum TWO levels only. Cannot amend an amendment to an amendment.' },
  { title: 'Tabled Motion Dies', desc: 'If not taken from table by end of NEXT meeting it dies permanently.' },
  { title: 'Point of Order Timing', desc: 'Must be raised IMMEDIATELY when violation occurs or it may be ruled untimely.' },
  { title: 'Division', desc: 'One word. No second. No vote. Must call BEFORE chair announces result.' },
];

const INCIDENTAL_MOTIONS = [
  {
    name: 'Point of Order',
    props: [{ label: 'No Second', type: 'no' }, { label: 'Not Debatable', type: 'no' }, { label: 'No Vote', type: 'no' }],
    desc: 'Raised when a rule is being violated. Chair rules immediately. Must be raised at the moment of violation.',
    example: '"Point of order Mr. Chairman \u2014 the member has exceeded their speaking time."',
  },
  {
    name: 'Appeal Decision of Chair',
    props: [{ label: 'Second Required', type: 'yes' }, { label: 'Debatable', type: 'yes' }, { label: 'Majority Vote', type: 'vote' }],
    desc: 'Challenges a ruling by the chair. Tie vote SUSTAINS the chair. Use sparingly \u2014 political consequences.',
    example: '"Mr. Chairman I appeal the decision of the chair."',
  },
  {
    name: 'Suspend the Rules',
    props: [{ label: 'Second Required', type: 'yes' }, { label: 'Not Debatable', type: 'no' }, { label: 'Two-Thirds Vote', type: 'vote' }],
    desc: 'Temporarily sets aside a procedural rule. Cannot suspend fundamental principles or bylaws.',
    example: '"I move to suspend the rules to allow a third speech on this motion."',
  },
  {
    name: 'Objection to Consideration',
    props: [{ label: 'No Second', type: 'no' }, { label: 'Not Debatable', type: 'no' }, { label: 'Two-Thirds Sustains', type: 'vote' }],
    desc: 'Stops a motion before debate begins. Must be raised immediately before any debate. Two-thirds vote kills it.',
    example: '"Mr. Chairman I object to consideration of this motion."',
  },
  {
    name: 'Division of the Assembly',
    props: [{ label: 'No Second', type: 'no' }, { label: 'Not Debatable', type: 'no' }, { label: 'No Vote', type: 'no' }],
    desc: 'Demands a rising or counted vote when voice vote is unclear. One word. Unilateral. Must call BEFORE result announced.',
    example: '"Division." \u2014 one word is sufficient.',
  },
  {
    name: 'Parliamentary Inquiry',
    props: [{ label: 'No Second', type: 'no' }, { label: 'Not Debatable', type: 'no' }, { label: 'No Vote', type: 'no' }],
    desc: 'Question to the chair asking for procedural guidance. Chair\'s answer is advisory. Use freely \u2014 costs nothing.',
    example: '"Mr. Chairman I rise to a parliamentary inquiry \u2014 is it in order to move to refer at this time?"',
  },
  {
    name: 'Request for Information',
    props: [{ label: 'No Second', type: 'no' }, { label: 'Not Debatable', type: 'no' }, { label: 'No Vote', type: 'no' }],
    desc: 'Factual question directed to chair or member. Not procedural \u2014 factual clarification only.',
    example: '"Mr. Chairman I rise to a request for information \u2014 what is the national comment window deadline?"',
  },
  {
    name: 'Question of Personal Privilege',
    props: [{ label: 'No Second', type: 'no' }, { label: 'Not Debatable', type: 'no' }, { label: 'Chair Rules', type: 'no' }],
    desc: 'Raises urgent matter affecting a member\'s rights. Use when your position is misrepresented in the record \u2014 especially in FACA meetings.',
    example: '"Mr. Chairman I rise to a question of personal privilege. My position has been mischaracterized. For the record my position is..."',
  },
];

const MOTION_STEPS = [
  { title: 'Obtain the Floor', desc: 'Rise and address the chair. Wait for recognition. You do not have the floor until the chair recognizes you.', tip: 'Say: "Mr. Chairman." \u2014 then wait.' },
  { title: 'Make the Motion', desc: 'State it clearly and specifically. Always begin with "I move to..." or "I move that..." \u2014 never vague suggestions.', tip: 'Get the wording right BEFORE the chair repeats it \u2014 after that you need permission to change it.' },
  { title: 'Second', desc: 'Another member says "Second." Means only that the matter is worth discussing \u2014 not agreement. No second = motion dies.', tip: 'Any number of members can second. Multiple seconds signal strong support before debate opens.' },
  { title: 'Chair States the Motion', desc: 'The chair repeats the motion for the record. This is the moment it transfers from the maker to the assembly. The assembly now owns it.', tip: 'After this point you cannot withdraw without unanimous consent.' },
  { title: 'Debate and Vote', desc: 'Floor opens for discussion. Maker speaks first. Chair calls vote when debate is exhausted. Chair announces result.', tip: 'Call Division BEFORE the chair announces the result if you need a recount.' },
];

const AMENDMENT_TYPES = [
  { name: 'Insert or Add Words', desc: 'Adds language to the motion that isn\'t currently there.', example: '"I move to amend by inserting \'pending Colorado-specific data\' after \'30% threshold\'."' },
  { name: 'Strike Out Words', desc: 'Removes language from the motion with nothing replacing it.', example: '"I move to amend by striking the word \'permanently\' from the motion."' },
  { name: 'Strike Out and Insert', desc: 'Replaces specific language with different language. Most precise tool for fixing problematic wording.', example: '"I move to amend by striking \'30 days\' and inserting \'45 days\'."' },
  { name: 'Substitute', desc: 'Replaces the entire text of the motion. Must still relate to the same subject matter.', example: '"I move to amend by substituting the following text in its entirety..."' },
];

const DEBATE_RULES = [
  'Must be recognized by chair before speaking',
  'All debate must be germane to the motion',
  'Address the chair \u2014 never another member directly',
  'Maximum two speeches per member per motion',
  'Maximum 10 minutes per speech (standard rules)',
  'Maker of motion has right of first recognition',
  'Chair does not debate \u2014 must vacate chair first',
  'No personal attacks \u2014 address the argument not the person',
];

const DEBATE_STRATEGY = [
  { text: 'Speech 1:', detail: 'Frame your argument before anyone else shapes it' },
  { text: 'Speech 2:', detail: 'Wait for opposition\'s strongest argument \u2014 then rebut it' },
  { text: '', detail: 'Members who haven\'t spoken get priority recognition' },
  { text: '', detail: 'Chair should alternate pro and con speakers' },
  { text: '', detail: 'Use parliamentary inquiry to buy thinking time' },
  { text: '', detail: 'If not germane \u2014 point of order immediately' },
  { text: '', detail: 'Speaking time exceeded \u2014 point of order immediately' },
  { text: '', detail: 'Never burn both speeches arguing the same point twice' },
];

const tagColors = {
  high: { bg: '#fff3cd', color: '#856404' },
  low: { bg: '#d1ecf1', color: '#0c5460' },
  note: { bg: '#f8d7da', color: '#721c24' },
};

const voteColors = {
  majority: { bg: '#d4edda', color: '#155724' },
  twothirds: { bg: '#fff3cd', color: '#856404' },
  unanimous: { bg: '#d1ecf1', color: '#0c5460' },
  none: { bg: '#f8d7da', color: '#721c24' },
};

const propColors = {
  yes: { bg: '#d4edda', color: '#155724' },
  no: { bg: '#f8d7da', color: '#721c24' },
  vote: { bg: '#fff3cd', color: '#856404' },
};

function Tag({ children, colors }) {
  return (
    <span style={{
      fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20, fontWeight: 700,
      letterSpacing: '0.3px', background: colors.bg, color: colors.color,
    }}>{children}</span>
  );
}

function CollapsibleSection({ title, icon, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: '12px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg)', borderBottom: open ? '1px solid var(--border)' : 'none',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: '0.95rem' }}>{icon}</span>
        <span style={{ flex: 1, fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)' }}>{title}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>{'\u25BC'}</span>
      </div>
      {open && <div style={{ padding: 18 }}>{children}</div>}
    </div>
  );
}

export default function RobertsRules() {
  return (
    <div>
      <div className="page-header">
        <h2>Roberts Rules of Order</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
          Quick reference \u2014 motions, hierarchy, debate rules, and voting thresholds
        </p>
      </div>

      {/* ── CHEAT SHEET GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Privileged Motions */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '1.2px', textTransform: 'uppercase', color: '#fff', background: '#1a2340' }}>
            Privileged Motions \u2014 Highest Rank
          </div>
          {PRIVILEGED.map(m => (
            <div key={m.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: '1px solid var(--border)' }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color: '#fff', background: '#1a2340', flexShrink: 0,
              }}>{m.rank}</span>
              <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600 }}>{m.name}</span>
              <Tag colors={tagColors[m.tagType]}>{m.tag}</Tag>
            </div>
          ))}
        </div>

        {/* Subsidiary Motions */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '1.2px', textTransform: 'uppercase', color: '#fff', background: '#1a6b3c' }}>
            Subsidiary Motions \u2014 Act on Main Motion
          </div>
          {SUBSIDIARY.map(m => (
            <div key={m.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: '1px solid var(--border)' }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color: '#fff', background: '#1a6b3c', flexShrink: 0,
              }}>{m.rank}</span>
              <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600 }}>{m.name}</span>
              <Tag colors={tagColors[m.tagType]}>{m.tag}</Tag>
            </div>
          ))}
        </div>

        {/* Vote Thresholds */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '1.2px', textTransform: 'uppercase', color: '#fff', background: '#7b3f00' }}>
            Vote Thresholds Quick Reference
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '9px 14px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', textAlign: 'left', borderBottom: '2px solid var(--border)', background: 'var(--bg)' }}>Motion</th>
                <th style={{ padding: '9px 14px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', textAlign: 'left', borderBottom: '2px solid var(--border)', background: 'var(--bg)' }}>Vote Required</th>
              </tr>
            </thead>
            <tbody>
              {VOTE_THRESHOLDS.map((v, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 14px', fontSize: '0.84rem', borderBottom: '1px solid var(--border)' }}>{v.motion}</td>
                  <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
                    <Tag colors={voteColors[v.type]}>{v.vote}</Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Critical Rules */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '1.2px', textTransform: 'uppercase', color: '#fff', background: '#4a0080' }}>
            Critical Rules to Know Cold
          </div>
          {KEY_RULES.map((r, i) => (
            <div key={i} style={{
              padding: '10px 16px', borderBottom: i < KEY_RULES.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{r.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── INCIDENTAL MOTIONS ── */}
      <CollapsibleSection title="Incidental Motions \u2014 Procedural Tools" icon="\u26A1" defaultOpen>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {INCIDENTAL_MOTIONS.map((m, i) => (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, background: 'var(--bg)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{m.name}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                {m.props.map((p, j) => (
                  <Tag key={j} colors={propColors[p.type]}>{p.label}</Tag>
                ))}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>{m.desc}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', borderLeft: '3px solid var(--border)', paddingLeft: 8 }}>{m.example}</div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* ── DEBATE RULES ── */}
      <CollapsibleSection title="Debate Rules & Strategy" icon="\uD83D\uDCAC">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text)', marginBottom: 10, paddingBottom: 6, borderBottom: '2px solid var(--text)' }}>The Rules</div>
            {DEBATE_RULES.map((r, i) => (
              <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '5px 0', borderBottom: i < DEBATE_RULES.length - 1 ? '1px solid var(--border)' : 'none', lineHeight: 1.4 }}>{r}</div>
            ))}
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text)', marginBottom: 10, paddingBottom: 6, borderBottom: '2px solid var(--text)' }}>Strategic Application</div>
            {DEBATE_STRATEGY.map((s, i) => (
              <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '5px 0', borderBottom: i < DEBATE_STRATEGY.length - 1 ? '1px solid var(--border)' : 'none', lineHeight: 1.4 }}>
                {s.text && <strong>{s.text} </strong>}{s.detail}
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* ── MOTION LIFECYCLE ── */}
      <CollapsibleSection title="The Five Steps of a Main Motion" icon="\uD83D\uDD04">
        {MOTION_STEPS.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < MOTION_STEPS.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'flex-start' }}>
            <span style={{
              width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 800, color: '#fff', background: '#1a2340', flexShrink: 0, marginTop: 1,
            }}>{i + 1}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{step.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.desc}</div>
              <div style={{ marginTop: 6, fontSize: '0.78rem', color: '#1a6b3c', fontWeight: 600, background: 'rgba(26, 107, 60, 0.08)', padding: '4px 10px', borderRadius: 4, display: 'inline-block' }}>{step.tip}</div>
            </div>
          </div>
        ))}
      </CollapsibleSection>

      {/* ── AMENDMENT GUIDE ── */}
      <CollapsibleSection title="Amendment Guide" icon="\u270F\uFE0F">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {AMENDMENT_TYPES.map((a, i) => (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, background: 'var(--bg)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{a.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>{a.desc}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', borderLeft: '3px solid var(--border)', paddingLeft: 8 }}>{a.example}</div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 16, padding: 14, background: 'rgba(26, 107, 60, 0.06)',
          borderRadius: 8, borderLeft: '4px solid #1a6b3c',
        }}>
          <strong style={{ fontSize: '0.85rem', color: '#1a6b3c' }}>Two Level Rule:</strong>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginLeft: 6 }}>
            Primary amendment acts on the main motion. Secondary amendment acts on the primary amendment.
            You cannot amend a secondary amendment. Three levels is never in order.
          </span>
        </div>
      </CollapsibleSection>
    </div>
  );
}
