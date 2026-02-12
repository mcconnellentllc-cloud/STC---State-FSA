import fs from 'fs';
import path from 'path';

export async function extractText(filePath, fileType) {
  const ext = fileType.toLowerCase();

  switch (ext) {
    case '.pdf':
      return extractPdf(filePath);
    case '.docx':
      return extractDocx(filePath);
    case '.xlsx':
      return extractXlsx(filePath);
    case '.jpg':
    case '.jpeg':
    case '.png':
      return extractImage(filePath);
    default:
      return '';
  }
}

async function extractPdf(filePath) {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    console.error('PDF extraction error:', err.message);
    return '';
  }
}

async function extractDocx(filePath) {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (err) {
    console.error('DOCX extraction error:', err.message);
    return '';
  }
}

async function extractXlsx(filePath) {
  try {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(fs.readFileSync(filePath));
    let text = '';
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      text += `--- ${sheetName} ---\n`;
      text += XLSX.utils.sheet_to_csv(sheet) + '\n\n';
    }
    return text;
  } catch (err) {
    console.error('XLSX extraction error:', err.message);
    return '';
  }
}

async function extractImage(filePath) {
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(filePath);
    await worker.terminate();
    return text || '';
  } catch (err) {
    console.error('OCR extraction error:', err.message);
    return '';
  }
}
