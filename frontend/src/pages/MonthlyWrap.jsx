import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  CheckCircle2, 
  ChevronRight,
  Flame,
  ArrowRight,
  Share2
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
import { api } from '../api/client';
import { formatINR } from '../utils/formatters';

const PIE_COLORS = ['#FF1493', '#7800B8', '#00F0FF', '#FF8C00', '#00E676', '#FFD600', '#E040FB', '#7C4DFF'];

export default function MonthlyWrap() {
  const [wrapData, setWrapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null); // { month, year }

  const fetchWrap = async (m, y) => {
    setLoading(true);
    try {
      const data = await api.getMonthlyWrap(m, y);
      setWrapData(data);
    } catch (err) {
      console.error('Error fetching wrap', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWrap();
  }, []);

  const handleMonthChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [m, y] = val.split('-');
    setSelectedMonth({ month: parseInt(m), year: parseInt(y) });
    fetchWrap(parseInt(m), parseInt(y));
  };

  if (loading && !wrapData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#FF1493] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#FF69B4] font-semibold">
            Synthesizing Your Monthly Money Wrap...
          </p>
        </div>
      </div>
    );
  }

  const {
    title,
    month_name,
    year,
    total_income,
    total_expenses,
    total_savings,
    savings_rate,
    highest_category,
    highest_category_amount,
    lowest_category,
    lowest_category_amount,
    num_transactions,
    average_daily_spend,
    comparison_with_prev_month,
    category_breakdown,
    insights,
    personality,
    badge_desc,
    available_months
  } = wrapData || {};

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Banner & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel relative overflow-hidden">
        {/* Glowing accents matching Reference Image 2 */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#FF1493]/30 via-[#D900A8]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF1493]/20 border border-[#FF1493]/50 text-xs font-bold text-[#FF69B4] mb-2 shadow-glow-pink">
            <Sparkles size={14} />
            <span>ANNUAL & MONTHLY ARCHIVE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wide">
            Your Monthly Money Wrap
          </h1>
          <p className="text-xs text-[#A5A5B8] mt-1">
            A comprehensive, personalized visual debrief of your financial habits and capital velocity.
          </p>
        </div>

        {/* Month Selector */}
        <div className="relative">
          <select
            onChange={handleMonthChange}
            value={selectedMonth ? `${selectedMonth.month}-${selectedMonth.year}` : ''}
            className="px-4 py-2.5 rounded-xl bg-[#080B24] border border-[#FF1493]/40 text-xs font-semibold text-white focus:outline-none focus:border-[#FF1493] cursor-pointer"
          >
            {(available_months || []).map((m) => (
              <option key={`${m.month}-${m.year}`} value={`${m.month}-${m.year}`}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SPOTIFY-WRAPPED STYLE EXECUTIVE POSTER */}
      <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-[#FF1493]/40 shadow-glow-purple bg-gradient-to-br from-[#050509] via-[#080B24] to-[#35004F]">
        {/* Watermark Logo */}
        <div className="absolute top-6 right-6 text-right">
          <span className="text-xl font-black bg-gradient-to-r from-white via-[#FF69B4] to-[#FF1493] bg-clip-text text-transparent">
            PENNYWISE
          </span>
          <p className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Make Every Rupee Count.</p>
        </div>

        {/* Wrap Title */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF69B4]">
            FINANCIAL INTELLIGENCE DEBRIEF
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mt-1 tracking-tight">
            {title || `YOUR ${month_name?.toUpperCase()} MONEY WRAP`}
          </h2>
          <p className="text-xs sm:text-sm text-[#A5A5B8] mt-1 font-medium">
            Based on {num_transactions} verified transactions recorded across your accounts.
          </p>
        </div>

        {/* Big 3 Financial Totals Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-2xl bg-[#080B24]/80 backdrop-blur-xl border border-white/10 mb-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Total Income Received</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              {formatINR(total_income)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Total Money Spent</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              {formatINR(total_expenses)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#FF69B4] font-semibold">Total Money Saved</p>
            <p className="text-2xl sm:text-3xl font-black text-[#FF1493] mt-1">
              {formatINR(total_savings)}
            </p>
          </div>
        </div>

        {/* Personality Badge & Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-8">
          {/* Personality Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-tr from-[#7800B8]/40 to-[#D900A8]/20 border border-[#FF1493]/35 flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FF1493]/20 border border-[#FF1493]/60 flex items-center justify-center text-3xl shrink-0 shadow-glow-pink">
              🏆
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF69B4]">
                Your Financial Persona
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">{personality}</h3>
              <p className="text-xs text-[#A5A5B8] mt-1">{badge_desc}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#050509]/60 border border-white/10 text-xs font-semibold text-white">
                <span>Savings Rate:</span>
                <span className="text-emerald-400 font-bold">{savings_rate}%</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Matrix */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#050509]/50 border border-white/5">
              <span className="text-[11px] text-gray-400">Daily Average Spend</span>
              <p className="text-lg font-bold text-white mt-1">{formatINR(average_daily_spend)}</p>
              <span className="text-[10px] text-[#A5A5B8]">Per day in {month_name}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#050509]/50 border border-white/5">
              <span className="text-[11px] text-gray-400">Ledger Count</span>
              <p className="text-lg font-bold text-white mt-1">{num_transactions} Txns</p>
              <span className="text-[10px] text-[#A5A5B8]">Verified & categorized</span>
            </div>
            <div className="p-4 rounded-xl bg-[#050509]/50 border border-white/5">
              <span className="text-[11px] text-gray-400">Top Spending Sector</span>
              <p className="text-lg font-bold text-[#FF1493] mt-1 truncate">{highest_category}</p>
              <span className="text-[10px] text-[#A5A5B8]">{formatINR(highest_category_amount)}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#050509]/50 border border-white/5">
              <span className="text-[11px] text-gray-400">Lowest Spending Sector</span>
              <p className="text-lg font-bold text-emerald-400 mt-1 truncate">{lowest_category}</p>
              <span className="text-[10px] text-[#A5A5B8]">{formatINR(lowest_category_amount)}</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: CATEGORY BREAKDOWN VISUALIZATION */}
        <div className="p-6 rounded-2xl bg-[#050509]/60 border border-white/10 mb-8">
          <h4 className="text-base font-bold text-white mb-1">Sector Outflow Breakdown</h4>
          <p className="text-xs text-[#A5A5B8] mb-4">Complete category distribution for {month_name}</p>

          <div className="space-y-3">
            {(category_breakdown || []).map((cat, i) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    {cat.name}
                  </span>
                  <span className="text-gray-300 font-semibold">
                    {formatINR(cat.amount)} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: PIE_COLORS[i % PIE_COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: PERSONALIZED BEHAVIORAL INSIGHTS */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#7800B8]/20 to-[#FF1493]/15 border border-[#FF1493]/30 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-[#FF1493]" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Personalized Financial Intelligence
            </h4>
          </div>

          <div className="space-y-2.5">
            {(insights || []).map((ins, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-gray-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF1493] mt-1.5 shrink-0" />
                <p className="leading-relaxed">{ins}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: PREVIOUS MONTH COMPARISON */}
        {comparison_with_prev_month && (
          <div className="p-6 rounded-2xl bg-[#080B24]/90 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#FF69B4] font-bold">
                MONTH-OVER-MONTH VELOCITY
              </span>
              <h5 className="text-base font-bold text-white mt-0.5">
                Comparison with {comparison_with_prev_month.prev_month_name}
              </h5>
              <p className="text-xs text-[#A5A5B8] mt-1">
                Expenses changed by{' '}
                <span className={comparison_with_prev_month.expense_diff > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {comparison_with_prev_month.expense_diff > 0 ? `+${formatINR(comparison_with_prev_month.expense_diff)}` : formatINR(comparison_with_prev_month.expense_diff)}
                </span>
                {' '}and net savings shifted by{' '}
                <span className={comparison_with_prev_month.savings_diff >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {comparison_with_prev_month.savings_diff >= 0 ? `+${formatINR(comparison_with_prev_month.savings_diff)}` : formatINR(comparison_with_prev_month.savings_diff)}
                </span>.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 rounded-xl bg-[#050509] border border-white/10">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">{comparison_with_prev_month.prev_month_name} Spent</p>
                <p className="text-sm font-bold text-gray-300 mt-0.5">{formatINR(comparison_with_prev_month.prev_expenses)}</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-[#050509] border border-[#FF1493]/30">
                <p className="text-[10px] text-[#FF69B4] uppercase font-semibold">{month_name} Spent</p>
                <p className="text-sm font-bold text-white mt-0.5">{formatINR(total_expenses)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

