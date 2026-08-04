import React, { useState } from 'react';
import { UdharRecord, PaymentMethod, Language, RepaymentLog } from '../types';
import { getTranslation } from '../utils/translations';
import { formatPKR } from '../utils/formatters';
import confetti from 'canvas-confetti';
import { X, CheckCircle, ArrowUpRight, Banknote, CreditCard, FileText, Sparkles } from 'lucide-react';

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

  const isGiven = record.type === 'given';
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

    const defaultNote = isGiven
      ? `Payment received via ${paymentMethod}`
      : `Payment paid via ${paymentMethod}`;

    const newPayment: Omit<RepaymentLog, 'id' | 'udharId'> = {
      amount: payNum,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      notes: notes.trim() || defaultNote,
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
              {isGiven ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>Receive Payment (وصولی)</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-5 h-5 text-rose-500" />
                  <span>Give Payment (ادائیگی)</span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isGiven ? 'Customer' : 'Lender / Person'}: <span className="font-semibold text-slate-800 dark:text-slate-200">{record.personName}</span>
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
        <div className={`mt-4 p-4 rounded-2xl border flex items-center justify-between ${
          isGiven
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-emerald-200/60 dark:border-emerald-800/40'
            : 'bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/40 border-rose-200/60 dark:border-rose-800/40'
        }`}>
          <div>
            <span className={`text-xs font-medium ${isGiven ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              {isGiven ? 'Remaining Receivable (وصول طلب بقایا)' : 'Remaining Payable (قابل ادا بقایا)'}
            </span>
            <div className={`text-xl font-extrabold ${isGiven ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200'}`}>
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
              {isGiven ? 'Payment Amount Received (Rs. PKR) *' : 'Payment Amount Paid (Rs. PKR) *'}
            </label>
            <div className="relative">
              <Banknote className={`absolute left-3 top-3 w-4 h-4 ${isGiven ? 'text-emerald-600' : 'text-rose-600'}`} />
              <input
                type="number"
                required
                min="1"
                max={remaining * 2}
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-9 pr-20 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-lg font-bold focus:outline-none focus:ring-2 ${
                  isGiven ? 'focus:ring-emerald-500' : 'focus:ring-rose-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setAmount(remaining.toString())}
                className={`absolute right-2 top-2 px-2.5 py-1 text-xs font-bold rounded-lg ${
                  isGiven
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                    : 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-200'
                }`}
              >
                Full Pay
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isGiven ? 'Payment Received Via' : 'Payment Paid Via'}
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 ${
                  isGiven ? 'focus:ring-emerald-500' : 'focus:ring-rose-500'
                }`}
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
                placeholder={isGiven ? "e.g. Received via JazzCash transfer" : "e.g. Paid via JazzCash transfer"}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 ${
                  isGiven ? 'focus:ring-emerald-500' : 'focus:ring-rose-500'
                }`}
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
              className={`flex-1 py-3 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-1.5 ${
                isGiven
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20'
                  : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-600/20'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {isGiven ? 'Record Received Payment' : 'Record Given Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
