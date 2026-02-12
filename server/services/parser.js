import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    const text = (data.text || '').trim();

    // If pdf-parse found meaningful text, return it
    if (text.length > 20) {
      return text;
    }

    // Otherwise this is likely a scanned/image PDF — extract embedded images then OCR
    console.log(`PDF has little/no text (${text.length} chars), attempting image-based OCR: ${path.basename(filePath)}`);
    try {
      const ocrText = await ocrPdfViaImage(buffer);
      if (ocrText && ocrText.trim().length > 0) {
        console.log(`OCR extracted ${ocrText.trim().length} chars from scanned PDF`);
        return ocrText.trim();
      }
    } catch (ocrErr) {
      console.error('PDF OCR fallback error:', ocrErr.message);
    }

    // Return whatever we got from pdf-parse (even if short)
    return text;
  } catch (err) {
    console.error('PDF extraction error:', err.message);
    return '';
  }
}

/**
 * OCR a scanned PDF by extracting embedded JPEG images from the raw PDF bytes,
 * then running Tesseract OCR on them.
 *
 * Tesseract.js CANNOT read PDF files directly — it only accepts image files.
 * Scanned PDFs typically contain one large embedded JPEG per page.
 * We find those JPEG streams in the binary and OCR the largest one.
 */
async function ocrPdfViaImage(pdfBuffer) {
  // Step 1: Try sharp to convert PDF to PNG (works if system has libvips+poppler)
  let imageBuffer;
  try {
    const sharp = (await import('sharp')).default;
    imageBuffer = await sharp(pdfBuffer, { density: 300, page: 0 })
      .png()
      .toBuffer();
    console.log('Sharp converted PDF to PNG successfully');
  } catch (sharpErr) {
    // sharp can't convert PDFs without poppler — extract embedded JPEG instead
    console.log('Sharp cannot convert PDF, extracting embedded JPEG...');
    imageBuffer = extractEmbeddedJpeg(pdfBuffer);
  }

  if (!imageBuffer || imageBuffer.length < 500) {
    console.log('No usable image found in PDF for OCR');
    return '';
  }

  // Step 2: Normalize the image to PNG via sharp (in case it's a raw JPEG)
  try {
    const sharp = (await import('sharp')).default;
    const pngBuffer = await sharp(imageBuffer).png().toBuffer();

    // Write temp file for Tesseract
    const tmpDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const tmpPath = path.join(tmpDir, `ocr-tmp-${Date.now()}.png`);
    fs.writeFileSync(tmpPath, pngBuffer);

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(tmpPath);
      await worker.terminate();
      return text || '';
    } finally {
      // Clean up temp file
      try { fs.unlinkSync(tmpPath); } catch {}
    }
  } catch (err) {
    console.error('OCR image processing error:', err.message);
    return '';
  }
}

/**
 * Extract the largest embedded JPEG image from a PDF buffer.
 * Scanned PDFs store each page as a JPEG stream.
 * We scan for JPEG start (FF D8 FF) and end (FF D9) markers.
 */
function extractEmbeddedJpeg(pdfBuffer) {
  const JPEG_START = [0xFF, 0xD8, 0xFF];
  let startIdx = -1;
  let largestImage = null;
  let largestSize = 0;

  for (let i = 0; i < pdfBuffer.length - 3; i++) {
    // Look for JPEG start marker
    if (pdfBuffer[i] === JPEG_START[0] && pdfBuffer[i + 1] === JPEG_START[1] && pdfBuffer[i + 2] === JPEG_START[2]) {
      startIdx = i;
    }
    // Look for JPEG end marker
    if (startIdx >= 0 && pdfBuffer[i] === 0xFF && pdfBuffer[i + 1] === 0xD9) {
      const endIdx = i + 2;
      const imageSize = endIdx - startIdx;
      // Keep the largest JPEG found (skip tiny ones < 5KB — likely thumbnails)
      if (imageSize > largestSize && imageSize > 5000) {
        largestImage = pdfBuffer.slice(startIdx, endIdx);
        largestSize = imageSize;
      }
      startIdx = -1;
    }
  }

  if (largestImage) {
    console.log(`Found embedded JPEG: ${(largestSize / 1024).toFixed(1)} KB`);
  } else {
    console.log('No embedded JPEG images found in PDF');
  }

  return largestImage;
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
