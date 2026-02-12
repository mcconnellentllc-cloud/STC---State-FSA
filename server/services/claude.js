import fetch from 'node-fetch';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

async function callClaude(prompt, maxTokens = 4096) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

export async function searchWithAI(query, context) {
  const prompt = `You are a helpful assistant searching through a Project Field Archive (PFA) for FSA State Committee work. The user is searching for: "${query}"

Here is the relevant context from the archive:

${context}

Based on this archive data, provide a comprehensive answer to the user's query. Reference specific entries, documents, or expenses where relevant. If the archive doesn't contain relevant information, say so.`;

  return callClaude(prompt);
}

export async function summarize(content, type = 'entry') {
  const prompt = `Summarize the following ${type} concisely. Highlight key points, decisions made, action items, and important details:

${content}`;

  return callClaude(prompt, 2048);
}

export async function extractReceipt(text) {
  const prompt = `Extract expense/receipt data from the following text. Return ONLY valid JSON with these fields:
- vendor: string (the business/vendor name)
- date: string (in YYYY-MM-DD format)
- amount: number (the total amount)
- category: string (one of: travel, meals, supplies, lodging, fuel, parking, other)
- description: string (brief description of the expense)

If a field cannot be determined, use null.

Text:
${text}`;

  const response = await callClaude(prompt, 1024);

  // Parse JSON from response
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.error('Receipt extraction parse error:', err.message);
  }
  return null;
}

export async function categorize(content, type = 'entry') {
  const prompt = `Analyze the following ${type} and suggest appropriate tags/categories. Return ONLY a JSON object with:
- tags: array of relevant tag strings (e.g., "meeting", "field-visit", "policy", "budget", etc.)
- category: string (the primary category)
- summary: string (one sentence summary)

Content:
${content}`;

  const response = await callClaude(prompt, 1024);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.error('Categorization parse error:', err.message);
  }
  return { tags: [], category: 'general', summary: '' };
}
