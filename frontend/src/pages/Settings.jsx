import React from 'react';
import { 
  User, 
  Shield, 
  Smartphone, 
  Bell, 
  Database, 
  CreditCard,
  Lock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel">
        <span className="text-xs uppercase tracking-widest text-[#FF69B4] font-bold">
          System & Account Preferences
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Settings & Security
        </h1>
        <p className="text-xs text-[#A5A5B8] mt-1">
          Manage your credentials, notification thresholds, and Account Aggregator authorizations.
        </p>
      </div>

      {/* Profile Details */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <User size={18} className="text-[#FF1493]" />
          <span>User Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#050509]/60 border border-white/10">
            <span className="text-gray-400">First Name</span>
            <p className="text-sm font-semibold text-white mt-0.5">{user?.first_name}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#050509]/60 border border-white/10">
            <span className="text-gray-400">Last Name</span>
            <p className="text-sm font-semibold text-white mt-0.5">{user?.last_name}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#050509]/60 border border-white/10">
            <span className="text-gray-400">Registered Phone</span>
            <p className="text-sm font-semibold text-white mt-0.5">+91 {user?.phone}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#050509]/60 border border-white/10">
            <span className="text-gray-400">Email Address</span>
            <p className="text-sm font-semibold text-white mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Currency & Locale */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CreditCard size={18} className="text-[#FF1493]" />
          <span>Fintech Locale & Currency</span>
        </h3>

        <div className="p-4 rounded-xl bg-[#050509]/60 border border-white/10 flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-white">Default Currency</p>
            <p className="text-gray-400 text-[11px]">All financial metrics, budgets, and wrap summaries are expressed in this format.</p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white font-bold text-xs shadow-glow-pink">
            Indian Rupee (INR ₹)
          </span>
        </div>
      </div>

      {/* SMS & Authentication Gateway */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Smartphone size={18} className="text-[#FF1493]" />
          <span>OTP Authentication Gateway</span>
        </h3>

        <div className="p-4 rounded-xl bg-[#050509]/60 border border-white/10 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">Development SMS Simulation Mode</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
              Active & Operational
            </span>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            When Twilio credentials (<code className="text-[#FF69B4]">TWILIO_ACCOUNT_SID</code>) are present in environment variables, real SMS messages are dispatched via telecom carrier. In local testing, instant 6-digit OTP codes are returned with clear test banners for frictionless end-to-end evaluation.
          </p>
        </div>
      </div>

      {/* About Pennywise */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#080B24] to-[#35004F] border border-[#FF1493]/30 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-white text-sm tracking-wider">PENNYWISE v1.0.0</span>
          <span className="text-[#FF69B4] font-semibold text-[11px]">Make Every Rupee Count.</span>
        </div>
        <p className="text-gray-300 text-[11px] leading-relaxed">
          Crafted with React, Tailwind CSS, FastAPI, and SQLite. Features full real-time ledger accounting, Account Aggregator framework simulation, dynamic monthly financial wrap, and intelligent conversational assistant grounded in actual user records.
        </p>
      </div>
    </div>
  );
}

