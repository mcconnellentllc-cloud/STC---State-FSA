import { Router } from 'express';
import fetch from 'node-fetch';
import { searchEntries, searchDocuments, get, all } from '../services/database.js';
import { searchWithAI, summarize, extractReceipt, categorize } from '../services/claude.js';
import { run, syncEntryFts, syncDocumentFts } from '../services/database.js';

const router = Router();

// POST /api/ai/search — natural language search
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    // Search FTS first
    const entries = searchEntries(query);
    const documents = searchDocuments(query);

    // Build context from results
    let context = '';
    if (entries.length) {
      context += '=== Journal Entries ===\n';
      for (const e of entries.slice(0, 10)) {
        context += `[Entry #${e.id}] ${e.title} (${e.date})\n`;
        if (e.location) context += `Location: ${e.location}\n`;
        if (e.attendees) context += `Attendees: ${e.attendees}\n`;
        context += `${(e.content || '').substring(0, 500)}\n\n`;
      }
    }
    if (documents.length) {
      context += '=== Documents ===\n';
      for (const d of documents.slice(0, 10)) {
        context += `[Doc #${d.id}] ${d.original_name} (${d.file_type})\n`;
        context += `${(d.extracted_text || '').substring(0, 500)}\n\n`;
      }
    }

    if (!context) {
      context = 'No matching records found in the archive.';
    }

    // Send to Claude
    const aiResponse = await searchWithAI(query, context);

    res.json({
      answer: aiResponse,
      sources: {
        entries: entries.slice(0, 10).map(e => ({ id: e.id, title: e.title, date: e.date })),
        documents: documents.slice(0, 10).map(d => ({ id: d.id, name: d.original_name, type: d.file_type }))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/summarize — summarize entry or document
router.post('/summarize', async (req, res) => {
  try {
    const { entry_id, document_id } = req.body;
    let content = '';
    let type = 'entry';

    if (entry_id) {
      const entry = get('SELECT * FROM entries WHERE id = ?', [entry_id]);
      if (!entry) return res.status(404).json({ error: 'Entry not found' });
      content = `Title: ${entry.title}\nDate: ${entry.date}\nLocation: ${entry.location || 'N/A'}\nAttendees: ${entry.attendees || 'N/A'}\n\n${entry.content || ''}`;
      type = 'journal entry';
    } else if (document_id) {
      const doc = get('SELECT * FROM documents WHERE id = ?', [document_id]);
      if (!doc) return res.status(404).json({ error: 'Document not found' });
      content = `Document: ${doc.original_name}\n\n${doc.extracted_text || ''}`;
      type = 'document';
    } else {
      return res.status(400).json({ error: 'entry_id or document_id required' });
    }

    const summary = await summarize(content, type);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/extract-receipt — extract expense data from a document
router.post('/extract-receipt', async (req, res) => {
  try {
    const { document_id } = req.body;
    if (!document_id) return res.status(400).json({ error: 'document_id required' });

    const doc = get('SELECT * FROM documents WHERE id = ?', [document_id]);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    if (!doc.extracted_text) return res.status(400).json({ error: 'No extracted text available' });

    const receiptData = await extractReceipt(doc.extracted_text);
    if (!receiptData) {
      return res.status(422).json({ error: 'Could not extract receipt data' });
    }

    res.json({ ...receiptData, document_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/categorize — auto-tag entries or documents
router.post('/categorize', async (req, res) => {
  try {
    const { entry_id, document_id } = req.body;
    let content = '';
    let type = 'entry';

    if (entry_id) {
      const entry = get('SELECT * FROM entries WHERE id = ?', [entry_id]);
      if (!entry) return res.status(404).json({ error: 'Entry not found' });
      content = `${entry.title}\n${entry.content || ''}`;

      const result = await categorize(content, 'journal entry');

      // Update tags
      if (result.tags?.length) {
        const tags = result.tags.join(', ');
        run('UPDATE entries SET tags = ? WHERE id = ?', [tags, entry_id]);
        syncEntryFts(entry_id, { ...entry, tags });
      }

      res.json(result);
    } else if (document_id) {
      const doc = get('SELECT * FROM documents WHERE id = ?', [document_id]);
      if (!doc) return res.status(404).json({ error: 'Document not found' });
      content = `${doc.original_name}\n${doc.extracted_text || ''}`;

      const result = await categorize(content, 'document');

      if (result.tags?.length) {
        const tags = result.tags.join(', ');
        run('UPDATE documents SET tags = ? WHERE id = ?', [tags, document_id]);
        syncDocumentFts(document_id, { ...doc, tags });
      }

      res.json(result);
    } else {
      return res.status(400).json({ error: 'entry_id or document_id required' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/research — research an action item / question for the committee
router.post('/research', async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) return res.status(400).json({ error: 'question required' });

    const prompt = `You are a research assistant for the Colorado FSA State Technical Committee (STC). A committee member needs help researching an action item from a meeting.

Action item / question:
"${question}"

${context ? `Additional context from the meeting:\n${context}\n\n` : ''}

Please provide a thorough, well-organized answer that:
1. Directly addresses the question with factual, useful information
2. Cites specific USDA/FSA programs, regulations, or policies where relevant
3. Is written in a professional tone suitable for sharing with the full committee
4. Includes any relevant numbers, dates, or deadlines
5. Ends with a brief "Sources & References" section listing relevant USDA/FSA web pages

Format the response so it can be easily copied and shared with the group (e.g., via email or Teams message). Keep it concise but comprehensive.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const answer = data.content?.[0]?.text || '';
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
