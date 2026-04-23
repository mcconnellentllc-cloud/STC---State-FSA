import React, { useState } from 'react';

/* ── CRP Cost Share Rate Data (50% Cost Share) ──────────────────── */
const CRP_RATES = [
  { category: "Seed", component: "CP1 Introduced Grasses and Legumes", unit: "Acre", approved2025: 62.00, supportedPrice: 61.97, stoProposed: 62.00, doc: "Pawnee Seed Company" },
  { category: "Seed", component: "CP2 Native Grasses", unit: "Acre", approved2025: 68.00, supportedPrice: 73.17, stoProposed: 73.00, doc: "Pawnee Seed Company" },
  { category: "Seed", component: "CP4D Wildlife Habitat - Non Easement", unit: "Acre", approved2025: 72.00, supportedPrice: 77.08, stoProposed: 77.00, doc: "Pawnee Seed Company" },
  { category: "Seed", component: "CP5A Field Windbreak Establishment", unit: "Each", approved2025: 3.00, supportedPrice: 3.17, stoProposed: 3.00, doc: "CSFS & One Canopy" },
  { category: "Seed", component: "CP8A Grass Waterway - Non Easement", unit: "Acre", approved2025: 68.00, supportedPrice: 73.17, stoProposed: 73.00, doc: "Pawnee Seed Company" },
  { category: "Seed", component: "CP15A Contour Grass Strips - Non Easement", unit: "Acre", approved2025: 68.00, supportedPrice: 73.17, stoProposed: 73.00, doc: "Pawnee Seed Company" },
  { category: "Seed", component: "CP16A Shelter Belt - Non Easement", unit: "Each", approved2025: 3.00, supportedPrice: 3.17, stoProposed: 3.00, doc: "CSFS & One Canopy" },
  { category: "Seed", component: "CP17A Living Snow Fence - Non Easement", unit: "Each", approved2025: 3.00, supportedPrice: 3.17, stoProposed: 3.00, doc: "CSFS & One Canopy" },
  { category: "Seed", component: "CP33 Habitat Buffers for Upland Birds", unit: "Acre", approved2025: 45.00, supportedPrice: 50.06, stoProposed: 50.00, doc: "Pawnee Seed Company" },
  { category: "Seed", component: "CP38E-2 SAFE Native Grasses", unit: "Acre", approved2025: 68.00, supportedPrice: 73.17, stoProposed: 73.00, doc: "Pawnee Seed Company" },
  { category: "Seed", component: "CP38E-4D SAFE Wildlife Habitat - Non Easement", unit: "Acre", approved2025: 72.00, supportedPrice: 77.08, stoProposed: 77.00, doc: "Pawnee Seed Company" },
  { category: "Seed", component: "CP42 Pollinator Habitat", unit: "Acre", approved2025: 109.00, supportedPrice: 108.21, stoProposed: 108.00, doc: "Pawnee Seed Company" },
  { category: "Seed", component: "CP43 Prairie Strips", unit: "Acre", approved2025: 109.00, supportedPrice: 108.21, stoProposed: 108.00, doc: "Pawnee Seed Company" },
  { category: "Seed", component: "Cover Crop", unit: "Acre", approved2025: 20.00, supportedPrice: 24.00, stoProposed: 24.00, doc: "Pawnee Seed Company" },
  { category: "Seedbed Prep", component: "Tillage 1st Operation", unit: "Acre", approved2025: 20.00, supportedPrice: 22.85, stoProposed: 23.00, doc: "CSU 2024 Custom Rates" },
  { category: "Seedbed Prep", component: "Tillage 2nd Operation", unit: "Acre", approved2025: 20.00, supportedPrice: 22.85, stoProposed: 23.00, doc: "CSU 2024 Custom Rates" },
  { category: "Seedbed Prep", component: "Tillage 3rd Operation", unit: "Acre", approved2025: 20.00, supportedPrice: 22.85, stoProposed: 23.00, doc: "CSU 2024 Custom Rates" },
  { category: "Seedbed Prep", component: "Tillage 4th Operation", unit: "Acre", approved2025: 20.00, supportedPrice: 22.85, stoProposed: 23.00, doc: "CSU 2024 Custom Rates" },
  { category: "Seedbed Prep", component: "Tillage 5th Operation", unit: "Acre", approved2025: 20.00, supportedPrice: 22.85, stoProposed: 23.00, doc: "CSU 2024 Custom Rates" },
  { category: "Seedbed Prep", component: "Mowing", unit: "Acre", approved2025: 17.00, supportedPrice: 25.00, stoProposed: 25.00, doc: "County Office Invoice" },
  { category: "Seedbed Prep", component: "Burning", unit: "Acre", approved2025: 20.00, supportedPrice: 73.93, stoProposed: 74.00, doc: "NRCS practice scenarios" },
  { category: "Seedbed Prep", component: "CP8A Grading and Shaping", unit: "Sq Ft", approved2025: 8.00, supportedPrice: "RETIRED", stoProposed: "RETIRED", doc: "Not utilized; lack of data", retired: true },
  { category: "Seedbed Prep", component: "Chemical Cover Crop Termination 1st App", unit: "Acre", approved2025: 20.00, supportedPrice: 24.09, stoProposed: 24.00, doc: "County Office Invoice" },
  { category: "Seedbed Prep", component: "Chemical Cover Crop Termination 2nd App", unit: "Acre", approved2025: 20.00, supportedPrice: 24.09, stoProposed: 24.00, doc: "County Office Invoice" },
  { category: "Seedbed Prep", component: "Chemical Cover Crop Termination 3rd App", unit: "Acre", approved2025: 20.00, supportedPrice: 24.09, stoProposed: 24.00, doc: "County Office Invoice" },
  { category: "Seeding", component: "Drill", unit: "Acre", approved2025: 23.00, supportedPrice: 22.38, stoProposed: 22.50, doc: "CSU 2024 Custom Rates" },
  { category: "Seeding", component: "Pollinator", unit: "Acre", approved2025: 23.00, supportedPrice: 22.38, stoProposed: 22.50, doc: "CSU 2024 Custom Rates" },
  { category: "Seeding", component: "Cover Crop", unit: "Acre", approved2025: 23.00, supportedPrice: 22.38, stoProposed: 22.50, doc: "CSU 2024 Custom Rates" },
  { category: "Seeding", component: "Tree Establishment", unit: "Foot", approved2025: 1.14, supportedPrice: 1.73, stoProposed: 2.00, doc: "NRCS practice scenarios" },
  { category: "Weed Control", component: "Mechanical Post Planting (12 mo)", unit: "Acre", approved2025: 18.00, supportedPrice: 24.00, stoProposed: 24.00, doc: "County Office Invoice" },
  { category: "Weed Control", component: "Mechanical Post Planting (24 mo)", unit: "Acre", approved2025: 18.00, supportedPrice: 24.00, stoProposed: 24.00, doc: "County Office Invoice" },
  { category: "Weed Control", component: "Chemical Purchase & Application (12 mo)", unit: "Acre", approved2025: 28.00, supportedPrice: 24.09, stoProposed: 24.00, doc: "County Office Invoice" },
  { category: "Weed Control", component: "Chemical Purchase & Application (24 mo)", unit: "Acre", approved2025: 28.00, supportedPrice: 24.09, stoProposed: 24.00, doc: "County Office Invoice" },
  { category: "Fencing", component: "Multistrand Barbed/Smooth Wire (3-4 strand)", unit: "Foot", approved2025: 3.00, supportedPrice: 5.63, stoProposed: 6.00, doc: "CSU 2024 Custom Rates" },
  { category: "Fencing", component: "Multistrand Barbed/Smooth Wire - Difficult Terrain", unit: "Foot", approved2025: 4.00, supportedPrice: 5.63, stoProposed: 8.40, doc: "CSU 2024 Custom Rates — STC Apr 23, 2026 approved at $8.40/ft (40% premium over $6 base fencing rate)" },
  { category: "Fencing", component: "Electric / High Tensile", unit: "Foot", approved2025: 3.00, supportedPrice: 5.63, stoProposed: 6.00, doc: "CSU 2024 Custom Rates" },
  { category: "Watering Facility", component: "Permanent Drinking/Storage < 750 gal", unit: "Gallon", approved2025: null, supportedPrice: 4.23, stoProposed: 4.25, doc: "NRCS practice scenarios", newItem: true },
  { category: "Watering Facility", component: "Permanent Drinking/Storage > 750 gal", unit: "Gallon", approved2025: null, supportedPrice: 4.67, stoProposed: 4.70, doc: "NRCS practice scenarios", newItem: true },
  { category: "Pipeline", component: "1.25 inch 160psi PVC-SDR", unit: "Foot", approved2025: 3.00, supportedPrice: 2.92, stoProposed: 3.00, doc: "Schroder Red Angus invoice, Baca Co" },
  { category: "Pipeline", component: ">= 1.5 inch HDPE", unit: "Foot", approved2025: 4.00, supportedPrice: 4.00, stoProposed: 4.00, doc: "Schroder Red Angus invoice, Baca Co" },
  { category: "Water Well", component: "Well: <= 100 Foot", unit: "Foot", approved2025: 95.00, supportedPrice: 211.85, stoProposed: 212.00, doc: "Schroder Red Angus invoice, Baca Co" },
  { category: "Water Well", component: "Well: 100-300 Foot", unit: "Foot", approved2025: 55.00, supportedPrice: 122.65, stoProposed: 123.00, doc: "Schroder Red Angus invoice, Baca Co" },
  { category: "Water Well", component: "Well: 300-600 Foot", unit: "Foot", approved2025: 48.00, supportedPrice: 107.07, stoProposed: 107.00, doc: "Schroder Red Angus invoice, Baca Co" },
  { category: "Water Well Pump", component: "Pump (Electric)", unit: "Each", approved2025: 448.00, supportedPrice: 2102.00, stoProposed: 2100.00, doc: "NRCS practice scenarios" },
  { category: "Water Well Pump", component: "Pump (Solar)", unit: "Each", approved2025: 4600.00, supportedPrice: 6118.66, stoProposed: 6120.00, doc: "NRCS practice scenarios" },
  { category: "Spring Development", component: "Spring Development", unit: "Each", approved2025: 7000.00, supportedPrice: 6144.82, stoProposed: 6145.00, doc: "NRCS practice scenarios" },
  { category: "Brush Management", component: "Mechanical, Small Shrubs, Light Infestation", unit: null, approved2025: 77.00, supportedPrice: "RETIRED", stoProposed: "RETIRED", doc: "Not utilized; ineligible per handbook", retired: true },
  { category: "Brush Management", component: "Mechanical, Large Shrubs, Medium Infestation", unit: null, approved2025: 400.00, supportedPrice: "RETIRED", stoProposed: "RETIRED", doc: "Not utilized; ineligible per handbook", retired: true },
  { category: "Brush Management", component: "Chemical, Aerial Applied", unit: null, approved2025: 57.00, supportedPrice: "RETIRED", stoProposed: "RETIRED", doc: "Not utilized; ineligible per handbook", retired: true },
  { category: "Other", component: "Soil Analysis Test", unit: "Each", approved2025: 205.00, supportedPrice: 210.00, stoProposed: 210.00, doc: "CSU Extension quoted price" },
];

