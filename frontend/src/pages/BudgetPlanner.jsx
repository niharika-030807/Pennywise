import React, { useState, useEffect } from 'react';
import {
  PieChart,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Sliders,
  Save,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../api/client';
import { formatINR } from '../utils/formatters';

export default function BudgetPlanner() {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [monthlyLimitInput, setMonthlyLimitInput] = useState(50000);
  const [categoryInputs, setCategoryInputs] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const res = await api.getCurrentBudget();
      setBudgetData(res);
      setMonthlyLimitInput(res.monthly_limit);
      const catMap = {};
      res.category_progress.forEach(c => {
        catMap[c.category] = c.limit;
      });
      setCategoryInputs(catMap);
    } catch (err) {
      console.error('Failed to fetch budget', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, []);

  const handleSaveBudget = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.saveBudget({
        month: budgetData.month,
        year: budgetData.year,
        monthly_limit: Number(monthlyLimitInput),
        category_budgets: categoryInputs
      });
      setSaveSuccess(true);
      setEditMode(false);
      fetchBudget();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update budget.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !budgetData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#FF1493] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#FF69B4] font-semibold">
            Loading Budget Architecture...
          </p>
        </div>
      </div>
    );
  }

  const { monthly_limit, total_spent, remaining, progress_percentage, category_progress, alerts, recommendations } = budgetData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#FF69B4] font-bold">
            Disciplined Capital Allocation
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Monthly Budget Planner
          </h1>
          <p className="text-xs text-[#A5A5B8] mt-1">
            Establish category limits, avoid overdrafts, and receive real-time threshold alerts.
          </p>
        </div>

        <div>
          {editMode ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditMode(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#A5A5B8] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBudget}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink hover:opacity-95"
              >
                <Save size={15} />
                <span>{saving ? 'Saving...' : 'Apply Limits'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#101536] border border-[#FF1493]/40 text-[#FF69B4] hover:bg-[#FF1493]/10 transition-colors"
            >
              <Sliders size={15} />
              <span>Modify Budget Targets</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Budget limits updated successfully and synced with ledger!</span>
        </div>
      )}

      {/* OVERALL MONTHLY PROGRESS HERO CARD */}
      <div className="p-6 rounded-2xl glass-panel-elevated relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
              Current Month Total Spending Cap
            </span>
            {editMode ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold text-[#FF1493]">₹</span>
                <input
                  type="number"
                  value={monthlyLimitInput}
                  onChange={(e) => setMonthlyLimitInput(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#050509] border border-[#FF1493] text-xl font-bold text-white w-48 focus:outline-none"
                />
              </div>
            ) : (
              <h2 className="text-3xl font-black text-white mt-1">
                {formatINR(monthly_limit)}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-400">Total Spent</p>
              <p className="text-xl font-bold text-white mt-0.5">{formatINR(total_spent)}</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <p className="text-xs text-[#FF69B4]">Remaining Buffer</p>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">{formatINR(remaining)}</p>
            </div>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-300">Budget Consumption</span>
            <span className={progress_percentage >= 100 ? 'text-rose-400 font-bold' : 'text-[#FF69B4]'}>
              {progress_percentage}% Used
            </span>
          </div>
          <div className="w-full h-3.5 bg-[#050509] rounded-full overflow-hidden p-0.5 border border-white/15">
            <div
              className={`h-full rounded-full transition-all duration-700 ${progress_percentage >= 100
                ? 'bg-rose-500 shadow-glow-pink'
                : progress_percentage >= 80
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-[#7800B8] via-[#D900A8] to-[#FF1493]'
                }`}
              style={{ width: `${Math.min(100, progress_percentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ALERTS SECTION */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#FF69B4] flex items-center gap-1.5">
            <ShieldAlert size={14} />
            <span>Active Budget Warnings & Threshold Alerts</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((alertText, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5"
              >
                <AlertTriangle size={16} className="shrink-0 text-amber-400 mt-0.5" />
                <span className="leading-relaxed">{alertText}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORY-WISE BUDGETS */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Category-Wise Spending Limits</h3>
          <p className="text-xs text-[#A5A5B8]">Granular controls per consumption sector</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(category_progress || []).map((cat) => {
            const isExceeded = cat.status === 'exceeded';
            const isWarning = cat.status === 'warning';
            return (
              <div
                key={cat.category}
                className="p-4 rounded-xl bg-[#050509]/60 border border-white/10 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{cat.category}</span>
                  {editMode ? (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 text-xs">Limit: ₹</span>
                      <input
                        type="number"
                        value={categoryInputs[cat.category] || cat.limit}
                        onChange={(e) => setCategoryInputs({
                          ...categoryInputs,
                          [cat.category]: Number(e.target.value)
                        })}
                        className="w-24 px-2 py-0.5 rounded bg-[#080B24] border border-[#FF1493]/50 text-white text-xs font-bold"
                      />
                    </div>
                  ) : (
                    <span className="text-[#A5A5B8]">
                      Spent: <b className="text-white">{formatINR(cat.spent)}</b> / {formatINR(cat.limit)}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-[#FF1493]'
                      }`}
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className={isExceeded ? 'text-rose-400 font-bold' : isWarning ? 'text-amber-400' : 'text-gray-400'}>
                    {cat.percentage}% Utilized
                  </span>
                  <span className="text-emerald-400 font-medium">
                    {formatINR(cat.remaining)} remaining
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECOMMENDATIONS FOR NEXT MONTH */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#7800B8]/20 to-[#FF1493]/10 border border-[#FF1493]/30">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={18} className="text-[#FF1493]" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Recommendations for Next Month
          </h4>
        </div>
        <div className="space-y-2">
          {(recommendations || []).map((rec, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF1493] mt-1.5 shrink-0" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

