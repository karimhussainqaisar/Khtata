export type Language = 'en' | 'ur';

export type UdharType = 'given' | 'taken'; // given = Maine Diya (they owe me), taken = Maine Liya (I owe them)

export type UdharStatus = 'pending' | 'partially_paid' | 'fully_paid' | 'overdue';

export type ExpenseCategory = 
  | 'Food' 
  | 'Transport' 
  | 'Home' 
  | 'Bills' 
  | 'Shopping' 
  | 'Health' 
  | 'Education' 
  | 'Business' 
  | 'Other';

export type PaymentMethod = 'Cash' | 'JazzCash' | 'Easypaisa' | 'Bank Transfer' | 'ATM/Card';

export interface RepaymentLog {
  id: string;
  udharId: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  transactionId?: string;
}

export interface UdharRecord {
  id: string;
  personName: string;
  phone: string;
  amount: number; // original principal amount
  paidAmount: number; // accumulated repayments
  type: UdharType; // 'given' or 'taken'
  date: string; // ISO string date
  dueDate: string; // ISO string due date
  purpose: string;
  status: UdharStatus;
  profilePhoto?: string;
  notes?: string;
  payments: RepaymentLog[];
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  paymentMethod: PaymentMethod;
  type: 'expense' | 'income';
  receiptPhotoUrl?: string;
  voiceNoteUrl?: string;
}

export interface UserProfile {
  name: string;
  shopName: string;
  phone: string;
  avatar?: string;
  isShopkeeper: boolean;
  pinEnabled: boolean;
  pinCode: string;
  currency: string; // 'PKR' or 'Rs'
  isDarkMode: boolean;
  language: Language;
  monthlyBudget: number;
}

export interface ReminderTemplate {
  id: string;
  title: string;
  englishMessage: string;
  urduMessage: string;
  timing: 'before_due' | 'on_due' | 'overdue' | 'custom';
}

export interface FinancialSummary {
  totalMoneyGiven: number; // Maine Diya
  totalMoneyTaken: number; // Maine Liya
  pendingReceivables: number; // Outstanding to collect
  pendingPayments: number; // Outstanding to pay
  monthlyExpenses: number;
  monthlyIncome: number;
  savings: number;
  overdueCount: number;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
