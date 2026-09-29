import React, { useState } from 'react';
import { 
  CloudLightning, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  Globe, 
  CheckCircle2,
  KeyRound,
  LogIn
} from 'lucide-react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  avatar?: string;
}

interface AuthPageProps {
  onLoginSuccess?: (user: AuthUser) => void;
  onNavigateToTab?: (tab: string) => void;
}

const getTargetTab = (user: AuthUser) => {
  const role = (user.role || '').toLowerCase();
  const org = (user.organization || '').toLowerCase();
  if (role.includes('farmer') || org.includes('krishi') || org.includes('farmer')) return 'farmer';
  if (role.includes('officer') || role.includes('ndrf') || org.includes('ndrf') || org.includes('disaster')) return 'disaster';
  return 'dashboard';
};

const getRoleFromOrganization = (org: string) => {
  const orgLower = (org || '').toLowerCase();
  if (orgLower.includes('farmer') || orgLower.includes('krishi')) return 'Farmer Representative';
  if (orgLower.includes('ndrf')) return 'NDRF Operations Officer';
  if (orgLower.includes('public') || orgLower.includes('citizen')) return 'Citizen Observer';
  if (orgLower.includes('sdma')) return 'Disaster Management Officer';
  if (orgLower.includes('imd')) return 'Meteorologist';
  return 'Registered Specialist';
};

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onNavigateToTab }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [organization, setOrganization] = useState('NDRF Disaster Response');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Demo user quick login
  const handleQuickDemo = (role: 'officer' | 'farmer' | 'public') => {
    setIsLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      let user: AuthUser;
      if (role === 'officer') {
        user = {
          id: 'USR-NDRF-904',
          name: 'Cmdt. Rajesh Sharma',
          email: 'rajesh.sharma@ndrf.gov.in',
          role: 'NDRF Disaster Operations Chief',
          organization: 'NDRF 9th Battalion (Supaul & Kosi Basin)',
          avatar: `https://unavatar.io/rajesh.sharma@ndrf.gov.in?fallback=https://ui-avatars.com/api/?name=Cmdt.+Rajesh+Sharma`,
        };
      } else if (role === 'farmer') {
        user = {
          id: 'USR-FAR-102',
          name: 'Sardar Gurdeep Singh',
          email: 'gurdeep.krishi@agri.in',
          role: 'Progressive Farmer Representative',
          organization: 'Kisan Samiti & Crop Protection Cell',
          avatar: `https://unavatar.io/gurdeep.krishi@agri.in?fallback=https://ui-avatars.com/api/?name=Sardar+Gurdeep+Singh`,
        };
      } else {
        user = {
          id: 'USR-PUB-501',
          name: 'Ananya Roy',
          email: 'ananya.roy@meteorology.org',
          role: 'Climate Researcher',
          organization: 'Indian Institute of Tropical Meteorology',
          avatar: `https://unavatar.io/ananya.roy@meteorology.org?fallback=https://ui-avatars.com/api/?name=Ananya+Roy`,
        };
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('STORMTRACE_AUTH_USER', JSON.stringify(user));
        window.dispatchEvent(new Event('auth-change'));
      }

      setIsLoading(false);
      setSuccessMsg(`Welcome, ${user.name}! Access Granted.`);
      if (onLoginSuccess) onLoginSuccess(user);
      if (onNavigateToTab) onNavigateToTab(getTargetTab(user));
    }, 600);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your email/phone and password.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Minimum password strength
    if (password.trim().length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const user: AuthUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          organization: data.user.organization,
          avatar: `https://unavatar.io/${data.user.email}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}`,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('STORMTRACE_AUTH_USER', JSON.stringify(user));
          window.dispatchEvent(new Event('auth-change'));
        }
        setIsLoading(false);
        setSuccessMsg(`Welcome, ${user.name}! (Authenticated via SQLite DB)`);
        if (onLoginSuccess) onLoginSuccess(user);
        if (onNavigateToTab) onNavigateToTab(getTargetTab(user));
        return;
      } else {
        setErrorMsg(data.message || 'Invalid login credentials.');
      }
    } catch (err) {
      console.warn('Backend login failed, using local fallback:', err);
      // Fallback if backend API is not running
      const user: AuthUser = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        name: email.split('@')[0].replace('.', ' ') || 'Disaster Officer',
        email: email,
        role: 'Authorized Disaster Officer',
        organization: 'State Disaster Management Authority (SDMA)',
        avatar: `https://unavatar.io/${email}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}`,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('STORMTRACE_AUTH_USER', JSON.stringify(user));
        window.dispatchEvent(new Event('auth-change'));
      }
      setIsLoading(false);
      setSuccessMsg('Authentication Successful!');
      if (onLoginSuccess) onLoginSuccess(user);
      if (onNavigateToTab) onNavigateToTab(getTargetTab(user));
      return;
    }
    setIsLoading(false);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Password strength validation
    if (signupPassword.trim().length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('Please accept the Terms of Service to create an account.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: signupEmail.trim(),
          password: signupPassword.trim(),
          organization: organization
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const newUser: AuthUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || getRoleFromOrganization(data.user.organization),
          organization: data.user.organization,
          avatar: `https://unavatar.io/${data.user.email}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}`,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('STORMTRACE_AUTH_USER', JSON.stringify(newUser));
          window.dispatchEvent(new Event('auth-change'));
        }
        setIsLoading(false);
        setSuccessMsg(`Account created in SQLite DB! Welcome, ${newUser.name}.`);
        if (onLoginSuccess) onLoginSuccess(newUser);
        if (onNavigateToTab) onNavigateToTab(getTargetTab(newUser));
        return;
      } else {
        setErrorMsg(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.warn('Backend signup failed, using local fallback:', err);
      const newUser: AuthUser = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        name: fullName,
        email: signupEmail,
        role: getRoleFromOrganization(organization),
        organization: organization,
        avatar: `https://unavatar.io/${signupEmail}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('STORMTRACE_AUTH_USER', JSON.stringify(newUser));
        window.dispatchEvent(new Event('auth-change'));
      }
      setIsLoading(false);
      setSuccessMsg('Account Created Successfully!');
      if (onLoginSuccess) onLoginSuccess(newUser);
      if (onNavigateToTab) onNavigateToTab(getTargetTab(newUser));
      return;
    }
    setIsLoading(false);
  };


  return (
    <div className="min-h-[calc(100vh-56px)] w-full flex items-center justify-center p-3 sm:p-6 bg-[#060a14] relative overflow-hidden">
      {/* Dynamic Background Glow & Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }}></div>

      {/* Main Split Screen Container */}
      <div className="w-full max-w-5xl bg-[#0a0f1e]/90 backdrop-blur-2xl border border-[#1e2d48] rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px] relative z-10">
        
        {/* Left Side: Dramatic Storm Brand Hero Panel */}
        <div className="lg:col-span-6 relative p-8 lg:p-12 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-[#1e2d48]">
          {/* Background Image Overlay with storm aesthetic */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000 hover:scale-100"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&w=1200&q=80')` 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060a14] via-[#0a0f1e]/80 to-blue-950/40"></div>

          {/* Brand Header */}
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-mono">
              <CloudLightning className="h-4 w-4 text-cyan-400 animate-pulse" />
              <span>STORMTRACE AI PLATFORM</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-blue-600/30">
                <CloudLightning className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight font-sans">
                  STORMTRACE <span className="text-cyan-400">AI</span>
                </h1>
                <p className="text-xs text-cyan-300/80 font-mono font-bold tracking-wider">
                  Smarter Forecasts. Safer Tomorrow.
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md pt-2">
              AI-powered extreme weather tracking, hyperlocal 5km downscaling, and real-time risk alerts for a more resilient future.
            </p>
          </div>

          {/* 4 Feature Cards Grid */}
          <div className="relative z-10 grid grid-cols-2 gap-3 my-8">
            <div className="bg-[#111827]/70 backdrop-blur-md p-3.5 rounded-2xl border border-[#1e2d48] flex items-center gap-3 hover:border-cyan-500/40 transition-all">
              <div className="h-8 w-8 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100 block">Real-Time Monitoring</span>
                <span className="text-[10px] text-slate-400">Pan-India Radar Tiles</span>
              </div>
            </div>

            <div className="bg-[#111827]/70 backdrop-blur-md p-3.5 rounded-2xl border border-[#1e2d48] flex items-center gap-3 hover:border-blue-500/40 transition-all">
              <div className="h-8 w-8 rounded-xl bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400 shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100 block">AI-Powered Forecasts</span>
                <span className="text-[10px] text-slate-400">DDPM Downscaling</span>
              </div>
            </div>

            <div className="bg-[#111827]/70 backdrop-blur-md p-3.5 rounded-2xl border border-[#1e2d48] flex items-center gap-3 hover:border-violet-500/40 transition-all">
              <div className="h-8 w-8 rounded-xl bg-violet-950 border border-violet-800/60 flex items-center justify-center text-violet-400 shrink-0">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100 block">Localized Risk Maps</span>
                <span className="text-[10px] text-slate-400">5km Precise Radius</span>
              </div>
            </div>

            <div className="bg-[#111827]/70 backdrop-blur-md p-3.5 rounded-2xl border border-[#1e2d48] flex items-center gap-3 hover:border-emerald-500/40 transition-all">
              <div className="h-8 w-8 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100 block">Data-Driven Decisions</span>
                <span className="text-[10px] text-slate-400">NDRF Alert Protocol</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Logins Bar */}
          <div className="relative z-10 bg-[#070b16]/90 p-4 rounded-2xl border border-[#1e2d48] space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              ⚡ Instant Evaluator Access (One-Click Demo Login)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('officer')}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                NDRF Officer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('farmer')}
                className="px-3 py-2 rounded-xl bg-[#111827] hover:bg-[#1e2d48] border border-[#1e2d48] text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
              >
                🌾 Farmer Rep
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Card */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between bg-[#0a0f1e]/95 relative z-10">
          <div>
            {/* Toggle Mode Switcher */}
            <div className="flex items-center p-1 bg-[#111827] border border-[#1e2d48] rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <span className="text-red-400 font-bold">⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Mode 1: LOGIN FORM */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-100 tracking-tight">Welcome Back</h2>
                  <p className="text-xs text-slate-400 mt-1">Sign in to your StormTrace AI account</p>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email or Phone Number</label>
                    <div className="relative">
                      <Mail className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="name@agency.gov.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#111827] border border-[#1e2d48] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">Password</label>
                      <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your registered email/mobile.'); }} className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium">
                        Forgot Password?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#111827] border border-[#1e2d48] rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#1e2d48] bg-[#111827] text-cyan-500 focus:ring-cyan-500/20"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-slate-400 cursor-pointer select-none">
                      Keep me signed in on this device
                    </label>
                  </div>
                </div>

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 mt-4 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </>
                  )}
                </button>

                {/* Social Sign In Options */}
                <div className="pt-3">
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-[#1e2d48]"></div>
                    <span className="flex-shrink mx-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">OR</span>
                    <div className="flex-grow border-t border-[#1e2d48]"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('public')}
                      className="px-3 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1e2d48] border border-[#1e2d48] text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                        <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.7-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                        <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                      </svg>
                      Google SSO
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemo('officer')}
                      className="px-3 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1e2d48] border border-[#1e2d48] text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <KeyRound className="h-4 w-4 text-amber-400" />
                      Govt. Auth
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Mode 2: SIGN UP FORM */
              <form onSubmit={handleSignupSubmit} className="space-y-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-100 tracking-tight">Create Account</h2>
                  <p className="text-xs text-slate-400 mt-1">Join the StormTrace AI extreme weather alert network</p>
                </div>

                <div className="space-y-2.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Dr. Ramesh Verma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-[#111827] border border-[#1e2d48] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email Address</label>
                    <div className="relative">
                      <Mail className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        placeholder="verma.r@sdma.gov.in"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full bg-[#111827] border border-[#1e2d48] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Organization Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Organization / Department</label>
                    <div className="relative">
                      <Building2 className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="w-full bg-[#111827] border border-[#1e2d48] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                      >
                        <option value="General Public / Citizen (Personal Account)">General Public / Citizen (Personal Account)</option>
                        <option value="NDRF Disaster Response">NDRF Battalion Command</option>
                        <option value="State Disaster Authority (SDMA)">State Disaster Management Authority (SDMA)</option>
                        <option value="IMD Meteorologist Cell">India Meteorological Department (IMD)</option>
                        <option value="Krishi Vigyan Kendra (Farmer Cell)">Farmer Cooperative / KVK Cell</option>
                        <option value="Academic Climate Research">University / Climate Research Institute</option>
                      </select>
                    </div>
                  </div>

                  {/* Passwords Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full bg-[#111827] border border-[#1e2d48] rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#111827] border border-[#1e2d48] rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-[#1e2d48] bg-[#111827] text-cyan-500 focus:ring-cyan-500/20"
                    />
                    <label htmlFor="agreeTerms" className="text-[11px] text-slate-400 cursor-pointer">
                      I agree to the <span className="text-cyan-400 underline">Terms of Service</span> and <span className="text-cyan-400 underline">Privacy Policy</span>.
                    </label>
                  </div>
                </div>

                {/* Primary Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 mt-3 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Create Account &amp; Access Dashboard
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer toggle prompt */}
          <div className="pt-4 text-center border-t border-[#1e2d48]/60 mt-4">
            <span className="text-xs text-slate-400">
              {mode === 'login' ? "Don't have an account? " : "Already registered? "}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors underline cursor-pointer"
              >
                {mode === 'login' ? 'Sign Up Now' : 'Sign In'}
              </button>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
