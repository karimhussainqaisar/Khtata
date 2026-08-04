import React, { useRef, useState } from 'react';
import { UdharRecord, RepaymentLog, Language } from '../types';
import { formatPKR, formatDatePK } from '../utils/formatters';
import { generatePaymentReceiptMessage, getWhatsAppLink } from '../utils/whatsapp';
import { downloadReceiptImage, shareReceiptImage } from '../utils/receiptImage';
import { X, Share2, Download, CheckCircle, ShieldCheck, Printer, Image as ImageIcon, Send } from 'lucide-react';

interface DigitalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: UdharRecord | null;
  payment: RepaymentLog | null;
  language: Language;
  shopName: string;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  isOpen,
  onClose,
  record,
  payment,
  language,
  shopName,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [sharingImage, setSharingImage] = useState(false);

  if (!isOpen || !record || !payment) return null;

  const remaining = Math.max(0, record.amount - record.paidAmount);

  const handleShareWhatsAppText = () => {
    const msg = generatePaymentReceiptMessage(record, payment, language);
    const link = getWhatsAppLink(record.phone, msg);
    window.open(link, '_blank');
  };

  const handleShareImage = async () => {
    setSharingImage(true);
    await shareReceiptImage(record, payment, shopName);
    setSharingImage(false);
  };

  const handleDownloadImage = () => {
    downloadReceiptImage(record, payment, shopName);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Official Khata Receipt
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Card */}
        <div
          ref={receiptRef}
          className="mt-4 p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-emerald-50/30 dark:from-slate-800/90 dark:to-slate-900 border border-slate-200 dark:border-slate-700 shadow-inner"
        >
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white font-black text-lg shadow-md mb-1">
              KP
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              {shopName || 'KhataPro Digital Ledger'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Payment Voucher & Statement</p>
          </div>

          {/* Amount Received Box */}
          <div className="my-4 p-3 rounded-xl bg-emerald-500 text-white text-center shadow-md">
            <span className="text-[11px] uppercase font-bold text-emerald-100 block tracking-wider">
              Amount Paid
            </span>
            <div className="text-2xl font-black">{formatPKR(payment.amount)}</div>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold bg-white/20 rounded-full">
              {payment.paymentMethod}
            </span>
          </div>

          {/* Details Table */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Customer Name</span>
              <span className="font-bold text-slate-900 dark:text-white">{record.personName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Phone</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{record.phone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Transaction ID</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{payment.transactionId || 'KP-102938'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Payment Date</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{formatDatePK(payment.date)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Original Loan</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{formatPKR(record.amount)}</span>
            </div>
            <div className="flex justify-between py-1 font-bold text-slate-900 dark:text-white">
              <span>Remaining Balance</span>
              <span className={remaining === 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {remaining === 0 ? 'Fully Settled ✓' : formatPKR(remaining)}
              </span>
            </div>
          </div>

          {/* Stamp / Footer */}
          <div className="mt-4 pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified KhataPro
            </span>
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          {/* Primary Action: Share Image Receipt */}
          <button
            onClick={handleShareImage}
            disabled={sharingImage}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
          >
            <ImageIcon className="w-4 h-4" />
            <span>{sharingImage ? 'Generating Image...' : 'Share Image Receipt (تصویر کے ساتھ شیئر کریں)'}</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleDownloadImage}
              className="py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1 transition-colors"
              title="Download Image File"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" /> Image PNG
            </button>
            <button
              onClick={handleShareWhatsAppText}
              className="py-2 px-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-100 dark:hover:bg-emerald-900/50 flex items-center justify-center gap-1 transition-colors"
              title="WhatsApp Text Statement"
            >
              <Send className="w-3.5 h-3.5" /> Text Msg
            </button>
            <button
              onClick={handlePrint}
              className="py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
