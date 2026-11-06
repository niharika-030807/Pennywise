import React from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  PiggyBank, 
  CreditCard, 
  Calendar, 
  PlusCircle, 
  ChevronRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useDashboard } from '../hooks/useDashboard';
import { formatINR, formatINRCompact } from '../utils/formatters';
import { TRANSACTION_CATEGORIES } from '../utils/constants';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const CATEGORY_COLOR_MAP = TRANSACTION_CATEGORIES.reduce((acc, curr) => {
  acc[curr.id] = curr.color;
  return acc;
}, {});

const DEFAULT_CHART_COLORS = ['#FF1493', '#7800B8', '#00F0FF', '#FF8C00', '#00E676', '#FFD600', '#FF69B4', '#9D00FF'];

export default function Dashboard({ onOpenAddTransaction, onNavigate }) {
  const {
    data,
    loading,
    error,
    expensePeriod,
    setExpensePeriod,
    displayExpense,
    periodLabel,
    savingsRate,
    refetch
  } = useDashboard();

  if (loading) {
    return <LoadingSpinner size="lg" message="Synchronizing Financial Telemetry..." />;
  }

  if (error && !data) {
    return <ErrorMessage message={error} onRetry={refetch} className="my-8" />;
  }

  const {
    user_name,
    first_name,
    total_balance = 0,
    monthly_income = 0,
    total_savings = 0,
    recent_transactions = [],
    category_spending = [],
    cashflow_trend = [],
    budget_progress
  } = data || {};

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ---------------- 1. DASHBOARD GREETING & QUICK ACTIONS ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Welcome back, <span className="bg-gradient-to-r from-white via-[#FF69B4] to-[#FF1493] bg-clip-text text-transparent">{first_name || user_name || 'User'}</span>!
          </h1>
          <p className="text-xs sm:text-sm text-[#A5A5B8] mt-1">
            Real-time financial telemetry, cashflow analytics, and predictive budgeting.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => onNavigate('wrap')}>
            Monthly Wrap
          </Button>
          <Button variant="primary" size="sm" onClick={onOpenAddTransaction} icon={PlusCircle}>
            Add Expense
          </Button>
        </div>
      </div>

      {/* ---------------- 2. FINANCIAL OVERVIEW METRIC CARDS ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Balance */}
        <StatCard
          title="Total Balance"
          value={total_balance}
          icon={Wallet}
          subtitle="Aggregated Net Worth"
          color="from-[#7800B8] to-[#FF1493]"
        />

        {/* Monthly Income */}
        <StatCard
          title="Monthly Income"
          value={monthly_income}
          icon={ArrowUpRight}
          subtitle="Received this month"
          color="from-emerald-500 to-teal-400"
        />

        {/* Expenses Overview with Period Selector */}
        <Card hover className="relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-[#A5A5B8] tracking-wide uppercase">
                  {periodLabel}
                </p>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                {formatINR(displayExpense)}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ArrowDownRight size={22} />
            </div>
          </div>

          {/* Daily / Weekly / Monthly Switcher */}
          <div className="mt-3.5 flex items-center gap-1.5 p-1 rounded-lg bg-[#050509]/60 border border-white/5 text-[11px] font-semibold">
            {['daily', 'weekly', 'monthly'].map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setExpensePeriod(period)}
                className={`flex-1 py-1 rounded-md capitalize transition-all ${
                  expensePeriod === period
                    ? 'bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-sm'
                    : 'text-[#A5A5B8] hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </Card>

        {/* Total Savings */}
        <StatCard
          title="Total Savings"
          value={total_savings}
          icon={PiggyBank}
          trend={savingsRate}
          trendLabel="Savings Rate"
          color="from-[#D900A8] to-[#FF1493]"
        />
      </div>

      {/* ---------------- 3. INTERACTIVE VISUALIZATIONS ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Cashflow Area Chart */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-[#FF1493]" />
                Cashflow Dynamics (Income vs Expenses)
              </h3>
              <p className="text-xs text-[#A5A5B8]">Daily inflow and outflow telemetry</p>
            </div>
            <span className="text-[11px] font-semibold text-[#FF69B4] px-2.5 py-1 rounded-full bg-[#7800B8]/20 border border-[#FF1493]/30">
              Last 14 Days
            </span>
          </div>

          <div className="h-64 w-full">
            {cashflow_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashflow_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E676" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF1493" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FF1493" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#606078" fontSize={11} tickFormatter={(d) => d.slice(8)} />
                  <YAxis stroke="#606078" fontSize={11} tickFormatter={(v) => formatINRCompact(v)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#080B24',
                      borderColor: 'rgba(255, 20, 147, 0.4)',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [formatINR(val)]}
                  />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#00E676" strokeWidth={2} fillOpacity={1} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#FF1493" strokeWidth={2} fillOpacity={1} fill="url(#expenseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No Cashflow Data Yet"
                description="Record income and expenses to view the cashflow telemetry curves."
                className="h-full border-0"
              />
            )}
          </div>
        </Card>

        {/* Spending Categories Donut Chart */}
        <Card className="flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard size={18} className="text-[#FF69B4]" />
              Spending Distribution
            </h3>
            <p className="text-xs text-[#A5A5B8]">Expenses grouped by category</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {category_spending.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={category_spending}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {category_spending.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLOR_MAP[entry.category] || DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#080B24',
                      borderColor: 'rgba(255, 20, 147, 0.4)',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [formatINR(val)]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-[#A5A5B8]">
                No recorded expenses this month.
              </div>
            )}
          </div>

          {/* Top 3 Category Breakdown Pills */}
          <div className="space-y-2 mt-2">
            {category_spending.slice(0, 3).map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLOR_MAP[cat.category] || DEFAULT_CHART_COLORS[i] }}
                  />
                  <span className="text-[#A5A5B8]">{cat.category}</span>
                </div>
                <span className="font-semibold text-white">{formatINR(cat.amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ---------------- 4. BUDGET PROGRESS & RECENT TRANSACTIONS ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Progress Indicator */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white">Monthly Budget Progress</h3>
              <button
                onClick={() => onNavigate('budgets')}
                className="text-xs text-[#FF69B4] hover:underline flex items-center gap-1 font-semibold"
              >
                Manage <ChevronRight size={14} />
              </button>
            </div>

            {budget_progress?.has_budget ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#A5A5B8] mb-1.5 font-medium">
                    <span>{formatINR(budget_progress.total_spent)} spent</span>
                    <span>Cap: {formatINR(budget_progress.monthly_limit)}</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#101536] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        budget_progress.percentage >= 100
                          ? 'bg-rose-500 shadow-glow-pink'
                          : budget_progress.percentage >= 80
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-[#7800B8] to-[#FF1493]'
                      }`}
                      style={{ width: `${Math.min(100, budget_progress.percentage)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#101536]/80 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[#A5A5B8]">Remaining Budget:</span>
                  <span className="font-bold text-emerald-400">
                    {formatINR(budget_progress.remaining)}
                  </span>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No Budget Cap Configured"
                description="Set monthly spending limits to prevent overspending and track burn rate."
                actionLabel="Set Budget"
                onAction={() => onNavigate('budgets')}
                className="py-6 border-0"
              />
            )}
          </div>
        </Card>

        {/* Recent Transactions Table */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt size={18} className="text-[#FF1493]" />
              Recent Transactions
            </h3>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-[#FF69B4] hover:underline flex items-center gap-1 font-semibold"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          {recent_transactions.length > 0 ? (
            <div className="divide-y divide-white/5">
              {recent_transactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between hover:bg-white/5 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        tx.type === 'income'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#7800B8]/30 text-[#FF69B4] border border-[#FF1493]/30'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{tx.title}</h4>
                      <p className="text-[11px] text-[#A5A5B8] flex items-center gap-2 mt-0.5">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-bold font-mono ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-white'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatINR(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Recorded Transactions"
              description="Start tracking your cashflow by clicking 'Add Expense' above."
              actionLabel="Add Transaction"
              onAction={onOpenAddTransaction}
              className="py-8 border-0"
            />
          )}
        </Card>
      </div>
    </div>
  );
}
