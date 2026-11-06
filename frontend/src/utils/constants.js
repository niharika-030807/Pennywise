export const TRANSACTION_CATEGORIES = [
  { id: 'Rent and Bills', label: 'Rent and Bills', color: '#FF1493', icon: 'Home' },
  { id: 'Groceries', label: 'Groceries', color: '#FF69B4', icon: 'ShoppingCart' },
  { id: 'Food and Dining', label: 'Food and Dining', color: '#D900A8', icon: 'Utensils' },
  { id: 'Shopping', label: 'Shopping', color: '#7800B8', icon: 'ShoppingBag' },
  { id: 'Transportation', label: 'Transportation', color: '#00E5FF', icon: 'Car' },
  { id: 'Entertainment', label: 'Entertainment', color: '#9D00FF', icon: 'Film' },
  { id: 'Healthcare', label: 'Healthcare', color: '#00E676', icon: 'Activity' },
  { id: 'Personal Expenses', label: 'Personal Expenses', color: '#FFB300', icon: 'User' },
  { id: 'Education', label: 'Education', color: '#2979FF', icon: 'GraduationCap' },
  { id: 'Other Expenses', label: 'Other Expenses', color: '#A5A5B8', icon: 'MoreHorizontal' }
];

export const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash'
];

export const NAVIGATION_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'transactions', label: 'Expense Tracker', icon: 'Receipt' },
  { id: 'budgets', label: 'Budget Planner', icon: 'PieChart' },
  { id: 'wrap', label: 'Monthly Wrap', icon: 'Sparkles', badge: 'Must See' },
  { id: 'insights', label: 'Financial Insights', icon: 'TrendingUp' },
  { id: 'goals', label: 'Savings Goals', icon: 'Target' },
  { id: 'assistant', label: 'AI Companion', icon: 'Bot' },
  { id: 'banks', label: 'Bank Accounts', icon: 'Building2' },
  { id: 'settings', label: 'Settings', icon: 'Settings' }
];

export const DEFAULT_CATEGORY_LIMITS = {
  'Rent and Bills': 20000,
  'Groceries': 6000,
  'Shopping': 6000,
  'Food and Dining': 4000,
  'Transportation': 3000,
  'Entertainment': 2500,
  'Healthcare': 3000,
  'Personal Expenses': 2500,
  'Education': 3000,
  'Other Expenses': 2000
};
