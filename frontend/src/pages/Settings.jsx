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
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <Card className="p-6">
        <span className="text-xs uppercase tracking-widest text-[#FF69B4] font-bold">
          System & Account Preferences
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Settings & Security
        </h1>
        <p className="text-xs text-[#A5A5B8] mt-1">
          Manage your credentials, notification thresholds, and Account Aggregator authorizations.
        </p>
      </Card>

      {/* Profile Details */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <User size={18} className="text-[#FF1493]" />
          <span>User Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#050509]/60 border border-white/10">
            <span className="text-[#A5A5B8]">First Name</span>
            <p className="text-sm font-semibold text-white mt-0.5">{user?.first_name || 'N/A'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#050509]/60 border border-white/10">
            <span className="text-[#A5A5B8]">Last Name</span>
            <p className="text-sm font-semibold text-white mt-0.5">{user?.last_name || 'N/A'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#050509]/60 border border-white/10">
            <span className="text-[#A5A5B8]">Registered Phone</span>
            <p className="text-sm font-semibold text-white mt-0.5">+91 {user?.phone || 'N/A'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#050509]/60 border border-white/10">
            <span className="text-[#A5A5B8]">Email Address</span>
            <p className="text-sm font-semibold text-white mt-0.5">{user?.email || 'N/A'}</p>
          </div>
        </div>
      </Card>

      {/* Currency & Locale */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CreditCard size={18} className="text-[#FF69B4]" />
          <span>Regional & Financial Configuration</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#050509]/60 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[#A5A5B8]">Currency Symbol</span>
              <p className="text-sm font-semibold text-white mt-0.5">Indian Rupee (₹ - INR)</p>
            </div>
            <Badge variant="primary" size="sm">Fixed</Badge>
          </div>

          <div className="p-3.5 rounded-xl bg-[#050509]/60 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[#A5A5B8]">Number System</span>
              <p className="text-sm font-semibold text-white mt-0.5">Lakhs & Crores (en-IN)</p>
            </div>
            <Badge variant="primary" size="sm">Active</Badge>
          </div>
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Shield size={18} className="text-emerald-400" />
          <span>Security & Data Protections</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#050509]/60 border border-white/10 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Password Protection</p>
              <p className="text-[11px] text-[#A5A5B8] mt-0.5">PBKDF2-HMAC-SHA256 (100,000 iterations + Salt)</p>
            </div>
            <Badge variant="success" size="sm">Enforced</Badge>
          </div>

          <div className="p-3.5 rounded-xl bg-[#050509]/60 border border-white/10 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Two-Factor Authentication</p>
              <p className="text-[11px] text-[#A5A5B8] mt-0.5">6-Digit Cellular OTP Verification</p>
            </div>
            <Badge variant="success" size="sm">Active</Badge>
          </div>

          <div className="p-3.5 rounded-xl bg-[#050509]/60 border border-white/10 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Banking Data Policy</p>
              <p className="text-[11px] text-[#A5A5B8] mt-0.5">Zero storage of banking passwords, UPI PINs, or transaction credentials</p>
            </div>
            <Badge variant="success" size="sm">Guaranteed</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
