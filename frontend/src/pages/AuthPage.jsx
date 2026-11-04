import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Phone, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import NetworkBackground from '../components/NetworkBackground';

export default function AuthPage() {
  const { login } = useAuth();
  
  // Views: 'login' | 'signup_details' | 'signup_otp' | 'forgot_phone' | 'forgot_otp' | 'forgot_newpass'
  const [view, setView] = useState('login');
  
  // Login Form
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup Form
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAgreed: false
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupOtp, setSignupOtp] = useState('');

  // Forgot Password Form
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password strength calculator
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-gray-600' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = calculatePasswordStrength(signupForm.password);

  // ---------------- LOGIN HANDLER ----------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginPhone.trim() || !loginPassword) {
      setError('Please enter your phone number and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(loginPhone.trim(), loginPassword);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SIGNUP STEP 1: VALIDATE & SEND OTP ----------------
  const handleSignupStep1 = async (e) => {
    e.preventDefault();
    setError('');

    if (!signupForm.firstName.trim() || !signupForm.lastName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!signupForm.phone.trim() || signupForm.phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!signupForm.email.trim() || !signupForm.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!signupForm.termsAgreed) {
      setError('Please accept the Terms & Conditions to proceed.');
      return;
    }

    setLoading(true);
    try {
      await api.sendOtp(signupForm.phone.trim(), 'signup');
      setSignupOtp('');
      setView('signup_otp');
    } catch (err) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SIGNUP STEP 2: VERIFY OTP & REGISTER ----------------
  const handleSignupStep2 = async (e) => {
    e.preventDefault();
    if (!signupOtp.trim() || signupOtp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Step 5 & 6: Verify and create account
      await api.register({
        first_name: signupForm.firstName,
        last_name: signupForm.lastName,
        phone: signupForm.phone.trim(),
        email: signupForm.email.trim(),
        password: signupForm.password,
        confirm_password: signupForm.confirmPassword,
        otp_code: signupOtp.trim()
      });

      // Step 7: Redirect to login page
      setSuccessMessage('Account created successfully! Please log in.');
      setView('login');
      setLoginPhone(signupForm.phone.trim());
    } catch (err) {
      setError(err.message || 'OTP verification or registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FORGOT PASSWORD STEP 1: SEND OTP ----------------
  const handleForgotStep1 = async (e) => {
    e.preventDefault();
    if (!forgotPhone.trim() || forgotPhone.trim().length < 10) {
      setError('Please enter your 10-digit registered mobile number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.sendOtp(forgotPhone.trim(), 'forgot_password');
      setForgotOtp('');
      setView('forgot_otp');
    } catch (err) {
      setError(err.message || 'Could not find account or send code.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FORGOT PASSWORD STEP 2: VERIFY OTP ----------------
  const handleForgotStep2 = async (e) => {
    e.preventDefault();
    if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.verifyOtp(forgotPhone.trim(), forgotOtp.trim(), 'forgot_password');
      setView('forgot_newpass');
    } catch (err) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FORGOT PASSWORD STEP 3: NEW PASSWORD & REDIRECT ----------------
  const handleForgotStep3 = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.forgotPasswordReset({
        phone: forgotPhone.trim(),
        otp_code: forgotOtp.trim(),
        new_password: newPassword,
        confirm_password: confirmNewPassword
      });
      setSuccessMessage('Password updated successfully! Please log in with your new credentials.');
      setView('login');
      setLoginPhone(forgotPhone.trim());
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#050509]">
      {/* Network Nodes Canvas from Reference Video 1 */}
      <NetworkBackground nodeCount={70} interactive={true} />

      {/* Reference Image 2 Flowing Gradient Wave Accents */}
      <div className="absolute top-0 right-0 w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-[#FF1493]/20 via-[#D900A8]/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#7800B8]/25 via-[#35004F]/30 to-transparent blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Auth Box */}
      <div className="relative z-10 w-full max-w-md my-8">
        {/* Glow Header Border */}
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7800B8] via-[#FF1493] to-[#FF69B4]" />

          {/* Logo & Slogan */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7800B8] to-[#FF1493] text-white text-2xl font-black mb-3 shadow-glow-pink">
              ₹
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-wider bg-gradient-to-r from-white via-[#FF69B4] to-[#FF1493] bg-clip-text text-transparent">
              PENNYWISE
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#A5A5B8] font-semibold mt-1">
              Make Every Rupee Count.
            </p>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ----------------- 1. LOGIN VIEW ----------------- */}
          {view === 'login' && (
            <div>
              {/* Tab Toggle */}
              <div className="flex p-1 rounded-xl bg-[#050509]/80 border border-white/10 mb-6">
                <button
                  type="button"
                  className="flex-1 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink"
                >
                  LOGIN
                </button>
                <button
                  type="button"
                  onClick={() => { setView('signup_details'); setError(''); }}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg text-[#A5A5B8] hover:text-white transition-colors"
                >
                  SIGN UP
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#A5A5B8] mb-1">
                    Registered Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-gray-400 text-xs font-semibold">+91</span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-[#050509]/60 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493] text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-[#A5A5B8]">Password</label>
                    <button
                      type="button"
                      onClick={() => { setView('forgot_phone'); setError(''); setSuccessMessage(''); }}
                      className="text-xs font-medium text-[#FF69B4] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050509]/60 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493] text-sm pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white"
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className="text-center mt-5">
                <span className="text-xs text-[#A5A5B8]">Don't have an account? </span>
                <button
                  onClick={() => { setView('signup_details'); setError(''); }}
                  className="text-xs font-bold text-[#FF69B4] hover:underline"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}

          {/* ----------------- 2. SIGN UP: STEP 1 (DETAILS) ----------------- */}
          {view === 'signup_details' && (
            <div>
              {/* Tab Toggle */}
              <div className="flex p-1 rounded-xl bg-[#050509]/80 border border-white/10 mb-6">
                <button
                  type="button"
                  onClick={() => { setView('login'); setError(''); }}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg text-[#A5A5B8] hover:text-white transition-colors"
                >
                  LOGIN
                </button>
                <button
                  type="button"
                  className="flex-1 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink"
                >
                  SIGN UP
                </button>
              </div>

              <form onSubmit={handleSignupStep1} className="space-y-3.5">
                {/* First & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#A5A5B8] mb-1">First Name *</label>
                    <input
                      type="text"
                      placeholder="Aarav"
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#050509]/60 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493] text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#A5A5B8] mb-1">Last Name *</label>
                    <input
                      type="text"
                      placeholder="Sharma"
                      value={signupForm.lastName}
                      onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#050509]/60 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493] text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-[#A5A5B8] mb-1">Phone Number *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400 text-xs font-semibold">+91</span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      className="w-full pl-11 pr-3 py-2 rounded-xl bg-[#050509]/60 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493] text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-[#A5A5B8] mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="aarav@example.com"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#050509]/60 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493] text-xs"
                    required
                  />
                </div>

                {/* Create Password */}
                <div>
                  <label className="block text-xs font-medium text-[#A5A5B8] mb-1">Create Password *</label>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#050509]/60 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493] text-xs pr-9"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
                    >
                      {showSignupPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  {signupForm.password && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all`}
                          style={{ width: `${(strength.score / 3) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400">{strength.label}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-medium text-[#A5A5B8] mb-1">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#050509]/60 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493] text-xs pr-9"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={signupForm.termsAgreed}
                    onChange={(e) => setSignupForm({ ...signupForm, termsAgreed: e.target.checked })}
                    className="mt-0.5 rounded accent-[#FF1493]"
                    required
                  />
                  <label htmlFor="terms" className="text-[11px] text-[#A5A5B8] leading-tight">
                    I agree to the <span className="text-[#FF69B4] underline">Terms of Service</span> & <span className="text-[#FF69B4] underline">Privacy Policy</span>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {loading ? 'Sending Verification Code...' : 'Proceed to Mobile Verification'}
                  <ArrowRight size={15} />
                </button>
              </form>

              <div className="text-center mt-4">
                <span className="text-xs text-[#A5A5B8]">Already registered? </span>
                <button
                  onClick={() => { setView('login'); setError(''); }}
                  className="text-xs font-bold text-[#FF69B4] hover:underline"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* ----------------- 3. SIGN UP: STEP 2 (OTP VERIFICATION) ----------------- */}
          {view === 'signup_otp' && (
            <div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#7800B8]/30 border border-[#FF1493]/40 flex items-center justify-center text-[#FF1493] mb-3 shadow-glow-pink">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-lg font-bold text-white">Enter Verification Code</h3>
                <p className="text-xs text-[#A5A5B8] mt-1">
                  Enter the 6-digit verification code sent to <span className="text-white font-medium">+91 {signupForm.phone}</span>
                </p>
              </div>

              <form onSubmit={handleSignupStep2} className="space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={signupOtp}
                    onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3.5 rounded-xl bg-[#050509]/80 border border-[#FF1493]/50 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF1493]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || signupOtp.length < 6}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying...' : 'Verify OTP & Complete Sign Up'}
                  <CheckCircle2 size={16} />
                </button>
              </form>

              <div className="flex items-center justify-between mt-5 text-xs">
                <button
                  onClick={() => { setView('signup_details'); setError(''); }}
                  className="text-gray-400 hover:text-white"
                >
                  ← Edit details
                </button>
                <button
                  onClick={handleSignupStep1}
                  className="text-[#FF69B4] font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* ----------------- 4. FORGOT PASSWORD: STEP 1 (PHONE) ----------------- */}
          {view === 'forgot_phone' && (
            <div>
              <div className="text-center mb-5">
                <h3 className="text-base font-bold text-white">Reset Your Password</h3>
                <p className="text-xs text-[#A5A5B8] mt-1">
                  Enter your registered phone number to receive a recovery code.
                </p>
              </div>

              <form onSubmit={handleForgotStep1} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#A5A5B8] mb-1">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-400 text-xs font-semibold">+91</span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-[#050509]/60 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493] text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending Code...' : 'Send Recovery OTP'}
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className="text-center mt-5">
                <button
                  onClick={() => { setView('login'); setError(''); }}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  ← Back to Login
                </button>
              </div>
            </div>
          )}

          {/* ----------------- 5. FORGOT PASSWORD: STEP 2 (OTP) ----------------- */}
          {view === 'forgot_otp' && (
            <div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#7800B8]/30 border border-[#FF1493]/40 flex items-center justify-center text-[#FF1493] mb-3 shadow-glow-pink">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-lg font-bold text-white">Verify Recovery Code</h3>
                <p className="text-xs text-[#A5A5B8] mt-1">
                  Enter the 6-digit recovery code sent to <span className="text-white font-medium">+91 {forgotPhone}</span>
                </p>
              </div>

              <form onSubmit={handleForgotStep2} className="space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3.5 rounded-xl bg-[#050509]/80 border border-[#FF1493]/50 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF1493]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || forgotOtp.length < 6}
                  className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className="flex items-center justify-between mt-5 text-xs">
                <button
                  onClick={() => { setView('forgot_phone'); setError(''); }}
                  className="text-gray-400 hover:text-white"
                >
                  ← Change Number
                </button>
                <button
                  onClick={handleForgotStep1}
                  className="text-[#FF69B4] font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* ----------------- 6. FORGOT PASSWORD: STEP 3 (NEW PASSWORD) ----------------- */}
          {view === 'forgot_newpass' && (
            <div>
              <div className="text-center mb-5">
                <h3 className="text-base font-bold text-white">Create New Password</h3>
                <p className="text-xs text-[#A5A5B8] mt-1">
                  Set a secure new password for your account.
                </p>
              </div>

              <form onSubmit={handleForgotStep3} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#A5A5B8] mb-1">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050509]/60 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493] text-sm pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white"
                    >
                      {showForgotNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A5A5B8] mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050509]/60 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493] text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#7800B8] to-[#FF1493] text-white shadow-glow-pink hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Updating Password...' : 'Save New Password & Log In'}
                  <CheckCircle2 size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

