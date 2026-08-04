import React, { useState } from 'react';
import { Expense, ExpenseCategory, PaymentMethod, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { X, Tag, Banknote, Calendar, CreditCard, Mic, Camera } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'>) => void;
  language: Language;
  onOpenVoice: () => void;
  onOpenScan: () => void;
}

const CATEGORIES: { id: ExpenseCategory; label: string; icon: string }[] = [
  { id: 'Food', label: 'Food 🍔', icon: '🍔' },
  { id: 'Transport', label: 'Transport 🚗', icon: '🚗' },
  { id: 'Home', label: 'Home 🏠', icon: '🏠' },
  { id: 'Bills', label: 'Bills 💡', icon: '💡' },
  { id: 'Shopping', label: 'Shopping 🛒', icon: '🛒' },
  { id: 'Health', label: 'Health 🏥', icon: '🏥' },
  { id: 'Education', label: 'Education 📚', icon: '📚' },
  { id: 'Business', label: 'Business 🐔', icon: '🐔' },
  { id: 'Other', label: 'Other 📦', icon: '📦' },
];

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'JazzCash', 'Easypaisa', 'Bank Transfer', 'ATM/Card'];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  language,
  onOpenVoice,
  onOpenScan,
}) => {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [receiptPhotoUrl, setReceiptPhotoUrl] = useState<string>('');

  if (!isOpen) return null;

  const handleReceiptFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReceiptPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    onSave({
      title: title.trim(),
      amount: numAmount,
      category,
      paymentMethod,
      date,
      type,
      receiptPhotoUrl: receiptPhotoUrl || undefined,
    });

    setTitle('');
    setAmount('');
    setReceiptPhotoUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {type === 'expense' ? 'Add Expense' : 'Add Income'}
          </h2>
          <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
            <button
              type="button"
              onClick={() => { onClose(); onOpenVoice(); }}
              className="p-1.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300 hover:bg-purple-100 transition-colors text-xs font-medium flex items-center gap-1"
              title="Voice Expense Log"
            >
              <Mic className="w-4 h-4 text-purple-500 animate-bounce" />
              <span>Voice</span>
            </button>
            <button
              type="button"
              onClick={() => { onClose(); onOpenScan(); }}
              className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300 hover:bg-indigo-100 transition-colors text-xs font-medium flex items-center gap-1"
              title="Scan Receipt OCR"
            >
              <Camera className="w-4 h-4 text-indigo-500" />
              <span>Scan</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Income (+)
            </button>
          </div>

          {/* Expense Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title / Description *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Electricity Bill, Lunch with team"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Amount (PKR) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount (Rs. PKR) *
            </label>
            <div className="relative">
              <Banknote className="absolute left-3 top-3 w-4 h-4 text-rose-500" />
              <input
                type="number"
                required
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="2500"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Category
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-left flex items-center gap-1.5 transition-all ${
                    category === cat.id
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span className="truncate">{cat.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Method (Pakistani Accounts)
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Attach Receipt Image */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Attach Receipt Photo (رسید کی تصویر)
            </label>
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all">
                <Camera className="w-4 h-4 text-indigo-500" />
                <span>{receiptPhotoUrl ? 'Change Receipt Photo' : 'Upload Receipt Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptFileUpload}
                  className="hidden"
                />
              </label>

              {receiptPhotoUrl && (
                <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-indigo-500 shadow-sm flex-shrink-0 group">
                  <img src={receiptPhotoUrl} alt="Receipt Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setReceiptPhotoUrl('')}
                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
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
              className={`flex-1 py-3 rounded-xl text-white font-bold text-sm shadow-md transition-all active:scale-98 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              {getTranslation(language, 'save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
