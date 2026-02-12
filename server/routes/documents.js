import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { all, get, run, syncDocumentFts, deleteDocumentFts, UPLOADS_DIR } from '../services/database.js';
import { extractText } from '../services/parser.js';

const router = Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.xlsx', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed`));
    }
  }
});

// POST /api/documents/upload — multipart file upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = path.extname(req.file.originalname).toLowerCase();
    const filePath = req.file.path;

    // Extract text
    let extractedText = '';
    try {
      extractedText = await extractText(filePath, ext);
    } catch (err) {
      console.error('Text extraction failed:', err.message);
    }

    const result = run(
      `INSERT INTO documents (filename, original_name, file_type, file_path, file_size, extracted_text, tags, entry_id, processed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        req.file.filename,
        req.file.originalname,
        ext,
        filePath,
        req.file.size,
        extractedText,
        req.body.tags || null,
        req.body.entry_id || null
      ]
    );

    const id = result.lastInsertRowid;
    syncDocumentFts(id, { original_name: req.file.originalname, extracted_text: extractedText, tags: req.body.tags || '' });

    const doc = get('SELECT * FROM documents WHERE id = ?', [id]);
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/documents — list all
router.get('/', (req, res) => {
  try {
    const { type, tag, entry_id } = req.query;
    let sql = 'SELECT * FROM documents';
    const conditions = [];
    const params = [];

    if (type) {
      conditions.push('file_type = ?');
      params.push(type);
    }
    if (tag) {
      conditions.push('tags LIKE ?');
      params.push(`%${tag}%`);
    }
    if (entry_id) {
      conditions.push('entry_id = ?');
      params.push(entry_id);
    }

    if (conditions.length) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';

    res.json(all(sql, params));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/documents/:id
router.get('/:id', (req, res) => {
  try {
    const doc = get('SELECT * FROM documents WHERE id = ?', [req.params.id]);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/documents/:id/file — serve the actual file
router.get('/:id/file', (req, res) => {
  try {
    const doc = get('SELECT * FROM documents WHERE id = ?', [req.params.id]);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const filePath = doc.file_path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.download(filePath, doc.original_name);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/documents/:id — update metadata
router.put('/:id', (req, res) => {
  try {
    const doc = get('SELECT * FROM documents WHERE id = ?', [req.params.id]);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const { tags, entry_id } = req.body;

    run(
      'UPDATE documents SET tags = ?, entry_id = ? WHERE id = ?',
      [tags !== undefined ? tags : doc.tags, entry_id !== undefined ? entry_id : doc.entry_id, req.params.id]
    );

    syncDocumentFts(req.params.id, {
      original_name: doc.original_name,
      extracted_text: doc.extracted_text,
      tags: tags !== undefined ? tags : doc.tags
    });

    const updated = get('SELECT * FROM documents WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/documents/:id/reprocess — re-extract text (useful for OCR after parser update)
router.post('/:id/reprocess', async (req, res) => {
  try {
    const doc = get('SELECT * FROM documents WHERE id = ?', [req.params.id]);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const filePath = doc.file_path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk — cannot re-extract' });
    }

    let extractedText = '';
    try {
      extractedText = await extractText(filePath, doc.file_type);
    } catch (err) {
      console.error('Re-extraction failed:', err.message);
      return res.status(500).json({ error: 'Text extraction failed: ' + err.message });
    }

    run(
      'UPDATE documents SET extracted_text = ?, processed_at = datetime(\'now\') WHERE id = ?',
      [extractedText, req.params.id]
    );

    syncDocumentFts(req.params.id, {
      original_name: doc.original_name,
      extracted_text: extractedText,
      tags: doc.tags || ''
    });

    const updated = get('SELECT * FROM documents WHERE id = ?', [req.params.id]);
    console.log(`Re-processed document ${doc.original_name}: extracted ${extractedText.length} chars`);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', (req, res) => {
  try {
    const doc = get('SELECT * FROM documents WHERE id = ?', [req.params.id]);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    // Delete file from disk
    if (fs.existsSync(doc.file_path)) {
      fs.unlinkSync(doc.file_path);
    }

    run('DELETE FROM documents WHERE id = ?', [req.params.id]);
    deleteDocumentFts(req.params.id);

    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
