import React, { useState } from 'react';
import { UdharRecord, UdharType, UdharStatus, Language, UserProfile, RepaymentLog } from '../types';
import { getTranslation } from '../utils/translations';
import { formatPKR, formatDatePK, getDaysRemainingOrOverdue } from '../utils/formatters';
import { getThemePresetConfig } from '../utils/theme';
import { CustomerPdfModal } from '../components/CustomerPdfModal';
import { downloadAllTransactionsPDF } from '../utils/pdfGenerator';
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  MessageSquare,
  Share2,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  Calendar,
  ChevronDown,
  ChevronUp,
  Receipt,
  FileText,
  Trash2,
  Camera,
  Download,
  X,
  RotateCcw,
  Filter,
} from 'lucide-react';

interface UdharViewProps {
  udharRecords: UdharRecord[];
  onOpenAddUdhar: (type?: UdharType) => void;
  onOpenRecordPayment: (record: UdharRecord) => void;
  onOpenWhatsAppReminder: (record: UdharRecord) => void;
  onOpenWhatsAppShare: (record: UdharRecord) => void;
  onOpenReceipt?: (record: UdharRecord, payment: RepaymentLog) => void;
  onDeleteUdharRecord?: (recordId: string) => void;
  onDeletePayment?: (udharId: string, paymentId: string) => void;
  onUpdateUdharRecord?: (recordId: string, updated: Partial<UdharRecord>) => void;
  language: Language;
  profile: UserProfile;
}

