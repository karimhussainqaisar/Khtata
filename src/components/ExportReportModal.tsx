import React from 'react';
import { UdharRecord, Expense, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { formatPKR, formatDatePK } from '../utils/formatters';
import { X, FileText, Download, Table, Printer } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  udharRecords: UdharRecord[];
  expenses: Expense[];
  language: Language;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  udharRecords,
  expenses,
  language,
}) => {
  if (!isOpen) return null;

  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Type,Name/Title,Amount (PKR),Paid/Category,Status/Method,Date,Due Date\n';

    udharRecords.forEach((r) => {
      csvContent += `Udhar (${r.type}),"${r.personName}",${r.amount},${r.paidAmount},${r.status},${r.date},${r.dueDate}\n`;
    });

    expenses.forEach((e) => {
      csvContent += `Expense (${e.type}),"${e.title}",${e.amount},${e.category},${e.paymentMethod},${e.date},-\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KhataPro_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSONBackup = () => {
    const backupData = {
      app: 'KhataPro',
      exportedAt: new Date().toISOString(),
      udharRecords,
      expenses,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `KhataPro_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Export Financial Statement
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 space-y-3">
          {/* Export CSV / Excel */}
          <button
            onClick={exportCSV}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Table className="w-5 h-5" />
              </div>
              <div className="text-left rtl:text-right">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Excel / CSV Spreadsheet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Export raw transaction table for Excel</p>
              </div>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </button>

          {/* Export PDF Print */}
          <button
            onClick={handlePrintPDF}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Printer className="w-5 h-5" />
              </div>
              <div className="text-left rtl:text-right">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">PDF Ledger Statement</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Formatted printable PDF document</p>
              </div>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          </button>

          {/* Full JSON Data Backup */}
          <button
            onClick={exportJSONBackup}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left rtl:text-right">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Complete JSON Backup</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Full offline data backup & restore</p>
              </div>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};
