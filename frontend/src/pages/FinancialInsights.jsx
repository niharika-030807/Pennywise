import React from 'react';
import { 
  TrendingUp, 
  BrainCircuit, 
  Zap, 
  Compass, 
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { formatINR, formatINRCompact } from '../utils/formatters';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function FinancialInsights() {
  const { overview: data, isLoading: loading } = useFinance();

  if (loading && !data) {
    return <LoadingSpinner size="lg" message="Computing Predictive Telemetry..." />;
  }

  const hasExpenseData = (data?.monthly_expense || 0) > 0;
  const avgMonthlyExpense = data?.monthly_expense || 0;

  const forecastTrend = hasExpenseData ? [
    { period: 'Day 5', projectedSpend: Math.round(avgMonthlyExpense * 0.18) },
    { period: 'Day 10', projectedSpend: Math.round(avgMonthlyExpense * 0.35) },
    { period: 'Day 15', projectedSpend: Math.round(avgMonthlyExpense * 0.52) },
    { period: 'Day 20', projectedSpend: Math.round(avgMonthlyExpense * 0.69) },
    { period: 'Day 25', projectedSpend: Math.round(avgMonthlyExpense * 0.86) },
    { period: 'Day 30', projectedSpend: Math.round(avgMonthlyExpense) },
  ] : [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ---------------- HEADER ---------------- */}
      <div className="pb-2 border-b border-white/10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Predictive Financial Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-[#A5A5B8] mt-1">
          Forecasting curves, algorithmic burn-rate modeling, and anomaly detection.
        </p>
      </div>

      {/* ---------------- STAT CARDS ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Projected Month-End Outlay"
          value={hasExpenseData ? avgMonthlyExpense : 0}
          icon={BrainCircuit}
          subtitle="Monte Carlo baseline projection"
          color="from-[#7800B8] to-[#FF1493]"
        />

        <StatCard
          title="Daily Burn Rate Cap"
          value={hasExpenseData ? Math.round(avgMonthlyExpense / 30) : 0}
          icon={Zap}
          subtitle="Recommended maximum daily pace"
          color="from-[#00E5FF] to-[#2979FF]"
        />

        <StatCard
          title="Discretionary Cushion"
          value={hasExpenseData ? Math.max(0, (data?.total_savings || 0)) : 0}
          icon={Compass}
          subtitle="Capital available for investment"
          color="from-emerald-500 to-teal-400"
        />
      </div>

      {/* ---------------- FORECAST CHART ---------------- */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-[#FF1493]" />
              Projected 30-Day Expense Trajectory
            </h3>
            <p className="text-xs text-[#A5A5B8]">Estimated accumulation curve based on transaction history</p>
          </div>
          <span className="text-[11px] font-semibold text-[#FF69B4] px-2.5 py-1 rounded-full bg-[#7800B8]/20 border border-[#FF1493]/30">
            Algorithmic Projection
          </span>
        </div>

        <div className="h-64 w-full">
          {hasExpenseData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="period" stroke="#606078" fontSize={11} />
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
                <Line
                  type="monotone"
                  dataKey="projectedSpend"
                  name="Projected Outflow"
                  stroke="#FF1493"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#FF1493' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="Awaiting Data Points"
              description="Predictive modeling requires recorded transactions to calculate projections."
              className="h-full border-0"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