/* ── EFRP Cost Share Rate Data (75% Cost Share) ─────────────────── */
const EFRP_RATES = [
  { category: "Obstruction Removal", component: "Light Scattered Debris", unit: "Acre", approved2025: 490.18, supportedPrice: 503.49, stoProposed: 504.00, doc: "NRCS Code 500, Scenario 43" },
  { category: "Obstruction Removal", component: "Heavy Scattered Debris", unit: "Sq Ft", approved2025: 1.39, supportedPrice: 1.49, stoProposed: 1.50, doc: "NRCS Code 500, Scenario 44" },
  { category: "Obstruction Removal", component: "Brush and Trees", unit: "Acre", approved2025: null, supportedPrice: 2089.29, stoProposed: 2089.00, doc: "NRCS Code 500, Scenarios 109+110", newItem: true },
  { category: "Obstruction Removal", component: "Light Flood Sediment", unit: "Acre", approved2025: null, supportedPrice: 3528.25, stoProposed: 3528.00, doc: "NRCS Code 500, Scenario 45", newItem: true },
  { category: "Obstruction Removal", component: "Heavy Flood Sediment", unit: "Acre", approved2025: null, supportedPrice: 4909.64, stoProposed: 4910.00, doc: "NRCS Code 500, Scenario 42", newItem: true },
  { category: "Obstruction Removal", component: "Rock/Boulder", unit: "Cu Yd", approved2025: 145.80, supportedPrice: 149.82, stoProposed: 150.00, doc: "NRCS Code 500, Scenario 112" },
  { category: "Obstruction Removal", component: "Fence Removal", unit: "Foot", approved2025: 1.36, supportedPrice: 1.40, stoProposed: 1.40, doc: "NRCS Code 500, Scenario 111" },
  { category: "Site Preparation", component: "Mechanical, Light", unit: "Acre", approved2025: null, supportedPrice: 126.87, stoProposed: 127.00, doc: "NRCS Code 490, Scenario 61", newItem: true },
  { category: "Site Preparation", component: "Mechanical, Moderate", unit: "Acre", approved2025: null, supportedPrice: 213.16, stoProposed: 213.00, doc: "NRCS Code 490, Scenario 56", newItem: true },
  { category: "Site Preparation", component: "Mechanical, Heavy", unit: "Acre", approved2025: null, supportedPrice: 472.04, stoProposed: 472.00, doc: "NRCS Code 490, Scenario 59", newItem: true },
  { category: "Site Preparation", component: "Weed Control, Mechanical", unit: "Acre", approved2025: null, supportedPrice: 72.31, stoProposed: 72.00, doc: "NRCS Code 315, Scenario 2", newItem: true },
  { category: "Site Preparation", component: "Weed Control, Chemical", unit: "Acre", approved2025: null, supportedPrice: 81.39, stoProposed: 81.00, doc: "NRCS Code 315, Scenario 5", newItem: true },
  { category: "Conservation Cover", component: "Cover Crop, Temporary", unit: "Acre", approved2025: null, supportedPrice: 43.00, stoProposed: 43.00, doc: "CRP rates: Seed + Seeding Drill", newItem: true },
  { category: "Conservation Cover", component: "Cover Crop, Termination", unit: "Acre", approved2025: null, supportedPrice: 30.60, stoProposed: 31.00, doc: "NRCS Code 340, Scenario 83", newItem: true },
  { category: "Contouring", component: "Contour Barriers", unit: "Each", approved2025: 55.00, supportedPrice: 55.00, stoProposed: 55.00, doc: "CSFS local technical knowledge" },
  { category: "Tree/Shrub", component: "Small Tree - Hand Planting", unit: "Each", approved2025: 1.88, supportedPrice: 8.47, stoProposed: 8.50, doc: "NRCS Code 612, Scenario 107" },
  { category: "Tree/Shrub", component: "Medium Tree - Hand Planting", unit: "Each", approved2025: 8.79, supportedPrice: 21.12, stoProposed: 21.00, doc: "NRCS Code 612, Scenario 104" },
  { category: "Tree/Shrub", component: "Large Tree - Hand Planting", unit: "Each", approved2025: 15.54, supportedPrice: 34.69, stoProposed: 35.00, doc: "NRCS Code 612, Scenario 103" },
  { category: "Tree/Shrub", component: "Natural Regeneration", unit: "Acre", approved2025: 0.00, supportedPrice: 0.00, stoProposed: 0.00, doc: "No cost - natural process" },
  { category: "Firebreak", component: "Normal Slope", unit: "Acre", approved2025: 1284.53, supportedPrice: 1342.67, stoProposed: 1343.00, doc: "NRCS Code 394, Scenario 2" },
  { category: "Firebreak", component: "Steep Slope", unit: "Acre", approved2025: 3831.78, supportedPrice: 3990.79, stoProposed: 3991.00, doc: "NRCS Code 394, Scenario 3" },
  { category: "Access Road", component: "Level Terrain", unit: "Each", approved2025: "10.26/ft", supportedPrice: 1308.54, stoProposed: 1310.00, doc: "NRCS Code 560, Scenario 6" },
  { category: "Access Road", component: "Sloped Terrain", unit: "Each", approved2025: "7.48/ft", supportedPrice: 1617.61, stoProposed: 1618.00, doc: "NRCS Code 560, Scenario 8" },
  { category: "Access Road", component: "Implementation", unit: "Foot", approved2025: null, supportedPrice: 9.42, stoProposed: 9.50, doc: "NRCS Code 560, Scenarios 7+9", newItem: true },
  { category: "Fuel Break", component: "Normal Terrain", unit: "Acre", approved2025: 1849.84, supportedPrice: 2645.57, stoProposed: 2646.00, doc: "NRCS Code 383, Scenario 96" },
  { category: "Fuel Break", component: "Steep Slope", unit: "Acre", approved2025: 3026.75, supportedPrice: 3345.79, stoProposed: 3346.00, doc: "NRCS Code 383, Scenario 27" },
  { category: "Fencing", component: "Multistrand Barbed/Smooth Wire (3-4 strand)", unit: "Foot", approved2025: 3.00, supportedPrice: 5.63, stoProposed: 6.00, doc: "CSU Custom Rates (same as CRP)" },
  { category: "Fencing", component: "Multistrand Barbed/Smooth Wire - Difficult Terrain", unit: "Foot", approved2025: 4.00, supportedPrice: 5.63, stoProposed: 8.40, doc: "CSU Custom Rates (same as CRP) — STC Apr 23, 2026 approved at $8.40/ft (40% premium over $6 base fencing rate)" },
  { category: "Fencing", component: "Electric / High Tensile", unit: "Foot", approved2025: 3.00, supportedPrice: 5.63, stoProposed: 6.00, doc: "CSU Custom Rates (same as CRP)" },
];

