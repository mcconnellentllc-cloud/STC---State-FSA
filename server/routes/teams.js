import { Router } from 'express';
import { testConnection, graphGet, getSiteId, getDriveId, graphUploadFile } from '../services/graph.js';
import { getStatus, manualSync, startWatcher, stopWatcher } from '../services/teams-watcher.js';
import { all } from '../services/database.js';
import XLSX from 'xlsx';

const router = Router();

// GET /api/teams/status — sync status
router.get('/status', (req, res) => {
  try {
    const status = getStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teams/test — test Graph API connection
router.post('/test', async (req, res) => {
  try {
    const result = await testConnection();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teams/sync — trigger manual sync
router.post('/sync', async (req, res) => {
  try {
    const result = await manualSync();
    res.json({ message: 'Sync completed', ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teams/start — start watcher
router.post('/start', async (req, res) => {
  try {
    await startWatcher();
    res.json({ message: 'Watcher started', ...getStatus() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teams/stop — stop watcher
router.post('/stop', (req, res) => {
  try {
    stopWatcher();
    res.json({ message: 'Watcher stopped', ...getStatus() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/teams/browse?path=some/folder
 * Browse SharePoint folder structure in real-time.
 * Returns children (folders and files) at the given path under the watch folder.
 * If no path, returns the root watch folder contents.
 */
router.get('/browse', async (req, res) => {
  try {
    const siteId = await getSiteId();
    const driveId = await getDriveId(siteId);
    const watchFolder = process.env.SHAREPOINT_WATCH_FOLDER || 'FSA - State Committee';

    // Build full path
    const subPath = req.query.path || '';
    const fullPath = subPath ? `${watchFolder}/${subPath}` : watchFolder;

    // Encode each segment individually for the Graph API
    const encodedPath = fullPath.split('/').map(seg => encodeURIComponent(seg)).join('/');

    // Fetch children from Graph API
    const endpoint = `/drives/${driveId}/root:/${encodedPath}:/children?$select=id,name,size,lastModifiedDateTime,file,folder,webUrl&$orderby=name`;

    const data = await graphGet(endpoint);
    const items = (data.value || []).map(item => ({
      id: item.id,
      name: item.name,
      isFolder: !!item.folder,
      isFile: !!item.file,
      size: item.size || 0,
      lastModified: item.lastModifiedDateTime,
      mimeType: item.file?.mimeType || null,
      childCount: item.folder?.childCount || 0,
      webUrl: item.webUrl
    }));

    // Sort: folders first, then files
    items.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });

    res.json({
      path: subPath,
      fullPath,
      items
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/teams/file/:itemId
 * Download/stream a specific file from SharePoint by its item ID.
 */
router.get('/file/:itemId', async (req, res) => {
  try {
    const siteId = await getSiteId();
    const driveId = await getDriveId(siteId);

    // Get file metadata first
    const meta = await graphGet(`/drives/${driveId}/items/${req.params.itemId}?$select=name,size,file`);

    if (!meta.file) {
      return res.status(400).json({ error: 'Item is not a file' });
    }

    // Get download URL via separate call
    const dlMeta = await graphGet(`/drives/${driveId}/items/${req.params.itemId}?$select=@microsoft.graph.downloadUrl`);
    const downloadUrl = dlMeta['@microsoft.graph.downloadUrl'];

    if (downloadUrl) {
      const fetch = (await import('node-fetch')).default;
      const fileResp = await fetch(downloadUrl);
      res.setHeader('Content-Type', meta.file.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${meta.name}"`);
      if (meta.size) res.setHeader('Content-Length', meta.size);
      fileResp.body.pipe(res);
    } else {
      const { graphGetBinary } = await import('../services/graph.js');
      const buffer = await graphGetBinary(`/drives/${driveId}/items/${req.params.itemId}/content`);
      res.setHeader('Content-Type', meta.file.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${meta.name}"`);
      res.send(buffer);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/teams/export-excel
 * Generate an Excel workbook with Expenses, Meetings/Calendar, and Documents
 * and upload it to the Teams channel in SharePoint.
 */
router.post('/export-excel', async (req, res) => {
  try {
    const siteId = await getSiteId();
    const driveId = await getDriveId(siteId);

    // Fetch all data
    const expenses = await all('SELECT * FROM expenses ORDER BY date DESC');
    const documents = await all('SELECT * FROM documents ORDER BY created_at DESC');
    const calendar = await all('SELECT * FROM calendar_notices ORDER BY date ASC');

    const wb = XLSX.utils.book_new();

    // ── Expenses sheet ──
    const expData = expenses.map(e => ({
      Date: e.date || '',
      Vendor: e.vendor || '',
      Amount: e.amount || 0,
      Category: e.category || '',
      Description: e.description || '',
      Status: e.status || 'pending'
    }));
    const expWs = XLSX.utils.json_to_sheet(expData.length ? expData : [{ Date: '', Vendor: '', Amount: 0, Category: '', Description: '', Status: '' }]);
    expWs['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 40 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, expWs, 'Expenses');

    // ── Expense Summary sheet ──
    const categories = {};
    let total = 0;
    for (const e of expenses) {
      const cat = e.category || 'Uncategorized';
      categories[cat] = (categories[cat] || 0) + (e.amount || 0);
      total += e.amount || 0;
    }
    const summaryData = Object.entries(categories).map(([cat, amt]) => ({ Category: cat, Total: amt }));
    summaryData.push({ Category: 'GRAND TOTAL', Total: total });
    const sumWs = XLSX.utils.json_to_sheet(summaryData);
    sumWs['!cols'] = [{ wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, sumWs, 'Expense Summary');

    // ── Calendar / Notices sheet ──
    const calData = calendar.map(c => ({
      Date: c.date || '',
      Title: c.title || '',
      Type: c.notice_type || '',
      Location: c.location || '',
      Description: c.description || '',
      'All Day': c.all_day ? 'Yes' : 'No',
      'Start Time': c.start_time || '',
      'End Time': c.end_time || ''
    }));
    const calWs = XLSX.utils.json_to_sheet(calData.length ? calData : [{ Date: '', Title: '', Type: '', Location: '', Description: '' }]);
    calWs['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 15 }, { wch: 25 }, { wch: 40 }, { wch: 8 }, { wch: 10 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, calWs, 'Calendar');

    // ── Documents sheet ──
    const docData = documents.map(d => ({
      Name: d.original_name || '',
      Type: d.file_type || '',
      'Size (KB)': d.file_size ? Math.round(d.file_size / 1024) : 0,
      Tags: d.tags || '',
      Folder: d.teams_folder || '',
      Uploaded: d.created_at ? new Date(d.created_at).toLocaleDateString() : ''
    }));
    const docWs = XLSX.utils.json_to_sheet(docData.length ? docData : [{ Name: '', Type: '', 'Size (KB)': 0, Tags: '', Folder: '' }]);
    docWs['!cols'] = [{ wch: 35 }, { wch: 8 }, { wch: 10 }, { wch: 30 }, { wch: 25 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, docWs, 'Documents');

    // Generate buffer
    const xlsxBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Upload to SharePoint
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `PFA_Export_${timestamp}.xlsx`;

    const uploadResult = await graphUploadFile(
      driveId,
      'STC PFA',
      fileName,
      Buffer.from(xlsxBuffer),
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.json({
      message: `Excel exported to Teams: ${fileName}`,
      fileName,
      webUrl: uploadResult.webUrl,
      size: xlsxBuffer.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
