import React from 'react';
import { UdharRecord, Expense, UserProfile, FinancialSummary, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { formatPKR } from '../utils/formatters';
import { getThemePresetConfig } from '../utils/theme';
import { Download, PieChart, TrendingUp, Sparkles, ShieldCheck, ArrowUpRight, CheckCircle } from 'lucide-react';

interface ReportsViewProps {
  summary: FinancialSummary;
  udharRecords: UdharRecord[];
  expenses: Expense[];
  profile: UserProfile;
  language: Language;
  onOpenExportModal: () => void;
  onOpenKhataAi: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  summary,
  udharRecords,
  expenses,
  profile,
  language,
  onOpenExportModal,
  onOpenKhataAi,
}) => {
  // Category breakdown for expenses
  const categoriesMap: Record<string, number> = {};
  expenses
    .filter((e) => e.type === 'expense')
    .forEach((e) => {
      categoriesMap[e.category] = (categoriesMap[e.category] || 0) + e.amount;
    });

  const categoryEntries = Object.entries(categoriesMap).sort((a, b) => b[1] - a[1]);
  const totalCategoryExpense = summary.monthlyExpenses || 1;

  // Udhar Recovery Calculation
  const totalGivenAmount = udharRecords
    .filter((r) => r.type === 'given')
    .reduce((acc, r) => acc + r.amount, 0);

  const totalCollectedAmount = udharRecords
    .filter((r) => r.type === 'given')
    .reduce((acc, r) => acc + r.paidAmount, 0);

  const recoveryRate = totalGivenAmount > 0 ? Math.round((totalCollectedAmount / totalGivenAmount) * 100) : 100;
  const theme = getThemePresetConfig(profile.themePreset);

  return (
    <div className="space-y-4 pb-20">
      {/* Header & Export Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
            {getTranslation(language, 'navReports')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Financial analytics & statement reports
          </p>
        </div>

        <button
          onClick={onOpenExportModal}
          className={`px-3.5 py-2 rounded-2xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 ${theme.primaryBtnClass}`}
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* UDHAR RECOVERY PROGRESS CARD */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs uppercase font-bold text-emerald-100 tracking-wider">
              Udhar Recovery Rate
            </span>
            <div className="text-3xl font-black mt-1">{recoveryRate}% Recovered</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-xl">
            📈
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${recoveryRate}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-emerald-100 font-medium">
          <span>Collected: {formatPKR(totalCollectedAmount, profile.currency)}</span>
          <span>Pending: {formatPKR(summary.pendingReceivables, profile.currency)}</span>
        </div>
      </div>

      {/* EXPENSE CATEGORY DISTRIBUTION */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-indigo-500" /> Expense Distribution by Category
          </h3>
          <span className="text-xs text-slate-400 font-medium">Monthly Breakdown</span>
        </div>

        {/* Category list with visual progress bars */}
        <div className="space-y-3">
          {categoryEntries.map(([cat, amt]) => {
            const pct = Math.round((amt / totalCategoryExpense) * 100);
            return (
              <div key={cat} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>{cat}</span>
                  <span>
                    {formatPKR(amt, profile.currency)} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI FINANCIAL RECOMMENDATIONS */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2 text-amber-300">
            <Sparkles className="w-4 h-4" /> Khata AI Smart Recommendation
          </h3>
          <button
            onClick={onOpenKhataAi}
            className="text-xs text-purple-200 underline hover:text-white"
          >
            Ask AI
          </button>
        </div>

        <p className="text-xs text-purple-100 leading-relaxed">
          💡 "You spent 22% on Food this month. Recovering <strong>Rs. {summary.pendingReceivables.toLocaleString()}</strong> pending Udhar from Ahmed Khan and Bilal Mobile Shop could boost your savings by 45%."
        </p>

        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={onOpenKhataAi}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md"
          >
            View AI Financial Strategy
          </button>
        </div>
      </div>
    </div>
  );
};
