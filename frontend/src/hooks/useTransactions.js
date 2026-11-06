import { useState, useEffect, useRef, useCallback } from 'react';
import { transactionsApi } from '../api/transactions.api';
import { useFinance } from '../context/FinanceContext';

export function useTransactions() {
  const { refreshAll } = useFinance();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals & Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  // CSV Import State
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await transactionsApi.getTransactions({
        search,
        category,
        type,
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
  }, [search, category, type, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await transactionsApi.deleteTransaction(id);
      await Promise.all([fetchTransactions(), refreshAll()]);
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

  const handleModalSuccess = async () => {
    await Promise.all([fetchTransactions(), refreshAll()]);
    setIsModalOpen(false);
  };

  const handleCsvChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportMessage('');
    try {
      const res = await transactionsApi.importCsv(file);
      setImportMessage(res.message || 'Transactions imported successfully!');
      await Promise.all([fetchTransactions(), refreshAll()]);
    } catch (err) {
      setImportMessage(`Import Error: ${err.message}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportCsv = () => {
    if (!transactions.length) return;
    const headers = ['Title', 'Amount', 'Type', 'Category', 'Date', 'Payment Method', 'Description'];
    const rows = transactions.map((t) => [
      `"${t.title.replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      `"${t.category}"`,
      t.date,
      `"${t.payment_method}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pennywise_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
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
    refetch: fetchTransactions
  };
}
