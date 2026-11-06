import React from 'react';
import {
  Building2,
  ShieldCheck,
  Plus,
  CheckCircle2,
  Lock,
  Unlink
} from 'lucide-react';
import { useBankAccounts } from '../hooks/useBankAccounts';
import { formatINR } from '../utils/formatters';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Modal from '../components/modals/Modal';

export default function BankAccounts() {
  const {
    accounts,
    loading,
    error,
    isConnectModalOpen,
    setIsConnectModalOpen,
    selectedBank,
    setSelectedBank,
    connecting,
    consentStep,
    popularBanks,
    handleConnectBank,
    handleDisconnect,
    refetch
  } = useBankAccounts();

  if (loading) {
    return <LoadingSpinner size="lg" message="Querying Account Aggregator framework..." />;
  }

  const totalBankBalance = accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ---------------- HEADER & ACTIONS ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Connect Your Financial World
          </h1>
          <p className="text-xs sm:text-sm text-[#A5A5B8] mt-1">
            Authorized Account Aggregator framework integration with RBI-regulated financial information providers.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsConnectModalOpen(true)} icon={Plus}>
          Link Bank Account
        </Button>
      </div>

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {/* ---------------- AGGREGATE STATS ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card hover>
          <p className="text-xs font-semibold text-[#A5A5B8] uppercase">Aggregated Liquid Balance</p>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            {formatINR(totalBankBalance)}
          </h3>
          <p className="text-xs text-[#A5A5B8] mt-2">Combined across connected institutions</p>
        </Card>

        <Card hover>
          <p className="text-xs font-semibold text-[#A5A5B8] uppercase">Linked Bank Accounts</p>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {accounts.length}
          </h3>
          <p className="text-xs text-[#A5A5B8] mt-2">Active telemetry pipelines</p>
        </Card>

        <Card hover>
          <p className="text-xs font-semibold text-[#A5A5B8] uppercase">Consent Security Mode</p>
          <div className="flex items-center gap-2 mt-2">
            <ShieldCheck size={24} className="text-[#FF1493]" />
            <span className="text-base font-bold text-white">RBI Account Aggregator</span>
          </div>
          <p className="text-[11px] text-[#A5A5B8] mt-2">Zero credential storage • Read-only telemetry</p>
        </Card>
      </div>

      {/* ---------------- LINKED ACCOUNTS LIST ---------------- */}
      <div>
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Building2 size={18} className="text-[#FF69B4]" />
          Active Account Aggregator Connections
        </h3>

        {accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((acc) => (
              <Card key={acc.id} hover className="flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">{acc.bank_name}</h4>
                      <p className="text-xs text-[#A5A5B8] mt-0.5">{acc.account_type}</p>
                    </div>

                    <Badge variant="success" size="sm">
                      Connected
                    </Badge>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-[#050509]/60 border border-white/5 space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#A5A5B8]">
                      <span>Account Number:</span>
                      <span className="font-mono text-white font-semibold">{acc.account_number_masked}</span>
                    </div>
                    <div className="flex justify-between text-[#A5A5B8]">
                      <span>IFSC Code:</span>
                      <span className="font-mono text-white font-semibold">{acc.ifsc}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between text-xs">
                    <span className="text-[#A5A5B8]">Available Balance:</span>
                    <span className="text-xl font-black text-white font-mono">
                      {formatINR(acc.balance)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#A5A5B8]">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Lock size={12} className="text-[#FF1493]" /> End-to-end encrypted
                  </span>
                  <button
                    onClick={() => handleDisconnect(acc.id)}
                    className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                  >
                    <Unlink size={13} /> Disconnect
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title="No Bank Accounts Connected"
            description="Link your bank accounts via our simulated RBI Account Aggregator flow to view aggregate balance."
            actionLabel="Connect Bank Account"
            onAction={() => setIsConnectModalOpen(true)}
            className="py-16"
          />
        )}
      </div>

      {/* ---------------- CONNECT BANK MODAL ---------------- */}
      <Modal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        title="Link Account via Account Aggregator"
      >
        <div className="space-y-4 pt-1">
          {consentStep === 1 && (
            <>
              <p className="text-xs text-[#A5A5B8] leading-relaxed">
                Select your bank to initiate an authorized Account Aggregator discovery flow. No banking passwords or UPI PINs are ever required.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {popularBanks.map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => setSelectedBank(bank.name)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      selectedBank === bank.name
                        ? 'border-[#FF1493] bg-[#7800B8]/30 shadow-glow-pink'
                        : 'border-white/10 bg-[#080B24] hover:bg-white/5'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{bank.logo}</span>
                    <span className="text-xs font-bold text-white block">{bank.name}</span>
                    <span className="text-[10px] text-[#A5A5B8]">{bank.badge}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="ghost" onClick={() => setIsConnectModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConnectBank}
                  isLoading={connecting}
                  icon={ShieldCheck}
                >
                  Authorize & Link
                </Button>
              </div>
            </>
          )}

          {consentStep === 3 && (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 size={48} className="text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Bank Account Linked Successfully</h4>
              <p className="text-xs text-[#A5A5B8]">
                Account Aggregator consent token registered. Balance synchronized.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
