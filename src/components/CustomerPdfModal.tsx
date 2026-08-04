import React from 'react';
import { UdharRecord, UserProfile } from '../types';
import { downloadCustomerTransactionPDF } from '../utils/pdfGenerator';
import { formatPKR, formatDatePK } from '../utils/formatters';
import { X, FileText, Download, Printer, Share2, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CustomerPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: UdharRecord | null;
  profile: UserProfile;
}

export const CustomerPdfModal: React.FC<CustomerPdfModalProps> = ({
  isOpen,
  onClose,
  record,
  profile,
}) => {
  if (!isOpen || !record) return null;

  const remaining = Math.max(0, record.amount - record.paidAmount);
  const isSettled = record.paidAmount >= record.amount;

  const handleDownloadPdf = () => {
    downloadCustomerTransactionPDF(record, profile);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">
                Customer PDF Statement (کھاتہ پی ڈی ایف)
              </h3>
              <p className="text-[11px] text-slate-400">
                Official Document for {record.personName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Top Bar */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF File (.pdf)</span>
          </button>

          <button
            onClick={handlePrint}
            className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>

        {/* Printable PDF Preview Sheet */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 print:p-0 print:bg-white print:text-black">
          {/* Paper Container */}
          <div className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-200 shadow-md space-y-5 print:shadow-none print:border-none">
            {/* Header branding */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {profile.shopName || profile.name || 'KhataPro Digital Ledger'}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Verified Khata Ledger Statement • Ph: {profile.phone || '0300-1234567'}
                </p>
              </div>

              <div className="text-right">
                <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                  isSettled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isSettled ? 'FULLY SETTLED ✓' : 'PARTIALLY PAID'}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Customer Name</span>
                <span className="font-bold text-sm text-slate-900">{record.personName}</span>
                <span className="text-slate-500 block text-[11px] mt-0.5">{record.phone}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Transaction Type</span>
                <span className="font-bold text-indigo-700">
                  {record.type === 'given' ? 'Udhar Given (Maine Diya)' : 'Udhar Taken (Maine Liya)'}
                </span>
                <span className="text-slate-500 block text-[11px] mt-0.5">{record.purpose}</span>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block">TOTAL UDHAR</span>
                <span className="text-xs font-black text-slate-900">{formatPKR(record.amount, profile.currency)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-700 font-bold block">PAID / RECEIVED</span>
                <span className="text-xs font-black text-emerald-700">{formatPKR(record.paidAmount, profile.currency)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-[10px] text-rose-700 font-bold block">REMAINING BAL</span>
                <span className="text-xs font-black text-rose-700">{formatPKR(remaining, profile.currency)}</span>
              </div>
            </div>

            {/* Repayment History Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Repayment Log History
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase">
                      <th className="p-2">Date</th>
                      <th className="p-2">Method</th>
                      <th className="p-2">Txn ID</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {record.payments && record.payments.length > 0 ? (
                      record.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-2 font-medium">{formatDatePK(p.date)}</td>
                          <td className="p-2">{p.paymentMethod}</td>
                          <td className="p-2 text-slate-500 font-mono text-[10px]">{p.transactionId || 'KP-PAY'}</td>
                          <td className="p-2 text-right font-bold text-emerald-700">
                            + {formatPKR(p.amount, profile.currency)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-slate-400 text-xs italic">
                          No repayments recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stamp & Verification */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified by KhataPro Digital Ledger</span>
              </div>
              <div className="text-right">
                <span className="block border-b border-slate-400 w-28 mb-1"></span>
                <span className="text-[10px] font-bold text-slate-700">Shopkeeper Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
