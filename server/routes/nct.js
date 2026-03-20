import { Router } from 'express';
import { getAccessToken, getSiteId, getDriveId } from '../services/graph.js';
import fetch from 'node-fetch';

const router = Router();
const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';
const DATA_FILE = 'nct_2026.json';

/*
 * 2026 NAP NCT — All Crops, All Counties
 * Source: 2026_NAP_NCT_All_Crops_All_Counties_dates_and_factors_260219.xlsx
 * As of: 2026-02-19
 * Total: 3,353 data rows across 64 counties and 73 crops
 *
 * Field mapping from source spreadsheet:
 *   County Name → county
 *   Crop Name → crop
 *   Crop Type → cropType
 *   Intended Use → intendedUse (GZ=Grazing, GR=Grain, FH=Fresh Harvest, etc.)
 *   Practice → practice (I=Irrigated, N=Non-irrigated)
 *   Unit of Measure → unitOfMeasure (AUD, BU, CWT, LB, TON, etc.)
 *   NAP CEY → napCEY (null for grazing/AUD rows)
 *   NAP Market Price → marketPrice
 *   Prevented Planting Factor → ppFactor
 *   Unharvested Payment Factor → uhFactor
 *   Animal Acres → animalAcres (operative for grazing rows)
 *   Grazing Days → grazingDays (operative for grazing rows)
 *   Final Planting Date → finalPlantingDate (null for grazing rows)
 *   Normal Harvest Date → normalHarvestDate
 *   Application Closing Date → applicationClosingDate
 *   Certified Organic Yield Factor → certifiedOrganicYieldFactor
 *   Transitional Yield Factor → transitionalYieldFactor
 */

