import fs from 'fs';

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
      // OCR removed to stay within 512MB memory limit on Render
      return '';
    default:
      return '';
  }
}

async function extractPdf(filePath) {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return (data.text || '').trim();
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
