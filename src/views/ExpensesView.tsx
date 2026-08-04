import React, { useState } from 'react';
import { Expense, ExpenseCategory, PaymentMethod, Language, UserProfile } from '../types';
import { getTranslation } from '../utils/translations';
import { formatPKR, formatDatePK, getCategoryIcon } from '../utils/formatters';
import { Plus, Mic, Camera, Banknote, TrendingDown, TrendingUp, Filter, Tag, Trash2 } from 'lucide-react';

interface ExpensesViewProps {
  expenses: Expense[];
  onOpenAddExpense: () => void;
  onOpenVoice: () => void;
  onOpenScan: () => void;
  onDeleteExpense?: (expenseId: string) => void;
  language: Language;
  profile: UserProfile;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  onOpenAddExpense,
  onOpenVoice,
  onOpenScan,
  onDeleteExpense,
  language,
  profile,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [deleteExpenseConfirmId, setDeleteExpenseConfirmId] = useState<string | null>(null);

  const filteredExpenses = expenses.filter((e) => {
    if (selectedType !== 'all' && e.type !== selectedType) return false;
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    return true;
  });

  const totalExpense = expenses
    .filter((e) => e.type === 'expense')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalIncome = expenses
    .filter((e) => e.type === 'income')
    .reduce((acc, e) => acc + e.amount, 0);

  const budgetProgress = Math.min(100, Math.round((totalExpense / (profile.monthlyBudget || 85000)) * 100));

  return (
    <div className="space-y-4 pb-20">
      {/* Header & Quick Action Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
            {getTranslation(language, 'navExpenses')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daily expenses & income tracking
          </p>
        </div>

        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
          <button
            onClick={onOpenVoice}
            className="p-2 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-200 transition-colors flex items-center gap-1"
            title="Voice Log"
          >
            <Mic className="w-4 h-4 text-purple-600 animate-pulse" />
          </button>
          <button
            onClick={onOpenScan}
            className="p-2 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-200 transition-colors flex items-center gap-1"
            title="Scan Receipt OCR"
          >
            <Camera className="w-4 h-4 text-indigo-600" />
          </button>
          <button
            onClick={onOpenAddExpense}
            className="px-3 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Income & Expense Totals Bar */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Total Expenses</span>
            <span className="text-base font-black text-rose-600 dark:text-rose-400">
              {formatPKR(totalExpense, profile.currency)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Total Income</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {formatPKR(totalIncome, profile.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Budget Limit Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300">Monthly Budget Usage</span>
          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{budgetProgress}% spent</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetProgress > 90
                ? 'bg-rose-500'
                : budgetProgress > 75
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${budgetProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Spent: {formatPKR(totalExpense, profile.currency)}</span>
          <span>Target: {formatPKR(profile.monthlyBudget, profile.currency)}</span>
        </div>
      </div>

      {/* Filter Tabs & Categories */}
      <div className="space-y-2">
        {/* Type Filter */}
        <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold max-w-xs">
          <button
            onClick={() => setSelectedType('all')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              selectedType === 'all' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => setSelectedType('expense')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              selectedType === 'expense' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Expenses (-)
          </button>
          <button
            onClick={() => setSelectedType('income')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              selectedType === 'income' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Income (+)
          </button>
        </div>

        {/* Category horizontal scroll */}
        <div className="flex items-center space-x-1.5 rtl:space-x-reverse overflow-x-auto pb-1">
          {['all', 'Food', 'Transport', 'Home', 'Bills', 'Shopping', 'Health', 'Education', 'Business', 'Other'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat === 'all' ? 'All Categories' : `${getCategoryIcon(cat)} ${cat}`}
              </button>
            )
          )}
        </div>
      </div>

      {/* Expense Entries List */}
      <div className="space-y-2.5">
        {filteredExpenses.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl shadow-inner">
                  {getCategoryIcon(item.category)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {item.category} • <span className="font-semibold text-slate-700 dark:text-slate-300">{item.paymentMethod}</span>
                  </p>
                  {item.receiptPhotoUrl && (
                    <span className="inline-block mt-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.2 rounded">
                      📷 Receipt attached
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div
                    className={`text-sm font-black ${
                      item.type === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {item.type === 'expense' ? '-' : '+'} {formatPKR(item.amount, profile.currency)}
                  </div>
                  <span className="text-[10px] text-slate-400 block">{formatDatePK(item.date)}</span>
                </div>

                <button
                  onClick={() => setDeleteExpenseConfirmId(deleteExpenseConfirmId === item.id ? null : item.id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expense Delete Confirmation */}
            {deleteExpenseConfirmId === item.id && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/90 rounded-2xl border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs text-rose-900 dark:text-rose-200 font-semibold animate-in fade-in">
                <span>Delete "{item.title}" ({formatPKR(item.amount, profile.currency)})?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteExpenseConfirmId(null)}
                    className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onDeleteExpense?.(item.id);
                      setDeleteExpenseConfirmId(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold shadow-sm"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
