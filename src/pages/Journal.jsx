import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApiFetch } from '../auth/apiFetch';
import EntryEditor from '../components/EntryEditor';

/* ── Static Reference Entries ────────────────────────────────────── */
const PINNED_ENTRIES = [
  {
    id: 'upcoming-otero-crowley',
    pinned: true,
    date: '2026-03-17',
    title: 'Special Meeting: Otero/Crowley COC Administrative Leave Letters',
    location: 'Virtual / TBD',
    tags: 'special-meeting, otero-county, crowley-county, COC, employee-relations',
    source: 'Email — Jerry Sonnenberg / Steve Niemann',
    content: `UPCOMING: Monday, March 17, 2026 at 2:00 PM

PURPOSE:
The STC is meeting in special session to authorize Chairperson Donald Brown to sign Administrative Leave Letters for the members of the Otero/Crowley County Committee (COC). These letters were prepared by Steve Niemann (HR Specialist, Employee Relations, FPAC-FBC) and forwarded by Colorado Executive Director Jerry Sonnenberg.

KEY ACTION ITEMS:
1. STC reviews the Administrative Leave Letters for accuracy
2. Chairperson Donald Brown signs the letters (digital or wet signature)
3. Date of issuance must be reflected on the letter (currently dated March 17, 2026)
4. This action must be included in the STC minutes

DISTRIBUTION REQUIREMENTS (after signing):
- Deliver signed letter to each COC member via email
- Have a CO-FSA employee (e.g., District Director) notify each COC member that they have received a letter
- Mail a copy to each member via USPS with tracking (do NOT send certified/signature required)
- Return signed/dated letter + tracking confirmation to Employee Relations (Steve Niemann)

CHAIN OF COMMUNICATION:
- Steve Niemann (HR Specialist, Employee Relations) -> Jerry Sonnenberg (CO Executive Director) -> STC
- CC: Brandi May (ID), Kim Viers (MO), Rick Pinkston (DC)
- Contact Steve Niemann with any questions: (816) 926-6448 / steve.niemann@usda.gov

ATTENDEES (STC Members):
- Donald Brown (Chair) — dpbrown@anchorfarms.net
- Kyle McConnell
- Darrell Mackey — darrellmackey1976@gmail.com
- Joe Petrocco — joe@petroccofarms.com
- Steve Raftopoulos — straft@msn.com
- Jonathan Weishaar (FSA Staff) — jonathan.weishaar@usda.gov

OTERO/CROWLEY COC MEMBERS RECEIVING ADMINISTRATIVE LEAVE LETTERS:
(from files uploaded 3/15/2026)
1. Alish___  — FILE IS 0 KB / APPEARS EMPTY OR CORRUPTED - flag to Jerry Sonnenberg
2. Andr___   — Letter ready (48 KB)
3. Charl___  — Letter ready (48 KB)
4. Dou___    — Letter ready (48 KB)
5. Zach___   — Letter ready (48 KB)

ACTION: Confirm full names with Jerry Sonnenberg or Steve Niemann. Verify the Alish___ file is not corrupted before Monday.

BACKGROUND — WHAT IS ADMINISTRATIVE LEAVE FOR COC MEMBERS?
Under 7 CFR Part 7, FSA County Committee members can be placed on administrative leave (effectively suspended from duties) pending investigation or resolution of issues related to performance, misconduct, or impediment to program effectiveness. The STC has authority over COC personnel actions in their state. Administrative leave is not termination — it is a temporary removal from duties while matters are resolved. Members placed on leave retain appeal rights.

NOTE: Letters should already be on appropriate letterhead. If edits are needed, contact Steve Niemann before issuing. This is a confidential personnel/employee relations matter.`,
  },
  {
    id: 'personal-fire-story',
    pinned: false,
    date: '2026-03-15',
    title: 'Why This Work Matters — The Fire That Almost Took Everything',
    location: 'Haxtun, CO / Logan County',
    tags: 'personal, wildfire, community, agriculture, haxtun, logan-county',
    source: 'Kyle McConnell — personal account',
    content: `I was in college at NJC when I got a call from a family member that there was a fire in Logan County heading southeast and it was about to cross I-76. I didn't think much about it at that moment because it was so far from Haxtun, but with the wind blowing as strong as it was that day I kept an eye out for updates.

I was in class when my phone started to explode from neighbors and friends asking about updates on the fire. My parents had taken my maternal grandmother to Greeley because she was having surgery after a recent fall. No one was home and the fire was heading right for the farm.

I quickly left class and jumped in my pickup with my then girlfriend, now wife. We drove as fast as my pickup would go heading to help my paternal grandparents out of their home, then to the farm. As we raced up Highway 6 I struggled to keep the pickup on the road due to the wind pushing it all over. As we drew closer to Haxtun I could not get any answers from my grandparents' phone and I worried that they had tried to escape themselves.

We were a mile away from their house when we received a phone call that a family member had gotten them out of the house and taken them to a safe location. My grandparents' home is on CR 36 between 11 and 9. The house was 98 years old that year, and their large red and white barn had just turned 100.

Being that my grandparents were safe, we headed to the farm. As we drove we saw there were disks to the north cutting fire lines into our irrigated circles. The fire at this stage was miles away but the reports were saying that it was jumping multiple large fire lines, and they could not get it stopped. The corn stalks that were being disked was where we had wintered our pregnant cows, and a week before this fire had moved them 2 miles south to a new field.

We raced to the farm where we found my brother-in-law, who knew no one was on the farm and came to help, and the sheriff discussing the fire at our mailbox. We talked briefly, getting clued in on the true severity of it, then my wife, brother-in-law and myself raced inside my childhood home to save what we could.

Once inside, the indecision on what could be saved was palpable. I called my mother (who is now passed) to ask what she wanted to save. Hearing her stutter for a moment, I broke at the words that I had just said. Handing the phone to my wife who continued to talk to my mother on what was needing to be saved, I went to the office to put together important paperwork, deeds, and taxes that were in the process of being filed, including any other family heirlooms that were in my father's desk (whom is also passed now).

As I composed myself, the other two had gone downstairs for clothes for my parents, heirlooms, and photo albums. The albums were so numerous that they carried them up in 55-gallon trash cans. I got back on the phone with my dad to ask about anything else absolutely necessary. I found what he needed and then he told me that if the fire gets too close that I needed to push out the 100+ weaned calves we had dry lotted at the place.

We discussed their survival and the high chances of losing the place with the field just north of the house being a hailed out wheat crop from the year before that dad had left standing in the vain hope of catching some snow over the winter.

I hung up and helped move what we had gathered into the vehicles we had staged outside. Looking out the kitchen window, the dust and smoke was oppressive. We walked around trying to think of anything that could have been forgotten. As we searched we listened frantically to the scanner for updates on how close the fire was.

We heard multiple reports of using our yard as a staging ground for water so the firefighters could fight the fingers that were coming closer. I went out to check and saw multiple tankers in the yard and stretching south down the road. I heard later that over 100,000 gallons were staged on and around our place, but could never confirm.

I talked with multiple firefighters who asked for drinking water, bathrooms, and gas to keep the pumps running. We gladly gave them anything they requested.

Around this time the fire crossed Highway 59. On the curve in the highway north of CR 38, there was a half section of CRP grass that had been there since I could remember. As the fire hit the CRP the sky turned a sickly black and all the outside yard lights turned on in the darkness. We thought for sure that this was the end.

I ran to shut off the propane tanks in some sort of fruitless attempt to feel useful. Disks cut fire lines just past the tree line to the north and west of the house. We started vehicles in preparation. Not wanting to prematurely cut the fence for the calves, we waited, pacing the house watching and listening for any sign of fire. My parents called frequently to see if they still had a home as they raced back from the front range.

Some time passed and the sky lightened. I do not know how, but by God's grace no embers ever landed in the wheatfield just north of us.

After what felt like years my parents made it shakily home. Dad and I immediately drove out to survey where things were. Disk lines were everywhere. We took CR 38 to the west to Trent Mason's house where firefighters were putting out hot spots in the tree line less than 100 yards from their house.

Dad and I got out as we saw some other farmers from down south. A couple years before, dad and I worked with others in a disk line to help save one of their homes from a similar fate as they had just saved ours from. As soon as that neighbor made eye contact with dad he climbed out of the tractor and they embraced each other. The hug broke and he asked dad if we still had our home. Dad said yes and told him thank you for coming. He said we did the same for him.

We moved northwest seeing that one of our sprinklers had been burned. Once we got on the highway we headed towards Haxtun. We saw the remains of the CRP field that had darkened our yard earlier. The empty old farmhouse that stood on the hill to the northeast of the curve was wiped out of existence. Just down from the house about 500 yards was a random spot of CRP that remained unburnt. I learned later that a fire truck had been overcome by the fire and they turned their hoses on themselves to keep themselves alive.

We moved onto CR 11 to see what had become of my grandparents' home. The two irrigated circles where our cows were at previously was totally gone and both sprinklers sat on the ground with tires still burning. On south was a gargantuan fire line that had been cut by no less than 6 disks from neighbors. That had stopped the fire, saving my grandparents' home.

We went back north and came across a few cows that were in an appalling state. Neither words nor pictures do justice to the state of those poor girls.

Driving on we came to Jared Firme's house that was actively on fire. We watched for a while as the firefighters fought to save what they could. Littered around the house was smoldering wrecks of equipment and heaped piles of tin where buildings once stood.

We moved on to the west. We saw Lynn Segers' place where he had run a disk just feet away from his house in a desperate attempt to save it. On to Steve Meakins' place where he once had a beautiful tree row that was always full of pheasants. There the fire had come so incredibly close to his house that it was fought off in the lawn right next to it. We then finally passed Mike Salyards who had lost multiple outbuildings but his house had been spared.

We looped around and headed back to the home place to decompress.

The next day I again came down from college to look over the damage. The wind had died down so we were able to get a better scope of it. That day I helped dad get an old chisel plow going so we could try to keep some of the ground from picking up and blowing. The wind was lighter than the day before. Once we finished we toured around to see what all had been destroyed in our area.

Tree windbreaks were gone. Fencelines that had stood for decades lay charred half buried in the sand. The next few days were a blur of helping where we could and trying to prepare for more, as the forecast still called for bad wind.

The toll on the area was heavy but everyone persevered to try and stop the continued loss of our farmable top soil. About a week later oat seed had been procured to try to get something growing in the burn spots to hold on to the ground.

The community and the area slowly healed but some of the scars are still there to this day.

I am and will always be immensely proud of how the AG community and the Haxtun area come together to support each other in times of need. Small town values and looking out for your neighbors seems archaic in the modern age. In Haxtun however, it is the spirit by which we all live our lives.

Thank you to all who helped that day.

---
This is why I serve on the State Technical Committee. The farmers and ranchers of Colorado — in Otero County, in Logan County, everywhere — deserve people at the table who understand what it means to almost lose everything, and who know firsthand that agriculture is not just a business. It is a way of life.`,
  },
];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedPinned, setExpandedPinned] = useState({});
  const navigate = useNavigate();
  const apiFetch = useApiFetch();

  const fetchEntries = (q = '') => {
    setLoading(true);
    const url = q ? `/api/entries?search=${encodeURIComponent(q)}` : '/api/entries';
    apiFetch(url)
      .then(r => r.json())
      .then(setEntries)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEntries(); }, [apiFetch]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEntries(search);
  };

  const handleSave = async (data) => {
    const res = await apiFetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      setShowEditor(false);
      fetchEntries();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Journal</h2>
        <button className="btn btn-primary" onClick={() => setShowEditor(true)}>+ New Entry</button>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search entries..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">Search</button>
      </form>

      {showEditor && (
        <div className="modal-overlay" onClick={() => setShowEditor(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Journal Entry</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowEditor(false)}>X</button>
            </div>
            <EntryEditor onSave={handleSave} onCancel={() => setShowEditor(false)} />
          </div>
        </div>
      )}

      {/* ── Pinned / Upcoming Entries ──────────────────────────────── */}
      {PINNED_ENTRIES.filter(e => e.pinned).map(entry => (
        <div key={entry.id} className="card" style={{ marginBottom: 16, borderLeft: '4px solid var(--warning, #f0ad4e)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <span style={{
                display: 'inline-block', padding: '2px 10px', borderRadius: 12,
                fontSize: '0.75rem', fontWeight: 700, marginBottom: 6,
                background: 'var(--warning-bg, #fff3cd)', color: 'var(--warning, #856404)',
              }}>UPCOMING</span>
              <h3 style={{ margin: 0 }}>{entry.title}</h3>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{entry.date}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
            {entry.location} &mdash; {entry.source}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {entry.tags.split(',').map((t, i) => (
              <span key={i} className="tag">{t.trim()}</span>
            ))}
          </div>
          {expandedPinned[entry.id] ? (
            <div>
              <pre style={{
                whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem',
                lineHeight: 1.7, margin: 0, padding: 16,
                background: 'var(--bg-secondary, #f8f9fa)', borderRadius: 8,
              }}>{entry.content}</pre>
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => setExpandedPinned(p => ({ ...p, [entry.id]: false }))}
              >Collapse</button>
            </div>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setExpandedPinned(p => ({ ...p, [entry.id]: true }))}
            >Show Full Details</button>
          )}
        </div>
      ))}

      {/* ── Reference Entries (non-pinned) ────────────────────────── */}
      {PINNED_ENTRIES.filter(e => !e.pinned).map(entry => (
        <div key={entry.id} className="card" style={{ marginBottom: 16, borderLeft: '4px solid var(--accent, #6c5ce7)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <span style={{
                display: 'inline-block', padding: '2px 10px', borderRadius: 12,
                fontSize: '0.75rem', fontWeight: 700, marginBottom: 6,
                background: 'var(--accent-bg, #e8e4fd)', color: 'var(--accent, #6c5ce7)',
              }}>REFERENCE</span>
              <h3 style={{ margin: 0 }}>{entry.title}</h3>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{entry.date}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
            {entry.location} &mdash; {entry.source}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {entry.tags.split(',').map((t, i) => (
              <span key={i} className="tag">{t.trim()}</span>
            ))}
          </div>
          {expandedPinned[entry.id] ? (
            <div>
              <pre style={{
                whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem',
                lineHeight: 1.7, margin: 0, padding: 16,
                background: 'var(--bg-secondary, #f8f9fa)', borderRadius: 8,
              }}>{entry.content}</pre>
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => setExpandedPinned(p => ({ ...p, [entry.id]: false }))}
              >Collapse</button>
            </div>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setExpandedPinned(p => ({ ...p, [entry.id]: true }))}
            >Show Full Details</button>
          )}
        </div>
      ))}

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <h3>No entries found</h3>
          <p>Create your first journal entry to get started.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Location</th>
                <th>Tags</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id} className="clickable-row" onClick={() => navigate(`/journal/${e.id}`)}>
                  <td>{e.date}</td>
                  <td style={{ fontWeight: 500 }}>{e.title}</td>
                  <td>{e.location || '\u2014'}</td>
                  <td>
                    {e.tags ? e.tags.split(',').map((t, i) => (
                      <span key={i} className="tag">{t.trim()}</span>
                    )) : '\u2014'}
                  </td>
                  <td>{e.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
