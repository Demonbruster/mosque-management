// ============================================
// PDF Receipt Generator (pdf-lib)
// ============================================

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface ReceiptData {
  mosqueName: string;
  receiptNumber: string;
  donorName: string;
  amount: number;
  currency: string;
  fundCategory: string;
  date: Date;
  paymentMethod: string;
  referenceNumber: string | null;
  approverName: string;
}

/**
 * Generates an ISAK-35 compliance PDF buffer dynamically avoiding Node native extensions.
 */
export async function generateReceiptPDF(data: ReceiptData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]); // Receipt dimension size
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Mosque Header
  page.drawText(data.mosqueName.toUpperCase(), {
    x: 50,
    y: height - 50,
    size: 20,
    font: boldFont,
    color: rgb(0, 0.4, 0), // Dark green theme
  });

  // Official Title
  page.drawText('OFFICIAL DONATION RECEIPT', {
    x: 50,
    y: height - 85,
    size: 14,
    font: boldFont,
  });

  // Top right details
  page.drawText(`Receipt No: ${data.receiptNumber}`, {
    x: width - 220,
    y: height - 60,
    size: 11,
    font: boldFont,
  });
  page.drawText(`Date: ${data.date.toLocaleDateString()}`, {
    x: width - 220,
    y: height - 85,
    size: 11,
    font,
  });

  // Form body sections
  const startY = height - 140;

  page.drawText('Received With Thanks From', {
    x: 50,
    y: startY,
    size: 12,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(data.donorName || 'Anonymous Donor', { x: 250, y: startY, size: 12, font });

  page.drawText('Amount', {
    x: 50,
    y: startY - 30,
    size: 12,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(`${data.currency} ${data.amount.toFixed(2)}`, {
    x: 250,
    y: startY - 30,
    size: 12,
    font,
  });

  page.drawText('Fund Category', {
    x: 50,
    y: startY - 60,
    size: 12,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(data.fundCategory, { x: 250, y: startY - 60, size: 12, font });

  page.drawText('Payment Method', {
    x: 50,
    y: startY - 90,
    size: 12,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(data.paymentMethod, { x: 250, y: startY - 90, size: 12, font });

  if (data.referenceNumber) {
    page.drawText('Reference No', {
      x: 50,
      y: startY - 120,
      size: 12,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText(data.referenceNumber, { x: 250, y: startY - 120, size: 12, font });
  }

  // Approver signature stand-in
  page.drawLine({
    start: { x: width - 200, y: 100 },
    end: { x: width - 50, y: 100 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawText(`Authorized by: ${data.approverName}`, { x: width - 200, y: 80, size: 10, font });

  // ISAK-35 Compliance Footer
  page.drawText(
    'This receipt is generated automatically and serves as an official tax-deductible',
    { x: 50, y: 40, size: 9, font, color: rgb(0.5, 0.5, 0.5) },
  );
  page.drawText(
    'proof of contribution in compliance with ISAK-35 non-profit accounting standards.',
    { x: 50, y: 25, size: 9, font, color: rgb(0.5, 0.5, 0.5) },
  );

  return await pdfDoc.save();
}
