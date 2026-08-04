export const formatPKR = (amount: number, currencySymbol: string = 'Rs.'): string => {
  const formattedNumber = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  }).format(amount || 0);

  return `${currencySymbol} ${formattedNumber}`;
};

export const formatDatePK = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const getDaysRemainingOrOverdue = (dueDateStr: string): { days: number; isOverdue: boolean; label: string } => {
  if (!dueDateStr) return { days: 0, isOverdue: false, label: '' };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: Math.abs(diffDays), isOverdue: true, label: `${Math.abs(diffDays)} days overdue` };
  } else if (diffDays === 0) {
    return { days: 0, isOverdue: false, label: 'Due today' };
  } else {
    return { days: diffDays, isOverdue: false, label: `Due in ${diffDays} days` };
  }
};

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Food': return '🍔';
    case 'Transport': return '🚗';
    case 'Home': return '🏠';
    case 'Bills': return '💡';
    case 'Shopping': return '🛒';
    case 'Health': return '🏥';
    case 'Education': return '📚';
    case 'Business': return '🐔';
    default: return '📦';
  }
};
