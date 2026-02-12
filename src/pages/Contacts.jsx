import React from 'react';

const committeeMembers = [
  {
    name: 'Donald Cleo Brown',
    role: 'Chair',
    location: 'Yuma, CO',
    phone: '970-630-1193',
    email: 'dpbrown@anchorfarms.net',
    bio: 'Operates a multi-generational farm and ranch with irrigated and dryland crops, yearling and feedlot cattle. Former Colorado Commissioner of Agriculture. Led regulatory reform and national agricultural policy initiatives.',
  },
  {
    name: 'Darrell Mackey',
    role: 'Member',
    location: 'Springfield, CO',
    phone: '719-529-4700',
    email: 'darrellmackey1976@gmail.com',
    bio: '5th-generation dryland wheat farmer. Continuous wheat farming with soil management, fertilization, and herbicide programs. Licensed crop insurance agent across multiple states.',
  },
  {
    name: 'Kyle Dean McConnell',
    role: 'Member',
    location: 'Haxtun, CO',
    email: 'straft@msn.com',
    bio: '4th-generation family farm operating across multiple counties. Degrees in agriculture. Colorado Corn Growers Association board member.',
  },
  {
    name: 'Joeseph Petrocco',
    role: 'Member',
    location: 'Thornton, CO',
    phone: '303-717-5045',
    email: 'joe@petroccofarms.com',
    bio: 'VP of a 4th-generation vegetable operation focused on sustainability, labor efficiency, and advanced production. CO Fruit and Vegetable Growers Association Board (VP). Expertise in innovative irrigation, crop management, and food safety.',
  },
  {
    name: 'Steve George Raftopoulos',
    role: 'Member',
    location: 'Craig, CO',
    phone: '970-326-8614',
    bio: 'Managing member of an open-range sheep production operation across private, state, BLM, and USFS lands in Colorado and Wyoming. Past president, American Sheep Industry Association. Former chairman, Wool Council and Lamb Council.',
  },
];

const quickLinks = [
  { label: 'FSA Colorado', url: 'https://www.fsa.usda.gov/state-offices/colorado', icon: '\uD83C\uDFDB' },
  { label: 'FSA Programs', url: 'https://www.fsa.usda.gov/resources/programs', icon: '\uD83D\uDCCB' },
  { label: 'Find Local FSA Office', url: 'https://www.farmers.gov/working-with-us/service-center-locator', icon: '\uD83D\uDCCD' },
  { label: 'CRP Info', url: 'https://www.fsa.usda.gov/resources/programs/conservation-programs/conservation-reserve-program', icon: '\uD83C\uDF3E' },
  { label: 'ELAP Info', url: 'https://www.fsa.usda.gov/resources/programs/emergency-assistance-livestock-honeybees-farm-raised-fish-elap', icon: '\uD83D\uDC02' },
  { label: 'Rangeland Analysis (RAP)', url: 'https://rangelands.app', icon: '\uD83D\uDDFA' },
  { label: 'U.S. Drought Monitor', url: 'https://droughtmonitor.unl.edu/', icon: '\u2600' },
  { label: 'FSA Fact Sheets', url: 'https://www.fsa.usda.gov/tools/informational/fact-sheets', icon: '\uD83D\uDCC4' },
  { label: 'FSA Handbooks', url: 'https://www.fsa.usda.gov/news-events/laws-regulations/fsa-handbooks', icon: '\uD83D\uDCD6' },
  { label: 'NRCS Colorado', url: 'https://www.nrcs.usda.gov/conservation-basics/conservation-by-state/colorado', icon: '\uD83C\uDF31' },
  { label: 'USDA Box', url: 'https://usda.app.box.com', icon: '\uD83D\uDCC1' },
];

