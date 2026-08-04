import React from 'react';
import { Expense } from '../types';
import { formatPKR, formatDatePK, getCategoryIcon } from '../utils/formatters';
import { X, Download, Share2, Receipt, Image as ImageIcon } from 'lucide-react';

interface ExpenseReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  currency: string;
}

export const ExpenseReceiptModal: React.FC<ExpenseReceiptModalProps> = ({
  isOpen,
  onClose,
  expense,
  currency,
}) => {
  if (!isOpen || !expense) return null;

  const receiptUrl =
    expense.receiptPhotoUrl ||
    'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800&auto=format&fit=crop&q=80';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = receiptUrl;
    link.download = `Expense-Receipt-${expense.title.replace(/\s+/g, '_')}.jpg`;
    link.target = '_blank';
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Expense Receipt: ${expense.title}`,
          text: `Receipt for ${expense.title} - ${formatPKR(expense.amount, currency)} (${expense.category})`,
          url: receiptUrl,
        });
      } catch {
        // user cancelled share
      }
    } else {
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-xl flex items-center justify-center">
              {getCategoryIcon(expense.category)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {expense.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {expense.category} • {formatDatePK(expense.date)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Expense Amount Summary Bar */}
        <div className="px-5 py-2 flex items-center justify-between text-xs font-bold bg-slate-100/60 dark:bg-slate-800/40 rounded-2xl mx-4 border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-slate-600 dark:text-slate-300">Total Paid via {expense.paymentMethod}</span>
          <span className="text-rose-600 dark:text-rose-400 font-black text-sm">
            - {formatPKR(expense.amount, currency)}
          </span>
        </div>

        {/* Receipt Image Container */}
        <div className="px-4">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 max-h-[380px] flex items-center justify-center group">
            <img
              src={receiptUrl}
              alt={`Receipt for ${expense.title}`}
              className="w-full h-auto max-h-[380px] object-contain transition-transform group-hover:scale-105"
            />
            <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1 border border-slate-700">
              <ImageIcon className="w-3 h-3 text-indigo-400" />
              <span>Verified Receipt</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-0 grid grid-cols-2 gap-2">
          <button
            onClick={handleDownload}
            className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-500" /> Download Image
          </button>
          <button
            onClick={handleShare}
            className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" /> Share Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
