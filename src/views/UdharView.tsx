import React, { useState } from 'react';
import { UdharRecord, UdharType, UdharStatus, Language, UserProfile, RepaymentLog } from '../types';
import { getTranslation } from '../utils/translations';
import { formatPKR, formatDatePK, getDaysRemainingOrOverdue } from '../utils/formatters';
import { CustomerPdfModal } from '../components/CustomerPdfModal';
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletePaymentConfirm, setDeletePaymentConfirm] = useState<{ udharId: string; paymentId: string } | null>(null);
  const [selectedPdfRecord, setSelectedPdfRecord] = useState<UdharRecord | null>(null);

  const filteredRecords = udharRecords.filter((r) => {
    if (r.type !== activeType) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const nameMatch = r.personName.toLowerCase().includes(q);
      const phoneMatch = r.phone.includes(q);
      if (!nameMatch && !phoneMatch) return false;
    }

    if (statusFilter === 'pending') {
      return r.status === 'pending' || r.status === 'partially_paid';
    }
    if (statusFilter === 'overdue') {
      return r.status === 'overdue';
    }
    if (statusFilter === 'paid') {
      return r.status === 'fully_paid';
    }

    return true;
  });

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
        <button
          onClick={() => onOpenAddUdhar(activeType)}
          className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Record
        </button>
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
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={getTranslation(language, 'searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 rtl:space-x-reverse overflow-x-auto pb-1">
          {['all', 'pending', 'overdue', 'paid'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                statusFilter === f
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
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
      </div>

      {/* Record List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Udhar records found</h4>
            <p className="text-xs text-slate-400 mt-1">
              Tap "+ Add Record" to add your first customer or credit entry.
            </p>
          </div>
        ) : (
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
                          className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                        >
                          Receive Payment
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