// Seed data — representative sample (Adams County)
// Full dataset (3,353 rows) loaded from OneDrive when available
const SEED_DATA = {
  metadata: {
    sourceFile: '2026_NAP_NCT_All_Crops_All_Counties_dates_and_factors_260219.xlsx',
    asOfDate: '2026-02-19',
    totalCounties: 64,
    totalCrops: 73,
    totalRows: 3353,
    notes: [
      'napCEY is null for all grazing/AUD rows — animalAcres and grazingDays are the operative values',
      'finalPlantingDate is null for grazing-intended-use rows',
      'certifiedOrganicYieldFactor and transitionalYieldFactor are null for grazing rows',
      'No prior year comparison data in source file',
      'Dates formatted YYYY-MM-DD',
      'applicationClosingDate for many grazing crops is 2025-12-01 (prior-cycle deadline carried into 2026 file)',
    ],
  },
  records: [
    // Adams County — full sample (47 records in source)
    { county: 'Adams', crop: 'ALFALFA', cropType: null, intendedUse: 'GZ', practice: 'I', unitOfMeasure: 'AUD', napCEY: null, marketPrice: 1.4099, ppFactor: 0, uhFactor: 1, animalAcres: 0.5, grazingDays: 180, finalPlantingDate: null, normalHarvestDate: '2026-10-15', applicationClosingDate: '2025-12-01', certifiedOrganicYieldFactor: null, transitionalYieldFactor: null },
    { county: 'Adams', crop: 'ALFALFA', cropType: null, intendedUse: 'GZ', practice: 'N', unitOfMeasure: 'AUD', napCEY: null, marketPrice: 1.4099, ppFactor: 0, uhFactor: 1, animalAcres: 2, grazingDays: 180, finalPlantingDate: null, normalHarvestDate: '2026-10-15', applicationClosingDate: '2025-12-01', certifiedOrganicYieldFactor: null, transitionalYieldFactor: null },
    { county: 'Adams', crop: 'BARLEY', cropType: 'WTR', intendedUse: 'GR', practice: 'I', unitOfMeasure: 'BU', napCEY: 64, marketPrice: 4.34, ppFactor: 0.77, uhFactor: 0.93, animalAcres: null, grazingDays: 0, finalPlantingDate: '2025-10-31', normalHarvestDate: '2026-10-31', applicationClosingDate: '2025-09-30', certifiedOrganicYieldFactor: 0.66, transitionalYieldFactor: 0.66 },
    { county: 'Adams', crop: 'BARLEY', cropType: 'WTR', intendedUse: 'GR', practice: 'N', unitOfMeasure: 'BU', napCEY: 40, marketPrice: 4.34, ppFactor: 0.77, uhFactor: 0.93, animalAcres: null, grazingDays: 0, finalPlantingDate: '2025-10-31', normalHarvestDate: '2026-10-31', applicationClosingDate: '2025-09-30', certifiedOrganicYieldFactor: 0.66, transitionalYieldFactor: 0.66 },
    { county: 'Adams', crop: 'CORN', cropType: null, intendedUse: 'GR', practice: 'I', unitOfMeasure: 'BU', napCEY: 170, marketPrice: 4.10, ppFactor: 0.58, uhFactor: 0.85, animalAcres: null, grazingDays: 0, finalPlantingDate: '2026-06-05', normalHarvestDate: '2026-11-25', applicationClosingDate: '2026-03-15', certifiedOrganicYieldFactor: 0.73, transitionalYieldFactor: 0.73 },
    { county: 'Adams', crop: 'CORN', cropType: null, intendedUse: 'GR', practice: 'N', unitOfMeasure: 'BU', napCEY: 45, marketPrice: 4.10, ppFactor: 0.58, uhFactor: 0.85, animalAcres: null, grazingDays: 0, finalPlantingDate: '2026-06-05', normalHarvestDate: '2026-11-25', applicationClosingDate: '2026-03-15', certifiedOrganicYieldFactor: 0.73, transitionalYieldFactor: 0.73 },
    { county: 'Adams', crop: 'FORAGE PRODUCTION', cropType: null, intendedUse: 'FH', practice: 'I', unitOfMeasure: 'TON', napCEY: 4.5, marketPrice: 195, ppFactor: 0.6, uhFactor: 0.85, animalAcres: null, grazingDays: 0, finalPlantingDate: '2026-05-31', normalHarvestDate: '2026-10-15', applicationClosingDate: '2026-03-15', certifiedOrganicYieldFactor: 1, transitionalYieldFactor: 1 },
    { county: 'Adams', crop: 'FORAGE PRODUCTION', cropType: null, intendedUse: 'FH', practice: 'N', unitOfMeasure: 'TON', napCEY: 1, marketPrice: 195, ppFactor: 0.6, uhFactor: 0.85, animalAcres: null, grazingDays: 0, finalPlantingDate: '2026-05-31', normalHarvestDate: '2026-10-15', applicationClosingDate: '2026-03-15', certifiedOrganicYieldFactor: 1, transitionalYieldFactor: 1 },
    { county: 'Adams', crop: 'FORAGE PRODUCTION', cropType: null, intendedUse: 'GZ', practice: 'I', unitOfMeasure: 'AUD', napCEY: null, marketPrice: 1.4099, ppFactor: 0, uhFactor: 1, animalAcres: 0.5, grazingDays: 180, finalPlantingDate: null, normalHarvestDate: '2026-10-15', applicationClosingDate: '2025-12-01', certifiedOrganicYieldFactor: null, transitionalYieldFactor: null },
    { county: 'Adams', crop: 'FORAGE PRODUCTION', cropType: null, intendedUse: 'GZ', practice: 'N', unitOfMeasure: 'AUD', napCEY: null, marketPrice: 1.4099, ppFactor: 0, uhFactor: 1, animalAcres: 2, grazingDays: 180, finalPlantingDate: null, normalHarvestDate: '2026-10-15', applicationClosingDate: '2025-12-01', certifiedOrganicYieldFactor: null, transitionalYieldFactor: null },
    { county: 'Adams', crop: 'GRASS', cropType: null, intendedUse: 'FH', practice: 'I', unitOfMeasure: 'TON', napCEY: 4.5, marketPrice: 195, ppFactor: 0.6, uhFactor: 0.85, animalAcres: null, grazingDays: 0, finalPlantingDate: '2026-05-31', normalHarvestDate: '2026-10-15', applicationClosingDate: '2026-03-15', certifiedOrganicYieldFactor: 1, transitionalYieldFactor: 1 },
    { county: 'Adams', crop: 'GRASS', cropType: null, intendedUse: 'FH', practice: 'N', unitOfMeasure: 'TON', napCEY: 1, marketPrice: 195, ppFactor: 0.6, uhFactor: 0.85, animalAcres: null, grazingDays: 0, finalPlantingDate: '2026-05-31', normalHarvestDate: '2026-10-15', applicationClosingDate: '2026-03-15', certifiedOrganicYieldFactor: 1, transitionalYieldFactor: 1 },
    { county: 'Adams', crop: 'GRASS', cropType: null, intendedUse: 'GZ', practice: 'I', unitOfMeasure: 'AUD', napCEY: null, marketPrice: 1.4099, ppFactor: 0, uhFactor: 1, animalAcres: 0.5, grazingDays: 180, finalPlantingDate: null, normalHarvestDate: '2026-10-15', applicationClosingDate: '2025-12-01', certifiedOrganicYieldFactor: null, transitionalYieldFactor: null },
    { county: 'Adams', crop: 'GRASS', cropType: null, intendedUse: 'GZ', practice: 'N', unitOfMeasure: 'AUD', napCEY: null, marketPrice: 1.4099, ppFactor: 0, uhFactor: 1, animalAcres: 2, grazingDays: 180, finalPlantingDate: null, normalHarvestDate: '2026-10-15', applicationClosingDate: '2025-12-01', certifiedOrganicYieldFactor: null, transitionalYieldFactor: null },
    { county: 'Adams', crop: 'MILLET', cropType: 'PRO', intendedUse: 'GR', practice: 'I', unitOfMeasure: 'CWT', napCEY: 35, marketPrice: 14, ppFactor: 0.55, uhFactor: 0.85, animalAcres: null, grazingDays: 0, finalPlantingDate: '2026-07-10', normalHarvestDate: '2026-10-31', applicationClosingDate: '2026-03-15', certifiedOrganicYieldFactor: 0.73, transitionalYieldFactor: 0.73 },
    { county: 'Adams', crop: 'MILLET', cropType: 'PRO', intendedUse: 'GR', practice: 'N', unitOfMeasure: 'CWT', napCEY: 15, marketPrice: 14, ppFactor: 0.55, uhFactor: 0.85, animalAcres: null, grazingDays: 0, finalPlantingDate: '2026-07-10', normalHarvestDate: '2026-10-31', applicationClosingDate: '2026-03-15', certifiedOrganicYieldFactor: 0.73, transitionalYieldFactor: 0.73 },
    { county: 'Adams', crop: 'OATS', cropType: null, intendedUse: 'GR', practice: 'I', unitOfMeasure: 'BU', napCEY: 75, marketPrice: 3.07, ppFactor: 0.65, uhFactor: 0.9, animalAcres: null, grazingDays: 0, finalPlantingDate: '2026-04-30', normalHarvestDate: '2026-09-30', applicationClosingDate: '2026-03-15', certifiedOrganicYieldFactor: 0.73, transitionalYieldFactor: 0.73 },
    { county: 'Adams', crop: 'OATS', cropType: null, intendedUse: 'GR', practice: 'N', unitOfMeasure: 'BU', napCEY: 45, marketPrice: 3.07, ppFactor: 0.65, uhFactor: 0.9, animalAcres: null, grazingDays: 0, finalPlantingDate: '2026-04-30', normalHarvestDate: '2026-09-30', applicationClosingDate: '2026-03-15', certifiedOrganicYieldFactor: 0.73, transitionalYieldFactor: 0.73 },
  ],
};