export default function Contacts() {
  return (
    <div>
      <div className="page-header">
        <h2>Committee &amp; Contacts</h2>
      </div>

      {/* State Executive Director */}
      <div className="contact-section">
        <h3>State Executive Director</h3>
        <div className="contact-card">
          <div className="contact-name">Jerry Sonnenberg</div>
          <div className="contact-role">Colorado State Executive Director, USDA FSA</div>
          <div className="contact-detail">
            <strong>Phone:</strong>{' '}
            <a href="tel:970-581-8648">970-581-8648</a>
          </div>
          <div className="contact-detail">
            <strong>Email:</strong>{' '}
            <a href="mailto:Jerry.Sonnenberg@usda.gov">Jerry.Sonnenberg@usda.gov</a>
          </div>
          <div className="contact-bio">
            4th-generation farmer/rancher from Logan County. Appointed May 2025 by the Trump Administration. Former Colorado Senate President Pro Tem with 16 years in the legislature. Colorado Agricultural Hall of Fame inductee, 2023.
          </div>
          <div className="contact-links">
            <a href="https://www.fsa.usda.gov/about-fsa/fsa-leadership/jerry-sonnenberg" target="_blank" rel="noopener noreferrer" className="contact-link">
              FSA Profile &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* State Committee Members */}
      <div className="contact-section">
        <h3>State Committee Members</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: -8, marginBottom: 16 }}>
          Appointed January 13, 2026 &mdash;{' '}
          <a href="https://www.fsa.usda.gov/news-events/news/01-13-2026/usda-names-trump-administration-appointees-colorado-farm-service-agency" target="_blank" rel="noopener noreferrer">
            Source
          </a>
        </p>
        {committeeMembers.map((m, i) => (
          <div className="contact-card" key={i}>
            <div className="contact-name">{m.name}</div>
            <div className="contact-role">
              {m.role === 'Chair' ? 'Chair' : 'Member'} &mdash; {m.location}
            </div>
            {(m.phone || m.email) && (
              <div style={{ marginBottom: 4 }}>
                {m.phone && (
                  <div className="contact-detail">
                    <strong>Phone:</strong>{' '}
                    <a href={`tel:${m.phone}`}>{m.phone}</a>
                  </div>
                )}
                {m.email && (
                  <div className="contact-detail">
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${m.email}`}>{m.email}</a>
                  </div>
                )}
              </div>
            )}
            <div className="contact-bio">{m.bio}</div>
          </div>
        ))}
      </div>

      {/* FSA Staff */}
      <div className="contact-section">
        <h3>FSA Staff</h3>

        <div className="contact-card">
          <div className="contact-name">Cindy Vukasin</div>
          <div className="contact-role">FPAC-FSA Colorado</div>
          <div className="contact-detail">
            <strong>Email:</strong>{' '}
            <a href="mailto:cindy.vukasin@usda.gov">cindy.vukasin@usda.gov</a>
          </div>
        </div>

        <div className="contact-card">
          <div className="contact-name">Jonathan Weishaar</div>
          <div className="contact-role">FPAC-FSA Colorado</div>
          <div className="contact-detail">
            <strong>Phone:</strong>{' '}
            <a href="tel:970-295-5665">970-295-5665</a>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 6 }}>(Larimer/Boulder Co. FSA office)</span>
          </div>
          <div className="contact-detail">
            <strong>Email:</strong>{' '}
            <a href="mailto:jonathan.weishaar@usda.gov">jonathan.weishaar@usda.gov</a>
          </div>
        </div>

        <div className="contact-card">
          <div className="contact-name">Corey Pelton</div>
          <div className="contact-role">FPAC-FSA Colorado</div>
          <div className="contact-detail">
            <strong>Email:</strong>{' '}
            <a href="mailto:corey.pelton@usda.gov">corey.pelton@usda.gov</a>
          </div>
        </div>

        <div className="contact-card">
          <div className="contact-name">Julie Sporhase</div>
          <div className="contact-role">FPAC-FSA Colorado</div>
          <div className="contact-detail">
            <strong>Email:</strong>{' '}
            <a href="mailto:julie.sporhase@usda.gov">julie.sporhase@usda.gov</a>
          </div>
        </div>

        <div className="contact-card">
          <div className="contact-name">Janae Rader</div>
          <div className="contact-role">FPAC-FSA Colorado</div>
          <div className="contact-detail">
            <strong>Email:</strong>{' '}
            <a href="mailto:janae.rader@usda.gov">janae.rader@usda.gov</a>
          </div>
        </div>

        <div className="contact-card">
          <div className="contact-name">Hunter Cleveland</div>
          <div className="contact-role">FPAC-FSA Colorado</div>
          <div className="contact-detail">
            <strong>Email:</strong>{' '}
            <a href="mailto:hunter.cleveland@usda.gov">hunter.cleveland@usda.gov</a>
          </div>
        </div>

        <div className="contact-card">
          <div className="contact-name">Douglas R. Andresen</div>
          <div className="contact-role">FPAC-FSA Colorado</div>
          <div className="contact-detail">
            <strong>Email:</strong>{' '}
            <a href="mailto:doug.andresen@usda.gov">doug.andresen@usda.gov</a>
          </div>
        </div>
      </div>

      {/* Colorado FSA State Office */}
      <div className="contact-section">
        <h3>Colorado FSA State Office</h3>
        <div className="contact-card">
          <div className="contact-detail">
            <strong>Address:</strong> Denver Federal Center, Building 56, Room 2760, PO Box 25426, Denver, CO 80225-0426
          </div>
          <div className="contact-detail">
            <strong>Phone:</strong>{' '}
            <a href="tel:720-544-2876">(720) 544-2876</a>
          </div>
          <div className="contact-links">
            <a href="https://www.fsa.usda.gov/state-offices/colorado" target="_blank" rel="noopener noreferrer" className="contact-link">
              Website &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* Colorado USDA Rural Development */}
      <div className="contact-section">
        <h3>Colorado USDA Rural Development</h3>
        <div className="contact-card">
          <div className="contact-name">Sallie Clark</div>
          <div className="contact-role">State Director</div>
          <div className="contact-detail">
            <strong>Address:</strong> Building 56, Room E-2300
          </div>
          <div className="contact-detail">
            <strong>Phone:</strong>{' '}
            <a href="tel:720-544-2903">(720) 544-2903</a>
          </div>
          <div className="contact-detail">
            <strong>Email:</strong>{' '}
            <a href="mailto:sm.rd.co@usda.gov">sm.rd.co@usda.gov</a>
          </div>
        </div>
      </div>

      {/* Key Links */}
      <div className="contact-section">
        <h3>Key Links &amp; Resources</h3>
        <div className="quick-links-grid">
          {quickLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="quick-link-card"
            >
              <span className="ql-icon">{link.icon}</span>
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
