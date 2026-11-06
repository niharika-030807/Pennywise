import { useState, useEffect, useCallback } from 'react';
import { goalsApi } from '../api/goals.api';
import { useFinance } from '../context/FinanceContext';

export function useGoals() {
  const { refreshAll } = useFinance();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Form
  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    target_date: '',
    category: 'General'
  });

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await goalsApi.getGoals();
      setGoals(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch goals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newGoal.title.trim() || !newGoal.target_amount || !newGoal.target_date) return;

    try {
      await goalsApi.createGoal({
        title: newGoal.title.trim(),
        target_amount: Number(newGoal.target_amount),
        target_date: newGoal.target_date,
        category: newGoal.category || 'General'
      });
      setIsCreateOpen(false);
      setNewGoal({ title: '', target_amount: '', target_date: '', category: 'General' });
      await Promise.all([fetchGoals(), refreshAll()]);
    } catch (err) {
      alert(err.message || 'Failed to create savings goal.');
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGoal || !depositAmount) return;

    try {
      await goalsApi.deposit(selectedGoal.id, Number(depositAmount));
      setIsDepositOpen(false);
      setDepositAmount('');
      await Promise.all([fetchGoals(), refreshAll()]);
    } catch (err) {
      alert(err.message || 'Failed to deposit to savings goal.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await goalsApi.deleteGoal(id);
      await Promise.all([fetchGoals(), refreshAll()]);
    } catch (err) {
      alert(err.message || 'Failed to remove goal.');
    }
  };

  const openDeposit = (goal) => {
    setSelectedGoal(goal);
    setDepositAmount('');
    setIsDepositOpen(true);
  };

  return {
    goals,
    loading,
    error,
    isCreateOpen,
    setIsCreateOpen,
    isDepositOpen,
    setIsDepositOpen,
    selectedGoal,
    depositAmount,
    setDepositAmount,
    newGoal,
    setNewGoal,
    handleCreateSubmit,
    handleDepositSubmit,
    handleDelete,
    openDeposit,
    refetch: fetchGoals
  };
}
