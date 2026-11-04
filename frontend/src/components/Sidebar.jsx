import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Bot, 
  Building2, 
  Settings, 
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budgets', label: 'Budget Planner', icon: PieChart },
  { id: 'wrap', label: 'Monthly Wrap', icon: Sparkles, badge: 'NEW' },
  { id: 'insights', label: 'Financial Insights', icon: TrendingUp },
  { id: 'goals', label: 'Savings Goals', icon: Target },
  { id: 'assistant', label: 'Financial Assistant', icon: Bot, highlight: true },
  { id: 'banks', label: 'Bank Accounts', icon: Building2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ currentTab, setCurrentTab, isOpen, setIsOpen }) {
  const { logout, user } = useAuth();

  const handleSelect = (id) => {
    setCurrentTab(id);
    if (setIsOpen) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#080B24]/90 backdrop-blur-2xl border-r border-[#D900A8]/20 flex flex-col
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#D900A8]/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7800B8] to-[#FF1493] flex items-center justify-center font-bold text-white text-xl shadow-glow-pink">
              ₹
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-[#FF69B4] to-[#FF1493] bg-clip-text text-transparent">
                PENNYWISE
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-[#A5A5B8] font-medium">
                Make Every Rupee Count.
              </p>
            </div>
          </div>

          <button 
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`
                  w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#7800B8]/40 to-[#D900A8]/20 text-white border border-[#FF1493]/50 shadow-glow-pink' 
                    : 'text-[#A5A5B8] hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon 
                  size={19} 
                  className={`transition-colors ${isActive ? 'text-[#FF1493]' : 'text-[#A5A5B8] group-hover:text-white'}`} 
                />
                <span className="flex-1 text-left">{item.label}</span>

                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#D900A8] to-[#FF1493] text-white">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#FF1493] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Footer Profile & Logout */}
        <div className="p-4 border-t border-[#D900A8]/15 bg-[#050509]/40">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#35004F] to-[#7800B8] border border-[#FF69B4]/40 flex items-center justify-center text-sm font-semibold text-white">
              {user?.first_name ? user.first_name[0] : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-[#A5A5B8] truncate">
                {user?.phone}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

