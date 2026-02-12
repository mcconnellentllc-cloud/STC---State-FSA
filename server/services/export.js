import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

export function generateExpenseXlsx(expenses) {
  const data = expenses.map(e => ({
    Date: e.date,
    Vendor: e.vendor || '',
    Amount: e.amount,
    Category: e.category || '',
    Description: e.description || '',
    Status: e.status || 'pending',
    Receipt: e.document_id ? `Doc #${e.document_id}` : 'None'
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // Date
    { wch: 25 }, // Vendor
    { wch: 12 }, // Amount
    { wch: 15 }, // Category
    { wch: 40 }, // Description
    { wch: 10 }, // Status
    { wch: 10 }, // Receipt
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

  // Add summary sheet
  const categories = {};
  let total = 0;
  for (const e of expenses) {
    const cat = e.category || 'Uncategorized';
    categories[cat] = (categories[cat] || 0) + (e.amount || 0);
    total += e.amount || 0;
  }

  const summaryData = Object.entries(categories).map(([cat, amt]) => ({
    Category: cat,
    Total: amt
  }));
  summaryData.push({ Category: 'GRAND TOTAL', Total: total });

  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

export function generateExpensePdf(expenses) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
    const buffers = [];

    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Title
    doc.fontSize(18).text('Expense Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);

    // Table header
    const startX = 50;
    let y = doc.y;
    const colWidths = [70, 120, 60, 80, 180];
    const headers = ['Date', 'Vendor', 'Amount', 'Category', 'Description'];

    doc.fontSize(9).font('Helvetica-Bold');
    headers.forEach((header, i) => {
      let x = startX;
      for (let j = 0; j < i; j++) x += colWidths[j];
      doc.text(header, x, y, { width: colWidths[i] });
    });

    y += 18;
    doc.moveTo(startX, y).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y).stroke();
    y += 5;

    // Table rows
    doc.font('Helvetica').fontSize(8);
    let grandTotal = 0;

    for (const expense of expenses) {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      const row = [
        expense.date || '',
        (expense.vendor || '').substring(0, 25),
        `$${(expense.amount || 0).toFixed(2)}`,
        expense.category || '',
        (expense.description || '').substring(0, 45)
      ];

      row.forEach((cell, i) => {
        let x = startX;
        for (let j = 0; j < i; j++) x += colWidths[j];
        doc.text(cell, x, y, { width: colWidths[i] });
      });

      grandTotal += expense.amount || 0;
      y += 16;
    }

    // Total
    y += 10;
    doc.moveTo(startX, y).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y).stroke();
    y += 8;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text(`Total: $${grandTotal.toFixed(2)}`, startX, y, { align: 'right', width: colWidths.reduce((a, b) => a + b, 0) });

    doc.end();
  });
}
