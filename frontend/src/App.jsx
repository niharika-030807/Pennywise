import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import BudgetPlanner from './pages/BudgetPlanner';
import MonthlyWrap from './pages/MonthlyWrap';
import FinancialInsights from './pages/FinancialInsights';
import SavingsGoals from './pages/SavingsGoals';
import FinancialAssistant from './pages/FinancialAssistant';
import BankAccounts from './pages/BankAccounts';
import Settings from './pages/Settings';

import Sidebar, { NAV_ITEMS } from './components/Sidebar';
import Navbar from './components/Navbar';
import NetworkBackground from './components/NetworkBackground';
import TransactionModal from './components/TransactionModal';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // If loading session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050509] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7800B8] to-[#FF1493] flex items-center justify-center font-bold text-white text-2xl animate-pulse shadow-glow-pink">
            ₹
          </div>
          <p className="text-xs uppercase tracking-widest text-[#FF69B4] font-bold">
            Initializing Pennywise Financial Engine...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Authentication System
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Active Tab Title
  const activeItem = NAV_ITEMS.find((n) => n.id === currentTab);
  const activeTabName = activeItem ? activeItem.label : 'Dashboard';

  const handleTransactionCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#050509] text-white flex relative overflow-x-hidden">
      {/* Background canvas from Reference Video 1 */}
      <NetworkBackground nodeCount={45} interactive={false} />

      {/* Background Gradient Waves from Reference Image 2 */}
      <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-[#FF1493]/15 via-[#D900A8]/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-[#7800B8]/15 via-[#35004F]/20 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      {/* Sidebar Navigation (10 items) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 relative z-10 min-w-0">
        <Navbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAddTransaction={() => setIsAddTxOpen(true)}
          activeTabName={activeTabName}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              key={refreshKey}
              onOpenAddTransaction={() => setIsAddTxOpen(true)}
              onNavigate={setCurrentTab}
            />
          )}
          {currentTab === 'transactions' && <Transactions key={refreshKey} />}
          {currentTab === 'budgets' && <BudgetPlanner key={refreshKey} />}
          {currentTab === 'wrap' && <MonthlyWrap key={refreshKey} />}
          {currentTab === 'insights' && <FinancialInsights key={refreshKey} />}
          {currentTab === 'goals' && <SavingsGoals key={refreshKey} />}
          {currentTab === 'assistant' && <FinancialAssistant />}
          {currentTab === 'banks' && <BankAccounts key={refreshKey} />}
          {currentTab === 'settings' && <Settings />}
        </main>
      </div>

      {/* Global Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onSuccess={handleTransactionCreated}
      />
    </div>
  );
}

