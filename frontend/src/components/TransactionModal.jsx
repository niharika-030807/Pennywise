import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { api } from '../api/client';

export const CATEGORIES = [
  'Groceries',
  'Shopping',
  'Personal Expenses',
  'Food and Dining',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Education',
  'Rent and Bills',
  'Other Expenses',
  'Salary',
  'Freelance',
  'Investments'
];

export const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash'
];

export default function TransactionModal({ isOpen, onClose, transaction, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food and Dining',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'UPI',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setFormData({
        title: transaction.title || '',
        amount: transaction.amount || '',
        type: transaction.type || 'expense',
        category: transaction.category || 'Food and Dining',
        date: transaction.date || new Date().toISOString().split('T')[0],
        payment_method: transaction.payment_method || 'UPI',
        description: transaction.description || ''
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: 'Food and Dining',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'UPI',
        description: ''
      });
    }
    setError('');
  }, [transaction, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a transaction name.');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please provide a valid amount in ₹.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount)
      };

      if (transaction && transaction.id) {
        await api.updateTransaction(transaction.id, payload);
      } else {
        await api.createTransaction(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Edit Transaction' : 'Record New Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Type Toggle: Expense vs Income */}
        <div className="flex p-1 rounded-xl bg-[#050509] border border-white/10">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'expense' })}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              formData.type === 'expense'
                ? 'bg-[#FF1493] text-white shadow-glow-pink'
                : 'text-[#A5A5B8] hover:text-white'
            }`}
          >
            💸 Expense
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'income', category: 'Salary' })}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              formData.type === 'income'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-[#A5A5B8] hover:text-white'
            }`}
          >
            💰 Income
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-[#A5A5B8] mb-1">
            Transaction Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Swiggy Dinner, DMart Groceries, Rent"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B24] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493]"
            required
          />
        </div>

        {/* Amount & Date in Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#A5A5B8] mb-1">
              Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-gray-400 font-semibold">₹</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#080B24] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493] font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A5A5B8] mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B24] border border-white/15 text-white focus:outline-none focus:border-[#FF1493]"
              required
            />
          </div>
        </div>

        {/* Category & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#A5A5B8] mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B24] border border-white/15 text-white focus:outline-none focus:border-[#FF1493]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#080B24] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A5A5B8] mb-1">
              Payment Method
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B24] border border-white/15 text-white focus:outline-none focus:border-[#FF1493]"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m} className="bg-[#080B24] text-white">
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-medium text-[#A5A5B8] mb-1">
            Notes / Description (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="Add invoice info, tags, or extra notes..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-[#080B24] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493] resize-none"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[#A5A5B8] hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink hover:opacity-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : transaction ? 'Update Transaction' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

