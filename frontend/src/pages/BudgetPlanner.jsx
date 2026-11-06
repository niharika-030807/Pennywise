import React from 'react';
import {
  PieChart,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Save,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';
import { formatINR } from '../utils/formatters';
import { TRANSACTION_CATEGORIES } from '../utils/constants';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function BudgetPlanner() {
  const {
    budgetData,
    loading,
    saving,
    editMode,
    setEditMode,
    monthlyLimitInput,
    setMonthlyLimitInput,
    categoryInputs,
    saveSuccess,
    error,
    handleSaveBudget,
    handleCategoryChange,
    refetch
  } = useBudgets();

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading budget calculations..." />;
  }

  const {
    has_budget = false,
    monthly_limit = 0,
    total_spent = 0,
    remaining = 0,
    progress_percentage = 0,
    category_progress = [],
    alerts = [],
    recommendations = []
  } = budgetData || {};

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ---------------- HEADER & MODE SWITCHER ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Monthly Budget Planner
          </h1>
          <p className="text-xs sm:text-sm text-[#A5A5B8] mt-1">
            Define monthly spending ceilings, track category utilization, and receive overspend warnings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {editMode ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditMode(false)} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveBudget} isLoading={saving} icon={Save}>
                Save Targets
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setEditMode(true)} icon={Sliders}>
              {has_budget ? 'Modify Budget Targets' : 'Set Up Budget'}
            </Button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Budget limits updated and synchronized successfully!</span>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {/* ---------------- BUDGET OVERVIEW METRICS ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card hover>
          <p className="text-xs font-semibold text-[#A5A5B8] uppercase">Total Budget Cap</p>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {formatINR(monthly_limit)}
          </h3>
          <p className="text-xs text-[#A5A5B8] mt-2">Maximum planned monthly outlay</p>
        </Card>

        <Card hover>
          <p className="text-xs font-semibold text-[#A5A5B8] uppercase">Total Outflow Spent</p>
          <h3 className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">
            {formatINR(total_spent)}
          </h3>
          <p className="text-xs text-[#A5A5B8] mt-2">{progress_percentage}% of total budget consumed</p>
        </Card>

        <Card hover>
          <p className="text-xs font-semibold text-[#A5A5B8] uppercase">Remaining Cushion</p>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            {formatINR(remaining)}
          </h3>
          <p className="text-xs text-[#A5A5B8] mt-2">Available for remaining days</p>
        </Card>
      </div>

      {/* ---------------- ALERTS & RECOMMENDATIONS ---------------- */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs sm:text-sm text-rose-300"
            >
              <ShieldAlert size={18} className="text-rose-400 shrink-0" />
              <span>{alert}</span>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- EDIT TARGETS FORM (IF EDIT MODE) ---------------- */}
      {editMode && (
        <Card className="border-[#FF1493]/40 shadow-glow-pink">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Sliders size={18} className="text-[#FF1493]" />
            Set Category Budget Limits
          </h3>

          <div className="space-y-4">
            <div className="max-w-xs">
              <Input
                label="Overall Monthly Cap (₹)"
                type="number"
                value={monthlyLimitInput}
                onChange={(e) => setMonthlyLimitInput(e.target.value)}
                placeholder="50000"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {TRANSACTION_CATEGORIES.map((cat) => (
                <Input
                  key={cat.id}
                  label={`${cat.label} (₹)`}
                  type="number"
                  value={categoryInputs[cat.id] ?? 0}
                  onChange={(e) => handleCategoryChange(cat.id, e.target.value)}
                  placeholder="0"
                />
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button variant="ghost" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveBudget} isLoading={saving} icon={Save}>
                Save Targets
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ---------------- CATEGORY PROGRESS BARS ---------------- */}
      <Card>
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <PieChart size={18} className="text-[#FF69B4]" />
          Category Spending vs Budget Limits
        </h3>

        {category_progress.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {category_progress.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#050509]/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{item.category}</span>
                  <span className="text-[#A5A5B8]">
                    <span className="text-white font-mono">{formatINR(item.spent)}</span> / {formatINR(item.limit)}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-[#101536] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      item.percentage >= 100
                        ? 'bg-rose-500 shadow-glow-pink'
                        : item.percentage >= 80
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-[#7800B8] to-[#FF1493]'
                    }`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span
                    className={
                      item.percentage >= 100
                        ? 'text-rose-400 font-bold'
                        : item.percentage >= 80
                        ? 'text-amber-400 font-medium'
                        : 'text-emerald-400'
                    }
                  >
                    {item.percentage}% used
                  </span>
                  <span className="text-[#A5A5B8]">
                    {item.remaining > 0 ? `${formatINR(item.remaining)} left` : 'Exceeded'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Category Limits Set"
            description="Configure category budgets to see real-time progress bars and alerts."
            actionLabel="Configure Budget"
            onAction={() => setEditMode(true)}
            className="py-12 border-0"
          />
        )}
      </Card>
    </div>
  );
}