function fmt(val) {
  if (val === null || val === undefined) return '--';
  if (typeof val === 'string') return val;
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pctChange(old2025, new2026) {
  if (old2025 === null || typeof old2025 === 'string' || typeof new2026 === 'string' || new2026 === null) return null;
  if (old2025 === 0) return new2026 > 0 ? 999 : 0;
  return ((new2026 - old2025) / old2025 * 100);
}

function ChangeBadge({ old2025, new2026 }) {
  const pct = pctChange(old2025, new2026);
  if (pct === null) return null;
  if (Math.abs(pct) < 0.5) return <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>--</span>;
  const color = pct > 0 ? '#dc3545' : '#28a745';
  const arrow = pct > 0 ? '\u25B2' : '\u25BC';
  return (
    <span style={{ color, fontSize: '0.75rem', fontWeight: 600 }}>
      {arrow} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function RateTable({ rates, program, costSharePct }) {
  const [filter, setFilter] = useState('all');
  const [showDoc, setShowDoc] = useState(false);
  const categories = [...new Set(rates.map(r => r.category))];

  const filtered = filter === 'all' ? rates
    : filter === 'retired' ? rates.filter(r => r.retired)
    : filter === 'new' ? rates.filter(r => r.newItem)
    : filter === 'significant' ? rates.filter(r => {
        const pct = pctChange(r.approved2025, r.stoProposed);
        return pct !== null && Math.abs(pct) >= 20;
      })
    : rates.filter(r => r.category === filter);

  const activeCount = rates.filter(r => !r.retired).length;
  const retiredCount = rates.filter(r => r.retired).length;
  const newCount = rates.filter(r => r.newItem).length;
  const significantCount = rates.filter(r => {
    const pct = pctChange(r.approved2025, r.stoProposed);
    return pct !== null && Math.abs(pct) >= 20;
  }).length;

  return (
    <div>
      {/* Stats Row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div className="card" style={{ flex: 1, minWidth: 120, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{activeCount}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Components</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 120, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#28a745' }}>{newCount}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>New for 2026</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 120, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc3545' }}>{significantCount}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Significant Changes (&ge;20%)</div>
        </div>
        {retiredCount > 0 && (
          <div className="card" style={{ flex: 1, minWidth: 120, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6c757d' }}>{retiredCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Retired</div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, marginRight: 4 }}>Filter:</span>
        <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('all')}>All ({rates.length})</button>
        <button className={`btn btn-sm ${filter === 'significant' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('significant')}>Significant Changes ({significantCount})</button>
        {newCount > 0 && <button className={`btn btn-sm ${filter === 'new' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('new')}>New Items ({newCount})</button>}
        {retiredCount > 0 && <button className={`btn btn-sm ${filter === 'retired' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('retired')}>Retired ({retiredCount})</button>}
        <span style={{ borderLeft: '1px solid var(--border)', height: 20, margin: '0 4px' }} />
        {categories.map(cat => (
          <button key={cat} className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(cat)}>{cat}</button>
        ))}
        <span style={{ marginLeft: 'auto' }}>
          <label style={{ fontSize: '0.8rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={showDoc} onChange={() => setShowDoc(!showDoc)} style={{ marginRight: 4 }} />
            Show Documentation
          </label>
        </span>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Component</th>
              <th>Unit</th>
              <th style={{ textAlign: 'right' }}>2025 Approved</th>
              <th style={{ textAlign: 'right' }}>Supported Price</th>
              <th style={{ textAlign: 'right' }}>STO Proposed 2026</th>
              <th style={{ textAlign: 'center' }}>Change</th>
              <th style={{ textAlign: 'center' }}>STC Approved</th>
              {showDoc && <th>Documentation</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const isRetired = r.retired;
              const isNew = r.newItem;
              const pct = pctChange(r.approved2025, r.stoProposed);
              const isSignificant = pct !== null && Math.abs(pct) >= 20;
              return (
                <tr key={i} style={{
                  opacity: isRetired ? 0.5 : 1,
                  textDecoration: isRetired ? 'line-through' : 'none',
                  background: isSignificant ? 'rgba(220,53,69,0.05)' : isNew ? 'rgba(40,167,69,0.05)' : 'transparent',
                }}>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>{r.category}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{r.component}</span>
                    {isNew && <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 700, background: '#d4edda', color: '#155724' }}>NEW</span>}
                    {isRetired && <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 700, background: '#e2e3e5', color: '#383d41' }}>RETIRED</span>}
                  </td>
                  <td>{r.unit || '--'}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{fmt(r.approved2025)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{fmt(r.supportedPrice)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(r.stoProposed)}</td>
                  <td style={{ textAlign: 'center' }}><ChangeBadge old2025={r.approved2025} new2026={r.stoProposed} /></td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>--</td>
                  {showDoc && <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.doc}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CostShareRates() {
  const [activeTab, setActiveTab] = useState('crp');

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Cost Share Rates Review</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            April 2026 STC Meeting - Prepared by Hunter Cleveland
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="card" style={{ marginBottom: 20, borderLeft: '4px solid var(--warning, #f0ad4e)', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ fontSize: '1.2rem' }}>!</span>
          <div>
            <strong>ACTION REQUIRED:</strong> Review proposed 2026 cost share rates below. The STC must approve, modify, or reject each rate at the April meeting.
            <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>Sources:</strong> Pawnee Seed Company, CSU 2024 Custom Rates, NRCS Practice Scenarios, County Office Invoices, CSFS, Schroder Red Angus (Baca County)
            </div>
            <div style={{ marginTop: 4, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>Email from:</strong> Jonathan Weishaar (FSA Staff) &mdash; March 24, 2026
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
        <button
          className={`btn ${activeTab === 'crp' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '8px 0 0 8px', flex: 1, padding: '12px 24px' }}
          onClick={() => setActiveTab('crp')}
        >
          <div style={{ fontSize: '1rem', fontWeight: 700 }}>CRP Cost Share Rates</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>50% Cost Share &mdash; {CRP_RATES.length} components</div>
        </button>
        <button
          className={`btn ${activeTab === 'efrp' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '0 8px 8px 0', flex: 1, padding: '12px 24px' }}
          onClick={() => setActiveTab('efrp')}
        >
          <div style={{ fontSize: '1rem', fontWeight: 700 }}>EFRP Cost Share Rates</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>75% Cost Share &mdash; {EFRP_RATES.length} components</div>
        </button>
      </div>

      {activeTab === 'crp' ? (
        <RateTable rates={CRP_RATES} program="CRP" costSharePct={50} />
      ) : (
        <RateTable rates={EFRP_RATES} program="EFRP" costSharePct={75} />
      )}

      {/* Key Notes */}
      <div className="card" style={{ marginTop: 20, padding: '16px 20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Key Notes for STC Review</h3>
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
          <li><strong>CRP (50% cost share):</strong> {CRP_RATES.length} total components. {CRP_RATES.filter(r => r.retired).length} retired, {CRP_RATES.filter(r => r.newItem).length} new. Rates based on Pawnee Seed Co., CSU Custom Rates, County Office invoices, and NRCS scenarios.</li>
          <li><strong>EFRP (75% cost share):</strong> {EFRP_RATES.length} total components. {EFRP_RATES.filter(r => r.newItem).length} new items added for 2026. Rates based on NRCS practice scenarios and CSFS.</li>
          <li><strong>Significant increases:</strong> Water wells (up ~120-370%), burning (up ~270%), fencing (up ~50-100%), tree establishment (up ~75-350% in EFRP). Most driven by updated NRCS practice scenario rates and real invoice data.</li>
          <li><strong>Retired components:</strong> CP8A Grading/Shaping and 3 Brush Management items retired from CRP due to non-utilization or handbook ineligibility.</li>
          <li><strong>Fencing rates identical</strong> between CRP and EFRP (CSU Custom Rates source).</li>
        </ul>
      </div>
    </div>
  );
}
