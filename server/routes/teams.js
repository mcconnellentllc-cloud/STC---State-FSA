import { Router } from 'express';
import { testConnection, graphGet, getSiteId, getDriveId } from '../services/graph.js';
import { getStatus, manualSync, startWatcher, stopWatcher } from '../services/teams-watcher.js';

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

export default router;
