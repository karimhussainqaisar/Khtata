import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  UdharRecord,
  Expense,
  UdharType,
  RepaymentLog,
  Language,
} from './types';
import {
  loadProfile,
  saveProfile,
  loadUdharRecords,
  saveUdharRecords,
  loadExpenses,
  saveExpenses,
  calculateSummary,
  resetToDemoData,
} from './utils/storage';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { AddUdharModal } from './components/AddUdharModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';
import { KhataAiDrawer } from './components/KhataAiDrawer';
import { VoiceInputModal } from './components/VoiceInputModal';
import { ReceiptScanModal } from './components/ReceiptScanModal';
import { PinLockModal } from './components/PinLockModal';
import { ExportReportModal } from './components/ExportReportModal';

import { HomeView } from './views/HomeView';
import { UdharView } from './views/UdharView';
import { ExpensesView } from './views/ExpensesView';
import { ReportsView } from './views/ReportsView';
import { ProfileView } from './views/ProfileView';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [udharRecords, setUdharRecords] = useState<UdharRecord[]>(loadUdharRecords);
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isLocked, setIsLocked] = useState<boolean>(profile.pinEnabled);

  // Modals state
  const [isAddUdharOpen, setIsAddUdharOpen] = useState(false);
  const [addUdharDefaultType, setAddUdharDefaultType] = useState<UdharType>('given');

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedRecordForPayment, setSelectedRecordForPayment] = useState<UdharRecord | null>(null);

  const [isWhatsAppShareOpen, setIsWhatsAppShareOpen] = useState(false);
  const [selectedRecordForShare, setSelectedRecordForShare] = useState<UdharRecord | null>(null);
  const [whatsAppShareMode, setWhatsAppShareMode] = useState<'statement' | 'reminder'>('reminder');

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedRecordForReceipt, setSelectedRecordForReceipt] = useState<UdharRecord | null>(null);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<RepaymentLog | null>(null);

  const [isKhataAiOpen, setIsKhataAiOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Sync state changes to localStorage
  useEffect(() => {
    saveProfile(profile);
    if (profile.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile]);

  useEffect(() => {
    saveUdharRecords(udharRecords);
  }, [udharRecords]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  const summary = calculateSummary(udharRecords, expenses);

  // Handlers
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateUdharRecord = (recordId: string, updated: Partial<UdharRecord>) => {
    setUdharRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, ...updated } : r))
    );
  };

  const handleAddUdhar = (newRecordData: Omit<UdharRecord, 'id' | 'paidAmount' | 'status' | 'payments' | 'createdAt'>) => {
    const newRecord: UdharRecord = {
      ...newRecordData,
      id: `u-${Date.now()}`,
      paidAmount: 0,
      status: 'pending',
      payments: [],
      createdAt: new Date().toISOString(),
    };

    setUdharRecords((prev) => [newRecord, ...prev]);
  };

  const handleAddExpense = (newExpenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...newExpenseData,
      id: `e-${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleSavePayment = (udharId: string, paymentData: Omit<RepaymentLog, 'id' | 'udharId'>) => {
    const paymentId = `p-${Date.now()}`;
    const newPayment: RepaymentLog = {
      ...paymentData,
      id: paymentId,
      udharId,
    };

    setUdharRecords((prev) =>
      prev.map((r) => {
        if (r.id !== udharId) return r;
        const newPaidAmount = r.paidAmount + paymentData.amount;
        const remaining = Math.max(0, r.amount - newPaidAmount);
        let status = r.status;
        if (remaining === 0) {
          status = 'fully_paid';
        } else if (newPaidAmount > 0) {
          status = 'partially_paid';
        }
        return {
          ...r,
          paidAmount: newPaidAmount,
          status,
          payments: [...r.payments, newPayment],
        };
      })
    );

    // Add repayment as positive cashflow income/expense log automatically
    handleAddExpense({
      title: `Udhar Repayment from ${selectedRecordForPayment?.personName || 'Customer'}`,
      amount: paymentData.amount,
      category: 'Business',
      paymentMethod: paymentData.paymentMethod,
      date: paymentData.date,
      type: 'income',
    });
  };

  const handleDeleteUdharRecord = (udharId: string) => {
    setUdharRecords((prev) => prev.filter((r) => r.id !== udharId));
  };

  const handleDeletePayment = (udharId: string, paymentId: string) => {
    setUdharRecords((prev) =>
      prev.map((r) => {
        if (r.id !== udharId) return r;
        const targetPayment = r.payments.find((p) => p.id === paymentId);
        if (!targetPayment) return r;

        const updatedPayments = r.payments.filter((p) => p.id !== paymentId);
        const newPaidAmount = Math.max(0, r.paidAmount - targetPayment.amount);
        const remaining = Math.max(0, r.amount - newPaidAmount);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let status = r.status;
        if (remaining === 0) {
          status = 'fully_paid';
        } else if (new Date(r.dueDate) < today) {
          status = 'overdue';
        } else if (newPaidAmount > 0) {
          status = 'partially_paid';
        } else {
          status = 'pending';
        }

        return {
          ...r,
          paidAmount: newPaidAmount,
          status,
          payments: updatedPayments,
        };
      })
    );
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  const handleResetDemo = () => {
    const res = resetToDemoData();
    setProfile(res.profile);
    setUdharRecords(res.udhar);
    setExpenses(res.expenses);
  };

  // Open triggers
  const openAddUdhar = (type: UdharType = 'given') => {
    setAddUdharDefaultType(type);
    setIsAddUdharOpen(true);
  };

  const openRecordPayment = (record: UdharRecord) => {
    setSelectedRecordForPayment(record);
    setIsRecordPaymentOpen(true);
  };

  const openWhatsAppReminder = (record: UdharRecord) => {
    setSelectedRecordForShare(record);
    setWhatsAppShareMode('reminder');
    setIsWhatsAppShareOpen(true);
  };

  const openWhatsAppShare = (record: UdharRecord) => {
    setSelectedRecordForShare(record);
    setWhatsAppShareMode('statement');
    setIsWhatsAppShareOpen(true);
  };

  const openReceipt = (record: UdharRecord, payment: RepaymentLog) => {
    setSelectedRecordForReceipt(record);
    setSelectedPaymentForReceipt(payment);
    setIsReceiptOpen(true);
  };

  return (
    <div className={`min-h-screen font-sans bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors ${profile.language === 'ur' ? 'font-urdu' : ''}`}>
      {/* Security PIN Lock Overlay */}
      <PinLockModal
        isLocked={isLocked}
        profile={profile}
        onUnlock={() => setIsLocked(false)}
      />

      {/* Header */}
      <Header
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onOpenKhataAi={() => setIsKhataAiOpen(true)}
        onLockApp={() => setIsLocked(true)}
        overdueCount={summary.overdueCount}
      />

      {/* Main Content View Container */}
      <main className="max-w-md mx-auto px-4 pt-4 pb-12">
        {activeTab === 'home' && (
          <HomeView
            summary={summary}
            udharRecords={udharRecords}
            expenses={expenses}
            profile={profile}
            language={profile.language}
            onOpenAddUdhar={openAddUdhar}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenRecordPayment={openRecordPayment}
            onOpenWhatsAppReminder={openWhatsAppReminder}
            onOpenKhataAi={() => setIsKhataAiOpen(true)}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenScan={() => setIsScanOpen(true)}
            onSelectTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'udhar' && (
          <UdharView
            udharRecords={udharRecords}
            onOpenAddUdhar={openAddUdhar}
            onOpenRecordPayment={openRecordPayment}
            onOpenWhatsAppReminder={openWhatsAppReminder}
            onOpenWhatsAppShare={openWhatsAppShare}
            onOpenReceipt={openReceipt}
            onDeleteUdharRecord={handleDeleteUdharRecord}
            onDeletePayment={handleDeletePayment}
            onUpdateUdharRecord={handleUpdateUdharRecord}
            language={profile.language}
            profile={profile}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenScan={() => setIsScanOpen(true)}
            onDeleteExpense={handleDeleteExpense}
            language={profile.language}
            profile={profile}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            summary={summary}
            udharRecords={udharRecords}
            expenses={expenses}
            profile={profile}
            language={profile.language}
            onOpenExportModal={() => setIsExportOpen(true)}
            onOpenKhataAi={() => setIsKhataAiOpen(true)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onResetDemo={handleResetDemo}
            language={profile.language}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        language={profile.language}
        overdueCount={summary.overdueCount}
      />

      {/* Modals & Drawers */}
      <AddUdharModal
        isOpen={isAddUdharOpen}
        onClose={() => setIsAddUdharOpen(false)}
        onSave={handleAddUdhar}
        defaultType={addUdharDefaultType}
        language={profile.language}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSave={handleAddExpense}
        language={profile.language}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenScan={() => setIsScanOpen(true)}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        record={selectedRecordForPayment}
        onSavePayment={handleSavePayment}
        language={profile.language}
        onOpenReceipt={openReceipt}
      />

      <WhatsAppShareModal
        isOpen={isWhatsAppShareOpen}
        onClose={() => setIsWhatsAppShareOpen(false)}
        record={selectedRecordForShare}
        mode={whatsAppShareMode}
        language={profile.language}
      />

      <DigitalReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        record={selectedRecordForReceipt}
        payment={selectedPaymentForReceipt}
        language={profile.language}
        shopName={profile.shopName || profile.name}
        profile={profile}
      />

      <KhataAiDrawer
        isOpen={isKhataAiOpen}
        onClose={() => setIsKhataAiOpen(false)}
        udharRecords={udharRecords}
        expenses={expenses}
        profile={profile}
        language={profile.language}
      />

      <VoiceInputModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onAddExpense={handleAddExpense}
        onAddUdhar={handleAddUdhar}
        language={profile.language}
      />

      <ReceiptScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onAddExpense={handleAddExpense}
        language={profile.language}
      />

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        udharRecords={udharRecords}
        expenses={expenses}
        language={profile.language}
      />
    </div>
  );
}
