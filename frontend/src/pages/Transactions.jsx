import React from 'react';
import {
  Plus,
  Search,
  Filter,
  Upload,
  Trash2,
  Edit3,
  Download,
  Calendar,
  Receipt,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { formatINR, formatDate } from '../utils/formatters';
import { TRANSACTION_CATEGORIES } from '../utils/constants';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import TransactionModal from '../components/modals/TransactionModal';

export default function Transactions() {
  const {
    transactions,
    loading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    type,
    setType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isModalOpen,
    setIsModalOpen,
    editingTx,
    handleAdd,
    handleEdit,
    handleDelete,
    handleModalSuccess,
    fileInputRef,
    importing,
    importMessage,
    handleCsvChange,
    handleExportCsv,
    refetch
  } = useTransactions();

  const categoryFilterOptions = [
    { value: 'All', label: 'All Categories' },
    ...TRANSACTION_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))
  ];

  const typeFilterOptions = [
    { value: 'All', label: 'All Types' },
    { value: 'expense', label: 'Expenses Only' },
    { value: 'income', label: 'Income Only' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ----------------- HEADER & ACTIONS ----------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Expense Tracker & Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#A5A5B8] mt-1">
            Search, filter, categorize, and manage your full financial transaction history.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* CSV Import Hidden Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCsvChange}
            accept=".csv"
            className="hidden"
          />

          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            isLoading={importing}
            icon={Upload}
          >
            Import CSV
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            disabled={!transactions.length}
            icon={Download}
          >
            Export CSV
          </Button>

          <Button variant="primary" size="sm" onClick={handleAdd} icon={Plus}>
            Record Entry
          </Button>
        </div>
      </div>

      {/* CSV Import Status Banner */}
      {importMessage && (
        <div className="p-3.5 rounded-xl bg-[#7800B8]/20 border border-[#FF1493]/30 text-xs text-[#FF69B4] flex items-center justify-between">
          <span>{importMessage}</span>
          <button onClick={() => {}} className="text-white hover:underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {/* ----------------- SEARCH & FILTERS CONTROLS ----------------- */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          {/* Search */}
          <div className="lg:col-span-2">
            <Input
              label="Search Description / Title"
              placeholder="Search by merchant, note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>

          {/* Category Filter */}
          <div>
            <Select
              label="Category"
              options={categoryFilterOptions}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div>
            <Select
              label="Type"
              options={typeFilterOptions}
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </div>

          {/* Date Range Start */}
          <div>
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* ----------------- TRANSACTIONS LEDGER TABLE ----------------- */}
      <Card className="overflow-hidden p-0">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner size="md" message="Loading transaction ledger..." />
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#050509]/60 border-b border-white/10 text-xs text-[#A5A5B8] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Transaction</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Method</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            tx.type === 'income'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-[#7800B8]/30 text-[#FF69B4]'
                          }`}
                        >
                          {tx.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{tx.title}</span>
                          {tx.description && (
                            <span className="text-[11px] text-[#A5A5B8] line-clamp-1">{tx.description}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={tx.type === 'income' ? 'success' : 'primary'} size="sm">
                        {tx.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#A5A5B8] whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#A5A5B8] whitespace-nowrap">
                      {tx.payment_method || 'UPI'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold font-mono whitespace-nowrap">
                      <span className={tx.type === 'income' ? 'text-emerald-400' : 'text-white'}>
                        {tx.type === 'income' ? '+' : '-'} {formatINR(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit transaction"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Receipt}
            title="No Transactions Found"
            description={
              search || category !== 'All' || type !== 'All'
                ? 'No transactions matched your search or active filter criteria.'
                : 'Your transaction register is currently empty. Record expenses or import a bank statement to begin.'
            }
            actionLabel="Add Transaction"
            onAction={handleAdd}
            className="py-12 border-0"
          />
        )}
      </Card>

      {/* ----------------- CREATE / EDIT MODAL ----------------- */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={editingTx}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
