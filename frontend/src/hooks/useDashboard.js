import { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';

export function useDashboard() {
  const { overview: data, isLoading: loading, error, refreshAll: refetch } = useFinance();
  const [expensePeriod, setExpensePeriod] = useState('monthly'); // 'daily' | 'weekly' | 'monthly'

  // Dynamic expense breakdowns based on active period
  const expenseMetrics = useMemo(() => {
    if (!data) return { displayExpense: 0, periodLabel: 'This Month' };

    const monthlyExpense = data.monthly_expense || 0;
    const now = new Date();
    const daysElapsed = Math.max(1, now.getDate());

    if (expensePeriod === 'daily') {
      return {
        displayExpense: Math.round(monthlyExpense / daysElapsed),
        periodLabel: 'Avg Daily Spend'
      };
    } else if (expensePeriod === 'weekly') {
      const weeksElapsed = Math.max(1, daysElapsed / 7);
      return {
        displayExpense: Math.round(monthlyExpense / weeksElapsed),
        periodLabel: 'Weekly Average'
      };
    }

    return {
      displayExpense: monthlyExpense,
      periodLabel: 'Total Monthly Outflow'
    };
  }, [data, expensePeriod]);

  // Savings rate
  const savingsRate = useMemo(() => {
    if (!data || !data.monthly_income || data.monthly_income <= 0) return 0;
    return Math.max(0, Math.round((data.total_savings / data.monthly_income) * 100));
  }, [data]);

  return {
    data,
    loading: loading && !data,
    error,
    expensePeriod,
    setExpensePeriod,
    displayExpense: expenseMetrics.displayExpense,
    periodLabel: expenseMetrics.periodLabel,
    savingsRate,
    refetch
  };
}
