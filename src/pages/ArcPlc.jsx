import { useState } from "react";
import { Link } from "react-router-dom";
import yieldData from "../data/arc_plc_county_yields.json";

const C = {
  navy: "#0B1F3A", navyMid: "#122C52",
  blue: "#1A4A8A", blueLight: "#DBEAFE",
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

const SECTIONS = [
  { id: "overview",     label: "Overview" },
  { id: "programs",     label: "Programs" },
  { id: "how-paid",     label: "How Producers Get Paid" },
  { id: "reference",    label: "Reference Prices" },
  { id: "colorado",     label: "Colorado Commodities" },
  { id: "county-data",  label: "County Data" },
  { id: "timeline",     label: "Program Timeline" },
  { id: "history",      label: "History & Farm Bills" },
];

// ── 2018 Farm Bill statutory reference prices (crop years 2019-2023, extended into 2024).
//    Source: 7 USC § 9016(c); 2018 Farm Bill; FSA Handbook 1-ARCPLC.
const REF_PRICES_2018 = [
  { code: "0011", crop: "Wheat",                unit: "$/bu",  price: 5.50 },
  { code: "0041", crop: "Corn",                 unit: "$/bu",  price: 3.70 },
  { code: "0051", crop: "Grain Sorghum",        unit: "$/bu",  price: 3.95 },
  { code: "0091", crop: "Barley",               unit: "$/bu",  price: 4.95 },
  { code: "0021", crop: "Oats",                 unit: "$/bu",  price: 2.40 },
  { code: "0081", crop: "Long-Grain Rice",      unit: "$/cwt", price: 14.00 },
  { code: "0082", crop: "Medium-Grain Rice",    unit: "$/cwt", price: 14.00 },
  { code: "0081", crop: "Temperate Japonica",   unit: "$/cwt", price: 16.10 },
  { code: "0081", crop: "Soybeans",             unit: "$/bu",  price: 8.40 },
  { code: "0801", crop: "Peanuts",              unit: "$/ton", price: 535.00 },
  { code: "0064", crop: "Dry Peas",             unit: "$/cwt", price: 11.00 },
  { code: "0065", crop: "Lentils",              unit: "$/cwt", price: 19.97 },
  { code: "0067", crop: "Small Chickpeas",      unit: "$/cwt", price: 19.04 },
  { code: "0068", crop: "Large Chickpeas",      unit: "$/cwt", price: 21.54 },
  { code: "0016", crop: "Canola",               unit: "$/lb",  price: 0.2015 },
  { code: "0027", crop: "Flaxseed",             unit: "$/bu",  price: 11.28 },
  { code: "0071", crop: "Safflower",            unit: "$/lb",  price: 0.2015 },
  { code: "0072", crop: "Sunflower Seed",       unit: "$/lb",  price: 0.2015 },
  { code: "0073", crop: "Mustard",              unit: "$/lb",  price: 0.2015 },
  { code: "0074", crop: "Rapeseed",             unit: "$/lb",  price: 0.2015 },
  { code: "0075", crop: "Sesame",               unit: "$/lb",  price: 0.2015 },
  { code: "0076", crop: "Crambe",               unit: "$/lb",  price: 0.2015 },
  { code: "0230", crop: "Seed Cotton",          unit: "$/lb",  price: 0.367 },
];

// ── Statutory reference prices under the 2024 Farm Bill (One Big Beautiful Bill Act / WFTCA).
//    Increases established for crop year 2025 and forward. Verify against current FSA notice
//    before quoting to producers.
const REF_PRICES_2024 = [
  { crop: "Wheat",                unit: "$/bu",  price: 6.35, delta: "+15.5%" },
  { crop: "Corn",                 unit: "$/bu",  price: 4.10, delta: "+10.8%" },
  { crop: "Grain Sorghum",        unit: "$/bu",  price: 4.40, delta: "+11.4%" },
  { crop: "Barley",               unit: "$/bu",  price: 5.45, delta: "+10.1%" },
  { crop: "Oats",                 unit: "$/bu",  price: 2.65, delta: "+10.4%" },
  { crop: "Long-Grain Rice",      unit: "$/cwt", price: 16.90, delta: "+20.7%" },
  { crop: "Medium-Grain Rice",    unit: "$/cwt", price: 16.90, delta: "+20.7%" },
  { crop: "Soybeans",             unit: "$/bu",  price: 10.00, delta: "+19.0%" },
  { crop: "Peanuts",              unit: "$/ton", price: 630.00, delta: "+17.8%" },
  { crop: "Dry Peas",             unit: "$/cwt", price: 13.10, delta: "+19.1%" },
  { crop: "Lentils",              unit: "$/cwt", price: 23.75, delta: "+18.9%" },
  { crop: "Small Chickpeas",      unit: "$/cwt", price: 22.65, delta: "+19.0%" },
  { crop: "Large Chickpeas",      unit: "$/cwt", price: 25.65, delta: "+19.1%" },
  { crop: "Sunflower Seed",       unit: "$/lb",  price: 0.2400, delta: "+19.1%" },
  { crop: "Seed Cotton",          unit: "$/lb",  price: 0.42, delta: "+14.4%" },
];

// ── Colorado's principal ARC/PLC covered commodities.
//    Ordered by prevalence on the Eastern Plains and San Luis Valley.
const CO_COMMODITIES = [
  { crop: "Winter Wheat",   region: "Eastern Plains (all counties)",       majorCounties: "Weld, Kit Carson, Yuma, Washington, Baca, Prowers, Cheyenne, Kiowa, Lincoln" },
  { crop: "Corn",           region: "Eastern Plains — irrigated + dryland", majorCounties: "Weld, Yuma, Washington, Logan, Phillips, Sedgwick, Kit Carson" },
  { crop: "Grain Sorghum",  region: "Southeastern Plains",                  majorCounties: "Baca, Prowers, Kiowa, Cheyenne, Bent, Lincoln" },
  { crop: "Barley",         region: "San Luis Valley, mountain valleys",    majorCounties: "Alamosa, Rio Grande, Saguache, Conejos, Costilla" },
  { crop: "Sunflower Seed", region: "Eastern Plains",                       majorCounties: "Yuma, Washington, Kit Carson, Weld, Phillips, Sedgwick" },
  { crop: "Dry Peas",       region: "Northeastern Plains",                  majorCounties: "Weld, Logan, Sedgwick, Phillips" },
  { crop: "Soybeans",       region: "Northeastern Plains (limited)",        majorCounties: "Sedgwick, Phillips, Logan" },
  { crop: "Oats",           region: "San Luis Valley, mountain valleys",    majorCounties: "Alamosa, Rio Grande, Saguache" },
];

// ── Payment factor / mechanics constants
const MECHANICS = {
  arcCoGuaranteePct: 86,   // ARC-CO guarantee = 86% of benchmark revenue
  arcCoCapPct: 10,         // Payment cap = 10% of benchmark revenue
  paymentFactor: 85,       // Payments made on 85% of base acres (both ARC & PLC)
  arcIcGuaranteePct: 86,   // ARC-IC guarantee
  arcIcPaymentFactorPct: 65, // ARC-IC pays on 65% of farm base acres (all commodities)
  effectiveRefPriceCapPct: 115, // OBBA raised the escalator cap
};

// ── Timeline / sign-up windows (typical annual pattern)
const TIMELINE = [
  { phase: "Election / Enrollment", when: "Jan – Mar (crop year)",
    detail: "Producers elect ARC-CO, ARC-IC, or PLC per covered commodity per farm. Election is annual under the 2018 Farm Bill; new farm bill continues annual choice." },
  { phase: "Plant Crop",            when: "Spring – Summer",
    detail: "ARC/PLC pays on base acres regardless of what is actually planted (decoupled). Producers can plant any covered crop, non-covered crop, or fallow." },
  { phase: "Harvest",               when: "Fall (crop year)",
    detail: "Marketing year begins for most crops. Wheat marketing year: June 1 – May 31. Corn/soy marketing year: September 1 – August 31." },
  { phase: "MYA Price Determined",  when: "~10 months after harvest",
    detail: "NASS publishes final Marketing Year Average (MYA) price. This is the price used in ARC/PLC calculations." },
  { phase: "County Yield Certified", when: "~12 months after harvest",
    detail: "FSA determines final county yields. STC votes on missing county yields (July 23, 2026 agenda item 6 for Crop Year 2025)." },
  { phase: "Payment Issued",         when: "October – November (of year AFTER crop year)",
    detail: "PLC and ARC payments are issued after MYA price and county yield are final. Payment for Crop Year 2024 = October 2025." },
];

// ── Farm Bill history
const FARM_BILLS = [
  { year: "2014", name: "Agricultural Act of 2014",
    changes: "Established ARC/PLC. Replaced Direct Payments, Counter-Cyclical Payments, and ACRE. Initial reference prices set." },
  { year: "2018", name: "Agriculture Improvement Act of 2018",
    changes: "Continued ARC/PLC. Made election annual (was one-time under 2014). Added escalator making effective reference price = max(statutory ref price, 85% of Olympic 5-yr avg MYA). Payment yields updateable in 2020." },
  { year: "2024", name: "One Big Beautiful Bill Act (OBBA / WFTCA)",
    changes: "Raised statutory reference prices ~15-20% for most commodities. Reference prices apply from crop year 2025 forward. Effective reference price escalator cap raised to 115% (was 115% in 2018 too, but calculation floor changed)." },
];

const COVERED_YEARS = ["2019", "2020", "2021", "2022", "2023", "2024", "2025"];

// ── UI atoms
const SectionTitle = ({ id, children, sub }) => (
  <h2 id={id} style={{ ...serif, color: C.navy, fontSize: 22, fontWeight: 800, margin: "40px 0 6px", scrollMarginTop: 20 }}>
    {children}
    {sub && <span style={{ fontSize: 13, color: C.slate, marginLeft: 10, ...mono, letterSpacing: "0.06em", fontWeight: 400 }}>· {sub}</span>}
  </h2>
);
const Rule = () => <div style={{ height: 3, background: C.gold, width: 60, marginBottom: 20 }} />;
const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: 18, marginBottom: 14, ...style }}>{children}</div>
);
const Chip = ({ bg, c, children }) => (
  <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", background: bg, color: c, ...mono }}>{children}</span>
);
const Label = ({ children }) => (
  <div style={{ fontSize: 10, color: C.slate, fontWeight: 700, ...mono, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{children}</div>
);

// ── Formula box — renders a math-y flow
const Formula = ({ title, lines }) => (
  <div style={{ background: C.navy, borderRadius: 8, padding: "16px 20px", marginBottom: 14 }}>
    <div style={{ color: C.goldLight, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", ...mono, marginBottom: 8 }}>{title}</div>
    {lines.map((line, i) => (
      <div key={i} style={{ color: "#fff", fontSize: 13, ...mono, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
        {line.label && <span style={{ color: C.slateLight }}>{line.label}: </span>}
        {line.text}
      </div>
    ))}
  </div>
);

// ── Sparkline: compact SVG line chart for inline table use.
//    Handles null values by breaking the polyline into segments.
//    Single-point series render as a labeled dot (common for CY 2025 seed data).
function Sparkline({ series, years, width = 140, height = 34 }) {
  const values = years.map(y => series.years[y]);
  const known = values.map((v, i) => ({ v, i })).filter(o => o.v != null);
  if (known.length === 0) {
    return <div style={{ fontSize: 10, color: C.slate, ...mono, width, textAlign: "center", paddingTop: 8 }}>[no data]</div>;
  }
  const min = Math.min(...known.map(o => o.v));
  const max = Math.max(...known.map(o => o.v));
  const range = max - min || 1;
  const stepX = width / Math.max(1, (years.length - 1));
  const points = values.map((v, i) => ({ x: i * stepX, y: v == null ? null : height - ((v - min) / range) * (height - 6) - 3, v }));
  const segments = [];
  let current = [];
  points.forEach(p => {
    if (p.y == null) { if (current.length > 0) { segments.push(current); current = []; } }
    else current.push(p);
  });
  if (current.length > 0) segments.push(current);
  const first = known[0].v;
  const last = known[known.length - 1].v;
  const delta = last - first;
  const color = delta > 0 ? C.green : delta < 0 ? C.red : C.slate;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <svg width={width} height={height} style={{ overflow: "visible" }}>
        {segments.map((seg, i) => seg.length > 1 && (
          <polyline key={i} fill="none" stroke={color} strokeWidth="1.5"
            points={seg.map(p => `${p.x},${p.y}`).join(" ")} />
        ))}
        {points.filter(p => p.y != null).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={known.length === 1 ? "2.5" : "1.6"} fill={color} />
        ))}
      </svg>
      <div style={{ fontSize: 10, color, ...mono, fontWeight: 700, whiteSpace: "nowrap" }}>
        {known.length === 1 ? last.toFixed(known[0].v >= 100 ? 0 : 2) : `${min.toFixed(0)}–${max.toFixed(0)}`}
      </div>
    </div>
  );
}

// ── Detail chart — larger, with axes and value labels
function DetailChart({ series, years }) {
  const width = 620;
  const height = 220;
  const padL = 40, padR = 20, padT = 20, padB = 30;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const values = years.map(y => series.years[y]);
  const known = values.filter(v => v != null);
  if (known.length < 1) return null;
  const min = Math.min(...known);
  const max = Math.max(...known);
  const range = (max - min) || max || 1;
  const yMin = min - range * 0.1;
  const yMax = max + range * 0.1;
  const yRange = yMax - yMin;

  const xAt = i => padL + (i / (years.length - 1)) * plotW;
  const yAt = v => padT + plotH - ((v - yMin) / yRange) * plotH;

  const points = values.map((v, i) => ({ x: xAt(i), y: v == null ? null : yAt(v), val: v }));
  const segments = [];
  let cur = [];
  points.forEach(p => {
    if (p.y == null) { if (cur.length > 0) { segments.push(cur); cur = []; } }
    else cur.push(p);
  });
  if (cur.length > 0) segments.push(cur);

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => yMin + (yRange / ticks) * i);

  return (
    <svg width={width} height={height} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 6 }}>
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={padL} y1={yAt(v)} x2={width - padR} y2={yAt(v)} stroke="#F1F5F9" strokeWidth="1" />
          <text x={padL - 6} y={yAt(v) + 3} fontSize="10" fill={C.slate} textAnchor="end" fontFamily="'IBM Plex Mono', monospace">{v.toFixed(0)}</text>
        </g>
      ))}
      {years.map((y, i) => (
        <text key={y} x={xAt(i)} y={height - padB + 14} fontSize="10" fill={C.slate} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace">{y}</text>
      ))}
      {segments.map((seg, i) => (
        <polyline key={i} fill="none" stroke={C.blue} strokeWidth="2" points={seg.map(p => `${p.x},${p.y}`).join(" ")} />
      ))}
      {points.filter(p => p.y != null).map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill={C.blue} />
          <text x={p.x} y={p.y - 8} fontSize="10" fill={C.navy} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontWeight="700">{p.val.toFixed(0)}</text>
        </g>
      ))}
    </svg>
  );
}

