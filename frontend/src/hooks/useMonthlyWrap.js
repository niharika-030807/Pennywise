import { useState, useEffect, useCallback } from 'react';
import { wrapApi } from '../api/wrap.api';

export function useMonthlyWrap() {
  const [wrapData, setWrapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null); // { month, year }
  const [error, setError] = useState('');

  const fetchWrap = useCallback(async (m = null, y = null) => {
    setLoading(true);
    setError('');
    try {
      const data = await wrapApi.getSummary(m, y);
      setWrapData(data);
    } catch (err) {
      setError(err.message || 'Error fetching monthly wrap.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWrap();
  }, [fetchWrap]);

  const handleMonthChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [m, y] = val.split('-');
    setSelectedMonth({ month: parseInt(m), year: parseInt(y) });
    fetchWrap(parseInt(m), parseInt(y));
  };

  return {
    wrapData,
    loading,
    error,
    selectedMonth,
    handleMonthChange,
    refetch: fetchWrap
  };
}
