import { jsPDF } from 'jspdf';
import { UdharRecord, UserProfile, RepaymentLog, Expense } from '../types';
import { formatPKR, formatDatePK } from './formatters';

export function generateCustomerTransactionPDF(
  recordInput: UdharRecord | UdharRecord[],
  profile: UserProfile
): jsPDF {
  const records = Array.isArray(recordInput) ? recordInput : [recordInput];
  if (records.length === 0) {
    return new jsPDF();
  }

  const primaryRecord = records[0];
  const personName = primaryRecord.personName;
  const phone = primaryRecord.phone || 'N/A';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const shopName = profile.shopName || profile.name || 'KhataPro Ledger';
  const shopPhone = profile.phone || '0300-1234567';

  // Math totals across all combined records
  const totalAmount = records.reduce((acc, r) => acc + r.amount, 0);
  const totalPaid = records.reduce((acc, r) => acc + r.paidAmount, 0);
  const remaining = Math.max(0, totalAmount - totalPaid);

  // Palette
  const darkNavy = [15, 23, 42];
  const primaryBlue = [37, 99, 235];
  const emeraldGreen = [16, 185, 129];
  const roseRed = [239, 68, 68];
  const slateGray = [100, 116, 139];
  const lightBg = [248, 250, 252];

  // Top Header Banner
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, 210, 38, 'F');

  // Top Accent Bar
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(0, 38, 210, 3, 'F');

  // Header Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(shopName, 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Digital Udhar Ledger Statement | Ph: ${shopPhone}`, 14, 26);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 196, 18, { align: 'right' });
  doc.text(`Total Entries: ${records.length}`, 196, 26, { align: 'right' });

  // Document Title
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(14, 48, 182, 18, 3, 3, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('CUSTOMER CONSOLIDATED TRANSACTION STATEMENT', 18, 59);

  // Status Badge
  let badgeColor = primaryBlue;
  let statusText = 'PENDING UNPAID';
  if (totalPaid >= totalAmount) {
    badgeColor = emeraldGreen;
    statusText = 'FULLY SETTLED';
  } else if (totalPaid > 0) {
    badgeColor = [217, 119, 6];
    statusText = 'PARTIALLY PAID';
  }
  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(144, 52, 48, 10, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(statusText, 168, 58.5, { align: 'center' });

  // Customer Profile Section
  let y = 74;

  doc.setLineWidth(0.3);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 28, 3, 3, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('CUSTOMER INFORMATION', 18, y + 7);

  doc.setFontSize(12);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`Name: ${personName}`, 18, y + 17);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Phone: ${phone}`, 18, y + 23);

  doc.setFont('helvetica', 'bold');
  doc.text(`Total Combined Entries: ${records.length}`, 120, y + 17);
  doc.setFont('helvetica', 'normal');
  doc.text(`Statement Date: ${new Date().toLocaleDateString()}`, 120, y + 23);

  // Financial Summary Cards
  y += 34;

  const cardW = 57;
  const cardH = 22;

  // Total Original
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, cardW, cardH, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('TOTAL UDHAR AMOUNT', 18, y + 7);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(formatPKR(totalAmount, profile.currency), 18, y + 16);

  // Paid Amount
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(76, y, cardW, cardH, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('TOTAL PAID / RECEIVED', 80, y + 7);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.text(formatPKR(totalPaid, profile.currency), 80, y + 16);

  // Remaining Balance
  doc.setFillColor(remaining === 0 ? 236 : 254, remaining === 0 ? 253 : 242, remaining === 0 ? 245 : 242);
  doc.roundedRect(139, y, cardW, cardH, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('REMAINING BALANCE', 143, y + 7);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(remaining === 0 ? emeraldGreen[0] : roseRed[0], remaining === 0 ? emeraldGreen[1] : roseRed[1], remaining === 0 ? emeraldGreen[2] : roseRed[2]);
  doc.text(formatPKR(remaining, profile.currency), 143, y + 16);

  // 1. COMBINED TRANSACTIONS TABLE
  y += 30;

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('COMBINED UDHAR TRANSACTIONS', 14, y);

  y += 4;

  const drawEntriesHeader = (currentY: number) => {
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(14, currentY, 182, 7.5, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('DATE', 16, currentY + 5);
    doc.text('PURPOSE / ENTRY', 42, currentY + 5);
    doc.text('TYPE', 96, currentY + 5);
    doc.text('TOTAL (PKR)', 125, currentY + 5);
    doc.text('PAID (PKR)', 155, currentY + 5);
    doc.text('REMAINING', 194, currentY + 5, { align: 'right' });
  };

  drawEntriesHeader(y);
  y += 7.5;

  records.forEach((rec, idx) => {
    if (y > 265) {
      doc.addPage();
      y = 20;
      drawEntriesHeader(y);
      y += 7.5;
    }

    const recRem = Math.max(0, rec.amount - rec.paidAmount);
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 7, 'F');
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);

    doc.text(formatDatePK(rec.date), 16, y + 4.8);
    doc.text((rec.purpose || 'General Entry').slice(0, 24), 42, y + 4.8);

    doc.setFont('helvetica', 'bold');
    if (rec.type === 'given') {
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.text('Given', 96, y + 4.8);
    } else {
      doc.setTextColor(roseRed[0], roseRed[1], roseRed[2]);
      doc.text('Taken', 96, y + 4.8);
    }

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(formatPKR(rec.amount, profile.currency), 125, y + 4.8);

    doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
    doc.text(formatPKR(rec.paidAmount, profile.currency), 155, y + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(recRem === 0 ? emeraldGreen[0] : roseRed[0], recRem === 0 ? emeraldGreen[1] : roseRed[1], recRem === 0 ? emeraldGreen[2] : roseRed[2]);
    doc.text(formatPKR(recRem, profile.currency), 194, y + 4.8, { align: 'right' });

    y += 7;
  });

  // 2. REPAYMENT LOG HISTORY TABLE
  y += 8;
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('PAYMENT LOGS & REPAYMENT HISTORY', 14, y);

  y += 4;

  const drawPaymentHeader = (currentY: number) => {
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(14, currentY, 182, 7.5, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('DATE', 16, currentY + 5);
    doc.text('FOR ENTRY', 42, currentY + 5);
    doc.text('METHOD', 96, currentY + 5);
    doc.text('TXN ID', 130, currentY + 5);
    doc.text('AMOUNT PAID', 194, currentY + 5, { align: 'right' });
  };

  drawPaymentHeader(y);
  y += 7.5;

  const allPayments = records
    .flatMap((r) =>
      (r.payments || []).map((p) => ({ ...p, entryPurpose: r.purpose || 'General Entry' }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (allPayments.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y, 182, 8, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    doc.text('No repayments recorded yet for this customer.', 18, y + 5.5);
    y += 8;
  } else {
    allPayments.forEach((p, index) => {
      if (y > 265) {
        doc.addPage();
        y = 20;
        drawPaymentHeader(y);
        y += 7.5;
      }

      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 182, 7, 'F');
      }

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);

      doc.text(formatDatePK(p.date), 16, y + 4.8);
      doc.text(p.entryPurpose.slice(0, 22), 42, y + 4.8);
      doc.text(p.paymentMethod.slice(0, 14), 96, y + 4.8);
      doc.text((p.transactionId || `PAY-${p.id.slice(0, 6)}`).slice(0, 16), 130, y + 4.8);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
      doc.text(formatPKR(p.amount, profile.currency), 194, y + 4.8, { align: 'right' });

      y += 7;
    });
  }

  // Divider Line
  y += 4;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);

  // Footer & Stamps
  if (y + 30 > 280) {
    doc.addPage();
    y = 20;
  } else {
    y += 6;
  }

  // Stamp Box
  doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.setLineWidth(0.8);
  doc.roundedRect(14, y, 80, 26, 2, 2, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text('VERIFIED DIGITAL STATEMENT', 18, y + 7);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('KhataPro Official Ledger Record', 18, y + 13);
  doc.text('Computer generated consolidated statement.', 18, y + 19);

  // Signature line
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(130, y + 16, 196, y + 16);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Authorized Shop Stamp & Signature', 163, y + 22, { align: 'center' });

  return doc;
}

export function downloadCustomerTransactionPDF(
  recordInput: UdharRecord | UdharRecord[],
  profile: UserProfile
) {
  const doc = generateCustomerTransactionPDF(recordInput, profile);
  const records = Array.isArray(recordInput) ? recordInput : [recordInput];
  const personName = records[0]?.personName || 'Customer';
  const fileName = `KhataPro_Statement_${personName.replace(/\s+/g, '_')}_${records.length}_entries.pdf`;
  doc.save(fileName);
}

// ============================================
// ALL TRANSACTIONS (UDHAR LEDGER) PDF EXPORT
// ============================================
export function generateAllTransactionsPDF(udharRecords: UdharRecord[], profile: UserProfile): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const shopName = profile.shopName || profile.name || 'KhataPro Ledger';
  const shopPhone = profile.phone || '0300-1234567';

  // Colors
  const darkNavy = [15, 23, 42];
  const primaryBlue = [37, 99, 235];
  const emeraldGreen = [16, 185, 129];
  const roseRed = [239, 68, 68];
  const slateGray = [100, 116, 139];

  // Header
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, 210, 36, 'F');
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(0, 36, 210, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(shopName, 14, 18);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Complete Udhar Transactions & Ledger Report | Ph: ${shopPhone}`, 14, 26);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 196, 18, { align: 'right' });
  doc.text(`Total Records: ${udharRecords.length}`, 196, 26, { align: 'right' });

  // Summary Math
  const totalGiven = udharRecords.filter((r) => r.type === 'given').reduce((acc, r) => acc + r.amount, 0);
  const totalGivenPaid = udharRecords.filter((r) => r.type === 'given').reduce((acc, r) => acc + r.paidAmount, 0);
  const totalTaken = udharRecords.filter((r) => r.type === 'taken').reduce((acc, r) => acc + r.amount, 0);
  const totalTakenPaid = udharRecords.filter((r) => r.type === 'taken').reduce((acc, r) => acc + r.paidAmount, 0);

  const netReceivable = Math.max(0, totalGiven - totalGivenPaid);
  const netPayable = Math.max(0, totalTaken - totalTakenPaid);

  let y = 46;

  // Summary Cards Grid
  const cardW = 43;
  const cardH = 18;

  // Given
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, cardW, cardH, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('TOTAL UDHAR GIVEN', 17, y + 6);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(formatPKR(totalGiven, profile.currency), 17, y + 14);

  // Taken
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(60, y, cardW, cardH, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('TOTAL UDHAR TAKEN', 63, y + 6);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(formatPKR(totalTaken, profile.currency), 63, y + 14);

  // Net Receivable
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(106, y, cardW, cardH, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.text('NET RECEIVABLE', 109, y + 6);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formatPKR(netReceivable, profile.currency), 109, y + 14);

  // Net Payable
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(153, y, cardW, cardH, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(roseRed[0], roseRed[1], roseRed[2]);
  doc.text('NET PAYABLE', 156, y + 6);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formatPKR(netPayable, profile.currency), 156, y + 14);

  y += 26;

  // Table Header Generator
  const drawTableHeader = (currentY: number) => {
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(14, currentY, 182, 8, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('DATE', 16, currentY + 5.5);
    doc.text('PERSON NAME', 40, currentY + 5.5);
    doc.text('TYPE', 85, currentY + 5.5);
    doc.text('TOTAL (PKR)', 114, currentY + 5.5);
    doc.text('PAID (PKR)', 140, currentY + 5.5);
    doc.text('REMAINING', 194, currentY + 5.5, { align: 'right' });
  };

  drawTableHeader(y);
  y += 8;

  let pageNum = 1;

  if (udharRecords.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y, 182, 10, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    doc.text('No transactions recorded in the ledger.', 18, y + 6.5);
  } else {
    udharRecords.forEach((r, idx) => {
      if (y > 265) {
        doc.addPage();
        pageNum++;
        // Running page header
        doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
        doc.rect(0, 0, 210, 12, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(`${shopName} - All Udhar Transactions Ledger`, 14, 8);
        doc.text(`Page ${pageNum}`, 196, 8, { align: 'right' });

        y = 20;
        drawTableHeader(y);
        y += 8;
      }

      const remaining = Math.max(0, r.amount - r.paidAmount);
      const isGiven = r.type === 'given';

      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 182, 8, 'F');
      }

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);

      doc.text(formatDatePK(r.date), 16, y + 5.5);
      doc.text(r.personName.slice(0, 22), 40, y + 5.5);

      doc.setFont('helvetica', 'bold');
      if (isGiven) {
        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.text('Given (Lend)', 85, y + 5.5);
      } else {
        doc.setTextColor(roseRed[0], roseRed[1], roseRed[2]);
        doc.text('Taken (Borrow)', 85, y + 5.5);
      }

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
      doc.text(formatPKR(r.amount, profile.currency), 114, y + 5.5);

      doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
      doc.text(formatPKR(r.paidAmount, profile.currency), 140, y + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(remaining === 0 ? emeraldGreen[0] : roseRed[0], remaining === 0 ? emeraldGreen[1] : roseRed[1], remaining === 0 ? emeraldGreen[2] : roseRed[2]);
      doc.text(formatPKR(remaining, profile.currency), 194, y + 5.5, { align: 'right' });

      y += 8;
    });
  }

  // Footer Signature
  if (y + 30 > 280) {
    doc.addPage();
    y = 20;
  } else {
    y += 12;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);

  y += 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('KhataPro Official Verified Report', 14, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('Auto-generated consolidated transaction summary statement.', 14, y + 9);

  doc.setDrawColor(148, 163, 184);
  doc.line(140, y + 8, 196, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Authorized Signature / Stamp', 168, y + 13, { align: 'center' });

  return doc;
}

export function downloadAllTransactionsPDF(udharRecords: UdharRecord[], profile: UserProfile) {
  const doc = generateAllTransactionsPDF(udharRecords, profile);
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`KhataPro_All_Transactions_${dateStr}.pdf`);
}

// ============================================
// ALL EXPENSES PDF EXPORT
// ============================================
export function generateAllExpensesPDF(expenses: Expense[], profile: UserProfile): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const shopName = profile.shopName || profile.name || 'KhataPro Ledger';
  const shopPhone = profile.phone || '0300-1234567';

  // Colors
  const darkNavy = [15, 23, 42];
  const primaryPurple = [147, 51, 234];
  const emeraldGreen = [16, 185, 129];
  const roseRed = [239, 68, 68];
  const slateGray = [100, 116, 139];

  // Top Banner
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, 210, 36, 'F');
  doc.setFillColor(primaryPurple[0], primaryPurple[1], primaryPurple[2]);
  doc.rect(0, 36, 210, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(shopName, 14, 18);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Complete Expenses Statement Report | Ph: ${shopPhone}`, 14, 26);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 196, 18, { align: 'right' });
  doc.text(`Total Records: ${expenses.length}`, 196, 26, { align: 'right' });

  // Summary Math
  const totalExpenses = expenses.filter((e) => e.type === 'expense').reduce((acc, e) => acc + e.amount, 0);
  const totalIncome = expenses.filter((e) => e.type === 'income').reduce((acc, e) => acc + e.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  let y = 46;

  // Summary Cards
  const cardW = 57;
  const cardH = 18;

  // Total Expenses
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(14, y, cardW, cardH, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('TOTAL EXPENSES (PKR)', 17, y + 6);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(roseRed[0], roseRed[1], roseRed[2]);
  doc.text(formatPKR(totalExpenses, profile.currency), 17, y + 14);

  // Total Income
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(76, y, cardW, cardH, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('TOTAL INCOME (PKR)', 79, y + 6);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.text(formatPKR(totalIncome, profile.currency), 79, y + 14);

  // Net Cash Flow
  doc.setFillColor(netBalance >= 0 ? 236 : 254, netBalance >= 0 ? 253 : 242, netBalance >= 0 ? 245 : 242);
  doc.roundedRect(139, y, cardW, cardH, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('NET CASH FLOW', 142, y + 6);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(netBalance >= 0 ? emeraldGreen[0] : roseRed[0], netBalance >= 0 ? emeraldGreen[1] : roseRed[1], netBalance >= 0 ? emeraldGreen[2] : roseRed[2]);
  doc.text(formatPKR(netBalance, profile.currency), 142, y + 14);

  y += 26;

  // Table Header
  const drawTableHeader = (currentY: number) => {
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(14, currentY, 182, 8, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('DATE', 16, currentY + 5.5);
    doc.text('TITLE / DESCRIPTION', 38, currentY + 5.5);
    doc.text('CATEGORY', 82, currentY + 5.5);
    doc.text('TYPE', 110, currentY + 5.5);
    doc.text('METHOD', 132, currentY + 5.5);
    doc.text('AMOUNT', 194, currentY + 5.5, { align: 'right' });
  };

  drawTableHeader(y);
  y += 8;

  let pageNum = 1;

  if (expenses.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y, 182, 10, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    doc.text('No expenses recorded yet.', 18, y + 6.5);
  } else {
    expenses.forEach((e, idx) => {
      if (y > 265) {
        doc.addPage();
        pageNum++;
        // Running page header
        doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
        doc.rect(0, 0, 210, 12, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(`${shopName} - Expenses Statement Report`, 14, 8);
        doc.text(`Page ${pageNum}`, 196, 8, { align: 'right' });

        y = 20;
        drawTableHeader(y);
        y += 8;
      }

      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 182, 8, 'F');
      }

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);

      doc.text(formatDatePK(e.date), 16, y + 5.5);
      doc.text(e.title.slice(0, 20), 38, y + 5.5);
      doc.text(e.category.slice(0, 13), 82, y + 5.5);

      doc.setFont('helvetica', 'bold');
      if (e.type === 'expense') {
        doc.setTextColor(roseRed[0], roseRed[1], roseRed[2]);
        doc.text('Expense', 110, y + 5.5);
      } else {
        doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
        doc.text('Income', 110, y + 5.5);
      }

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
      doc.text(e.paymentMethod.slice(0, 12), 132, y + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(e.type === 'expense' ? roseRed[0] : emeraldGreen[0], e.type === 'expense' ? roseRed[1] : emeraldGreen[1], e.type === 'expense' ? roseRed[2] : emeraldGreen[2]);
      doc.text(`${e.type === 'expense' ? '-' : '+'} ${formatPKR(e.amount, profile.currency)}`, 194, y + 5.5, { align: 'right' });

      y += 8;
    });
  }

  // Footer Signature
  if (y + 30 > 280) {
    doc.addPage();
    y = 20;
  } else {
    y += 12;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);

  y += 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('KhataPro Expenses Verified Report', 14, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('Auto-generated consolidated expenses statement document.', 14, y + 9);

  doc.setDrawColor(148, 163, 184);
  doc.line(140, y + 8, 196, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Authorized Signature / Stamp', 168, y + 13, { align: 'center' });

  return doc;
}

export function downloadAllExpensesPDF(expenses: Expense[], profile: UserProfile) {
  const doc = generateAllExpensesPDF(expenses, profile);
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`KhataPro_All_Expenses_${dateStr}.pdf`);
}

