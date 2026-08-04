import React, { useState } from 'react';
import { Expense, ExpenseCategory, PaymentMethod, Language, UserProfile } from '../types';
import { getTranslation } from '../utils/translations';
import { formatPKR, formatDatePK, getCategoryIcon } from '../utils/formatters';
import { ExpenseReceiptModal } from '../components/ExpenseReceiptModal';
import { downloadAllExpensesPDF } from '../utils/pdfGenerator';
import {
  Search,
  X,
  Calendar,
  CreditCard,
  RotateCcw,
  Plus,
  Mic,
  Camera,
  Banknote,
  TrendingDown,
  TrendingUp,
  Filter,
  Tag,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  Download,
  FileText,
} from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [deleteExpenseConfirmId, setDeleteExpenseConfirmId] = useState<string | null>(null);
  const [viewReceiptExpense, setViewReceiptExpense] = useState<Expense | null>(null);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedType !== 'all' ||
    selectedPaymentMethod !== 'all' ||
    dateRange !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedPaymentMethod('all');
    setDateRange('all');
  };

  const filteredExpenses = expenses.filter((e) => {
    if (selectedType !== 'all' && e.type !== selectedType) return false;
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (selectedPaymentMethod !== 'all' && e.paymentMethod !== selectedPaymentMethod) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const titleMatch = e.title.toLowerCase().includes(q);
      const categoryMatch = e.category.toLowerCase().includes(q);
      const methodMatch = e.paymentMethod.toLowerCase().includes(q);
      const amountMatch = e.amount.toString().includes(q);
      if (!titleMatch && !categoryMatch && !methodMatch && !amountMatch) return false;
    }

    if (dateRange !== 'all') {
      const itemDate = new Date(e.date);
      const now = new Date();
      if (dateRange === 'today') {
        if (itemDate.toDateString() !== now.toDateString()) return false;
      } else if (dateRange === 'week') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        if (itemDate < sevenDaysAgo) return false;
      } else if (dateRange === 'month') {
        if (itemDate.getMonth() !== now.getMonth() || itemDate.getFullYear() !== now.getFullYear()) return false;
      }
    }

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
            onClick={() => downloadAllExpensesPDF(expenses, profile)}
            className="p-2 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-200 transition-colors flex items-center gap-1"
            title="Export Expenses PDF"
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
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

      {/* Search & Filter Section */}
      <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expenses, income, category, note..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Type Filter & Reset Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl text-xs font-bold flex-1 max-w-xs">
            <button
              onClick={() => setSelectedType('all')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-[11px] ${
                selectedType === 'all' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-[11px] ${
                selectedType === 'expense' ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              Expenses (-)
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-[11px] ${
                selectedType === 'income' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              Income (+)
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors flex items-center gap-1"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Filter Chips Groups */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
          {/* Date Range Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 whitespace-nowrap pr-1">
              <Calendar className="w-3 h-3" /> Date:
            </span>
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDateRange(d.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                  dateRange === d.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Category Chips Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 whitespace-nowrap pr-1">
              <Tag className="w-3 h-3" /> Category:
            </span>
            {['all', 'Food', 'Transport', 'Home', 'Bills', 'Shopping', 'Health', 'Education', 'Business', 'Other'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : `${getCategoryIcon(cat)} ${cat}`}
                </button>
              )
            )}
          </div>

          {/* Payment Method Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 whitespace-nowrap pr-1">
              <CreditCard className="w-3 h-3" /> Method:
            </span>
            {['all', 'Cash', 'JazzCash', 'EasyPaisa', 'Bank Transfer', 'Card', 'Other'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedPaymentMethod(m)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                  selectedPaymentMethod === m
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {m === 'all' ? 'All Methods' : m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expense Entries List */}
      <div className="space-y-2.5">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
            <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching entries found</h4>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search query, date range, or filter chips.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-3.5 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 font-bold text-xs hover:bg-rose-200 transition-colors inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            )}
          </div>
        ) : (
          filteredExpenses.map((item) => (
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
                    <button
                      onClick={() => setViewReceiptExpense(item)}
                      className="inline-flex items-center gap-1 mt-1 text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors shadow-xs"
                    >
                      <ImageIcon className="w-3 h-3 text-indigo-500" />
                      <span>View Receipt Photo (تصویر دیکھیں)</span>
                      <ExternalLink className="w-2.5 h-2.5 text-indigo-400" />
                    </button>
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

                {item.receiptPhotoUrl && (
                  <button
                    onClick={() => setViewReceiptExpense(item)}
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600 hover:scale-105 transition-transform"
                    title="Preview Receipt Image"
                  >
                    <img src={item.receiptPhotoUrl} alt="Receipt" className="w-full h-full object-cover" />
                  </button>
                )}

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
        ))
        )}
      </div>

      {/* Expense Receipt Modal */}
      <ExpenseReceiptModal
        isOpen={!!viewReceiptExpense}
        onClose={() => setViewReceiptExpense(null)}
        expense={viewReceiptExpense}
        currency={profile.currency}
      />
    </div>
  );
};
