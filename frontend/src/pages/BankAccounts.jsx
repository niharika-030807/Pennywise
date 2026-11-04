import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  Plus,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Lock,
  AlertCircle,
  Unlink
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/formatters';
import Modal from '../components/Modal';

const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC', badge: 'Fast Sync', logo: '🏦' },
  { id: 'sbi', name: 'State Bank of India', code: 'SBI', badge: 'Public Sector', logo: '🏛️' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI', badge: 'Instant Sync', logo: '💳' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS', badge: 'AA Ready', logo: '📈' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', code: 'KOTAK', badge: '811 Verified', logo: '💼' },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PNB', badge: 'National', logo: '🏪' }
];

export default function BankAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(POPULAR_BANKS[0].name);
  const [connecting, setConnecting] = useState(false);
  const [consentStep, setConsentStep] = useState(1); // 1: Select Bank, 2: AA Consent, 3: Success

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await api.getBankAccounts();
      setAccounts(data);
    } catch (err) {
      console.error('Failed to fetch bank accounts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleConnectBank = async () => {
    setConnecting(true);
    try {
      await api.connectDemoBank(selectedBank, user?.phone || '9876543210');
      setConsentStep(3);
      fetchAccounts();
      setTimeout(() => {
        setIsConnectModalOpen(false);
        setConsentStep(1);
      }, 1600);
    } catch (err) {
      alert(err.message || 'Connection failed.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (id) => {
    if (!window.confirm('Disconnect this bank account from Pennywise?')) return;
    try {
      await api.disconnectBank(id);
      fetchAccounts();
    } catch (err) {
      alert(err.message || 'Failed to disconnect.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#7800B8]/20 rounded-full blur-3xl pointer-events-none" />

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101536] border border-[#FF1493]/35 text-xs font-semibold text-[#FF69B4] mb-2">
            <ShieldCheck size={14} className="text-[#FF1493]" />
            <span>RBI Account Aggregator (AA) Framework</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Connect Your Financial World
          </h1>
          <p className="text-xs text-[#A5A5B8] mt-1">
            Seamlessly synchronize your savings accounts, deposits, and transaction logs in a single unified ledger.
          </p>
        </div>

        <button
          onClick={() => {
            setConsentStep(1);
            setIsConnectModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink hover:opacity-95 transition-all"
        >
          <Plus size={16} />
          <span>Link Bank Account</span>
        </button>
      </div>

      {/* Security Guarantee Box */}
      <div className="p-4 rounded-xl bg-[#080B24]/90 border border-emerald-500/25 flex items-start gap-3 text-xs">
        <Lock size={18} className="text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-white">Bank-Grade Encryption & Read-Only Protocol</p>
          <p className="text-[#A5A5B8] text-[11px] mt-0.5 leading-relaxed">
            Pennywise integrates through authorized Account Aggregator consent gates. We <b className="text-white">never</b> ask for, store, or have access to your Net Banking passwords, Debit Card PINs, or UPI credentials.
          </p>
        </div>
      </div>

      {/* CONNECTED ACCOUNTS GRID */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#FF69B4] flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-[#FF1493] border-t-transparent rounded-full animate-spin" />
          <span>Querying Account Aggregator nodes...</span>
        </div>
      ) : accounts.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 flex items-center justify-center text-gray-500">
            <Building2 size={24} />
          </div>
          <p className="text-sm font-semibold text-white">No Linked Bank Accounts</p>
          <p className="text-xs text-[#A5A5B8] max-w-sm mx-auto">
            Link your HDFC, SBI, ICICI or other bank to auto-sync transactions and balances.
          </p>
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF1493] text-white shadow-glow-pink"
          >
            Link Demo Bank Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="glass-panel glass-card-hover p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group border border-[#FF1493]/30"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#35004F] to-[#7800B8] border border-[#FF69B4]/40 flex items-center justify-center text-2xl shadow-sm">
                      🏦
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{acc.bank_name}</h3>
                      <p className="text-xs text-gray-400 font-mono">{acc.account_number_masked}</p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#050509]/70 border border-white/5 space-y-1 mb-4">
                  <span className="text-[11px] text-gray-400">Available Liquid Balance</span>
                  <p className="text-2xl font-black text-white">{formatINR(acc.balance)}</p>
                  <p className="text-[10px] text-[#A5A5B8]">IFSC: <span className="font-mono text-gray-300">{acc.ifsc}</span></p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                <span className="text-[10px] text-gray-400">Sync: Real-time (AA)</span>
                <button
                  onClick={() => handleDisconnect(acc.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                >
                  <Unlink size={13} />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONNECT BANK MODAL */}
      <Modal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        title="Link Account via Account Aggregator"
      >
        {consentStep === 1 && (
          <div className="space-y-4 text-xs">
            <p className="text-gray-300">
              Select your primary Indian banking institution to initiate secure, authorized read-only synchronization.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {POPULAR_BANKS.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => setSelectedBank(bank.name)}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${selectedBank === bank.name
                    ? 'bg-[#7800B8]/30 border-[#FF1493] shadow-glow-pink'
                    : 'bg-[#050509] border-white/10 hover:border-white/30'
                    }`}
                >
                  <span className="text-xl">{bank.logo}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white text-xs truncate">{bank.name}</p>
                    <span className="text-[10px] text-[#FF69B4]">{bank.badge}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#050509] border border-white/10 text-[11px] text-gray-400 space-y-1">
              <p>• Mobile registered with bank: <b className="text-white">+91 {user?.phone}</b></p>
              <p>• Consent handle: <b className="text-white">{user?.first_name?.toLowerCase()}@onemoney</b></p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsConnectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setConsentStep(2)}
                className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink"
              >
                Proceed to Consent
              </button>
            </div>
          </div>
        )}

        {consentStep === 2 && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#050509] border border-[#FF1493]/40 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#FF1493]/20 flex items-center justify-center text-[#FF1493]">
                <ShieldCheck size={24} />
              </div>
              <h4 className="font-bold text-white text-sm">Account Aggregator Consent Request</h4>
              <p className="text-[#A5A5B8] text-xs">
                {selectedBank} is requesting your one-time digital consent to share account statements with Pennywise for financial tracking.
              </p>
            </div>

            <div className="space-y-1.5 text-gray-300 text-[11px]">
              <p>✓ <b>Purpose:</b> Personal Finance Ledger & Expense Analytics</p>
              <p>✓ <b>Data Access:</b> Read-only account balances and transaction logs</p>
              <p>✓ <b>Validity:</b> Revocable anytime from settings</p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setConsentStep(1)}
                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConnectBank}
                disabled={connecting}
                className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink flex items-center gap-2"
              >
                {connecting ? 'Authenticating with Bank...' : 'Authorize & Link'}
              </button>
            </div>
          </div>
        )}

        {consentStep === 3 && (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-lg">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="font-bold text-white text-base">Account Successfully Linked!</h4>
            <p className="text-xs text-gray-400">
              Synced {selectedBank} balance and synced latest transactions into your ledger.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

