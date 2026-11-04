import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  Upload,
  Trash2,
  Edit3,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Calendar,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../api/client';
import { formatINR } from '../utils/formatters';
import TransactionModal, { CATEGORIES } from '../components/TransactionModal';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  // CSV Import State
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.getTransactions({
        search,
        category: selectedCategory,
        type: selectedType,
        start_date: startDate,
        end_date: endDate
      });
      setTransactions(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedType, startDate, endDate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.deleteTransaction(id);
      fetchTransactions();
    } catch (err) {
      alert(err.message || 'Failed to delete transaction.');
    }
  };

  const handleEdit = (tx) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTx(null);
    setIsModalOpen(true);
  };

  const handleCsvChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportMessage('');
    try {
      const res = await api.importCsv(file);
      setImportMessage(res.message || 'Transactions imported successfully!');
      fetchTransactions();
    } catch (err) {
      setImportMessage(`Import Error: ${err.message}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Export current list to CSV
  const handleExportCsv = () => {
    if (!transactions.length) return;
    const headers = ['Title', 'Amount', 'Type', 'Category', 'Date', 'Payment Method', 'Description'];
    const rows = transactions.map(t => [
      `"${t.title.replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      `"${t.category}"`,
      t.date,
      `"${t.payment_method}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pennywise_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#FF69B4] font-bold">
            Personal Ledger & Cashbook
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Transactions & Expense Tracker
          </h1>
          <p className="text-xs text-[#A5A5B8] mt-1">
            Search, record, categorize and audit every rupee in your financial world.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* CSV Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCsvChange}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#101536] border border-[#7800B8]/40 text-[#A5A5B8] hover:text-white hover:bg-white/5 transition-all"
          >
            <Upload size={14} />
            <span>{importing ? 'Importing...' : 'Import CSV'}</span>
          </button>

          {/* CSV Export */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#101536] border border-[#7800B8]/40 text-[#A5A5B8] hover:text-white hover:bg-white/5 transition-all"
          >
            <Download size={14} />
            <span>Export</span>
          </button>

          {/* Add New Transaction Button */}
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink hover:opacity-95 transition-all"
          >
            <Plus size={16} />
            <span>Record Entry</span>
          </button>
        </div>
      </div>

      {importMessage && (
        <div className="p-3 rounded-xl bg-[#7800B8]/20 border border-[#FF1493]/30 text-xs text-[#FF69B4] flex items-center justify-between">
          <span>{importMessage}</span>
          <button onClick={() => setImportMessage('')} className="text-white hover:underline">Dismiss</button>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 rounded-2xl glass-panel space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, description, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-[#050509]/80 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#050509]/80 border border-white/10 text-xs text-white focus:outline-none focus:border-[#FF1493]"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#080B24]">{cat}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#050509]/80 border border-white/10 text-xs text-white focus:outline-none focus:border-[#FF1493]"
            >
              <option value="All">All Flow Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Incomes Only</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedType('All');
                setStartDate('');
                setEndDate('');
              }}
              className="w-full py-2 rounded-xl bg-[#101536] border border-white/10 text-xs font-semibold text-[#A5A5B8] hover:text-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/5 text-xs">
          <span className="text-[#A5A5B8] font-medium flex items-center gap-1">
            <Calendar size={13} /> Date Range:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-[#050509] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF1493]"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-[#050509] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF1493]"
            />
          </div>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#FF69B4] flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#FF1493] border-t-transparent rounded-full animate-spin" />
            <span>Loading ledger entries...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 flex items-center justify-center text-gray-500">
              <FileSpreadsheet size={24} />
            </div>
            <p className="text-sm font-semibold text-white">No transactions found</p>
            <p className="text-xs text-[#A5A5B8] max-w-sm mx-auto">
              No records match your active query or filters. Record your first transaction or clear filters.
            </p>
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF1493] text-white shadow-glow-pink"
            >
              Record First Entry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#050509]/60 border-b border-white/10 text-[#A5A5B8] uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Transaction</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Title & Notes */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${isExpense ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'
                            }`}>
                            {isExpense ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-xs">{tx.title}</p>
                            {tx.description && (
                              <p className="text-[10px] text-[#A5A5B8] truncate max-w-xs">{tx.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-[#A5A5B8]">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px]">
                          {tx.category}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-gray-400 whitespace-nowrap">
                        {tx.date}
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4 text-gray-300">
                        <span className="text-[11px] font-medium text-[#FF69B4]">{tx.payment_method}</span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className={`font-bold text-xs ${isExpense ? 'text-white' : 'text-emerald-400'}`}>
                          {isExpense ? '-' : '+'}{formatINR(tx.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(tx)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Add/Edit Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={editingTx}
        onSuccess={fetchTransactions}
      />
    </div>
  );
}

