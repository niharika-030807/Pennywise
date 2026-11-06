import React from 'react';
import { 
  Sparkles, 
  Award, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useMonthlyWrap } from '../hooks/useMonthlyWrap';
import { formatINR } from '../utils/formatters';
import { TRANSACTION_CATEGORIES } from '../utils/constants';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const PIE_COLORS = ['#FF1493', '#7800B8', '#00F0FF', '#FF8C00', '#00E676', '#FFD600', '#E040FB', '#7C4DFF'];

export default function MonthlyWrap() {
  const {
    wrapData,
    loading,
    error,
    selectedMonth,
    handleMonthChange,
    refetch
  } = useMonthlyWrap();

  if (loading && !wrapData) {
    return <LoadingSpinner size="lg" message="Compiling Spotify-style Monthly Money Wrap..." />;
  }

  if (error && !wrapData) {
    return <ErrorMessage message={error} onRetry={refetch} className="my-8" />;
  }

  const {
    title = 'MONTHLY MONEY WRAP',
    month_name,
    year,
    total_income = 0,
    total_expenses = 0,
    total_savings = 0,
    savings_rate = 0,
    highest_category = 'None',
    highest_category_amount = 0,
    num_transactions = 0,
    average_daily_spend = 0,
    comparison_with_prev_month,
    category_breakdown = [],
    insights = [],
    personality = 'New Voyager 🌱',
    badge_desc,
    available_months = []
  } = wrapData || {};

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ---------------- 1. WRAP HEADER & MONTH SELECTOR ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white">
              Spotify-Style Recap
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Your Monthly Money Wrap
          </h1>
          <p className="text-xs sm:text-sm text-[#A5A5B8]">
            An executive visual retrospective of your inflows, outflows, habits, and financial personality.
          </p>
        </div>

        {/* Month Selector Dropdown */}
        {available_months.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#A5A5B8] font-medium hidden sm:inline">Report Period:</label>
            <select
              onChange={handleMonthChange}
              value={selectedMonth ? `${selectedMonth.month}-${selectedMonth.year}` : ''}
              className="rounded-xl bg-[#080B24] border border-[#FF1493]/40 text-white text-xs sm:text-sm py-2 px-3 focus:outline-none focus:border-[#FF1493]"
            >
              {available_months.map((m) => (
                <option key={`${m.month}-${m.year}`} value={`${m.month}-${m.year}`}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ---------------- 2. HERO HIGHLIGHT BANNER ---------------- */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#080B24] via-[#35004F]/60 to-[#080B24] border border-[#FF1493]/35 shadow-glow-purple">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF1493]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-3">
            <Badge variant="primary" size="sm">
              <Sparkles size={12} className="mr-1.5" /> {month_name?.toUpperCase()} {year} OVERVIEW
            </Badge>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {title}
            </h2>

            <p className="text-xs sm:text-sm text-[#A5A5B8] leading-relaxed max-w-xl">
              You retained <span className="text-emerald-400 font-bold">{formatINR(total_savings)}</span> in savings from <span className="text-white font-bold">{formatINR(total_income)}</span> total earnings, achieving a <span className="text-[#FF69B4] font-bold">{savings_rate}% savings velocity</span>.
            </p>
          </div>

          {/* Financial Persona Badge */}
          <div className="p-5 rounded-2xl bg-[#050509]/80 border border-[#FF1493]/40 text-center shadow-glow-pink">
            <Award size={36} className="text-[#FF1493] mx-auto mb-2" />
            <h4 className="text-sm font-black text-white">{personality}</h4>
            <p className="text-[11px] text-[#A5A5B8] mt-1">{badge_desc}</p>
          </div>
        </div>
      </div>

      {/* ---------------- 3. CORE METRIC STATS ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Income"
          value={total_income}
          icon={TrendingUp}
          color="from-emerald-500 to-teal-400"
        />
        <StatCard
          title="Total Outflow"
          value={total_expenses}
          color="from-rose-500 to-rose-600"
        />
        <StatCard
          title="Net Savings"
          value={total_savings}
          trend={savings_rate}
          trendLabel="Savings Rate"
          color="from-[#7800B8] to-[#FF1493]"
        />
        <StatCard
          title="Avg Daily Spend"
          value={average_daily_spend}
          subtitle={`Across ${num_transactions} entries`}
          color="from-[#00E5FF] to-[#2979FF]"
        />
      </div>

      {/* ---------------- 4. VISUAL BREAKDOWNS & COMPARISONS ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Horizontal Bars */}
        <Card>
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Flame size={18} className="text-[#FF1493]" />
            Expense Allocations
          </h3>
          <p className="text-xs text-[#A5A5B8] mb-4">Ranked by money spent</p>

          {category_breakdown.length > 0 ? (
            <div className="space-y-3">
              {category_breakdown.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{cat.name}</span>
                    <span className="text-[#A5A5B8]">
                      <span className="text-white font-mono">{formatINR(cat.amount)}</span> ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#101536] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7800B8] to-[#FF1493]"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Spending Recorded"
              description="No category expenses found for this month."
              className="py-10 border-0"
            />
          )}
        </Card>

        {/* Personalized AI Insights */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles size={18} className="text-[#FF69B4]" />
              Tailored Financial Takeaways
            </h3>
            <p className="text-xs text-[#A5A5B8] mb-4">Derived from your habits and trends</p>

            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#101536]/80 border border-white/5 flex items-start gap-3 text-xs leading-relaxed text-[#A5A5B8]"
                >
                  <CheckCircle2 size={16} className="text-[#FF1493] shrink-0 mt-0.5" />
                  <span className="text-white">{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {comparison_with_prev_month && (
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-[#A5A5B8] flex items-center justify-between">
              <span>vs {comparison_with_prev_month.prev_month_name}</span>
              <span className={comparison_with_prev_month.expense_diff <= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {comparison_with_prev_month.expense_diff <= 0 ? 'Decreased Outflow by ' : 'Increased Outflow by '}
                {formatINR(Math.abs(comparison_with_prev_month.expense_diff))}
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