export default function ArcPlc() {
  const [scrollTo] = useState(() => (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  const [selectedSeries, setSelectedSeries] = useState(yieldData.series[0]);
  const [commodityFilter, setCommodityFilter] = useState("all");
  const dataYears = yieldData.years;
  const hasData = (s) => Object.values(s.years).some(v => v != null);
  const commodityKey = (s) => s.commodity.replace(/\s*\(.*\)$/, "").trim();
  const allCommodities = ["all", ...Array.from(new Set(yieldData.series.map(commodityKey))).sort()];
  const filteredSeries = commodityFilter === "all" ? yieldData.series : yieldData.series.filter(s => commodityKey(s) === commodityFilter);

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{ background: C.navy, padding: "11px 28px", color: C.goldLight, fontSize: 12, ...mono, letterSpacing: "0.08em" }}>
        COLORADO STC · FARM SAFETY NET PROGRAMS
      </div>

      {/* Header */}
      <div style={{ background: C.navyMid, padding: "32px 28px 24px", borderBottom: `4px solid ${C.gold}` }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ color: C.goldLight, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", ...mono, marginBottom: 6 }}>
            USDA Farm Service Agency · 7 USC § 9016 & § 9017
          </div>
          <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800, margin: "0 0 10px", ...serif }}>ARC &amp; PLC</h1>
          <p style={{ color: C.slateLight, fontSize: 15, lineHeight: 1.6, maxWidth: 720, margin: 0 }}>
            Agriculture Risk Coverage and Price Loss Coverage — the two core Title I commodity safety-net programs.
            Producers elect one per covered commodity per farm each year. Payments are made on 85% of base acres,
            regardless of what is actually planted.
          </p>
        </div>
      </div>

      {/* Sticky sub-nav */}
      <div style={{ position: "sticky", top: 0, background: "#fff", borderBottom: `1px solid ${C.border}`, zIndex: 10 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "10px 20px", display: "flex", flexWrap: "wrap", gap: 4 }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)}
              style={{ background: "none", border: "none", color: C.navy, fontSize: 12, fontWeight: 700, ...mono, letterSpacing: "0.04em", padding: "6px 10px", borderRadius: 4, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = C.blueLight}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 20px 60px" }}>

        {/* ── OVERVIEW ─────────────────────────────────────────────── */}
        <SectionTitle id="overview">Overview</SectionTitle>
        <Rule />
        <Card>
          <p style={{ fontSize: 14.5, color: C.navy, lineHeight: 1.75, margin: 0 }}>
            <strong>Both ARC and PLC are commodity title programs.</strong> They are triggered by either county-average
            revenue falling below a benchmark (ARC-CO) or by the national marketing-year average price falling below a
            statutory reference price (PLC). Producers do NOT need to plant the crop to receive a payment — payments are
            based on <strong>base acres</strong>, which are historical. Producers plant whatever makes economic sense that
            year and still receive an ARC or PLC payment on their base acres if the trigger is met.
          </p>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <Card>
            <Label>Trigger</Label>
            <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.6 }}>
              <div><strong>PLC:</strong> National MYA price below statutory reference price.</div>
              <div style={{ marginTop: 6 }}><strong>ARC-CO:</strong> County revenue below 86% of benchmark revenue.</div>
              <div style={{ marginTop: 6 }}><strong>ARC-IC:</strong> Farm revenue below 86% of benchmark, aggregated across all covered crops on all ARC-IC farms.</div>
            </div>
          </Card>
          <Card>
            <Label>Payment basis</Label>
            <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.6 }}>
              85% of base acres (ARC-CO and PLC).<br />
              65% of base acres (ARC-IC — reflects that ARC-IC covers all crops).<br />
              Base acres are historical and are not tied to what was actually planted.
            </div>
          </Card>
          <Card>
            <Label>Election</Label>
            <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.6 }}>
              Per covered commodity per farm, annually. A single farm can have (for example) wheat in PLC and corn in ARC-CO for the same crop year.
            </div>
          </Card>
          <Card>
            <Label>Sign-up window</Label>
            <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.6 }}>
              Typically opens January of the crop year, closes March 15 (window varies by farm bill and year — confirm current window with local FSA office).
            </div>
          </Card>
        </div>

        {/* ── PROGRAMS ─────────────────────────────────────────────── */}
        <SectionTitle id="programs">The Three Programs</SectionTitle>
        <Rule />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
          <Card style={{ borderTop: `4px solid ${C.green}` }}>
            <Chip bg={C.greenBg} c={C.green}>PLC</Chip>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, ...serif, marginTop: 6 }}>Price Loss Coverage</div>
            <div style={{ fontSize: 12, color: C.slate, marginTop: 3 }}>Price-only trigger</div>
            <p style={{ fontSize: 12.5, color: C.navy, lineHeight: 1.65, marginTop: 10 }}>
              Pays when the national MYA price for the commodity falls below the effective reference price. Payments do not depend on county or farm yields for the trigger — only on national price. However, the payment amount uses the farm's PLC payment yield.
            </p>
            <div style={{ marginTop: 10, fontSize: 11, color: C.slate, ...mono }}>Best fit: high-reference-price crops where the price is the primary risk (peanuts, rice, wheat in some years).</div>
          </Card>
          <Card style={{ borderTop: `4px solid ${C.blue}` }}>
            <Chip bg={C.blueLight} c={C.blue}>ARC-CO</Chip>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, ...serif, marginTop: 6 }}>ARC — County</div>
            <div style={{ fontSize: 12, color: C.slate, marginTop: 3 }}>County revenue trigger</div>
            <p style={{ fontSize: 12.5, color: C.navy, lineHeight: 1.65, marginTop: 10 }}>
              Pays when actual county revenue (county yield × MYA price) falls below 86% of the county's benchmark revenue. Payment is capped at 10% of benchmark. The trigger uses county-average yield, not the individual farm's yield.
            </p>
            <div style={{ marginTop: 10, fontSize: 11, color: C.slate, ...mono }}>Best fit: crops where yield loss and price loss can compound (corn, soybeans, wheat in drought-prone areas). Most common Colorado election.</div>
          </Card>
          <Card style={{ borderTop: `4px solid ${C.purple}` }}>
            <Chip bg={C.purpleBg} c={C.purple}>ARC-IC</Chip>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, ...serif, marginTop: 6 }}>ARC — Individual</div>
            <div style={{ fontSize: 12, color: C.slate, marginTop: 3 }}>Farm-level revenue trigger</div>
            <p style={{ fontSize: 12.5, color: C.navy, lineHeight: 1.65, marginTop: 10 }}>
              Pays when farm-level revenue (aggregated across ALL covered crops planted on ALL of the producer's ARC-IC farms in the state) falls below 86% of benchmark. Payments made on 65% of base acres. All crops on the farm are covered under ARC-IC — cannot split.
            </p>
            <div style={{ marginTop: 10, fontSize: 11, color: C.slate, ...mono }}>Best fit: rare — producers whose farm yields differ substantially from county averages and who accept the 65% payment factor. Uncommon in Colorado.</div>
          </Card>
        </div>

        {/* ── HOW PAID ─────────────────────────────────────────────── */}
        <SectionTitle id="how-paid">How Producers Get Paid</SectionTitle>
        <Rule />
        <Card>
          <p style={{ fontSize: 14, color: C.navy, lineHeight: 1.75, margin: 0 }}>
            Payments are made after the marketing year ends and after the MYA price and (for ARC-CO) the county yield are finalized. That means <strong>the payment for Crop Year 2024 arrives in October 2025</strong> — roughly a 12-14 month lag from harvest to check.
          </p>
        </Card>

        <Formula title="PLC Payment Formula"
          lines={[
            { label: "Effective Reference Price", text: "= max(statutory reference price, 85% × 5-yr Olympic avg MYA)" },
            { label: "Effective Price",           text: "= max(national MYA price, national loan rate)" },
            { label: "Payment Rate",              text: "= max(0, Effective Reference Price − Effective Price)" },
            { label: "Payment",                   text: "= Payment Rate × PLC Payment Yield × Base Acres × 85%" },
          ]} />

        <Formula title="ARC-CO Payment Formula"
          lines={[
            { label: "Benchmark Yield",  text: "= Olympic average of most recent 5 crop-year county yields" },
            { label: "Benchmark Price",  text: "= Olympic average of most recent 5 crop-year MYA prices, floored at statutory ref price" },
            { label: "Benchmark Revenue",text: "= Benchmark Yield × Benchmark Price" },
            { label: "Guarantee",        text: "= 86% × Benchmark Revenue" },
            { label: "Actual Revenue",   text: "= actual county yield × max(actual MYA price, national loan rate)" },
            { label: "Payment Rate",     text: "= min(Guarantee − Actual Revenue, 10% × Benchmark Revenue)  [floored at 0]" },
            { label: "Payment",          text: "= Payment Rate × Base Acres × 85%" },
          ]} />

        <Card>
          <Label>Olympic average — what it means</Label>
          <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.7 }}>
            The most recent 5 crop years, with the highest and lowest values thrown out, then the middle 3 averaged. This smooths out one anomalous year (a drought or a boom) so the benchmark reflects normal performance.
          </div>
        </Card>

        <Card>
          <Label>Yield vs Revenue triggers</Label>
          <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.7 }}>
            <strong>Yield failure alone does not trigger PLC.</strong> PLC only pays if the national price falls below the reference price. A Colorado producer whose county gets hit by drought and loses half their corn crop but sees corn prices stay strong nationally will NOT get a PLC payment — but MAY get an ARC-CO payment because their county revenue fell.
            <br /><br />
            Conversely, ARC-CO does not pay in a year with normal county yields but weak national prices — the revenue may still stay above 86% of benchmark. PLC would pay in that case.
            <br /><br />
            Producers choose based on which risk (price vs county revenue) they think dominates over the life of the farm bill.
          </div>
        </Card>

        {/* ── REFERENCE PRICES ─────────────────────────────────────── */}
        <SectionTitle id="reference" sub="statutory & effective">Reference Prices</SectionTitle>
        <Rule />
        <p style={{ fontSize: 13.5, color: C.navy, lineHeight: 1.7, marginBottom: 16 }}>
          The <strong>statutory reference price</strong> is set by Congress in each Farm Bill. The <strong>effective reference price</strong>
          used in the PLC calculation is the greater of the statutory price or 85% of the 5-year Olympic average MYA price — with a
          cap at 115% of the statutory price. When market prices run high for several years, the effective reference price
          escalates; when they collapse, it stays at the statutory floor.
        </p>

        <h3 style={{ ...serif, fontSize: 16, color: C.navy, margin: "20px 0 10px" }}>2018 Farm Bill — Crop Years 2019 through 2024</h3>
        <div style={{ overflowX: "auto", marginBottom: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, ...mono, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 6 }}>
            <thead>
              <tr style={{ background: C.navy, color: "#fff" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, letterSpacing: "0.05em" }}>Commodity</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 11, letterSpacing: "0.05em" }}>Statutory Ref Price</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, letterSpacing: "0.05em" }}>Unit</th>
              </tr>
            </thead>
            <tbody>
              {REF_PRICES_2018.map((r, i) => (
                <tr key={r.crop} style={{ background: i % 2 === 0 ? "#F8FAFC" : "#fff", borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "6px 12px", color: C.navy }}>{r.crop}</td>
                  <td style={{ padding: "6px 12px", textAlign: "right", color: C.navy, fontWeight: 700 }}>${r.price.toFixed(r.unit === "$/lb" ? 4 : 2)}</td>
                  <td style={{ padding: "6px 12px", color: C.slate }}>{r.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 10, color: C.slate, ...mono, marginTop: 6 }}>Source: 7 USC § 9016(c) as amended by 2018 Farm Bill; FSA Handbook 1-ARCPLC.</div>
        </div>

        <h3 style={{ ...serif, fontSize: 16, color: C.navy, margin: "26px 0 10px" }}>2024 Farm Bill (OBBA / WFTCA) — Crop Year 2025 forward</h3>
        <div style={{ background: C.amberBg, border: `1px solid ${C.amber}`, borderRadius: 6, padding: "10px 14px", marginBottom: 14, fontSize: 12.5, color: C.navy, lineHeight: 1.6 }}>
          ⚠ These are the updated statutory reference prices established by the 2024 Farm Bill. <strong>Verify against the current FSA notice before quoting to producers</strong> — the values in this table are the rates published in the enacted legislation and are subject to any implementing rules.
        </div>
        <div style={{ overflowX: "auto", marginBottom: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, ...mono, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 6 }}>
            <thead>
              <tr style={{ background: C.navy, color: "#fff" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, letterSpacing: "0.05em" }}>Commodity</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 11, letterSpacing: "0.05em" }}>2024 Farm Bill Ref Price</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, letterSpacing: "0.05em" }}>Unit</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 11, letterSpacing: "0.05em" }}>Change vs 2018</th>
              </tr>
            </thead>
            <tbody>
              {REF_PRICES_2024.map((r, i) => (
                <tr key={r.crop} style={{ background: i % 2 === 0 ? "#F8FAFC" : "#fff", borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "6px 12px", color: C.navy }}>{r.crop}</td>
                  <td style={{ padding: "6px 12px", textAlign: "right", color: C.navy, fontWeight: 700 }}>${r.price.toFixed(r.unit === "$/lb" ? 4 : 2)}</td>
                  <td style={{ padding: "6px 12px", color: C.slate }}>{r.unit}</td>
                  <td style={{ padding: "6px 12px", textAlign: "right", color: C.green, fontWeight: 700 }}>{r.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── COLORADO ─────────────────────────────────────────────── */}
        <SectionTitle id="colorado">Colorado — Principal Covered Commodities</SectionTitle>
        <Rule />
        <p style={{ fontSize: 13.5, color: C.navy, lineHeight: 1.7, marginBottom: 14 }}>
          Colorado's covered-commodity base acres concentrate in a handful of crops. Wheat is the single largest,
          spread across the Eastern Plains. Corn base is largest in the northeastern irrigation belt (Weld, Yuma, Washington,
          Logan). Grain sorghum concentrates in the southeast (Baca, Prowers). Barley is the San Luis Valley story.
        </p>
        <div style={{ overflowX: "auto", marginBottom: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 6 }}>
            <thead>
              <tr style={{ background: C.navy, color: "#fff" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, letterSpacing: "0.05em", ...mono }}>Commodity</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, letterSpacing: "0.05em", ...mono }}>Production Region</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, letterSpacing: "0.05em", ...mono }}>Major Counties</th>
              </tr>
            </thead>
            <tbody>
              {CO_COMMODITIES.map((r, i) => (
                <tr key={r.crop} style={{ background: i % 2 === 0 ? "#F8FAFC" : "#fff", borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "8px 12px", color: C.navy, fontWeight: 700, ...serif }}>{r.crop}</td>
                  <td style={{ padding: "8px 12px", color: C.navy, fontSize: 12 }}>{r.region}</td>
                  <td style={{ padding: "8px 12px", color: C.slate, fontSize: 11.5, ...mono }}>{r.majorCounties}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── COUNTY DATA ──────────────────────────────────────────── */}
        <SectionTitle id="county-data" sub="crop year × county × commodity">Colorado County Data</SectionTitle>
        <Rule />
        <Card style={{ background: C.blueLight, border: `1px solid ${C.blue}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 18 }}>ℹ</span>
            <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.65 }}>
              <strong>Data source pending FSA import.</strong> The complete county-yield and county-payment history for ARC/PLC from crop year 2014 forward is published by FSA and available for import. The July 23, 2026 STC agenda includes item 6 — "ARC/PLC 2025 DAFP Yield Solicitation" — where the STC votes on missing 2025 county yields. Once that vote is recorded and the FSA county-yield tables are downloaded, they can populate this section.
              <br /><br />
              To populate this section: (a) FSA publishes county yields at <span style={{ ...mono }}>fsa.usda.gov / Economic and Policy Analysis / ARC-PLC County Data</span>; (b) county-payment totals appear in the annual FSA county-payment reports. Both can be reduced to a simple <span style={{ ...mono }}>arc_plc_county_data.json</span> with rows of <span style={{ ...mono }}>{"{ year, county, commodity, program, yield, mya_price, payment_rate, payment_total }"}</span>.
            </div>
          </div>
        </Card>

        <h3 style={{ ...serif, fontSize: 16, color: C.navy, margin: "20px 0 10px" }}>Yield Detail — {selectedSeries.county} / {selectedSeries.commodity}</h3>
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 6, padding: 14, marginBottom: 14 }}>
          {hasData(selectedSeries) ? (
            <>
              <DetailChart series={selectedSeries} years={dataYears} />
              <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 11, color: C.slate, ...mono }}>
                <span>{selectedSeries.unit}</span>
                {selectedSeries.source && <span>Source: {selectedSeries.source}</span>}
              </div>
            </>
          ) : (
            <div style={{ padding: "40px 20px", textAlign: "center", color: C.slate, ...serif, fontSize: 14 }}>
              No data imported yet for {selectedSeries.county} / {selectedSeries.commodity}.
              Populate <span style={{ ...mono }}>src/data/arc_plc_county_yields.json</span> from FSA county-yield tables.
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, margin: "20px 0 10px" }}>
          <h3 style={{ ...serif, fontSize: 16, color: C.navy, margin: 0 }}>All Series ({filteredSeries.length}) — Click a Row to View Detail</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 11, color: C.slate, ...mono, textTransform: "uppercase", letterSpacing: "0.06em" }}>Commodity</label>
            <select value={commodityFilter} onChange={e => setCommodityFilter(e.target.value)}
              style={{ padding: "6px 10px", border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 12, ...mono, color: C.navy }}>
              {allCommodities.map(c => <option key={c} value={c}>{c === "all" ? "All commodities" : c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ overflowX: "auto", marginBottom: 14 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 6 }}>
            <thead>
              <tr style={{ background: C.navy, color: "#fff" }}>
                <th style={{ padding: "7px 10px", textAlign: "left", fontSize: 10, letterSpacing: "0.05em", ...mono }}>County</th>
                <th style={{ padding: "7px 10px", textAlign: "left", fontSize: 10, letterSpacing: "0.05em", ...mono }}>Commodity</th>
                <th style={{ padding: "7px 10px", textAlign: "left", fontSize: 10, letterSpacing: "0.05em", ...mono }}>Unit</th>
                <th style={{ padding: "7px 10px", textAlign: "left", fontSize: 10, letterSpacing: "0.05em", ...mono }}>Trend {dataYears[0]}–{dataYears[dataYears.length - 1]}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSeries.map((s, i) => {
                const active = s === selectedSeries;
                const populated = hasData(s);
                return (
                  <tr key={`${s.county}-${s.commodity}`}
                    onClick={() => setSelectedSeries(s)}
                    style={{
                      background: active ? C.blueLight : i % 2 === 0 ? "#F8FAFC" : "#fff",
                      borderBottom: `1px solid ${C.border}`,
                      cursor: "pointer",
                    }}>
                    <td style={{ padding: "6px 10px", color: C.navy, fontWeight: 700, ...serif }}>
                      {s.county === "Colorado (State)" && <span style={{ display: "inline-block", background: C.gold, color: "#fff", padding: "1px 5px", borderRadius: 3, fontSize: 9, marginRight: 5, ...mono }}>STATE</span>}
                      {s.county}
                    </td>
                    <td style={{ padding: "6px 10px", color: C.navy }}>{s.commodity}</td>
                    <td style={{ padding: "6px 10px", color: C.slate, fontSize: 11, ...mono }}>{s.unit}</td>
                    <td style={{ padding: "6px 10px" }}>
                      {populated ? <Sparkline series={s} years={dataYears} /> : <span style={{ color: C.amber, fontSize: 10, ...mono }}>[FSA import pending]</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ fontSize: 10, color: C.slate, ...mono, marginTop: 6 }}>
            State-level rows (Colorado) are seeded from NASS QuickStats as reference. County-level rows populate from FSA ARC-CO yield data — the July 23 STC votes on missing 2025 county yields (Regular Session item 6).
          </div>
        </div>

        <Card>
          <Label>Cross-reference — July 23, 2026 meeting</Label>
          <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.7 }}>
            The July 23 Regular Session includes <strong>ARC/PLC — 2025 DAFP Yield Solicitation</strong> (item 6, Doug Andresen presenting).
            The STC will vote on missing 2025 county yields for corn, flaxseed, grain sorghum, peanuts, and sunflower seed (Exhibit 1 also includes soybeans).
            Authority: <span style={{ ...mono }}>1-ARCPLC ¶134</span>. Benchmark uses the Olympic average of 5 crop years (2019-2023) for the 2025 program year.
            {" "}
            <Link to="/board-meetings/2026-07-23" style={{ color: C.blue, ...mono, fontSize: 12 }}>→ View meeting</Link>
          </div>
        </Card>

        {/* ── TIMELINE ─────────────────────────────────────────────── */}
        <SectionTitle id="timeline">Program Timeline</SectionTitle>
        <Rule />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {TIMELINE.map((t, i) => (
            <div key={t.phase} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ flexShrink: 0, background: C.navy, color: C.goldLight, borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, ...mono }}>{i + 1}</div>
              <div style={{ flex: 1, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, ...serif }}>{t.phase}</div>
                  <Chip bg={C.amberBg} c={C.amber}>{t.when}</Chip>
                </div>
                <div style={{ fontSize: 12.5, color: C.navy, lineHeight: 1.6 }}>{t.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── HISTORY ──────────────────────────────────────────────── */}
        <SectionTitle id="history">History &amp; Farm Bill Changes</SectionTitle>
        <Rule />
        {FARM_BILLS.map(fb => (
          <Card key={fb.year}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: C.gold, ...serif }}>{fb.year}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.navy, ...serif }}>{fb.name}</span>
            </div>
            <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.7 }}>{fb.changes}</div>
          </Card>
        ))}

        <Card>
          <Label>What changed between generations of these programs</Label>
          <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.75 }}>
            The 2014 Farm Bill replaced <strong>Direct Payments</strong> (paid regardless of price or yield) and
            <strong> Counter-Cyclical Payments</strong> (price-triggered) with ARC and PLC — moving the safety net from an
            entitlement to a triggered payment tied to actual market conditions. The 2018 Farm Bill made election annual
            (was originally locked for the life of the farm bill) and added the effective-reference-price escalator so
            reference prices could rise with market prices, up to 115% of the statutory floor. The 2024 Farm Bill increased
            statutory reference prices by roughly 15-20% across most commodities — the largest across-the-board increase
            since the programs were created.
          </div>
        </Card>

        <Card>
          <Label>Payment limits</Label>
          <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.7 }}>
            <strong>$125,000 per person or legal entity per year</strong> for ARC and PLC payments combined (separate limit for peanuts). Adjusted Gross Income cap: producers with average AGI over $900,000 are generally ineligible for ARC/PLC payments (with exceptions under the 2024 Farm Bill for producers deriving 75%+ of AGI from farming).
          </div>
        </Card>

        {/* Footer */}
        <div style={{ marginTop: 40, padding: "16px 0", borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.slate, ...mono, lineHeight: 1.6 }}>
          Sources: 7 USC §§ 9016-9017; 2014, 2018, 2024 Farm Bills; FSA Handbook 1-ARCPLC (Rev. 5); FSA Economic and Policy Analysis county data.
          <br />
          For producer-specific questions, refer to the local FSA county office. This page is a reference for STC deliberation and is not a producer-facing benefits calculation.
        </div>
      </div>
    </div>
  );
}
