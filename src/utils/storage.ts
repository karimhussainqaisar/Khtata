import { UdharRecord, Expense, UserProfile, FinancialSummary } from '../types';
import { initialProfile, initialUdharRecords, initialExpenses } from '../data/mockData';

const KEYS = {
  PROFILE: 'khatapro_profile_v1',
  UDHAR: 'khatapro_udhar_records_v1',
  EXPENSES: 'khatapro_expenses_v1',
};

export const loadProfile = (): UserProfile => {
  try {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : initialProfile;
  } catch {
    return initialProfile;
  }
};

export const saveProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
};

export const loadUdharRecords = (): UdharRecord[] => {
  try {
    const data = localStorage.getItem(KEYS.UDHAR);
    if (!data) return initialUdharRecords;
    const records: UdharRecord[] = JSON.parse(data);
    // Recalculate status dynamically based on current date
    const today = new Date();
    today.setHours(0,0,0,0);

    return records.map(record => {
      const remaining = record.amount - record.paidAmount;
      let status = record.status;
      if (remaining <= 0) {
        status = 'fully_paid';
      } else if (new Date(record.dueDate) < today) {
        status = 'overdue';
      } else if (record.paidAmount > 0) {
        status = 'partially_paid';
      } else {
        status = 'pending';
      }
      return { ...record, status };
    });
  } catch {
    return initialUdharRecords;
  }
};

export const saveUdharRecords = (records: UdharRecord[]): void => {
  try {
    localStorage.setItem(KEYS.UDHAR, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving Udhar records:', e);
  }
};

export const loadExpenses = (): Expense[] => {
  try {
    const data = localStorage.getItem(KEYS.EXPENSES);
    return data ? JSON.parse(data) : initialExpenses;
  } catch {
    return initialExpenses;
  }
};

export const saveExpenses = (expenses: Expense[]): void => {
  try {
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses:', e);
  }
};

export const calculateSummary = (records: UdharRecord[], expenses: Expense[]): FinancialSummary => {
  let totalMoneyGiven = 0; // All given records total principal
  let totalMoneyTaken = 0; // All taken records total principal
  let pendingReceivables = 0; // Given remaining
  let pendingPayments = 0; // Taken remaining
  let overdueCount = 0;

  const today = new Date();
  today.setHours(0,0,0,0);

  records.forEach((r) => {
    const remaining = Math.max(0, r.amount - r.paidAmount);
    if (r.type === 'given') {
      totalMoneyGiven += r.amount;
      pendingReceivables += remaining;
    } else {
      totalMoneyTaken += r.amount;
      pendingPayments += remaining;
    }

    if (remaining > 0 && new Date(r.dueDate) < today) {
      overdueCount++;
    }
  });

  const monthlyExpenses = expenses
    .filter((e) => e.type === 'expense')
    .reduce((acc, e) => acc + e.amount, 0);

  const monthlyIncome = expenses
    .filter((e) => e.type === 'income')
    .reduce((acc, e) => acc + e.amount, 0);

  // Net Savings = Income + Receivables Collected - Expenses - Money Taken Owed
  const totalReceivedBack = records
    .filter(r => r.type === 'given')
    .reduce((acc, r) => acc + r.paidAmount, 0);

  const savings = Math.max(0, monthlyIncome + totalReceivedBack - monthlyExpenses);

  return {
    totalMoneyGiven,
    totalMoneyTaken,
    pendingReceivables,
    pendingPayments,
    monthlyExpenses,
    monthlyIncome,
    savings,
    overdueCount,
  };
};

export const resetToDemoData = (): { profile: UserProfile; udhar: UdharRecord[]; expenses: Expense[] } => {
  localStorage.clear();
  saveProfile(initialProfile);
  saveUdharRecords(initialUdharRecords);
  saveExpenses(initialExpenses);
  return {
    profile: initialProfile,
    udhar: initialUdharRecords,
    expenses: initialExpenses,
  };
};
