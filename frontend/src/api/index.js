import { authApi } from './auth.api';
import { transactionsApi } from './transactions.api';
import { dashboardApi } from './dashboard.api';
import { budgetsApi } from './budgets.api';
import { goalsApi } from './goals.api';
import { bankApi } from './bank.api';
import { wrapApi } from './wrap.api';
import { assistantApi } from './assistant.api';
import { getAuthToken, setAuthToken, httpClient } from './httpClient';

export {
  authApi,
  transactionsApi,
  dashboardApi,
  budgetsApi,
  goalsApi,
  bankApi,
  wrapApi,
  assistantApi,
  getAuthToken,
  setAuthToken,
  httpClient
};

// Backward-compatible unified API client
export const api = {
  ...authApi,
  ...transactionsApi,
  getDashboardOverview: dashboardApi.getOverview,
  getCurrentBudget: budgetsApi.getCurrent,
  setBudget: budgetsApi.setBudget,
  ...goalsApi,
  ...bankApi,
  getMonthlyWrap: wrapApi.getSummary,
  chatWithAssistant: assistantApi.chat,
  getChatHistory: assistantApi.getHistory
};

export default api;
