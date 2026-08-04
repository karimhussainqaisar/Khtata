import { UdharRecord, Expense, UserProfile } from '../types';

export const initialProfile: UserProfile = {
  name: 'Tariq Mehmood',
  shopName: 'Mehmood Traders & General Store',
  phone: '03009283741',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  isShopkeeper: true,
  pinEnabled: false,
  pinCode: '1234',
  biometricEnabled: true,
  currency: 'Rs.',
  isDarkMode: false,
  language: 'en',
  monthlyBudget: 85000,
  themePreset: 'corporate_blue',
};

export const initialUdharRecords: UdharRecord[] = [
  {
    id: 'u-1',
    personName: 'Ahmed Khan',
    phone: '03124567890',
    amount: 10000,
    paidAmount: 4000,
    type: 'given', // Maine Diya
    date: '2026-07-15',
    dueDate: '2026-08-15',
    purpose: 'Grocery & monthly shop credit',
    status: 'partially_paid',
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-07-15T10:30:00Z',
    payments: [
      {
        id: 'p-101',
        udharId: 'u-1',
        amount: 4000,
        date: '2026-07-28',
        paymentMethod: 'JazzCash',
        notes: 'Partial payment via JazzCash',
        transactionId: 'JC-9923841'
      }
    ]
  },
  {
    id: 'u-2',
    personName: 'Bilal Mobile Shop',
    phone: '03338765432',
    amount: 25000,
    paidAmount: 0,
    type: 'given', // Maine Diya
    date: '2026-06-20',
    dueDate: '2026-07-20',
    purpose: 'Mobile accessories bulk stock',
    status: 'overdue',
    profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-06-20T14:15:00Z',
    payments: []
  },
  {
    id: 'u-3',
    personName: 'Usman Electronics',
    phone: '03015554321',
    amount: 18000,
    paidAmount: 5000,
    type: 'taken', // Maine Liya (I owe Usman)
    date: '2026-07-01',
    dueDate: '2026-08-10',
    purpose: 'Inverter AC repair spare parts',
    status: 'partially_paid',
    profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-07-01T09:00:00Z',
    payments: [
      {
        id: 'p-102',
        udharId: 'u-3',
        amount: 5000,
        date: '2026-07-18',
        paymentMethod: 'Easypaisa',
        notes: 'Paid via Easypaisa account',
        transactionId: 'EP-4438102'
      }
    ]
  },
  {
    id: 'u-4',
    personName: 'Fatima Bibi (Neighbor)',
    phone: '03219876543',
    amount: 6500,
    paidAmount: 6500,
    type: 'given', // Maine Diya
    date: '2026-06-10',
    dueDate: '2026-07-10',
    purpose: 'Emergency medical loan',
    status: 'fully_paid',
    profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-06-10T11:00:00Z',
    payments: [
      {
        id: 'p-103',
        udharId: 'u-4',
        amount: 6500,
        date: '2026-07-09',
        paymentMethod: 'Cash',
        notes: 'Full payment received in shop',
        transactionId: 'CSH-1092'
      }
    ]
  },
  {
    id: 'u-5',
    personName: 'Zubair Contractor',
    phone: '03451122334',
    amount: 45000,
    paidAmount: 15000,
    type: 'given', // Maine Diya
    date: '2026-07-25',
    dueDate: '2026-08-25',
    purpose: 'Shop renovation cement & paint advance',
    status: 'partially_paid',
    profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-07-25T16:00:00Z',
    payments: [
      {
        id: 'p-104',
        udharId: 'u-5',
        amount: 15000,
        date: '2026-08-01',
        paymentMethod: 'Bank Transfer',
        notes: 'Meezan Bank online transfer',
        transactionId: 'MB-7731904'
      }
    ]
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'e-1',
    title: 'K-Electric Bill Payment',
    amount: 14500,
    category: 'Bills',
    date: '2026-08-02',
    paymentMethod: 'Easypaisa',
    type: 'expense',
    receiptPhotoUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'e-2',
    title: 'Daily Grocery & Vegetables',
    amount: 3200,
    category: 'Food',
    date: '2026-08-03',
    paymentMethod: 'Cash',
    type: 'expense',
    receiptPhotoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'e-3',
    title: 'Shop Sales Revenue',
    amount: 52000,
    category: 'Business',
    date: '2026-08-02',
    paymentMethod: 'Cash',
    type: 'income',
  },
  {
    id: 'e-4',
    title: 'Suzuki Pickup Petrol',
    amount: 2800,
    category: 'Transport',
    date: '2026-08-01',
    paymentMethod: 'JazzCash',
    type: 'expense',
    receiptPhotoUrl: 'https://images.unsplash.com/photo-1527018601619-a508a2be00d6?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'e-5',
    title: 'Children School Fee (Beaconhouse)',
    amount: 22000,
    category: 'Education',
    date: '2026-07-28',
    paymentMethod: 'Bank Transfer',
    type: 'expense',
    receiptPhotoUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'e-6',
    title: 'Wholesale Inventory Purchase',
    amount: 38000,
    category: 'Business',
    date: '2026-07-25',
    paymentMethod: 'Bank Transfer',
    type: 'expense',
    receiptPhotoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'e-7',
    title: 'Freelance Design Income',
    amount: 35000,
    category: 'Business',
    date: '2026-07-29',
    paymentMethod: 'JazzCash',
    type: 'income',
  }
];
