import React, { useState } from 'react';

const sectionStyle = { cursor: 'pointer', userSelect: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const cardStyle = { marginBottom: 16 };
const bodyStyle = { padding: '16px 0 0 0', lineHeight: 1.8 };
const redCard = { borderLeft: '4px solid #dc3545', padding: '12px 16px', marginBottom: 10, background: 'rgba(220,53,69,0.05)', borderRadius: 8 };
const greenCard = { borderLeft: '4px solid #28a745', padding: '12px 16px', marginBottom: 10, background: 'rgba(40,167,69,0.05)', borderRadius: 8 };
const stepCircle = (num, color) => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: color, color: '#fff', fontWeight: 700, fontSize: '0.85rem', marginRight: 12, flexShrink: 0 });

function Section({ title, tag, tagColor, children, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="card" style={cardStyle}>
      <div style={sectionStyle} onClick={() => setOpen(!open)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          {tag && <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700, background: tagColor || '#e8e4fd', color: tagColor ? '#fff' : '#6c5ce7' }}>{tag}</span>}
        </div>
        <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>{open ? '\u25B2' : '\u25BC'}</span>
      </div>
      {open && <div style={bodyStyle}>{children}</div>}
    </div>
  );
}

function TimelineStep({ num, color, title, detail }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
      <div style={stepCircle(num, color)}>{num}</div>
      <div>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{detail}</div>
      </div>
    </div>
  );
}

