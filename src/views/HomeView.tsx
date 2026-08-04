import React from 'react';
import { UdharRecord, Expense, UserProfile, FinancialSummary, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { formatPKR, formatDatePK, getDaysRemainingOrOverdue } from '../utils/formatters';
import { getThemePresetConfig } from '../utils/theme';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  PiggyBank,
  TrendingUp,
  AlertTriangle,
  Plus,
  Send,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Clock,
  Mic,
  Camera,
  CheckCircle2,
} from 'lucide-react';

interface HomeViewProps {
  summary: FinancialSummary;
  udharRecords: UdharRecord[];
  expenses: Expense[];
  profile: UserProfile;
  language: Language;
  onOpenAddUdhar: (type?: 'given' | 'taken') => void;
  onOpenAddExpense: () => void;
  onOpenRecordPayment: (record: UdharRecord) => void;
  onOpenWhatsAppReminder: (record: UdharRecord) => void;
  onOpenKhataAi: () => void;
  onOpenVoice: () => void;
  onOpenScan: () => void;
  onSelectTab: (tab: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  summary,
  udharRecords,
  expenses,
  profile,
  language,
  onOpenAddUdhar,
  onOpenAddExpense,
  onOpenRecordPayment,
  onOpenWhatsAppReminder,
  onOpenKhataAi,
  onOpenVoice,
  onOpenScan,
  onSelectTab,
}) => {
  const overdueRecords = udharRecords.filter(
    (r) => (r.status === 'overdue' || r.status === 'partially_paid') && r.amount > r.paidAmount
  );

  const upcomingDueRecords = udharRecords
    .filter((r) => r.amount > r.paidAmount)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const recentExpenses = expenses.slice(0, 4);
  const theme = getThemePresetConfig(profile.themePreset);

  return (
    <div className="space-y-5 pb-20">
      {/* Top Banner Greeting */}
      <div className={`p-6 rounded-3xl bg-gradient-to-br ${theme.heroBannerGradient} text-white shadow-2xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
              {profile.isShopkeeper ? 'Shopkeeper Dashboard' : 'Personal Khata'}
            </span>
            <h2 className="text-xl font-black mt-0.5">
              Assalam-o-Alaikum, {profile.name}! 👋
            </h2>
            <p className="text-xs text-white/80 mt-1">
              KhataPro smart digital notebook is active.
            </p>
          </div>

          <button
            onClick={onOpenKhataAi}
            className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Advice</span>
          </button>
        </div>
      </div>

      {/* Main 4 Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Money Given (Maine Diya) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-bold">{getTranslation(language, 'totalMoneyGiven')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatPKR(summary.totalMoneyGiven, profile.currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Pending:</span>
            <strong className="text-emerald-700 dark:text-emerald-300 font-bold">
              {formatPKR(summary.pendingReceivables, profile.currency)}
            </strong>
          </div>
        </div>

        {/* Total Money Taken (Maine Liya) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-bold">{getTranslation(language, 'totalMoneyTaken')}</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatPKR(summary.totalMoneyTaken, profile.currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Owed:</span>
            <strong className="text-rose-700 dark:text-rose-300 font-bold">
              {formatPKR(summary.pendingPayments, profile.currency)}
            </strong>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-bold">{getTranslation(language, 'monthlyExpenses')}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatPKR(summary.monthlyExpenses, profile.currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Target budget: {formatPKR(profile.monthlyBudget, profile.currency)}
          </div>
        </div>

        {/* Savings */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-bold">{getTranslation(language, 'savings')}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {formatPKR(summary.savings, profile.currency)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            Positive Cashflow ✓
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          {getTranslation(language, 'quickActions')}
        </h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <button
            onClick={() => onOpenAddUdhar('given')}
            className="flex flex-col items-center p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 mb-1.5">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold leading-tight">Udhar Dena</span>
          </button>

          <button
            onClick={() => onOpenAddUdhar('taken')}
            className="flex flex-col items-center p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 mb-1.5">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold leading-tight">Udhar Lena</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="flex flex-col items-center p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 mb-1.5">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold leading-tight">Add Expense</span>
          </button>

          <button
            onClick={onOpenVoice}
            className="flex flex-col items-center p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 mb-1.5">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-[11px] font-bold leading-tight">Voice Log</span>
          </button>
        </div>
      </div>

      {/* Overdue Recovery Alert (if any) */}
      {summary.overdueCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/60 dark:to-amber-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                {summary.overdueCount} Udhar Overdue Payment{summary.overdueCount > 1 ? 's' : ''}!
              </h4>
              <p className="text-[11px] text-rose-700 dark:text-rose-300">
                Send WhatsApp reminders now to recover funds faster.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('udhar')}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm whitespace-nowrap"
          >
            Recover
          </button>
        </div>
      )}

      {/* UPCOMING PAYMENT DUE DATES */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-500" /> {getTranslation(language, 'upcomingPayments')}
          </h3>
          <button
            onClick={() => onSelectTab('udhar')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline"
          >
            {getTranslation(language, 'viewAll')} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {upcomingDueRecords.map((record) => {
            const remaining = record.amount - record.paidAmount;
            const dueInfo = getDaysRemainingOrOverdue(record.dueDate);

            return (
              <div
                key={record.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-sm overflow-hidden">
                    {record.profilePhoto ? (
                      <img src={record.profilePhoto} alt={record.personName} className="w-full h-full object-cover" />
                    ) : (
                      record.personName.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{record.personName}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{record.purpose}</p>
                    <span
                      className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        dueInfo.isOverdue
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
                      }`}
                    >
                      {dueInfo.label}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {formatPKR(remaining, profile.currency)}
                  </div>
                  <div className="mt-1 flex items-center justify-end space-x-1 rtl:space-x-reverse">
                    <button
                      onClick={() => onOpenWhatsAppReminder(record)}
                      className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-[11px] font-semibold flex items-center gap-1"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenRecordPayment(record)}
                      className={`px-2 py-1 rounded-lg text-white text-[11px] font-bold transition-all active:scale-95 ${
                        record.type === 'given'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-rose-600 hover:bg-rose-700'
                      }`}
                    >
                      {record.type === 'given'
                        ? getTranslation(language, 'receivePayment')
                        : getTranslation(language, 'givePayment')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT EXPENSES LOG */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-emerald-500" /> {getTranslation(language, 'recentTransactions')}
          </h3>
          <button
            onClick={() => onSelectTab('expenses')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline"
          >
            {getTranslation(language, 'viewAll')} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recentExpenses.map((expense) => (
            <div
              key={expense.id}
              className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg">
                  {expense.category === 'Food' ? '🍔' : expense.category === 'Bills' ? '💡' : '📦'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{expense.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {expense.category} • {expense.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-xs font-bold ${
                    expense.type === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {expense.type === 'expense' ? '-' : '+'} {formatPKR(expense.amount, profile.currency)}
                </span>
                <span className="text-[10px] text-slate-400 block">{formatDatePK(expense.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
