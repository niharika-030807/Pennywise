import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  PiggyBank, 
  TrendingUp, 
  CreditCard, 
  Calendar,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  ChevronRight
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
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { api } from '../api/client';
import { formatINR, formatINRCompact } from '../utils/formatters';

const CATEGORY_COLORS = {
  'Rent and Bills': '#7800B8',
  'Shopping': '#FF1493',
  'Groceries': '#00F0FF',
  'Food and Dining': '#FF8C00',
  'Transportation': '#9D00FF',
  'Entertainment': '#FF69B4',
  'Healthcare': '#00E676',
  'Education': '#FFD600',
  'Personal Expenses': '#E040FB',
  'Other Expenses': '#7C4DFF'
};

const DEFAULT_COLORS = ['#FF1493', '#7800B8', '#00F0FF', '#FF8C00', '#00E676', '#FFD600', '#FF69B4', '#9D00FF'];

export default function Dashboard({ onOpenAddTransaction, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expensePeriod, setExpensePeriod] = useState('monthly'); // 'daily' | 'weekly' | 'monthly'

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardOverview();
      setData(res);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#FF1493] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#FF69B4] font-semibold">
            Aggregating Financial Telemetry...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
        <p className="font-semibold">Failed to load dashboard</p>
        <p className="text-xs mt-1">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-3 px-4 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  // Determine expense bar data based on period toggle
  let expenseChartData = [];
  if (expensePeriod === 'daily') {
    expenseChartData = data?.daily_expenses?.map(d => ({ name: d.day, amount: d.amount })) || [];
  } else if (expensePeriod === 'weekly') {
    expenseChartData = data?.weekly_expenses?.map(w => ({ name: w.week, amount: w.amount })) || [];
  } else {
    expenseChartData = data?.trends?.map(t => ({ name: t.month, amount: t.expense })) || [];
  }

  return (
    <div className="space-y-6">
      {/* Personalized Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel relative overflow-hidden">
        {/* Glow background accent */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#FF1493]/20 rounded-full blur-2xl pointer-events-none" />

        <div>
          <span className="text-xs uppercase tracking-widest text-[#FF69B4] font-bold">
            Executive Financial Pulse
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
            Welcome back, {data?.first_name || 'Investor'}! 👋
          </h1>
          <p className="text-xs text-[#A5A5B8] mt-1">
            Here is your live personal ledger, active banking balances, and capital flow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate?.('wrap')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#101536] border border-[#FF1493]/40 text-[#FF69B4] hover:bg-[#FF1493]/10 transition-colors"
          >
            <span>View Money Wrap</span>
            <ChevronRight size={14} />
          </button>
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink hover:opacity-95 transition-all"
          >
            <PlusCircle size={15} />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* 4 STAT OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Balance */}
        <div className="glass-panel glass-card-hover p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#A5A5B8]">Total Net Balance</span>
            <div className="w-9 h-9 rounded-xl bg-[#7800B8]/30 border border-[#7800B8]/60 flex items-center justify-center text-[#FF69B4]">
              <Wallet size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatINR(data?.total_balance)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-semibold">
            <TrendingUp size={13} />
            <span>Active across all accounts</span>
          </div>
        </div>

        {/* Card 2: Monthly Income */}
        <div className="glass-panel glass-card-hover p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#A5A5B8]">Monthly Inflow</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ArrowDownRight size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatINR(data?.monthly_income)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-emerald-400">
            <span>+{data?.income_change_pct || 0}% vs last month</span>
          </div>
        </div>

        {/* Card 3: Monthly Expenses */}
        <div className="glass-panel glass-card-hover p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#A5A5B8]">Monthly Outflow</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatINR(data?.monthly_expense)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-[#FF69B4]">
            <span>{data?.expense_change_pct >= 0 ? `+${data?.expense_change_pct}%` : `${data?.expense_change_pct}%`} vs last month</span>
          </div>
        </div>

        {/* Card 4: Total Savings */}
        <div className="glass-panel glass-card-hover p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#A5A5B8]">Net Monthly Savings</span>
            <div className="w-9 h-9 rounded-xl bg-[#D900A8]/25 border border-[#FF1493]/40 flex items-center justify-center text-[#FF1493]">
              <PiggyBank size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatINR(data?.monthly_savings)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-[#FF69B4]">
            <span>{data?.monthly_income > 0 ? `${Math.round((data.monthly_savings / data.monthly_income) * 100)}% Savings Rate` : 'No income registered'}</span>
          </div>
        </div>
      </div>

      {/* SECTION B & C: CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Trend Area Chart (Span 2) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Income vs Expenses Velocity</span>
              </h3>
              <p className="text-xs text-[#A5A5B8]">6-month capital inflow & burn telemetry</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-[#FF1493]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF1493]" /> Expenses
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E676" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00E676" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF1493" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#FF1493" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#A5A5B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#A5A5B8" fontSize={11} tickLine={false} tickFormatter={(v) => formatINRCompact(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#080B24', borderColor: '#FF1493', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val) => [formatINR(val)]}
                />
                <Area type="monotone" dataKey="income" name="Income" stroke="#00E676" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#FF1493" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending Categories Donut Chart */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col">
          <div className="mb-2">
            <h3 className="text-base font-bold text-white">Spending Categories</h3>
            <p className="text-xs text-[#A5A5B8]">Current month allocation</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.category_breakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(data?.category_breakdown || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#080B24', borderColor: '#7800B8', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val) => [formatINR(val)]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase text-[#A5A5B8] font-bold">Spent</span>
              <span className="text-sm font-black text-white">{formatINRCompact(data?.monthly_expense)}</span>
            </div>
          </div>

          {/* Top 3 Legend items */}
          <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
            {(data?.category_breakdown || []).slice(0, 3).map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[item.name] || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
                  />
                  <span className="text-[#A5A5B8] truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="font-semibold text-white">{formatINR(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION A, D & E: EXPENSE OVERVIEW TOGGLE & RECENT TRANSACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* A. Expense Overview with Daily/Weekly/Monthly Toggle (1 col) */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Expense Overview</h3>
              <p className="text-xs text-[#A5A5B8]">Filtered spend distribution</p>
            </div>
            {/* Period Toggle */}
            <div className="flex p-0.5 rounded-lg bg-[#050509] border border-white/10 text-[11px] font-semibold">
              <button
                onClick={() => setExpensePeriod('daily')}
                className={`px-2 py-1 rounded-md transition-all ${
                  expensePeriod === 'daily' ? 'bg-[#FF1493] text-white shadow-sm' : 'text-[#A5A5B8] hover:text-white'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setExpensePeriod('weekly')}
                className={`px-2 py-1 rounded-md transition-all ${
                  expensePeriod === 'weekly' ? 'bg-[#FF1493] text-white shadow-sm' : 'text-[#A5A5B8] hover:text-white'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setExpensePeriod('monthly')}
                className={`px-2 py-1 rounded-md transition-all ${
                  expensePeriod === 'monthly' ? 'bg-[#FF1493] text-white shadow-sm' : 'text-[#A5A5B8] hover:text-white'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#A5A5B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#A5A5B8" fontSize={11} tickLine={false} tickFormatter={(v) => formatINRCompact(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#080B24', borderColor: '#FF1493', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val) => [formatINR(val), 'Expense']}
                />
                <Bar dataKey="amount" fill="#FF1493" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* E. Budget Progress Bar */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-white">Monthly Budget Cap</span>
              <span className="text-[#FF69B4] font-bold">
                {data?.budget?.percentage || 0}% Used
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#050509] rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (data?.budget?.percentage || 0) >= 100
                    ? 'bg-rose-500 shadow-glow-pink'
                    : (data?.budget?.percentage || 0) >= 80
                    ? 'bg-amber-400'
                    : 'bg-gradient-to-r from-[#7800B8] to-[#FF1493]'
                }`}
                style={{ width: `${Math.min(100, data?.budget?.percentage || 0)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#A5A5B8] mt-1.5">
              <span>Spent: {formatINR(data?.budget?.spent)}</span>
              <span>Limit: {formatINR(data?.budget?.limit)}</span>
            </div>
          </div>
        </div>

        {/* D. Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Recent Transactions</h3>
                <p className="text-xs text-[#A5A5B8]">Latest ledger activity</p>
              </div>
              <button
                onClick={() => onNavigate?.('transactions')}
                className="text-xs font-semibold text-[#FF69B4] hover:underline flex items-center gap-1"
              >
                <span>View Full Ledger</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-2.5">
              {(data?.recent_transactions || []).map((tx) => {
                const isExpense = tx.type === 'expense';
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#050509]/50 border border-white/5 hover:border-[#FF1493]/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isExpense ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        {isExpense ? '↓' : '↑'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{tx.title}</p>
                        <p className="text-[10px] text-[#A5A5B8] flex items-center gap-1.5">
                          <span>{tx.category}</span>
                          <span>•</span>
                          <span>{tx.date}</span>
                          <span>•</span>
                          <span className="text-[#FF69B4]">{tx.payment_method}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${isExpense ? 'text-white' : 'text-emerald-400'}`}>
                        {isExpense ? '-' : '+'}{formatINR(tx.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-center">
            <button
              onClick={onOpenAddTransaction}
              className="text-xs font-bold text-[#FF1493] hover:text-[#FF69B4] inline-flex items-center gap-1.5"
            >
              <PlusCircle size={14} />
              <span>Record a new expense or income</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

