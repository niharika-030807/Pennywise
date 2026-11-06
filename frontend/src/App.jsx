import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppLayout from './components/layout/AppLayout';
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
import TransactionModal from './components/modals/TransactionModal';
import LoadingSpinner from './components/common/LoadingSpinner';

function MainApp() {
  const { isAuthenticated, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);

  if (loading) {
    return <LoadingSpinner size="lg" message="Initializing Pennywise Financial Engine..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <FinanceProvider>
      <AppLayout
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddTransaction={() => setIsAddTxOpen(true)}
      >
        {currentTab === 'dashboard' && (
          <Dashboard
            onOpenAddTransaction={() => setIsAddTxOpen(true)}
            onNavigate={setCurrentTab}
          />
        )}
        {currentTab === 'transactions' && <Transactions />}
        {currentTab === 'budgets' && <BudgetPlanner />}
        {currentTab === 'wrap' && <MonthlyWrap />}
        {currentTab === 'insights' && <FinancialInsights />}
        {currentTab === 'goals' && <SavingsGoals />}
        {currentTab === 'assistant' && <FinancialAssistant />}
        {currentTab === 'banks' && <BankAccounts />}
        {currentTab === 'settings' && <Settings />}
      </AppLayout>

      {/* Global Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />
    </FinanceProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
