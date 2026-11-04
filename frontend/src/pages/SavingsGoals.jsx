import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  TrendingUp,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  Laptop,
  Plane,
  Shield,
  Car,
  Home
} from 'lucide-react';
import { api } from '../api/client';
import { formatINR } from '../utils/formatters';
import Modal from '../components/Modal';

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  // New Goal Form
  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    target_date: '',
    category: 'Gadgets'
  });

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await api.getGoals();
      setGoals(data);
    } catch (err) {
      console.error('Failed to fetch goals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newGoal.title.trim() || !newGoal.target_amount || !newGoal.target_date) return;
    try {
      await api.createGoal({
        title: newGoal.title.trim(),
        target_amount: Number(newGoal.target_amount),
        target_date: newGoal.target_date,
        category: newGoal.category
      });
      setIsCreateOpen(false);
      setNewGoal({ title: '', target_amount: '', target_date: '', category: 'Gadgets' });
      fetchGoals();
    } catch (err) {
      alert(err.message || 'Failed to create goal.');
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGoal || !depositAmount || Number(depositAmount) <= 0) return;
    try {
      await api.depositToGoal(selectedGoal.id, Number(depositAmount));
      setIsDepositOpen(false);
      setDepositAmount('');
      setSelectedGoal(null);
      fetchGoals();
    } catch (err) {
      alert(err.message || 'Deposit failed.');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Delete this savings goal?')) return;
    try {
      await api.deleteGoal(id);
      fetchGoals();
    } catch (err) {
      alert(err.message || 'Failed to delete goal.');
    }
  };

  const openDeposit = (goal) => {
    setSelectedGoal(goal);
    setDepositAmount('');
    setIsDepositOpen(true);
  };

  const getCategoryIcon = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'gadgets': return '💻';
      case 'travel': return '✈️';
      case 'emergency': return '🛡️';
      case 'vehicle': return '🚗';
      case 'home': return '🏠';
      default: return '🎯';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#FF69B4] font-bold">
            Target-Driven Wealth Accumulation
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Savings Goals
          </h1>
          <p className="text-xs text-[#A5A5B8] mt-1">
            Define ambitious life milestones, fund targets, and view auto-calculated monthly SIP needs.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink hover:opacity-95"
        >
          <Plus size={16} />
          <span>New Savings Target</span>
        </button>
      </div>

      {/* GOALS GRID */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#FF69B4] flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-[#FF1493] border-t-transparent rounded-full animate-spin" />
          <span>Tracking savings milestones...</span>
        </div>
      ) : goals.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 flex items-center justify-center text-gray-500">
            <Target size={24} />
          </div>
          <p className="text-sm font-semibold text-white">No Savings Goals Set Yet</p>
          <p className="text-xs text-[#A5A5B8] max-w-sm mx-auto">
            Set a goal for an emergency fund, vehicle, gadget, or dream vacation.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF1493] text-white shadow-glow-pink"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const isCompleted = g.progress_percentage >= 100;
            return (
              <div
                key={g.id}
                className="glass-panel glass-card-hover p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                        {getCategoryIcon(g.category)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">{g.title}</h3>
                        <span className="text-[10px] text-[#A5A5B8] uppercase tracking-wider font-semibold">
                          {g.category} Target
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="text-gray-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Financial numbers */}
                  <div className="my-4">
                    <div className="flex items-baseline justify-between text-xs mb-1">
                      <span className="text-gray-400">Saved: <b className="text-white text-sm">{formatINR(g.current_amount)}</b></span>
                      <span className="text-gray-400">Target: <b className="text-gray-200">{formatINR(g.target_amount)}</b></span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-[#050509] rounded-full overflow-hidden p-0.5 border border-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isCompleted
                          ? 'bg-emerald-400 shadow-glow-cyan'
                          : 'bg-gradient-to-r from-[#7800B8] to-[#FF1493]'
                          }`}
                        style={{ width: `${g.progress_percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] mt-1.5 font-semibold">
                      <span className={isCompleted ? 'text-emerald-400' : 'text-[#FF69B4]'}>
                        {g.progress_percentage}% Completed
                      </span>
                      <span className="text-gray-400">
                        {formatINR(g.remaining_amount)} remaining
                      </span>
                    </div>
                  </div>

                  {/* Recommended monthly savings & target date */}
                  <div className="p-3 rounded-xl bg-[#050509]/60 border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-[#A5A5B8]">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> Target Date:
                      </span>
                      <span className="font-medium text-white">{g.target_date}</span>
                    </div>

                    {!isCompleted && (
                      <div className="flex items-center justify-between text-[11px] text-[#FF69B4] pt-1 border-t border-white/5">
                        <span>Recommended Monthly SIP:</span>
                        <span className="font-bold text-white">{formatINR(g.recommended_monthly_savings)}/mo</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deposit action button */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  {isCompleted ? (
                    <div className="py-2 text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={16} />
                      <span>Target Milestone Achieved! 🎉</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => openDeposit(g)}
                      className="w-full py-2 rounded-xl text-xs font-bold bg-[#101536] border border-[#FF1493]/40 text-[#FF69B4] hover:bg-[#FF1493] hover:text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle size={14} />
                      <span>Add Money to Target</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Savings Goal"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Milestone Name *</label>
            <input
              type="text"
              placeholder="e.g. MacBook Pro, Bali Trip, Emergency Fund"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050509] border border-white/15 text-white focus:outline-none focus:border-[#FF1493]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Target Amount (₹) *</label>
              <input
                type="number"
                placeholder="60000"
                value={newGoal.target_amount}
                onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050509] border border-white/15 text-white font-semibold focus:outline-none focus:border-[#FF1493]"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Target Date *</label>
              <input
                type="date"
                value={newGoal.target_date}
                onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050509] border border-white/15 text-white focus:outline-none focus:border-[#FF1493]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Category</label>
            <select
              value={newGoal.category}
              onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050509] border border-white/15 text-white focus:outline-none focus:border-[#FF1493]"
            >
              <option value="Gadgets">Gadgets & Tech 💻</option>
              <option value="Travel">Travel & Vacation ✈️</option>
              <option value="Emergency">Emergency Cushion 🛡️</option>
              <option value="Vehicle">Vehicle 🚗</option>
              <option value="Home">Home & Real Estate 🏠</option>
              <option value="General">General Milestone 🎯</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink"
            >
              Set Milestone
            </button>
          </div>
        </form>
      </Modal>

      {/* DEPOSIT MODAL */}
      <Modal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        title={`Add Funds to ${selectedGoal?.title}`}
      >
        <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
          <p className="text-gray-300">
            Deposit money from your savings into this goal to advance your progress.
          </p>

          <div>
            <label className="block text-gray-400 mb-1">Deposit Amount (₹) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-gray-400 font-semibold">₹</span>
              <input
                type="number"
                step="100"
                placeholder="5000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#050509] border border-white/15 text-white text-base font-bold focus:outline-none focus:border-[#FF1493]"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsDepositOpen(false)}
              className="px-4 py-2 rounded-xl text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink"
            >
              Confirm Deposit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

