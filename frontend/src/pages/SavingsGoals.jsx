import React from 'react';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useGoals } from '../hooks/useGoals';
import { formatINR, formatDate } from '../utils/formatters';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Modal from '../components/modals/Modal';

const GOAL_CATEGORIES = [
  'General',
  'Gadgets & Electronics',
  'Travel & Vacation',
  'Emergency Fund',
  'Vehicle',
  'Real Estate & Home',
  'Investments'
];

export default function SavingsGoals() {
  const {
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
    refetch
  } = useGoals();

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your savings goals..." />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ---------------- HEADER & ACTIONS ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Target Savings Goals
          </h1>
          <p className="text-xs sm:text-sm text-[#A5A5B8] mt-1">
            Set ambitious targets, track accumulation velocity, and allocate deposits.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)} icon={Plus}>
          New Savings Goal
        </Button>
      </div>

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {/* ---------------- GOALS GRID ---------------- */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} hover className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="primary" size="sm">
                      {goal.category}
                    </Badge>
                    <h3 className="text-lg font-bold text-white mt-2">{goal.title}</h3>
                  </div>

                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Target & Saved */}
                <div className="mt-4 flex items-baseline justify-between text-xs">
                  <span className="text-[#A5A5B8]">Saved:</span>
                  <span className="text-lg font-black text-white font-mono">
                    {formatINR(goal.current_amount)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs text-[#A5A5B8]">
                  <span>Target:</span>
                  <span>{formatINR(goal.target_amount)}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-[#101536] overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      goal.progress_percentage >= 100
                        ? 'bg-emerald-400 shadow-glow-pink'
                        : 'bg-gradient-to-r from-[#7800B8] to-[#FF1493]'
                    }`}
                    style={{ width: `${Math.min(100, goal.progress_percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#A5A5B8] mt-1.5">
                  <span className="font-bold text-[#FF69B4]">{goal.progress_percentage}% completed</span>
                  <span>Target: {formatDate(goal.target_date)}</span>
                </div>
              </div>

              {/* Action: Deposit funds */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-[#A5A5B8]">
                  Rec. {formatINR(goal.recommended_monthly_savings)}/mo
                </span>
                <Button variant="secondary" size="sm" onClick={() => openDeposit(goal)} icon={ArrowUpRight}>
                  Deposit Funds
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="No Savings Goals Configured"
          description="Create savings targets for vacations, emergency buffers, gadgets, or vehicles."
          actionLabel="Create First Goal"
          onAction={() => setIsCreateOpen(true)}
          className="py-16"
        />
      )}

      {/* ---------------- CREATE GOAL MODAL ---------------- */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Savings Goal">
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-1">
          <Input
            label="Goal Title"
            placeholder="e.g. MacBook Pro, Japan Vacation, Emergency Fund"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            required
          />

          <Input
            label="Target Amount (₹)"
            type="number"
            placeholder="50000"
            value={newGoal.target_amount}
            onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
            required
          />

          <Select
            label="Category"
            options={GOAL_CATEGORIES}
            value={newGoal.category}
            onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
          />

          <Input
            label="Target Completion Date"
            type="date"
            value={newGoal.target_date}
            onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Target</Button>
          </div>
        </form>
      </Modal>

      {/* ---------------- DEPOSIT FUNDS MODAL ---------------- */}
      <Modal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} title={`Deposit to ${selectedGoal?.title}`}>
        <form onSubmit={handleDepositSubmit} className="space-y-4 pt-1">
          <p className="text-xs text-[#A5A5B8]">
            Allocate savings toward your <span className="text-white font-bold">{selectedGoal?.title}</span> target.
          </p>

          <Input
            label="Deposit Amount (₹)"
            type="number"
            placeholder="5000"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button variant="ghost" onClick={() => setIsDepositOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm Deposit</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
