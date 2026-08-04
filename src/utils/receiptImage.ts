import { UdharRecord, RepaymentLog } from '../types';
import { formatPKR, formatDatePK } from './formatters';

export function generateReceiptCanvas(
  record: UdharRecord,
  payment: RepaymentLog,
  shopName: string
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const scale = 2; // High-DPI crisp scale
  const width = 480;
  const height = 640;

  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#0F172A'; // Slate 900
  ctx.fillRect(0, 0, width, height);

  // Outer Card
  const pad = 20;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;

  // Card Background
  ctx.fillStyle = '#1E293B'; // Slate 800
  ctx.beginPath();
  ctx.roundRect(pad, pad, cardW, cardH, 24);
  ctx.fill();

  // Top Accent Banner
  const isFull = record.paidAmount >= record.amount;
  ctx.fillStyle = isFull ? '#10B981' : '#0EA5E9'; // Emerald or Sky
  ctx.beginPath();
  ctx.roundRect(pad, pad, cardW, 80, [24, 24, 0, 0]);
  ctx.fill();

  // Header Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(shopName || 'KhataPro Digital Ledger', width / 2, pad + 38);

  ctx.font = '600 12px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText(isFull ? 'OFFICIAL SETTLEMENT RECEIPT' : 'PARTIAL PAYMENT VOUCHER', width / 2, pad + 58);

  // Amount Hero Box
  const boxY = pad + 105;
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.roundRect(pad + 20, boxY, cardW - 40, 110, 16);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('AMOUNT RECEIVED / وصولی رقم', width / 2, boxY + 30);

  ctx.fillStyle = '#34D399'; // Emerald 400
  ctx.font = 'black 32px system-ui, -apple-system, sans-serif';
  ctx.fillText(formatPKR(payment.amount), width / 2, boxY + 68);

  ctx.fillStyle = '#CBD5E1';
  ctx.font = '600 12px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Via ${payment.paymentMethod}`, width / 2, boxY + 92);

  // Table Details
  const startY = boxY + 135;
  const leftX = pad + 35;
  const rightX = width - pad - 35;

  const rows = [
    { label: 'Customer Name (گاہک ਦਾ نام)', val: record.personName, isBold: true },
    { label: 'Phone Number', val: record.phone, isBold: false },
    { label: 'Transaction ID', val: payment.transactionId || 'KP-10029', isBold: false },
    { label: 'Payment Date', val: formatDatePK(payment.date), isBold: false },
    { label: 'Total Original Udhar', val: formatPKR(record.amount), isBold: false },
    {
      label: 'Remaining Balance (بقیہ)',
      val: Math.max(0, record.amount - record.paidAmount) === 0 ? '0 (Fully Settled ✓)' : formatPKR(Math.max(0, record.amount - record.paidAmount)),
      isBold: true,
      color: Math.max(0, record.amount - record.paidAmount) === 0 ? '#34D399' : '#F87171',
    },
  ];

  let currY = startY;
  ctx.font = '12px system-ui, -apple-system, sans-serif';

  rows.forEach((row) => {
    // Divider line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(leftX, currY);
    ctx.lineTo(rightX, currY);
    ctx.stroke();

    currY += 22;

    // Label
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(row.label, leftX, currY);

    // Value
    ctx.textAlign = 'right';
    ctx.fillStyle = row.color || (row.isBold ? '#FFFFFF' : '#E2E8F0');
    ctx.font = row.isBold ? 'bold 13px system-ui, -apple-system, sans-serif' : '500 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(row.val, rightX, currY);

    currY += 10;
  });

  // Stamp Badge & Footer
  const footerY = height - pad - 45;

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftX, footerY);
  ctx.lineTo(rightX, footerY);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#34D399';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('✓ VERIFIED BY KHATAPRO DIGITAL LEDGER', leftX, footerY + 25);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748B';
  ctx.font = '500 10px system-ui, -apple-system, sans-serif';
  ctx.fillText(new Date().toLocaleDateString(), rightX, footerY + 25);

  return canvas;
}

export function downloadReceiptImage(record: UdharRecord, payment: RepaymentLog, shopName: string) {
  const canvas = generateReceiptCanvas(record, payment, shopName);
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `KhataPro-Receipt-${record.personName.replace(/\s+/g, '_')}-${payment.transactionId || 'pay'}.png`;
  link.href = dataUrl;
  link.click();
}

export async function shareReceiptImage(record: UdharRecord, payment: RepaymentLog, shopName: string): Promise<boolean> {
  const canvas = generateReceiptCanvas(record, payment, shopName);

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }

      const file = new File(
        [blob],
        `KhataPro-Receipt-${record.personName.replace(/\s+/g, '_')}.png`,
        { type: 'image/png' }
      );

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `Payment Receipt - ${shopName}`,
            text: `Payment Receipt for ${record.personName} - Amount: ${formatPKR(payment.amount)}`,
            files: [file],
          });
          resolve(true);
        } catch {
          downloadReceiptImage(record, payment, shopName);
          resolve(false);
        }
      } else {
        // Fallback: Download receipt image directly
        downloadReceiptImage(record, payment, shopName);
        resolve(false);
      }
    }, 'image/png');
  });
}
