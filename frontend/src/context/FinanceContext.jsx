import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../api/dashboard.api';
import { transactionsApi } from '../api/transactions.api';
import { budgetsApi } from '../api/budgets.api';
import { goalsApi } from '../api/goals.api';
import { bankApi } from '../api/bank.api';
import { useAuth } from './AuthContext';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(null);
  const [goals, setGoals] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Dashboard Overview
  const fetchOverview = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await dashboardApi.getOverview();
      setOverview(data);
    } catch (err) {
      console.error('Failed to load overview:', err);
    }
  }, [isAuthenticated]);

  // Fetch Transactions list
  const fetchTransactions = useCallback(async (filters = {}) => {
    if (!isAuthenticated) return;
    try {
      const list = await transactionsApi.getTransactions(filters);
      setTransactions(list);
      return list;
    } catch (err) {
      console.error('Failed to load transactions:', err);
      throw err;
    }
  }, [isAuthenticated]);

  // Fetch Current Budget
  const fetchBudgets = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await budgetsApi.getCurrent();
      setBudget(data);
    } catch (err) {
      console.error('Failed to load budget:', err);
    }
  }, [isAuthenticated]);

  // Fetch Savings Goals
  const fetchGoals = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await goalsApi.getGoals();
      setGoals(data);
    } catch (err) {
      console.error('Failed to load goals:', err);
    }
  }, [isAuthenticated]);

  // Fetch Bank Accounts
  const fetchBankAccounts = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await bankApi.getAccounts();
      setBankAccounts(data);
    } catch (err) {
      console.error('Failed to load banks:', err);
    }
  }, [isAuthenticated]);

  // Refresh All financial state across views
  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchOverview(),
        fetchTransactions(),
        fetchBudgets(),
        fetchGoals(),
        fetchBankAccounts()
      ]);
    } catch (err) {
      setError(err.message || 'Failed to synchronize financial data.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchOverview, fetchTransactions, fetchBudgets, fetchGoals, fetchBankAccounts]);

  // Initial load when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    } else {
      setOverview(null);
      setTransactions([]);
      setBudget(null);
      setGoals([]);
      setBankAccounts([]);
    }
  }, [isAuthenticated, refreshAll]);

  // Reactive mutations
  const createTransaction = async (data) => {
    const res = await transactionsApi.createTransaction(data);
    await refreshAll();
    return res;
  };

  const updateTransaction = async (id, data) => {
    const res = await transactionsApi.updateTransaction(id, data);
    await refreshAll();
    return res;
  };

  const deleteTransaction = async (id) => {
    const res = await transactionsApi.deleteTransaction(id);
    await refreshAll();
    return res;
  };

  const saveBudget = async (payload) => {
    const res = await budgetsApi.setBudget(payload);
    setBudget(res);
    await fetchOverview();
    return res;
  };

  const createGoal = async (payload) => {
    const res = await goalsApi.createGoal(payload);
    await fetchGoals();
    return res;
  };

  const depositToGoal = async (goalId, amount) => {
    const res = await goalsApi.deposit(goalId, amount);
    await Promise.all([fetchGoals(), fetchOverview()]);
    return res;
  };

  const deleteGoal = async (goalId) => {
    const res = await goalsApi.deleteGoal(goalId);
    await fetchGoals();
    return res;
  };

  const connectDemoBank = async (bankName, accountType) => {
    const res = await bankApi.connectDemo(bankName, '', accountType);
    await Promise.all([fetchBankAccounts(), fetchOverview()]);
    return res;
  };

  const disconnectBank = async (bankId) => {
    const res = await bankApi.disconnect(bankId);
    await Promise.all([fetchBankAccounts(), fetchOverview()]);
    return res;
  };

  const value = {
    overview,
    transactions,
    budget,
    goals,
    bankAccounts,
    isLoading,
    error,
    refreshAll,
    fetchOverview,
    fetchTransactions,
    fetchBudgets,
    fetchGoals,
    fetchBankAccounts,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    saveBudget,
    createGoal,
    depositToGoal,
    deleteGoal,
    connectDemoBank,
    disconnectBank
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
