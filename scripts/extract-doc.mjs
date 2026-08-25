// Extract text from a PDF or XLSX file. Usage: node scripts/extract-doc.mjs <path>
import fs from 'fs';
import path from 'path';

const file = process.argv[2];
if (!file) { console.error('usage: node scripts/extract-doc.mjs <path>'); process.exit(1); }
const ext = path.extname(file).toLowerCase();

if (ext === '.pdf') {
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(fs.readFileSync(file));
  console.log(`==== PDF: ${path.basename(file)} (${data.numpages} pages) ====`);
  console.log(data.text);
} else if (ext === '.xlsx' || ext === '.xls') {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(fs.readFileSync(file));
  console.log(`==== XLSX: ${path.basename(file)} (${wb.SheetNames.length} sheets) ====`);
  for (const name of wb.SheetNames) {
    console.log(`\n--- Sheet: ${name} ---`);
    console.log(XLSX.utils.sheet_to_csv(wb.Sheets[name]));
  }
} else {
  console.error(`unsupported extension: ${ext}`);
}
