const BASE_URL = '/api';

export function getAuthToken() {
  return localStorage.getItem('pennywise_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('pennywise_token', token);
  } else {
    localStorage.removeItem('pennywise_token');
  }
}

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || data.message || 'Request failed';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  sendOtp: (phone, purpose = 'signup') =>
    apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, purpose })
    }),

  verifyOtp: (phone, code, purpose = 'signup') =>
    apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code, purpose })
    }),

  register: (payload) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (phone, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    }),

  forgotPasswordReset: (payload) =>
    apiRequest('/auth/forgot-password/reset', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMe: () => apiRequest('/auth/me'),

  // Dashboard
  getDashboardOverview: () => apiRequest('/dashboard/overview'),

  // Transactions
  getTransactions: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'All') searchParams.append('category', params.category);
    if (params.type && params.type !== 'All') searchParams.append('type', params.type);
    if (params.search) searchParams.append('search', params.search);
    if (params.start_date) searchParams.append('start_date', params.start_date);
    if (params.end_date) searchParams.append('end_date', params.end_date);
    const queryString = searchParams.toString();
    return apiRequest(`/transactions${queryString ? `?${queryString}` : ''}`);
  },

  createTransaction: (tx) =>
    apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(tx)
    }),

  updateTransaction: (id, tx) =>
    apiRequest(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tx)
    }),

  deleteTransaction: (id) =>
    apiRequest(`/transactions/${id}`, {
      method: 'DELETE'
    }),

  importCsv: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/transactions/import-csv', {
      method: 'POST',
      body: formData
    });
  },

  // Budgets
  getCurrentBudget: () => apiRequest('/budgets/current'),
  saveBudget: (budget) =>
    apiRequest('/budgets', {
      method: 'POST',
      body: JSON.stringify(budget)
    }),

  // Goals
  getGoals: () => apiRequest('/goals'),
  createGoal: (goal) =>
    apiRequest('/goals', {
      method: 'POST',
      body: JSON.stringify(goal)
    }),
  depositToGoal: (id, amount) =>
    apiRequest(`/goals/${id}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    }),
  deleteGoal: (id) =>
    apiRequest(`/goals/${id}`, {
      method: 'DELETE'
    }),

  // Bank
  getBankAccounts: () => apiRequest('/bank/accounts'),
  connectDemoBank: (bank_name, phone) =>
    apiRequest('/bank/connect-demo', {
      method: 'POST',
      body: JSON.stringify({ bank_name, phone })
    }),
  disconnectBank: (id) =>
    apiRequest(`/bank/disconnect/${id}`, {
      method: 'POST'
    }),

  // Wrap
  getMonthlyWrap: (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const qs = params.toString();
    return apiRequest(`/wrap/summary${qs ? `?${qs}` : ''}`);
  },

  // Assistant
  chatWithAssistant: (message) =>
    apiRequest('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    }),
  getAssistantHistory: () => apiRequest('/assistant/history')
};

