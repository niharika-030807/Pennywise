import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import ErrorMessage from '../common/ErrorMessage';
import { transactionsApi } from '../../api/transactions.api';
import { TRANSACTION_CATEGORIES, PAYMENT_METHODS } from '../../utils/constants';

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
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide a title or description for the transaction.');
      return;
    }

    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: amt
      };

      if (transaction && transaction.id) {
        await transactionsApi.updateTransaction(transaction.id, payload);
      } else {
        await transactionsApi.createTransaction(payload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save transaction.');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = TRANSACTION_CATEGORIES.map((c) => ({ value: c.id, label: c.label }));
  if (formData.type === 'income') {
    categoryOptions.unshift(
      { value: 'Salary', label: 'Salary' },
      { value: 'Freelance', label: 'Freelance' },
      { value: 'Investments', label: 'Investments' }
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Edit Transaction' : 'Record New Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <ErrorMessage message={error} />

        {/* Transaction Type Tabs */}
        <div>
          <label className="block text-xs font-semibold text-[#A5A5B8] mb-1.5">Transaction Type</label>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#050509]/80 border border-white/10">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense', category: 'Food and Dining' })}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                formData.type === 'expense'
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md'
                  : 'text-[#A5A5B8] hover:text-white'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income', category: 'Salary' })}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                formData.type === 'income'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                  : 'text-[#A5A5B8] hover:text-white'
              }`}
            >
              Income (+)
            </button>
          </div>
        </div>

        {/* Title */}
        <Input
          label="Transaction Name / Merchant"
          placeholder="e.g. Swiggy Order, Grocery Mart, Salary"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        {/* Amount */}
        <Input
          label="Amount (₹)"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <Select
            label="Category"
            options={categoryOptions}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />

          {/* Date */}
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        {/* Payment Method */}
        <Select
          label="Payment Method"
          options={PAYMENT_METHODS}
          value={formData.payment_method}
          onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
        />

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-semibold text-[#A5A5B8] mb-1.5">
            Notes / Description (Optional)
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Additional context or notes..."
            className="w-full rounded-xl bg-[#080B24]/90 border border-white/10 text-white placeholder-gray-500 text-sm p-3 focus:outline-none focus:border-[#FF1493]"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {transaction ? 'Save Changes' : 'Record Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
