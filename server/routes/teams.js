import { Router } from 'express';
import { testConnection, graphGet, getSiteId, getDriveId, graphUploadFile } from '../services/graph.js';
import { all, get } from '../services/database.js';
import XLSX from 'xlsx';

// Returns set of graph_file_ids the given user should not see, because the
// file is linked to at least one appeal the user has an active recusal on.
// Admin bypasses (returns empty set). Per-file fallback; folder-level filter
// (recusedFolderPathsForUser) is the primary mechanism.
async function recusedFileIdsForUser(user) {
  if (!user || user.role === 'admin') return new Set();
  const rows = await all(
    `SELECT DISTINCT drl.graph_file_id
       FROM document_recusal_links drl
       JOIN appeal_recusals ar
         ON ar.appeal_id = drl.appeal_id
        AND ar.revoked_at IS NULL
      WHERE ar.user_id = ?`,
    [user.id]
  );
  return new Set(rows.map(r => r.graph_file_id));
}

// Returns array of folder PATHS (relative to watch-folder root) the given
// user is barred from. Any folder whose path equals or is a descendant of
// one of these paths is hidden in browse listings and rejected on direct
// file access. Admin bypasses.
async function recusedFolderPathsForUser(user) {
  if (!user || user.role === 'admin') return [];
  const rows = await all(
    `SELECT DISTINCT frl.folder_path
       FROM folder_recusal_links frl
       JOIN appeal_recusals ar
         ON ar.appeal_id = frl.appeal_id
        AND ar.revoked_at IS NULL
      WHERE ar.user_id = ?`,
    [user.id]
  );
  return rows.map(r => r.folder_path);
}

// True if `path` equals one of the recused paths or is a descendant (within
// a recused folder).
function pathIsInsideAny(path, recusedPaths) {
  return recusedPaths.some(rp => path === rp || path.startsWith(rp + '/'));
}

const router = Router();

// POST /api/teams/test — test Graph API connection
router.post('/test', async (req, res) => {
  try {
    const result = await testConnection();
    res.json(result);
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
// Member-scoped subfolder within the watch folder. Members can only browse
// inside this subfolder; admin sees the full watch folder. Must match the
// constant used client-side in src/pages/Documents.jsx.
const MEMBER_DOCS_ROOT = process.env.MEMBER_DOCS_ROOT || 'Committee Shared';

router.get('/browse', async (req, res) => {
  try {
    const siteId = await getSiteId();
    const driveId = await getDriveId(siteId);
    const watchFolder = process.env.SHAREPOINT_WATCH_FOLDER || 'FSA - State Committee';

    // Build full path
    let subPath = req.query.path || '';

    // Member scoping: force the browse to stay inside Committee Shared.
    // Empty path gets rewritten to the member root; any other path must be
    // under the member root or we return 403. Admin bypasses.
    let memberRelative = ''; // path under MEMBER_DOCS_ROOT, used for recusal compares
    if (req.user?.role === 'member') {
      if (!subPath) {
        subPath = MEMBER_DOCS_ROOT;
      } else if (subPath !== MEMBER_DOCS_ROOT && !subPath.startsWith(MEMBER_DOCS_ROOT + '/')) {
        return res.status(403).json({ error: 'Access restricted' });
      }
      memberRelative = subPath === MEMBER_DOCS_ROOT
        ? ''
        : subPath.slice(MEMBER_DOCS_ROOT.length + 1);
      // Folder-recusal gate: if a member tries to navigate INTO a recused
      // folder (or any descendant) via direct URL, 404. folder_recusal_links
      // stores paths relative to MEMBER_DOCS_ROOT (e.g. "Appeal 2" or
      // "April 2026/Appeals/Appeal 2").
      const recusedPaths = await recusedFolderPathsForUser(req.user);
      if (memberRelative && pathIsInsideAny(memberRelative, recusedPaths)) {
        return res.status(404).json({ error: 'Not found' });
      }
    }

    const fullPath = subPath ? `${watchFolder}/${subPath}` : watchFolder;

    // Encode each segment individually for the Graph API
    const encodedPath = fullPath.split('/').map(seg => encodeURIComponent(seg)).join('/');

    // Fetch children from Graph API
    const endpoint = `/drives/${driveId}/root:/${encodedPath}:/children?$select=id,name,size,lastModifiedDateTime,file,folder,webUrl&$orderby=name`;

    const data = await graphGet(endpoint);
    let items = (data.value || []).map(item => ({
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

    // Recusal filters (members only; admin bypasses both):
    //   1. Folder-level: hide subfolders under a recused appeal folder.
    //      Paths compared relative to MEMBER_DOCS_ROOT.
    //   2. Per-file fallback: hide individual files linked via the legacy
    //      document_recusal_links table.
    if (req.user?.role === 'member') {
      const recusedPaths = await recusedFolderPathsForUser(req.user);
      if (recusedPaths.length > 0) {
        items = items.filter(it => {
          if (!it.isFolder) return true;
          const folderRelative = memberRelative ? `${memberRelative}/${it.name}` : it.name;
          return !pathIsInsideAny(folderRelative, recusedPaths);
        });
      }
      const recusedIds = await recusedFileIdsForUser(req.user);
      if (recusedIds.size > 0) {
        items = items.filter(it => !(it.isFile && recusedIds.has(it.id)));
      }
    }

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

    // Fetch metadata plus parentReference so we can enforce the Committee
    // Shared scope on member downloads. Admin bypasses.
    const meta = await graphGet(
      `/drives/${driveId}/items/${req.params.itemId}?$select=name,size,file,parentReference`
    );

    if (!meta.file) {
      return res.status(400).json({ error: 'Item is not a file' });
    }

    // Member scoping: parse parentReference.path to confirm the file is
    // anchored under the watch folder AND its first segment within the watch
    // folder is the member root (default 'Committee Shared'). Tighter than
    // a substring match: a folder like 'Old Committee Shared Archive'
    // sitting elsewhere in the drive would not pass.
    if (req.user?.role === 'member') {
      const watchFolder = process.env.SHAREPOINT_WATCH_FOLDER || 'FSA - State Committee';
      const rootPrefix = `/root:/${watchFolder}/`;
      const parentPath = meta.parentReference?.path || '';
      const idx = parentPath.indexOf(rootPrefix);
      if (idx < 0) {
        return res.status(403).json({ error: 'Access restricted' });
      }
      const relative = parentPath.slice(idx + rootPrefix.length);
      const firstSegment = relative.split('/')[0];
      if (firstSegment !== MEMBER_DOCS_ROOT) {
        return res.status(403).json({ error: 'Access restricted' });
      }

      // Folder-recusal check: relative path looks like
      // "Committee Shared/April 2026/Appeals/Appeal 2". Strip the member root
      // prefix and check if the remaining path is inside any recused folder.
      const memberSubPath = relative === MEMBER_DOCS_ROOT
        ? ''
        : relative.slice(MEMBER_DOCS_ROOT.length + 1); // drop "Committee Shared/"
      const recusedPaths = await recusedFolderPathsForUser(req.user);
      if (memberSubPath && pathIsInsideAny(memberSubPath, recusedPaths)) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Per-file recusal fallback (legacy document_recusal_links): 404 if
      // this specific file id is tagged.
      const recusedIds = await recusedFileIdsForUser(req.user);
      if (recusedIds.has(req.params.itemId)) {
        return res.status(404).json({ error: 'Not found' });
      }
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