// In-memory cache
let cachedData = null;

function getDataFolderPath() {
  const watchFolder = process.env.SHAREPOINT_WATCH_FOLDER || 'FSA - State Committee';
  return `${watchFolder}/data`;
}

async function readNCT() {
  if (cachedData) return cachedData;

  try {
    const token = await getAccessToken();
    const siteId = await getSiteId();
    const driveId = await getDriveId(siteId);
    const folderPath = getDataFolderPath();
    const encodedPath = folderPath.split('/').map(seg => encodeURIComponent(seg)).join('/');
    const encodedFile = encodeURIComponent(DATA_FILE);

    const url = `${GRAPH_BASE}/drives/${driveId}/root:/${encodedPath}/${encodedFile}:/content`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      cachedData = JSON.parse(await response.text());
      return cachedData;
    }

    if (response.status === 404) {
      cachedData = SEED_DATA;
      return cachedData;
    }

    throw new Error(`Graph read error (${response.status})`);
  } catch (err) {
    if (err.message.includes('not configured')) {
      cachedData = SEED_DATA;
      return cachedData;
    }
    throw err;
  }
}

// GET /api/nct — metadata + summary stats
router.get('/', async (req, res) => {
  try {
    const data = await readNCT();
    const records = data.records || [];

    // Compute summary stats
    const counties = [...new Set(records.map(r => r.county))].sort();
    const crops = [...new Set(records.map(r => r.crop))].sort();
    const grazingRecords = records.filter(r => r.intendedUse === 'GZ');
    const grainRecords = records.filter(r => r.intendedUse === 'GR');

    res.json({
      metadata: data.metadata,
      summary: {
        countiesLoaded: counties.length,
        cropsLoaded: crops.length,
        totalRecords: records.length,
        grazingRecords: grazingRecords.length,
        grainRecords: grainRecords.length,
        otherRecords: records.length - grazingRecords.length - grainRecords.length,
        counties,
        crops,
      },
    });
  } catch (err) {
    console.error('GET /api/nct error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/nct/records — query NCT records with optional filters
// ?county=Adams&crop=CORN&intendedUse=GR&practice=I
router.get('/records', async (req, res) => {
  try {
    const data = await readNCT();
    let records = data.records || [];
    const { county, crop, intendedUse, practice } = req.query;

    if (county) records = records.filter(r => r.county.toLowerCase() === county.toLowerCase());
    if (crop) records = records.filter(r => r.crop.toLowerCase() === crop.toLowerCase());
    if (intendedUse) records = records.filter(r => r.intendedUse === intendedUse.toUpperCase());
    if (practice) records = records.filter(r => r.practice === practice.toUpperCase());

    res.json({ count: records.length, records });
  } catch (err) {
    console.error('GET /api/nct/records error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/nct/county/:name — all records for a specific county
router.get('/county/:name', async (req, res) => {
  try {
    const data = await readNCT();
    const records = (data.records || []).filter(
      r => r.county.toLowerCase() === req.params.name.toLowerCase()
    );

    if (records.length === 0) {
      return res.status(404).json({ error: `No records found for county: ${req.params.name}` });
    }

    const crops = [...new Set(records.map(r => r.crop))].sort();
    res.json({ county: records[0].county, totalRecords: records.length, crops, records });
  } catch (err) {
    console.error('GET /api/nct/county error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/nct/crop/:name — all records for a specific crop across all counties
router.get('/crop/:name', async (req, res) => {
  try {
    const data = await readNCT();
    const records = (data.records || []).filter(
      r => r.crop.toLowerCase() === req.params.name.toLowerCase()
    );

    if (records.length === 0) {
      return res.status(404).json({ error: `No records found for crop: ${req.params.name}` });
    }

    const counties = [...new Set(records.map(r => r.county))].sort();
    res.json({ crop: records[0].crop, totalRecords: records.length, counties, records });
  } catch (err) {
    console.error('GET /api/nct/crop error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/nct/upload — replace full dataset (for loading the complete 3,353 rows)
router.post('/upload', async (req, res) => {
  try {
    const { metadata, records } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Request body must include records array' });
    }

    const newData = {
      metadata: metadata || SEED_DATA.metadata,
      records,
    };

    // Try to persist to OneDrive
    try {
      const token = await getAccessToken();
      const siteId = await getSiteId();
      const driveId = await getDriveId(siteId);
      const folderPath = getDataFolderPath();
      const encodedPath = folderPath.split('/').map(seg => encodeURIComponent(seg)).join('/');
      const encodedFile = encodeURIComponent(DATA_FILE);

      const url = `${GRAPH_BASE}/drives/${driveId}/root:/${encodedPath}/${encodedFile}:/content`;
      await fetch(url, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newData, null, 2),
      });
    } catch (writeErr) {
      console.warn('Could not persist to OneDrive:', writeErr.message);
    }

    // Update in-memory cache
    cachedData = newData;

    res.json({
      message: 'NCT data loaded',
      totalRecords: records.length,
      counties: [...new Set(records.map(r => r.county))].length,
      crops: [...new Set(records.map(r => r.crop))].length,
    });
  } catch (err) {
    console.error('POST /api/nct/upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
