import { UdharRecord, RepaymentLog, Language } from '../types';
import { formatPKR, formatDatePK } from './formatters';

export const generateUdharShareMessage = (record: UdharRecord, lang: Language = 'en'): string => {
  const remaining = Math.max(0, record.amount - record.paidAmount);
  
  if (lang === 'ur') {
    return `السلام علیکم ${record.personName} صاحب،

آپ کے کھاتہ کا تفصیل درج ذیل ہے:

کل رقم: ${formatPKR(record.amount)}
ادا شدہ رقم: ${formatPKR(record.paidAmount)}
بقایا واجب الادا رقم: ${formatPKR(remaining)}
آخری تاریخ: ${formatDatePK(record.dueDate)}

شکریہ!
(کھاتہ پرو - ڈیجیٹل کھاتہ مینیجر)`;
  }

  return `Assalam-o-Alaikum ${record.personName},

This is a statement regarding your Udhar balance:

Total Amount: ${formatPKR(record.amount)}
Paid: ${formatPKR(record.paidAmount)}
Remaining Balance: ${formatPKR(remaining)}
Due Date: ${formatDatePK(record.dueDate)}

Thank you.
(Sent via KhataPro App)`;
};

export const generateReminderMessage = (
  record: UdharRecord,
  timing: 'before_due' | 'on_due' | 'overdue',
  lang: Language = 'en'
): string => {
  const remaining = Math.max(0, record.amount - record.paidAmount);

  if (lang === 'ur') {
    if (timing === 'overdue') {
      return `السلام علیکم ${record.personName} صاحب،
گزارش ہے کہ آپ کے ذمے ${formatPKR(remaining)} کی رقم کی میعاد ${formatDatePK(record.dueDate)} کو ختم ہو چکی ہے۔
براہ کرم جلد از جلد رقم ادا کرنے کی زحمت فرمائیں۔
جزاک اللہ!`;
    }
    if (timing === 'on_due') {
      return `السلام علیکم ${record.personName} صاحب،
آج آپ کے کھاتے کی بقایا رقم ${formatPKR(remaining)} کی ادائیگی کی آخری تاریخ ہے۔
مہربانی فرما کر ادائیگی کر دیں۔
شکریہ!`;
    }
    return `السلام علیکم ${record.personName} صاحب،
یاد دہانی: آپ کے ذمے ${formatPKR(remaining)} کی بقایا رقم کی میعاد ${formatDatePK(record.dueDate)} ہے۔
بہت شکریہ!`;
  }

  // English
  if (timing === 'overdue') {
    return `Assalam-o-Alaikum ${record.personName},
Kind reminder that your Udhar balance of ${formatPKR(remaining)} was due on ${formatDatePK(record.dueDate)} and is now OVERDUE.
Please arrange for payment at your earliest convenience (JazzCash / Easypaisa / Cash).
Thank you!`;
  }
  if (timing === 'on_due') {
    return `Assalam-o-Alaikum ${record.personName},
Today (${formatDatePK(record.dueDate)}) is the due date for your pending balance of ${formatPKR(remaining)}.
Please process the payment today.
Thank you!`;
  }
  return `Assalam-o-Alaikum ${record.personName},
Friendly reminder regarding your upcoming payment of ${formatPKR(remaining)} due on ${formatDatePK(record.dueDate)}.
Thank you for your cooperation.`;
};

export const generatePaymentReceiptMessage = (
  record: UdharRecord,
  payment: RepaymentLog,
  lang: Language = 'en'
): string => {
  const remaining = Math.max(0, record.amount - record.paidAmount);
  
  if (lang === 'ur') {
    return `🧾 *کھاتہ پرو - ادائیگی کی رسید*
------------------------------
کسٹمر: ${record.personName}
وصول شدہ رقم: ${formatPKR(payment.amount)}
بقایا بیلنس: ${formatPKR(remaining)}
طریقہ ادائیگی: ${payment.paymentMethod}
تاریخ: ${formatDatePK(payment.date)}
ٹرانزیکشن ID: ${payment.transactionId || 'KP-' + Math.floor(100000 + Math.random() * 900000)}

آپ کا بہت بہت شکریہ!`;
  }

  return `🧾 *KhataPro Payment Receipt*
------------------------------
Customer: ${record.personName}
Paid Amount: ${formatPKR(payment.amount)}
Remaining Balance: ${formatPKR(remaining)}
Payment Method: ${payment.paymentMethod}
Date: ${formatDatePK(payment.date)}
Tx ID: ${payment.transactionId || 'KP-' + Math.floor(100000 + Math.random() * 900000)}

Thank you for your prompt payment!`;
};

export const formatWhatsAppPhone = (phone: string): string => {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.slice(1);
  }
  if (!cleaned.startsWith('92') && cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }
  return cleaned;
};

export const getWhatsAppLink = (phone: string, message: string): string => {
  const formattedPhone = formatWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
};
