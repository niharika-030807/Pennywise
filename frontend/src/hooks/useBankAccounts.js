import { useState, useEffect, useCallback } from 'react';
import { bankApi } from '../api/bank.api';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';

export const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC', badge: 'Fast Sync', logo: '🏦' },
  { id: 'sbi', name: 'State Bank of India', code: 'SBI', badge: 'Public Sector', logo: '🏛️' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI', badge: 'Instant Sync', logo: '💳' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS', badge: 'AA Ready', logo: '📈' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', code: 'KOTAK', badge: '811 Verified', logo: '💼' },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PNB', badge: 'National', logo: '🏪' }
];

export function useBankAccounts() {
  const { user } = useAuth();
  const { refreshAll } = useFinance();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(POPULAR_BANKS[0].name);
  const [connecting, setConnecting] = useState(false);
  const [consentStep, setConsentStep] = useState(1); // 1: Select Bank, 2: AA Consent, 3: Success

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bankApi.getAccounts();
      setAccounts(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch bank accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleConnectBank = async () => {
    setConnecting(true);
    try {
      await bankApi.connectDemo(selectedBank, user?.phone || '9876543210');
      setConsentStep(3);
      await Promise.all([fetchAccounts(), refreshAll()]);
      setTimeout(() => {
        setIsConnectModalOpen(false);
        setConsentStep(1);
        setConnecting(false);
      }, 1500);
    } catch (err) {
      alert(err.message || 'Connection failed.');
      setConnecting(false);
    }
  };

  const handleDisconnect = async (bankId) => {
    if (!window.confirm('Disconnect this bank account?')) return;
    try {
      await bankApi.disconnect(bankId);
      await Promise.all([fetchAccounts(), refreshAll()]);
    } catch (err) {
      alert(err.message || 'Failed to disconnect account.');
    }
  };

  return {
    accounts,
    loading,
    error,
    isConnectModalOpen,
    setIsConnectModalOpen,
    selectedBank,
    setSelectedBank,
    connecting,
    consentStep,
    setConsentStep,
    popularBanks: POPULAR_BANKS,
    handleConnectBank,
    handleDisconnect,
    refetch: fetchAccounts
  };
}
