import React from 'react';
import { Menu, Plus, ShieldCheck, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onOpenSidebar, onOpenAddTransaction, activeTabName }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#080B24]/70 backdrop-blur-xl border-b border-[#D900A8]/15 px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile trigger & Page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-[#A5A5B8] hover:text-white hover:bg-white/5"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-lg lg:text-xl font-bold text-white capitalize flex items-center gap-2">
            {activeTabName}
          </h2>
        </div>
      </div>

      {/* Right: Bank badge, Quick Add button, User greeting */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Bank Connection Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101536] border border-[#7800B8]/40 text-xs text-[#FF69B4]">
          <ShieldCheck size={14} className="text-[#FF1493]" />
          <span>Account Aggregator Active</span>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onOpenAddTransaction}
          className="flex items-center gap-2 px-3.5 py-1.5 lg:px-4 lg:py-2 rounded-xl text-xs lg:text-sm font-semibold bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink hover:opacity-95 transition-all transform active:scale-95"
        >
          <Plus size={16} />
          <span>Add Expense</span>
        </button>

        {/* Greeting Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF1493] to-[#7800B8] flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {user?.first_name ? user.first_name[0] : 'P'}
          </div>
          <span className="hidden md:inline text-xs font-medium text-white">
            Hi, {user?.first_name}
          </span>
        </div>
      </div>
    </header>
  );
}

