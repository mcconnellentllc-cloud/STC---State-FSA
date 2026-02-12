import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { graphGet, graphGetBinary, getSiteId, getDriveId } from './graph.js';
import { extractText } from './parser.js';
import { categorize, extractReceipt } from './claude.js';
import { all, run, syncDocumentFts, UPLOADS_DIR } from './database.js';

let watcherInterval = null;
let deltaLink = null;
let siteId = null;
let driveId = null;
let lastSync = null;
let filesProcessed = 0;
let isRunning = false;

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function getStatus() {
  return {
    running: isRunning,
    lastSync,
    filesProcessed,
    siteId,
    driveId,
    pollInterval: POLL_INTERVAL / 1000
  };
}

export async function startWatcher() {
  if (isRunning) return;

  try {
    siteId = await getSiteId();
    driveId = await getDriveId(siteId);
    console.log(`Teams watcher: site=${siteId}, drive=${driveId}`);
    isRunning = true;

    // Initial poll
    await pollForChanges();

    // Set up interval
    watcherInterval = setInterval(async () => {
      try {
        await pollForChanges();
      } catch (err) {
        console.error('Watcher poll error:', err.message);
      }
    }, POLL_INTERVAL);

    console.log('Teams watcher started, polling every 5 minutes');
  } catch (err) {
    console.error('Failed to start Teams watcher:', err.message);
    isRunning = false;
  }
}

export function stopWatcher() {
  if (watcherInterval) {
    clearInterval(watcherInterval);
    watcherInterval = null;
  }
  isRunning = false;
  console.log('Teams watcher stopped');
}

async function pollForChanges() {
  const watchFolder = process.env.SHAREPOINT_WATCH_FOLDER || 'FSA - State Committee';

  let url;
  if (deltaLink) {
    url = deltaLink;
  } else {
    url = `/drives/${driveId}/root:/${watchFolder}:/delta`;
  }

  try {
    const data = await graphGet(url);
    const items = data.value || [];

    // Save delta link for next poll
    if (data['@odata.deltaLink']) {
      deltaLink = data['@odata.deltaLink'];
    }

    // Process new/changed files (with rate limit delay)
    for (const item of items) {
      if (item.file && !item.deleted) {
        await processNewFile(item);
        await new Promise(r => setTimeout(r, 15000)); // 15 sec delay between files
      }
    }

    lastSync = new Date().toISOString();
  } catch (err) {
    console.error('Delta poll error:', err.message);
    // Reset delta link on error so we start fresh
    deltaLink = null;
  }
}

async function processNewFile(item) {
  const allowedExts = ['.pdf', '.docx', '.xlsx', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(item.name).toLowerCase();

  if (!allowedExts.includes(ext)) return;

  // Check if already imported
  try {
    const existing = await all('SELECT id FROM documents WHERE teams_file_id = ?', [item.id]);
    if (existing.length > 0) return;
  } catch (err) {
    // Continue if check fails
  }

  console.log(`Processing SharePoint file: ${item.name}`);

  try {
    // Download file
    const downloadUrl = item['@microsoft.graph.downloadUrl'];
    let fileBuffer;
    if (downloadUrl) {
      const fetch = (await import('node-fetch')).default;
      const resp = await fetch(downloadUrl);
      fileBuffer = await resp.buffer();
    } else {
      fileBuffer = await graphGetBinary(`/drives/${driveId}/items/${item.id}/content`);
    }

    // Save to uploads
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, fileBuffer);

    // Extract text
    const extractedText = await extractText(filePath, ext);

    // Determine the folder path from the parentReference
    const watchFolder = process.env.SHAREPOINT_WATCH_FOLDER || 'FSA - State Committee';
    const teamsFolder = item.parentReference?.path
      ? item.parentReference.path.replace(/^.*?:\/?/, '').replace(new RegExp(`^${watchFolder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/?`), '')
      : '';

    // Save to database
    const result = await run(
      `INSERT INTO documents (filename, original_name, file_type, file_path, file_size, extracted_text, teams_file_id, teams_drive_id, teams_folder, processed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [filename, item.name, ext, filePath, item.size || 0, extractedText, item.id, driveId, teamsFolder]
    );

    const docId = result.lastInsertRowid;

    // Update FTS
    await syncDocumentFts(docId, { original_name: item.name, extracted_text: extractedText, tags: '' });

    // AI categorization (non-blocking)
    try {
      if (extractedText && process.env.ANTHROPIC_API_KEY) {
        const catResult = await categorize(extractedText, 'document');
        if (catResult.tags?.length) {
          await run('UPDATE documents SET tags = ? WHERE id = ?', [catResult.tags.join(', '), docId]);
          await syncDocumentFts(docId, { original_name: item.name, extracted_text: extractedText, tags: catResult.tags.join(', ') });
        }

        // Check if it's a receipt
        const receiptData = await extractReceipt(extractedText);
        if (receiptData && receiptData.amount) {
          await run(
            `INSERT INTO expenses (date, vendor, amount, category, description, document_id, status)
             VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [receiptData.date || new Date().toISOString().split('T')[0], receiptData.vendor || '', receiptData.amount, receiptData.category || 'other', receiptData.description || '', docId]
          );
          console.log(`Auto-created expense from receipt: $${receiptData.amount} at ${receiptData.vendor}`);
        }
      }
    } catch (aiErr) {
      console.error('AI processing error (non-critical):', aiErr.message);
    }

    filesProcessed++;
    console.log(`Processed: ${item.name} (doc #${docId})`);
  } catch (err) {
    console.error(`Error processing ${item.name}:`, err.message);
  }
}

export async function manualSync() {
  deltaLink = null; // Reset to full sync
  await pollForChanges();
  return { lastSync, filesProcessed };
}
