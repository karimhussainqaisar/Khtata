import { jsPDF } from 'jspdf';
import { UdharRecord, UserProfile, RepaymentLog } from '../types';
import { formatPKR, formatDatePK } from './formatters';

export function generateCustomerTransactionPDF(record: UdharRecord, profile: UserProfile): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const shopName = profile.shopName || profile.name || 'KhataPro Ledger';
  const shopPhone = profile.phone || '0300-1234567';
  const remaining = Math.max(0, record.amount - record.paidAmount);
  const isGiven = record.type === 'given';

  // Palette
  const darkNavy = [15, 23, 42]; // #0F172A
  const primaryBlue = [37, 99, 235]; // #2563EB
  const emeraldGreen = [16, 185, 129]; // #10B981
  const roseRed = [239, 68, 68]; // #EF4444
  const slateGray = [100, 116, 139]; // #64748B
  const lightBg = [248, 250, 252]; // #F8FAFC

  // Top Header Banner
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, 210, 38, 'F');

  // Top Accent Bar
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(0, 38, 210, 3, 'F');

  // Header Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(shopName, 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Digital Udhar Ledger Statement | Ph: ${shopPhone}`, 14, 26);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 196, 18, { align: 'right' });
  doc.text(`Ref ID: KP-${record.id.slice(0, 8).toUpperCase()}`, 196, 26, { align: 'right' });

  // Document Title
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(14, 48, 182, 18, 3, 3, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('CUSTOMER TRANSACTION & UDHAR STATEMENT', 18, 59);

  // Status Badge
  let badgeColor = primaryBlue;
  let statusText = 'PENDING UNPAID';
  if (record.paidAmount >= record.amount) {
    badgeColor = emeraldGreen;
    statusText = 'FULLY SETTLED';
  } else if (record.paidAmount > 0) {
    badgeColor = [217, 119, 6]; // Amber
    statusText = 'PARTIALLY PAID';
  }
  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(148, 52, 44, 10, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(statusText, 170, 58.5, { align: 'center' });

  // Customer Profile Section
  let y = 74;

  doc.setLineWidth(0.3);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 32, 3, 3, 'D');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('CUSTOMER INFORMATION', 18, y + 8);

  doc.setFontSize(12);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`Name: ${record.personName}`, 18, y + 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Phone: ${record.phone || 'N/A'}`, 18, y + 25);

  doc.setFont('helvetica', 'bold');
  doc.text(`Transaction Type: ${isGiven ? 'Udhar Given (Maine Diya)' : 'Udhar Taken (Maine Liya)'}`, 110, y + 18);
  doc.text(`Purpose / Details: ${record.purpose || 'General Account'}`, 110, y + 25);

  // Financial Summary Cards
  y += 40;

  const cardW = 57;
  const cardH = 22;

  // Total Original
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, cardW, cardH, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('TOTAL UDHAR AMOUNT', 18, y + 7);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(formatPKR(record.amount, profile.currency), 18, y + 16);

  // Paid Amount
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(76, y, cardW, cardH, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('TOTAL PAID / RECEIVED', 80, y + 7);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.text(formatPKR(record.paidAmount, profile.currency), 80, y + 16);

  // Remaining Balance
  doc.setFillColor(remaining === 0 ? 236 : 254, remaining === 0 ? 253 : 242, remaining === 0 ? 245 : 242);
  doc.roundedRect(139, y, cardW, cardH, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('REMAINING BALANCE', 143, y + 7);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(remaining === 0 ? emeraldGreen[0] : roseRed[0], remaining === 0 ? emeraldGreen[1] : roseRed[1], remaining === 0 ? emeraldGreen[2] : roseRed[2]);
  doc.text(formatPKR(remaining, profile.currency), 143, y + 16);

  // Repayment Table Section
  y += 32;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('REPAYMENT LOGS & PAYMENT HISTORY', 14, y);

  y += 5;

  // Table Header
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(14, y, 182, 8, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('DATE', 18, y + 5.5);
  doc.text('TRANSACTION ID', 55, y + 5.5);
  doc.text('METHOD', 105, y + 5.5);
  doc.text('AMOUNT PAID', 150, y + 5.5);
  doc.text('RUNNING BAL', 192, y + 5.5, { align: 'right' });

  y += 8;

  let currentBal = record.amount;
  const payments = record.payments || [];

  if (payments.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y, 182, 10, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    doc.text('No repayments recorded yet for this transaction.', 18, y + 6.5);
    y += 10;
  } else {
    payments.forEach((p: RepaymentLog, index: number) => {
      currentBal -= p.amount;

      // Alternating row background
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 182, 8, 'F');
      }

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);

      doc.text(formatDatePK(p.date), 18, y + 5.5);
      doc.text(p.transactionId || `PAY-${p.id.slice(0, 6)}`, 55, y + 5.5);
      doc.text(p.paymentMethod, 105, y + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
      doc.text(formatPKR(p.amount, profile.currency), 150, y + 5.5);

      doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
      doc.text(formatPKR(Math.max(0, currentBal), profile.currency), 192, y + 5.5, { align: 'right' });

      y += 8;
    });
  }

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(14, y + 5, 196, y + 5);

  // Footer & Stamps
  y = Math.max(y + 25, 240);

  // Stamp Box
  doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.setLineWidth(0.8);
  doc.roundedRect(14, y, 80, 28, 2, 2, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text('VERIFIED DIGITAL STATEMENT', 18, y + 8);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('KhataPro Official Ledger Record', 18, y + 14);
  doc.text('Computer generated document. No signature needed.', 18, y + 20);

  // Signature line
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(130, y + 18, 196, y + 18);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Authorized Shop Stamp & Signature', 163, y + 24, { align: 'center' });

  return doc;
}

export function downloadCustomerTransactionPDF(record: UdharRecord, profile: UserProfile) {
  const doc = generateCustomerTransactionPDF(record, profile);
  const fileName = `KhataPro_Statement_${record.personName.replace(/\s+/g, '_')}_${record.id.slice(0, 6)}.pdf`;
  doc.save(fileName);
}
