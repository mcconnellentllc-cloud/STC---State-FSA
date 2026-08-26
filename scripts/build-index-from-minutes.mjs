// Build a minimal meeting_YYYY-MM-DD_index.json from an approved minutes PDF.
// Usage: node scripts/build-index-from-minutes.mjs <date> <execMinutes.pdf> <regMinutes.pdf?>
import fs from 'fs';
import path from 'path';

const [, , date, ...pdfPaths] = process.argv;
if (!date || pdfPaths.length === 0) {
  console.error('Usage: node scripts/build-index-from-minutes.mjs <date-YYYY-MM-DD> <pdf1> [pdf2]');
  process.exit(1);
}

async function extractText(filePath) {
  const pdfParse = (await import('pdf-parse')).default;
  const buf = fs.readFileSync(filePath);
  const data = await pdfParse(buf);
  return data.text;
}

// Parse the numbered agenda items out of a minutes text.
// Detects "N. Title" (top-level) and "A|B|C..." (sub-items), pairs motions with items.
function parseAgenda(text, sessionName) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const items = [];
  let current = null;
  let currentSub = null;
  const numRegex = /^(\d{1,2})\.\s+(.+)/;
  const subRegex = /^([A-F])\s+(.+)/;
  const motionRegex = /(moved to |motion passed|Motion passed|Motion Passed|adjourned at|adjourn(ed)? at)/i;

  for (const line of lines) {
    // Top-level numbered item
    const m = line.match(numRegex);
    if (m && parseInt(m[1]) >= 1 && parseInt(m[1]) <= 20) {
      current = { number: m[1], title: m[2].trim(), motions: [], subs: [] };
      currentSub = null;
      items.push(current);
      continue;
    }
    // Sub-item A/B/C/D/E/F
    const s = line.match(subRegex);
    if (s && current) {
      currentSub = { letter: s[1], title: s[2].trim(), motions: [] };
      current.subs.push(currentSub);
      continue;
    }
    // Motion line
    if (motionRegex.test(line)) {
      const target = currentSub || current;
      if (target) target.motions.push(line);
    }
  }

  // Build agenda_items structure
  return items.map(it => {
    const action_type = it.motions.length > 0 || it.subs.some(s => s.motions.length > 0) ? 'Action Item' : 'Procedural';
    return {
      number: it.number,
      title: it.title.replace(/\s*\(Exhibit \d+\)$/, ''),
      action_type,
      motions: it.motions.slice(0, 3),
      sub_items: it.subs.map(s => ({
        letter: s.letter,
        title: s.title.replace(/\s*\(Exhibit \d+\)$/, ''),
        motions: s.motions.slice(0, 3),
      })),
    };
  });
}

// Extract meeting metadata from the first ~50 lines
function parseMetadata(text) {
  const meta = { start_time: null, location: null, members_present: [], staff_present: [], guests: [] };
  const startMatch = text.match(/Meeting Time:\s*([^\n]+)/i);
  if (startMatch) meta.start_time = startMatch[1].trim();
  const locMatch = text.match(/Meeting Place:\s*([^\n]+(?:\n[^\n]+)?)/i);
  if (locMatch) meta.location = locMatch[1].replace(/\s+/g, ' ').trim();
  // Members / staff — grab lines under those headers
  const memberBlock = text.match(/Members Present:([\s\S]{0,600}?)Staff Present:/);
  if (memberBlock) {
    meta.members_present = memberBlock[1].split('\n').map(l => l.trim()).filter(l => l && l.length > 3 && /[A-Z]/.test(l));
  }
  const staffBlock = text.match(/Staff Present:([\s\S]{0,1000}?)Guests:/);
  if (staffBlock) {
    meta.staff_present = staffBlock[1].split('\n').map(l => l.trim()).filter(l => l && l.length > 3 && /[A-Z]/.test(l));
  }
  const guestBlock = text.match(/Guests:\s*([^\n]+)/);
  if (guestBlock) {
    const g = guestBlock[1].trim();
    if (g && !/none/i.test(g)) meta.guests = [g];
  }
  return meta;
}

const [y, mo, d] = date.split('-');
const meeting = {
  body: 'USDA FSA Colorado State Committee (STC)',
  meeting_date: date,
  sessions: [],
};

for (const pdf of pdfPaths) {
  const text = await extractText(pdf);
  const isExec = /Executive/i.test(pdf);
  const sessionName = isExec ? 'Executive Session' : 'Regular Session';
  const meta = parseMetadata(text);
  if (!meeting.location && meta.location) meeting.location = meta.location;
  if (!meeting.committee_members && meta.members_present.length) {
    meeting.committee_members = meta.members_present;
  }
  const agenda = parseAgenda(text, sessionName);
  meeting.sessions.push({
    session: sessionName,
    start_time: meta.start_time || '',
    guests: meta.guests,
    agenda_items: agenda.map(it => ({
      number: it.number,
      title: it.title,
      action_type: it.action_type,
      motions: it.motions,
      sub_items: it.sub_items.map(s => ({
        number: `${it.number}${s.letter}`,
        title: s.title,
        action_type: s.motions.length ? 'Action Item' : 'Discussion',
        motions: s.motions,
      })),
    })),
  });
}

const idx = {
  schema_version: '1.0',
  index_title: `Colorado STC — ${date} Meeting — Index (from approved minutes)`,
  meeting,
  source_note: 'Built from approved minutes PDFs — captures every numbered agenda item and any motions passed. For Discussion Records with pre-vote background, see the packet PDFs on Teams.',
};

console.log(JSON.stringify(idx, null, 2));