export const UdharView: React.FC<UdharViewProps> = ({
  udharRecords,
  onOpenAddUdhar,
  onOpenRecordPayment,
  onOpenWhatsAppReminder,
  onOpenWhatsAppShare,
  onOpenReceipt,
  onDeleteUdharRecord,
  onDeletePayment,
  onUpdateUdharRecord,
  language,
  profile,
}) => {
  const [activeType, setActiveType] = useState<UdharType>('given');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [viewMode, setViewMode] = useState<'customer' | 'individual'>('customer');
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletePaymentConfirm, setDeletePaymentConfirm] = useState<{ udharId: string; paymentId: string } | null>(null);
  const [selectedPdfRecord, setSelectedPdfRecord] = useState<UdharRecord | null>(null);
  const theme = getThemePresetConfig(profile.themePreset);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    statusFilter !== 'all' ||
    dateRange !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange('all');
  };

  const filteredRecords = udharRecords.filter((r) => {
    if (r.type !== activeType) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const nameMatch = r.personName.toLowerCase().includes(q);
      const phoneMatch = r.phone.includes(q);
      const purposeMatch = r.purpose?.toLowerCase().includes(q);
      const notesMatch = r.notes?.toLowerCase().includes(q);
      const amountMatch = r.amount.toString().includes(q) || (r.amount - r.paidAmount).toString().includes(q);
      if (!nameMatch && !phoneMatch && !purposeMatch && !notesMatch && !amountMatch) return false;
    }

    if (statusFilter === 'pending') {
      if (r.status !== 'pending' && r.status !== 'partially_paid') return false;
    } else if (statusFilter === 'overdue') {
      if (r.status !== 'overdue') return false;
    } else if (statusFilter === 'paid') {
      if (r.status !== 'fully_paid') return false;
    }

    if (dateRange !== 'all') {
      const itemDate = new Date(r.date);
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

  // Group filtered records by Customer (Person Name)
  interface CustomerGroup {
    personName: string;
    phone: string;
    profilePhoto?: string;
    records: UdharRecord[];
    totalAmount: number;
    totalPaidAmount: number;
    totalRemaining: number;
    hasOverdue: boolean;
  }

  const customerGroups: CustomerGroup[] = React.useMemo(() => {
    const map = new Map<string, CustomerGroup>();

    filteredRecords.forEach((record) => {
      const key = record.personName.trim().toLowerCase();
      const remaining = Math.max(0, record.amount - record.paidAmount);
      const existing = map.get(key);

      if (existing) {
        existing.records.push(record);
        existing.totalAmount += record.amount;
        existing.totalPaidAmount += record.paidAmount;
        existing.totalRemaining += remaining;
        if (record.status === 'overdue') existing.hasOverdue = true;
        if (!existing.profilePhoto && record.profilePhoto) {
          existing.profilePhoto = record.profilePhoto;
        }
        if (record.phone && (!existing.phone || existing.phone === 'N/A')) {
          existing.phone = record.phone;
        }
      } else {
        map.set(key, {
          personName: record.personName,
          phone: record.phone || 'N/A',
          profilePhoto: record.profilePhoto,
          records: [record],
          totalAmount: record.amount,
          totalPaidAmount: record.paidAmount,
          totalRemaining: remaining,
          hasOverdue: record.status === 'overdue',
        });
      }
    });

    return Array.from(map.values());
  }, [filteredRecords]);

  const totalGiven = udharRecords.filter((r) => r.type === 'given').reduce((acc, r) => acc + (r.amount - r.paidAmount), 0);
  const totalTaken = udharRecords.filter((r) => r.type === 'taken').reduce((acc, r) => acc + (r.amount - r.paidAmount), 0);

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
            {getTranslation(language, 'navUdhar')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Digital notebook for Pakistani credit & debts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadAllTransactionsPDF(udharRecords, profile)}
            className="px-3 py-2 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-200 transition-colors flex items-center gap-1.5"
            title="Export All Transactions PDF"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button
            onClick={() => onOpenAddUdhar(activeType)}
            className={`px-3.5 py-2 rounded-2xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 ${theme.primaryBtnClass}`}
          >
            <Plus className="w-4 h-4" /> Add Record
          </button>
        </div>
      </div>

      {/* Main 2 Sub-Tabs: 1. Maine Diya (Given) / 2. Maine Liya (Taken) */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveType('given')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeType === 'given'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>{getTranslation(language, 'maineDiya')}</span>
          <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-white/20 rounded-full font-mono">
            {formatPKR(totalGiven, profile.currency)}
          </span>
        </button>

        <button
          onClick={() => setActiveType('taken')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeType === 'taken'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>{getTranslation(language, 'maineLiya')}</span>
          <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-white/20 rounded-full font-mono">
            {formatPKR(totalTaken, profile.currency)}
          </span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={getTranslation(language, 'searchPlaceholder') + " (Name, phone, note...)"}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
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

        {/* Filter Chips & Reset Button */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between gap-2">
            {/* Status Filter Pills */}
            <div className="flex items-center space-x-1.5 rtl:space-x-reverse overflow-x-auto pb-1 flex-1">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 whitespace-nowrap pr-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {['all', 'pending', 'overdue', 'paid'].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize whitespace-nowrap transition-all ${
                    statusFilter === f
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f === 'all'
                    ? getTranslation(language, 'filterAll')
                    : f === 'pending'
                    ? getTranslation(language, 'filterPending')
                    : f === 'overdue'
                    ? getTranslation(language, 'filterOverdue')
                    : getTranslation(language, 'filterPaid')}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-colors flex items-center gap-1 whitespace-nowrap"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Date Range Chips */}
          <div className="flex items-center space-x-1.5 rtl:space-x-reverse overflow-x-auto pb-1 text-xs">
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
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* View Mode Switcher: Combined by Customer vs Single Entries */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setViewMode('customer')}
            className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 ${
              viewMode === 'customer'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Combined by Customer</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full font-mono">
              {customerGroups.length}
            </span>
          </button>
          <button
            onClick={() => setViewMode('individual')}
            className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 ${
              viewMode === 'individual'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Single Entries</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-mono">
              {filteredRecords.length}
            </span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
          {viewMode === 'customer'
            ? 'All transactions combined per customer'
            : 'Line-by-line entry view'}
        </span>
      </div>

      {/* Record List / Customer Groups List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
            <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Udhar records found</h4>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search term, status filter, or date range.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-200 transition-colors inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            )}
          </div>
        ) : viewMode === 'customer' ? (
          /* COMBINED BY CUSTOMER VIEW */
          customerGroups.map((group) => {
            const isCustomerExpanded = expandedCustomerId === group.personName;
            const pendingRecord = group.records.find((r) => r.paidAmount < r.amount) || group.records[0];

            return (
              <div
                key={group.personName}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden transition-all"
              >
                {/* Customer Consolidated Card Header */}
                <div
                  onClick={() => setExpandedCustomerId(isCustomerExpanded ? null : group.personName)}
                  className="p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      {/* Customer Avatar Photo */}
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-black text-base overflow-hidden border border-indigo-200 dark:border-indigo-800 shadow-xs flex-shrink-0">
                        {group.profilePhoto ? (
                          <img src={group.profilePhoto} alt={group.personName} className="w-full h-full object-cover" />
                        ) : (
                          group.personName.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {group.personName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {group.phone}
                        </p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                          {group.records.length} {group.records.length === 1 ? 'Transaction' : 'Combined Transactions'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Net Remaining Udhar</span>
                      <div
                        className={`text-base font-black ${
                          group.totalRemaining === 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : activeType === 'given'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatPKR(group.totalRemaining, profile.currency)}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Total: {formatPKR(group.totalAmount, profile.currency)} • Paid: {formatPKR(group.totalPaidAmount, profile.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Customer Badges & Combined Action Bar */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          group.totalRemaining === 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : group.hasOverdue
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {group.totalRemaining === 0
                          ? 'Settled'
                          : group.hasOverdue
                          ? 'Overdue Entries'
                          : 'Pending Udhar'}
                      </span>
                    </div>

                    {/* Quick Customer Action Buttons */}
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse" onClick={(e) => e.stopPropagation()}>
                      {/* PDF Export for Customer */}
                      {pendingRecord && (
                        <button
                          onClick={() => setSelectedPdfRecord(pendingRecord)}
                          className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs flex items-center gap-1 font-semibold"
                          title="Export Customer PDF Statement"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[11px]">PDF</span>
                        </button>
                      )}

                      {/* WhatsApp Reminder for Customer */}
                      {group.totalRemaining > 0 && pendingRecord && (
                        <button
                          onClick={() => onOpenWhatsAppReminder(pendingRecord)}
                          className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-xs flex items-center gap-1 font-semibold"
                          title="WhatsApp Reminder"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Quick Record Payment */}
                      {group.totalRemaining > 0 && pendingRecord && (
                        <button
                          onClick={() => onOpenRecordPayment(pendingRecord)}
                          className={`px-2.5 py-1 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 ${
                            activeType === 'given'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-rose-600 hover:bg-rose-700 text-white'
                          }`}
                        >
                          {activeType === 'given' ? 'Pay / Receive' : 'Pay Back'}
                        </button>
                      )}

                      <div className="text-slate-400 pl-1 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        <span>{isCustomerExpanded ? 'Hide Transactions' : 'View All'}</span>
                        {isCustomerExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* EXPANDED CUSTOMER TRANSACTIONS DRAWER */}
                {isCustomerExpanded && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Receipt className="w-4 h-4 text-indigo-500" /> Transactions for {group.personName} ({group.records.length})
                      </h4>
                      <button
                        onClick={() => onOpenAddUdhar(activeType)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Entry for Customer
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {group.records.map((record) => {
                        const recRemaining = Math.max(0, record.amount - record.paidAmount);
                        const isRecordExpanded = expandedId === record.id;
                        const dueInfo = getDaysRemainingOrOverdue(record.dueDate);

                        return (
                          <div
                            key={record.id}
                            className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                                    {record.purpose || 'General Entry'}
                                  </span>
                                  <span
                                    className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                                      record.status === 'fully_paid'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : record.status === 'overdue'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {getTranslation(language, record.status as any)}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  Date: {formatDatePK(record.date)} {recRemaining > 0 && `• ${dueInfo.label}`}
                                </p>
                              </div>

                              <div className="text-right">
                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                  {formatPKR(record.amount, profile.currency)}
                                </span>
                                {recRemaining > 0 && (
                                  <span className="text-[10px] font-bold text-rose-600 block">
                                    Rem: {formatPKR(recRemaining, profile.currency)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Sub-actions per entry */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                              <button
                                onClick={() => setExpandedId(isRecordExpanded ? null : record.id)}
                                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                              >
                                {isRecordExpanded ? 'Hide Details' : `Payment History (${record.payments.length})`}
                                {isRecordExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setSelectedPdfRecord(record)}
                                  className="p-1 text-slate-400 hover:text-indigo-600"
                                  title="Export PDF"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onOpenWhatsAppShare(record)}
                                  className="p-1 text-slate-400 hover:text-emerald-600"
                                  title="Share WhatsApp"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>
                                {recRemaining > 0 && (
                                  <button
                                    onClick={() => onOpenRecordPayment(record)}
                                    className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px]"
                                  >
                                    Pay
                                  </button>
                                )}
                                <button
                                  onClick={() => setDeleteConfirmId(deleteConfirmId === record.id ? null : record.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Record Delete Confirmation */}
                            {deleteConfirmId === record.id && (
                              <div className="p-2 bg-rose-50 dark:bg-rose-950/90 rounded-xl border border-rose-200 flex items-center justify-between text-xs font-semibold text-rose-900 dark:text-rose-200">
                                <span>Delete this entry?</span>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => {
                                      onDeleteUdharRecord?.(record.id);
                                      setDeleteConfirmId(null);
                                    }}
                                    className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px]"
                                  >
                                    Confirm
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Detailed Payment Timeline */}
                            {isRecordExpanded && (
                              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2 mt-2">
                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                                  Repayment Logs:
                                </span>
                                {record.payments.length === 0 ? (
                                  <p className="text-[10px] text-slate-400 italic">No payment logs recorded yet.</p>
                                ) : (
                                  record.payments.map((p) => (
                                    <div
                                      key={p.id}
                                      className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] flex items-center justify-between"
                                    >
                                      <div>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                          - {formatPKR(p.amount, profile.currency)}
                                        </span>
                                        <span className="text-[10px] text-slate-400 block">
                                          {formatDatePK(p.date)} via {p.paymentMethod}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => onOpenReceipt?.(record, p)}
                                          className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1"
                                        >
                                          <Receipt className="w-3 h-3" /> Receipt
                                        </button>
                                        <button
                                          onClick={() => onDeletePayment?.(record.id, p.id)}
                                          className="p-1 text-slate-400 hover:text-rose-600"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* INDIVIDUAL ENTRY VIEW (Flat List) */
          filteredRecords.map((record) => {
            const remaining = Math.max(0, record.amount - record.paidAmount);
            const isExpanded = expandedId === record.id;
            const dueInfo = getDaysRemainingOrOverdue(record.dueDate);

            return (
              <div
                key={record.id}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden transition-all"
              >
                {/* Main Card Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                  className="p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      {/* Customer Photo Avatar with quick upload camera overlay */}
                      <div className="relative group/avatar flex-shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 text-base overflow-hidden border border-slate-200 dark:border-slate-600 shadow-xs">
                          {record.profilePhoto ? (
                            <img src={record.profilePhoto} alt={record.personName} className="w-full h-full object-cover" />
                          ) : (
                            record.personName.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <label
                          onClick={(e) => e.stopPropagation()}
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-indigo-700 hover:scale-110 transition-all border border-white dark:border-slate-800"
                          title="Change Customer Photo"
                        >
                          <Camera className="w-3 h-3" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && onUpdateUdharRecord) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    onUpdateUdharRecord(record.id, {
                                      profilePhoto: event.target.result as string,
                                    });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {record.personName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {record.phone}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{record.purpose}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Remaining</span>
                      <div
                        className={`text-base font-black ${
                          remaining === 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : activeType === 'given'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatPKR(remaining, profile.currency)}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Total: {formatPKR(record.amount, profile.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Badges & Actions Row */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                      {/* Status Pill */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          record.status === 'fully_paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : record.status === 'overdue'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {getTranslation(language, record.status as any)}
                      </span>

                      {/* Due date info */}
                      {remaining > 0 && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {dueInfo.label}
                        </span>
                      )}
                    </div>

                    {/* Quick Buttons */}
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse" onClick={(e) => e.stopPropagation()}>
                      {/* PDF Export Button */}
                      <button
                        onClick={() => setSelectedPdfRecord(record)}
                        className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs flex items-center gap-1 font-semibold"
                        title="Export PDF Statement"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">PDF</span>
                      </button>

                      {/* Share WhatsApp */}
                      <button
                        onClick={() => onOpenWhatsAppShare(record)}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs flex items-center gap-1 font-semibold"
                        title="Share Statement"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Reminder */}
                      {remaining > 0 && (
                        <button
                          onClick={() => onOpenWhatsAppReminder(record)}
                          className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-xs flex items-center gap-1 font-semibold"
                          title="WhatsApp Reminder"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Pay Button */}
                      {remaining > 0 && (
                        <button
                          onClick={() => onOpenRecordPayment(record)}
                          className={`px-2.5 py-1 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 ${
                            record.type === 'given'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                          }`}
                        >
                          {record.type === 'given'
                            ? getTranslation(language, 'receivePayment')
                            : getTranslation(language, 'givePayment')}
                        </button>
                      )}

                      {/* Delete Customer Button */}
                      <button
                        onClick={() => setDeleteConfirmId(deleteConfirmId === record.id ? null : record.id)}
                        className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs flex items-center gap-1 font-semibold transition-colors"
                        title="Delete Customer Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="text-slate-400 pl-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Customer Deletion Confirmation Banner */}
                  {deleteConfirmId === record.id && (
                    <div
                      className="p-3 bg-rose-50 dark:bg-rose-950/90 border-t border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs font-semibold text-rose-900 dark:text-rose-200 animate-in fade-in"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Delete customer record for <strong>{record.personName}</strong>?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            onDeleteUdharRecord?.(record.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-sm"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* EXPANDED LEDGER STATEMENT */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-indigo-500" /> Customer Payment Ledger Statement
                    </h4>

                    {/* Timeline of payments */}
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex justify-between">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">Original Udhar Loan</span>
                          <span className="text-[10px] text-slate-400 block">{formatDatePK(record.date)}</span>
                        </div>
                        <span className="font-black text-slate-900 dark:text-white">
                          {formatPKR(record.amount, profile.currency)}
                        </span>
                      </div>

                      {record.payments.map((p) => (
                        <div key={p.id} className="space-y-1">
                          <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs flex justify-between items-center">
                            <div>
                              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                                Payment via {p.paymentMethod}
                              </span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">
                                {formatDatePK(p.date)} • Tx: {p.transactionId}
                              </span>
                            </div>

                             <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-emerald-700 dark:text-emerald-300 mr-1">
                                - {formatPKR(p.amount, profile.currency)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenReceipt?.(record, p);
                                }}
                                className="p-1 rounded-lg text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-0.5 text-[10px] font-bold"
                                title="View & Share Image Receipt"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletePaymentConfirm(
                                    deletePaymentConfirm?.paymentId === p.id ? null : { udharId: record.id, paymentId: p.id }
                                  );
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100/70 dark:hover:bg-rose-950/60 transition-colors"
                                title="Delete Payment Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Payment Delete Confirmation */}
                          {deletePaymentConfirm?.udharId === record.id && deletePaymentConfirm?.paymentId === p.id && (
                            <div className="p-2.5 bg-rose-100 dark:bg-rose-950/90 rounded-xl border border-rose-300 dark:border-rose-800 flex items-center justify-between text-xs text-rose-900 dark:text-rose-200 font-semibold animate-in fade-in">
                              <span>Delete payment of {formatPKR(p.amount, profile.currency)}?</span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => setDeletePaymentConfirm(null)}
                                  className="px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => {
                                    onDeletePayment?.(record.id, p.id);
                                    setDeletePaymentConfirm(null);
                                  }}
                                  className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[10px] font-bold shadow-sm"
                                >
                                  Delete Payment
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedPdfRecord(record)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Customer PDF (پی ڈی ایف)</span>
                      </button>

                      <button
                        onClick={() => onOpenWhatsAppShare(record)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
                      >
                        Share Full Ledger / WA
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Customer PDF Modal */}
      <CustomerPdfModal
        isOpen={!!selectedPdfRecord}
        onClose={() => setSelectedPdfRecord(null)}
        record={selectedPdfRecord}
        profile={profile}
      />
    </div>
  );
};
