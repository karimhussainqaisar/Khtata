import React, { useState } from 'react';
import { UdharRecord, PaymentMethod, Language, RepaymentLog } from '../types';
import { getTranslation } from '../utils/translations';
import { formatPKR } from '../utils/formatters';
import confetti from 'canvas-confetti';
import { X, CheckCircle, Banknote, CreditCard, FileText, Sparkles } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: UdharRecord | null;
  onSavePayment: (udharId: string, payment: Omit<RepaymentLog, 'id' | 'udharId'>) => void;
  language: Language;
  onOpenReceipt: (record: UdharRecord, payment: RepaymentLog) => void;
}

const PAYMENT_METHODS: PaymentMethod[] = ['JazzCash', 'Easypaisa', 'Cash', 'Bank Transfer', 'ATM/Card'];

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  record,
  onSavePayment,
  language,
  onOpenReceipt,
}) => {
  if (!isOpen || !record) return null;

  const remaining = Math.max(0, record.amount - record.paidAmount);
  const [amount, setAmount] = useState<string>(remaining.toString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('JazzCash');
  const [notes, setNotes] = useState('');
  const [txId, setTxId] = useState(() => `KP-${Math.floor(100000 + Math.random() * 900000)}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payNum = parseFloat(amount);
    if (isNaN(payNum) || payNum <= 0) return;

    const isFullSettlement = payNum >= remaining;

    const newPayment: Omit<RepaymentLog, 'id' | 'udharId'> = {
      amount: payNum,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      notes: notes.trim() || `Payment received via ${paymentMethod}`,
      transactionId: txId,
    };

    onSavePayment(record.id, newPayment);

    // Confetti on full settlement!
    if (isFullSettlement) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Trigger receipt view modal
    onOpenReceipt(
      {
        ...record,
        paidAmount: record.paidAmount + payNum,
      },
      {
        id: 'p-temp',
        udharId: record.id,
        ...newPayment,
      }
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" /> Receive / Record Payment
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customer: <span className="font-semibold text-slate-800 dark:text-slate-200">{record.personName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Remaining Balance</span>
            <div className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200">
              {formatPKR(remaining)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Original Amount</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatPKR(record.amount)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Payment Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Amount (Rs. PKR) *
            </label>
            <div className="relative">
              <Banknote className="absolute left-3 top-3 w-4 h-4 text-emerald-600" />
              <input
                type="number"
                required
                min="1"
                max={remaining * 2}
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setAmount(remaining.toString())}
                className="absolute right-2 top-2 px-2.5 py-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200"
              >
                Full Pay
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Received Via
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transaction ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Transaction ID / Reference
            </label>
            <input
              type="text"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-mono"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Remarks / Notes
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Received via JazzCash transfer"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center space-x-3 rtl:space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {getTranslation(language, 'cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Save & Generate Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
