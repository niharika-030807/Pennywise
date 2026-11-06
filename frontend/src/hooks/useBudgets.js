import { useState, useEffect, useCallback } from 'react';
import { budgetsApi } from '../api/budgets.api';
import { useFinance } from '../context/FinanceContext';
import { DEFAULT_CATEGORY_LIMITS } from '../utils/constants';

export function useBudgets() {
  const { refreshAll } = useFinance();
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [monthlyLimitInput, setMonthlyLimitInput] = useState(0);
  const [categoryInputs, setCategoryInputs] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchBudget = useCallback(async () => {
    try {
      setLoading(true);
      const res = await budgetsApi.getCurrent();
      setBudgetData(res);
      setMonthlyLimitInput(res.monthly_limit || 0);

      const catMap = { ...DEFAULT_CATEGORY_LIMITS };
      if (res.category_progress && res.category_progress.length > 0) {
        res.category_progress.forEach((c) => {
          catMap[c.category] = c.limit;
        });
      }
      setCategoryInputs(catMap);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load budget.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const handleSaveBudget = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setError('');

    try {
      const now = new Date();
      await budgetsApi.setBudget({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        monthly_limit: parseFloat(monthlyLimitInput) || 0,
        category_budgets: categoryInputs
      });
      setSaveSuccess(true);
      setEditMode(false);
      await Promise.all([fetchBudget(), refreshAll()]);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save budget targets.');
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryChange = (cat, val) => {
    setCategoryInputs((prev) => ({
      ...prev,
      [cat]: Math.max(0, parseFloat(val) || 0)
    }));
  };

  return {
    budgetData,
    loading,
    saving,
    editMode,
    setEditMode,
    monthlyLimitInput,
    setMonthlyLimitInput,
    categoryInputs,
    saveSuccess,
    error,
    handleSaveBudget,
    handleCategoryChange,
    refetch: fetchBudget
  };
}