export default function AppealsTraining() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Appeals Training</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            7 CFR Part 780 &mdash; FSA Administrative Appeals Procedures
          </p>
        </div>
      </div>

      {/* Banner */}
      <div className="card" style={{ marginBottom: 20, borderLeft: '4px solid #0056b3', padding: '16px 20px', background: 'rgba(0,86,179,0.05)' }}>
        <strong style={{ fontSize: '1.05rem' }}>Appeals are a fundamental right &mdash; proper procedure protects both the participant and the agency.</strong>
        <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Every adverse decision must include written notice of appeal rights. The STC serves as the reviewing authority for county committee decisions. This page provides the procedural framework every STC member must know.
        </div>
      </div>

      {/* ── Section 1: Overview ── */}
      <Section title="Appeal Process Overview" tag="START HERE" tagColor="#0056b3" defaultOpen>
        <p style={{ marginTop: 0 }}>When a participant receives an adverse decision, they have <strong>30 calendar days</strong> to choose one of three informal resolution tracks:</p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
          <div className="card" style={{ flex: 1, minWidth: 200, padding: '16px', borderTop: '4px solid #6c5ce7' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#6c5ce7' }}>Track 1: Reconsideration</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Same decision-maker reviews with additional facts. Quick resolution path. Cannot be used if already reconsidered or mediated.</p>
          </div>
          <div className="card" style={{ flex: 1, minWidth: 200, padding: '16px', borderTop: '4px solid #f0ad4e' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#b8860b' }}>Track 2: Mediation</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Voluntary process to narrow issues and reach mutual agreement. Available as part of informal appeal process.</p>
          </div>
          <div className="card" style={{ flex: 1, minWidth: 200, padding: '16px', borderTop: '4px solid #28a745' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#28a745' }}>Track 3: Appeal</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Formal appeal chain: County Committee &rarr; State Committee (STC) &rarr; NAD &rarr; Federal Court. Waives right to reconsideration.</p>
          </div>
        </div>

        <h4>Full Appeal Chain</h4>
        <TimelineStep num={1} color="#6c5ce7" title="Adverse Decision Issued" detail="Written notice with appeal rights. 30-day clock starts." />
        <TimelineStep num={2} color="#0056b3" title="Informal Review (County Committee)" detail="For decisions by county subordinates. Hearing before the county committee." />
        <TimelineStep num={3} color="#28a745" title="Appeal to State Committee (STC)" detail="STC is reviewing authority for county committee decisions. Informal hearing (in person or phone). Waives county reconsideration." />
        <TimelineStep num={4} color="#f0ad4e" title="National Appeals Division (NAD)" detail="Independent Administrative Judge hearing. Must exhaust FSA informal review first. File within 30 days of STC decision." />
        <TimelineStep num={5} color="#dc3545" title="NAD Director Review" detail="Either party may request within 30 days. Director may affirm, reverse, or remand." />
        <TimelineStep num={6} color="#343a40" title="Judicial Review (Federal Court)" detail="Available after NAD process fully exhausted. Federal district court under Administrative Procedure Act." />
      </Section>

      {/* ── Section 2: Adverse Decisions ── */}
      <Section title="Adverse Decisions &mdash; What Can Be Appealed" tag="7 CFR 780.2">
        <h4 style={{ marginTop: 0 }}>Definition</h4>
        <p>An <strong>adverse decision</strong> is a program decision by an FSA employee, officer, or committee that is adverse to the participant &mdash; including any denial of program participation, benefits, eligibility, or payments where the participant receives less than believed entitled.</p>

        <h4>Who Can Appeal</h4>
        <p>Any <strong>"participant"</strong> &mdash; a person or entity who has applied for, or whose right to participate in or receive a payment or benefit is affected by, an FSA decision. Includes anyone with a direct financial stake.</p>

        <h4>Appealability Review</h4>
        <p>A participant who believes a decision should be appealable may request an <strong>appealability review</strong> from the State Executive Director within 30 calendar days.</p>

        <h4 style={{ color: '#dc3545' }}>NON-APPEALABLE Decisions (7 CFR 780.5)</h4>
        <ul>
          <li><strong>General program provisions</strong> applicable to all similarly situated participants</li>
          <li><strong>Mathematical formulas</strong> established by statute</li>
          <li><strong>Decisions made final</strong> by statute</li>
          <li><strong>Equitable relief decisions</strong> by the SED under Section 1613 of the Farm Security and Rural Investment Act of 2002</li>
        </ul>
      </Section>

      {/* ── Section 3: Timeline ── */}
      <Section title="Timeline Requirements" tag="7 CFR 780.15">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Deadline</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Request reconsideration, mediation, or appeal</td><td style={{ fontWeight: 600 }}>30 calendar days from written notice</td><td>780.15</td></tr>
              <tr><td>Reconsideration decision issued</td><td style={{ fontWeight: 600 }}>Restarts 30-day clock (new decision)</td><td>780.7</td></tr>
              <tr><td>File NAD appeal after final FSA informal decision</td><td style={{ fontWeight: 600 }}>30 calendar days</td><td>Part 11</td></tr>
              <tr><td>NAD hearing officer determination</td><td style={{ fontWeight: 600 }}>30 days after hearing/record close</td><td>11.8</td></tr>
              <tr><td>Request NAD Director review</td><td style={{ fontWeight: 600 }}>30 days from AJ determination</td><td>11.9</td></tr>
              <tr><td>NAD Director completes review (appellant request)</td><td style={{ fontWeight: 600 }}>30 business days</td><td>11.9</td></tr>
              <tr><td>NAD Director completes review (agency head request)</td><td style={{ fontWeight: 600 }}>10 business days</td><td>11.9</td></tr>
            </tbody>
          </table>
        </div>
        <div style={redCard}>
          <strong>CRITICAL:</strong> A reconsideration decision is a <em>new decision</em> that restarts all applicable time limitation periods. This means after reconsideration, participants have a fresh 30-day period to file subsequent appeals.
        </div>
      </Section>

      {/* ── Section 4: STC Role — MOST IMPORTANT ── */}
      <Section title="STC Role in Appeals" tag="CRITICAL" tagColor="#dc3545" defaultOpen>
        <div style={{ background: 'rgba(220,53,69,0.05)', border: '2px solid #dc3545', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <strong style={{ color: '#dc3545', fontSize: '1rem' }}>The State Committee is the reviewing authority for all county committee decisions.</strong>
        </div>

        <h4>STC Authority (7 CFR 780.9 / 780.10)</h4>
        <ul style={{ lineHeight: 2 }}>
          <li>Participant has the right to an <strong>informal hearing</strong> before the STC</li>
          <li>Hearing may be attended <strong>in person or by telephone</strong></li>
          <li><strong>Federal Rules of Evidence DO NOT apply</strong> &mdash; but STC may exclude evidence that is irrelevant, unduly repetitious, or otherwise inappropriate</li>
          <li>Appealing a county committee decision to STC <strong>waives the right to reconsideration</strong> by the county committee</li>
          <li>The <strong>official record</strong> is the decision letter issued following disposition of the appeal</li>
          <li>STC decisions can then be <strong>appealed to NAD</strong></li>
        </ul>

        <h4>STC Hearing Procedure</h4>
        <TimelineStep num={1} color="#0056b3" title="Receive Appeal Request" detail="Verify timely filing (within 30 days). Confirm the decision is appealable. Coordinate with State Executive Director." />
        <TimelineStep num={2} color="#0056b3" title="Schedule Hearing" detail="Notify participant of hearing date, time, and format (in person or telephone). Ensure adequate time for preparation." />
        <TimelineStep num={3} color="#0056b3" title="Review Agency Record" detail="Examine the complete agency record. Identify key facts, regulations, and issues. Note any gaps in documentation." />
        <TimelineStep num={4} color="#0056b3" title="Conduct Hearing" detail="Allow participant to present their case. Ask clarifying questions. Manage scope (exclude irrelevant/repetitious material). Ensure fair process." />
        <TimelineStep num={5} color="#0056b3" title="Deliberate" detail="STC members discuss the case. Apply regulations to the facts. Consider all evidence in the record. Must be based on the record." />
        <TimelineStep num={6} color="#0056b3" title="Issue Decision Letter" detail="Document the decision and reasoning clearly. This becomes the official record. Include notice of further appeal rights (NAD)." />

        <div style={redCard}>
          <strong>REMEMBER:</strong> Your decision must be based on the record. If you consider evidence outside the record, you MUST give the participant an opportunity to respond to that evidence.
        </div>
      </Section>

      {/* ── Section 5: Reconsideration ── */}
      <Section title="Reconsideration" tag="7 CFR 780.7">
        <ul style={{ lineHeight: 2 }}>
          <li>Written request submitted to the <strong>same decision-maker</strong></li>
          <li>Allows consideration of <strong>additional facts</strong> not available at the time of the original decision</li>
          <li>A reconsideration decision is a <strong>new decision</strong> that restarts the 30-day appeal clock</li>
        </ul>

        <h4 style={{ color: '#dc3545' }}>Reconsideration NOT Available When:</h4>
        <ul>
          <li>The decision has <strong>already been reconsidered</strong></li>
          <li>The decision has been <strong>mediated</strong></li>
          <li>The decision was <strong>previously appealed</strong> (choosing appeal waives reconsideration)</li>
          <li>The decision-maker is the <strong>Administrator</strong> or other high-level FSA official</li>
        </ul>
      </Section>

      {/* ── Section 6: NAD ── */}
      <Section title="National Appeals Division (NAD)" tag="7 CFR Part 11">
        <h4 style={{ marginTop: 0 }}>Pre-Requisite</h4>
        <p>Informal review through FSA (county committee and/or state committee) is <strong>required</strong> before NAD will accept an appeal of an FSA adverse decision.</p>

        <h4>Filing Requirements</h4>
        <ul>
          <li>Written request, <strong>personally signed</strong> by the participant</li>
          <li>Include a copy of the adverse decision (if available)</li>
          <li>Brief statement of reasons for believing the decision was wrong</li>
          <li>Filed within <strong>30 days</strong> of receiving the final FSA informal appeal decision</li>
          <li>Participant may request a <strong>record review</strong> instead of a hearing</li>
        </ul>

        <h4>Hearing Process</h4>
        <ul>
          <li>Conducted by an <strong>independent Administrative Judge (AJ)</strong></li>
          <li>Hearing is <strong>in person</strong> unless the appellant agrees to telephone</li>
          <li>The <strong>agency record is automatically admitted</strong> as evidence</li>
          <li>Participants may present <strong>new evidence</strong></li>
          <li>Determination issued within <strong>30 days</strong> after hearing or closing of record</li>
        </ul>

        <h4>Director Review</h4>
        <ul>
          <li>Either party may request within <strong>30 days</strong> of AJ determination</li>
          <li>Director must complete: <strong>30 business days</strong> (appellant request) or <strong>10 business days</strong> (agency head request)</li>
          <li>Director may <strong>affirm, reverse, or remand</strong></li>
        </ul>

        <h4>Judicial Review</h4>
        <p>Available in <strong>federal district courts</strong> under the Administrative Procedure Act. The NAD process must be <strong>fully exhausted</strong> before judicial review is available.</p>
      </Section>

      {/* ── Section 7: CRP-Specific ── */}
      <Section title="CRP-Specific Appeal Issues" tag="7 CFR Part 1410">
        <h4 style={{ marginTop: 0 }}>Common CRP Appeal Issues</h4>
        <ul>
          <li><strong>Contract compliance violations</strong> (unauthorized haying, grazing, or other use of CRP acreage)</li>
          <li><strong>Payment disputes</strong> (rental rate calculations, cost-share amounts)</li>
          <li><strong>Eligibility determinations</strong> (land eligibility, producer eligibility)</li>
          <li><strong>Conservation plan compliance</strong> (failure to establish or maintain cover)</li>
          <li><strong>Contract termination or modification</strong> disputes</li>
        </ul>

        <h4>Key Rules</h4>
        <ul>
          <li>CRP appeals follow the <strong>same Part 780 procedures</strong> as all FSA appeals</li>
          <li>State and county committees <strong>CANNOT modify or waive</strong> any provisions in Part 1410 (CRP regulations) unless specifically authorized by the Deputy Administrator</li>
          <li>CRP regulations are administered under general supervision of the Executive Vice President, CCC, and the Administrator, FSA</li>
        </ul>

        <div style={{ ...greenCard, borderLeftColor: '#0056b3' }}>
          <strong>Colorado Example:</strong> The Ebright CRP Appeal (March 24, 2026) involved 7 contracts in Bent County with issues including unauthorized grazing, stocking rate compliance, and conservation plan violations. See the Summary of Events page for the full case brief and STC voting guide.
        </div>
      </Section>

      {/* ── Section 8: Equitable Relief ── */}
      <Section title="Equitable Relief &amp; Good Faith" tag="7 CFR Part 718 Subpart D">
        <h4 style={{ marginTop: 0 }}>Good Faith Reliance</h4>
        <p>If a participant relied <strong>in good faith</strong> on the action or advice of an authorized FSA representative and that reliance caused noncompliance, relief may be granted.</p>

        <h4>Good Faith Effort to Comply</h4>
        <p>Relief may be authorized when a participant failed to fully comply but made a <strong>good faith effort</strong> and performed substantial actions required for eligibility.</p>

        <h4>State Executive Director (SED) Authority Limits</h4>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Condition</th>
                <th>Threshold</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Relief amount per participant</td><td style={{ fontWeight: 600, color: '#dc3545' }}>Under $20,000</td></tr>
              <tr><td>Cumulative prior relief to that participant</td><td style={{ fontWeight: 600, color: '#dc3545' }}>Does not exceed $5,000</td></tr>
              <tr><td>Total relief to similarly situated participants</td><td style={{ fontWeight: 600, color: '#dc3545' }}>Does not exceed $1,000,000</td></tr>
            </tbody>
          </table>
        </div>
        <p>Above these thresholds, the <strong>Deputy Administrator</strong> decides.</p>

        <div style={redCard}>
          <strong>IMPORTANT:</strong> SED equitable relief decisions are <strong>ADMINISTRATIVELY FINAL</strong> &mdash; they are NOT subject to further appeal or judicial review. (See FSA Handbook 7-CP.)
        </div>
      </Section>

      {/* ── Section 9: Best Practices ── */}
      <Section title="STC Member Best Practices" tag="CHECKLIST" tagColor="#28a745" defaultOpen>
        {[
          'Ensure the participant received proper written notice of the adverse decision AND appeal rights',
          'Confirm jurisdiction: Is the decision appealable? Was the request timely (30-day window)?',
          'Coordinate with the State Executive Director on appealability questions BEFORE conducting a hearing',
          'Review the complete agency record before the hearing. Identify key facts, regulations, and issues',
          'Allow the participant a full and fair hearing but manage scope — exclude irrelevant material per your regulatory authority',
          'Base your decision on the record and document your reasoning clearly in the decision letter',
          'Include notice of further appeal rights (NAD) in every decision letter',
          'Consult FSA Handbook 1-APP (Program Appeals, Mediation, and Litigation) for procedural checklists',
          'Remember: a reconsideration decision restarts the 30-day clock — this creates NEW appeal rights',
          'DO NOT consider evidence outside the record without giving the participant opportunity to respond',
          'DO NOT confuse appealable program decisions with non-appealable general provisions or statutory formulas',
        ].map((item, i) => (
          <div key={i} style={greenCard}>
            <span style={{ color: '#28a745', fontWeight: 700, marginRight: 8 }}>{'\u2713'}</span>
            {item}
          </div>
        ))}
      </Section>

      {/* ── Section 10: Common Mistakes ── */}
      <Section title="Common Mistakes to Avoid" tag="WARNING" tagColor="#dc3545">
        {[
          { title: 'Considering Outside Evidence', detail: 'Considering evidence outside the record without giving the participant an opportunity to respond. This is a due process violation that can result in reversal on appeal.' },
          { title: 'Missing the Clock Restart', detail: 'Failing to recognize that a reconsideration decision restarts the 30-day clock, creating entirely new appeal rights. Participants can use this to extend their window.' },
          { title: 'Appealable vs. Non-Appealable Confusion', detail: 'Confusing appealable program decisions with non-appealable general provisions or statutory formulas. When in doubt, consult the SED for an appealability determination.' },
          { title: 'Failing to Manage Hearing Scope', detail: 'Allowing irrelevant or unduly repetitious testimony to go unchecked. While Federal Rules of Evidence do not apply, the STC has authority to exclude inappropriate evidence.' },
          { title: 'SED Equitable Relief is Final', detail: 'Not recognizing that equitable relief decisions made by the State Executive Director are administratively final and outside the STC appeal chain.' },
          { title: 'Inadequate Decision Letters', detail: 'Issuing vague or poorly reasoned decision letters. The decision letter IS the official record — it must clearly state the decision, reasoning, and further appeal rights.' },
        ].map((item, i) => (
          <div key={i} style={redCard}>
            <strong style={{ color: '#dc3545' }}>{item.title}</strong>
            <div style={{ marginTop: 4, fontSize: '0.9rem' }}>{item.detail}</div>
          </div>
        ))}
      </Section>

      {/* ── Section 11: Key References ── */}
      <Section title="Key References &amp; Handbooks" defaultOpen>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Description</th>
                <th>Key Sections</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>7 CFR Part 780</td>
                <td>FSA Appeal Regulations</td>
                <td>780.2 (definitions), 780.5 (non-appealable), 780.7 (reconsideration), 780.9-10 (STC appeals), 780.15 (timelines)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>7 CFR Part 11</td>
                <td>National Appeals Division Rules of Procedure</td>
                <td>11.6-11.8 (filing/hearing), 11.9 (Director review), 11.12 (judicial review)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>7 CFR Part 1410</td>
                <td>Conservation Reserve Program Regulations</td>
                <td>Contract requirements, compliance, payment provisions</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>7 CFR Part 718, Subpart D</td>
                <td>Equitable Relief Provisions</td>
                <td>Good faith reliance, good faith effort, SED authority limits</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>FSA Handbook 1-APP</td>
                <td>Program Appeals, Mediation, and Litigation</td>
                <td>Complete procedural checklists for all appeal types</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>FSA Handbook 7-CP</td>
                <td>Finality Rule and Equitable Relief</td>
                <td>Administrative finality, equitable relief procedures</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>FSA Handbook 2-CRP</td>
                <td>Conservation Reserve Program (Rev. 6)</td>
                <td>CRP contract administration, compliance, payment rules</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
