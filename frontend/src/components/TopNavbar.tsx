import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Globe, 
  Bell, 
  Sun, 
  Moon, 
  Clock, 
  AlertTriangle,
  X,
  Menu,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  Wifi,
  WifiOff
} from 'lucide-react';

import type { AuthUser } from './AuthPage';

import { INDIA_REGION_PRESETS } from '../data/mockData';
import type { IndiaRegionId, AlertItem } from '../types/weather';
import { subscribeBackendStatus, checkBackendHealth, fetchApiAlerts } from '../services/apiService';

interface TopNavbarProps {
  selectedRegion: IndiaRegionId;
  setSelectedRegion: (region: IndiaRegionId) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onSearchSubmit: (query: string) => void;
  onMobileMenuToggle?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  selectedRegion,
  setSelectedRegion,
  theme,
  setTheme,
  onSearchSubmit,
  onMobileMenuToggle,
  onNavigateToTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const stored = localStorage.getItem('STORMTRACE_AUTH_USER');
      if (stored) {
        try {
          setAuthUser(JSON.parse(stored));
        } catch(e) {}
      } else {
        setAuthUser(null);
      }
    };
    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('STORMTRACE_AUTH_USER');
    window.dispatchEvent(new Event('auth-change'));
    setShowUserDropdown(false);
    if (onNavigateToTab) onNavigateToTab('dashboard');
  };

  useEffect(() => {
    checkBackendHealth();
    const unsub = subscribeBackendStatus((status) => setIsLive(status));
    
    fetchApiAlerts().then(res => {
      if (res.status === 'success') {
        setAlerts(res.alerts.slice(0, 5));
      }
    });

    return unsub;
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' IST');
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
      setMobileSearchOpen(false);
    }
  }, [searchQuery, onSearchSubmit]);

  return (
    <>
      <header className="h-14 bg-white/95 dark:bg-[#0a0f1e]/95 backdrop-blur-xl border-b border-slate-200 dark:border-[#141d32] px-2.5 sm:px-4 flex items-center justify-between gap-2 md:gap-4 sticky top-0 z-30 transition-colors">
        
        {/* Left: Hamburger + Cyclone pill */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#1e2d48] transition-colors shrink-0"
            aria-label="Open Mobile Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Quick Feature Pill (Desktop/Tablet only) */}
          <div className="hidden sm:flex items-center gap-1.5 py-1">
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('cyclone')}
              className="px-2.5 py-1.5 min-h-[36px] rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[11px] flex items-center gap-1 shadow-md hover:scale-105 transition shrink-0"
            >
              <span className="animate-spin text-xs" style={{ animationDuration: '4s' }}>🌀</span>
              <span>Cyclone</span>
            </button>
          </div>
        </div>

        {/* Search Input – Desktop: always visible, Mobile: hidden (shown in dropdown row below) */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm relative hidden md:block">
          <Search className={`h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${searchFocused ? 'text-blue-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search Prayagraj, Mumbai, PIN 211001..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d48] rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 dark:focus:ring-blue-500/10 transition-all"
          />
        </form>

        {/* Right Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Mobile: Search Icon Button */}
          <button
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="md:hidden p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d48] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e2d48] transition-all"
            aria-label="Toggle Search"
          >
            {mobileSearchOpen ? <X className="h-4 w-4 text-blue-500" /> : <Search className="h-4 w-4" />}
          </button>

          {/* Backend Status Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border text-[10px] sm:text-[11px] font-bold transition-colors ${
            isLive 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
          }`}>
            {isLive ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                <span>LIVE</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-500" />
                <span>CACHED</span>
              </>
            )}
          </div>

          {/* Live Clock – xl only */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d48] text-slate-600 dark:text-slate-300 text-[11px] font-mono">
            <Clock className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
            <span>{currentTime || 'Loading...'}</span>
          </div>

          {/* Region Selector */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d48] rounded-xl px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs text-slate-700 dark:text-slate-200">
            <Globe className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as IndiaRegionId)}
              className="bg-transparent text-[11px] sm:text-xs font-semibold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200 max-w-[60px] sm:max-w-none"
            >
              {INDIA_REGION_PRESETS.map(r => (
                <option key={r.id} value={r.id} className="bg-white dark:bg-[#111827]">{r.name}</option>
              ))}
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-1.5 sm:p-2 min-h-[36px] min-w-[36px] sm:min-h-[38px] sm:min-w-[38px] flex items-center justify-center rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d48] text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-[#1e2d48] transition-all"
            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* Bell Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowAlertModal(!showAlertModal)}
              className="p-1.5 sm:p-2 min-h-[36px] min-w-[36px] sm:min-h-[38px] sm:min-w-[38px] flex items-center justify-center rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d48] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e2d48] relative transition-all"
            >
              <Bell className="h-4 w-4" />
              {alerts.length > 0 && (
                <>
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                </>
              )}
            </button>

            {showAlertModal && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 bg-white dark:bg-[#0f1628] border border-slate-200 dark:border-[#1a2540] rounded-2xl shadow-2xl p-3.5 z-50 text-xs space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-[#1e2d48] pb-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Active Severe Alerts ({alerts.length})
                  </span>
                  <button onClick={() => setShowAlertModal(false)}>
                    <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                  </button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">No active alerts at this time.</div>
                  ) : (
                    alerts.map(alert => {
                      const isCritical = alert.riskLevel === 'critical';
                      const isSevere = alert.riskLevel === 'severe';
                      const bgClass = isCritical 
                        ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/30 hover:border-red-400 dark:hover:border-red-700 text-red-600 dark:text-red-400" 
                        : isSevere
                        ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/30 hover:border-orange-400 dark:hover:border-orange-700 text-orange-600 dark:text-orange-400"
                        : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/30 hover:border-amber-400 dark:hover:border-amber-700 text-amber-600 dark:text-amber-400";
                      
                      const timeStr = alert.issuedAt ? new Date(alert.issuedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now';
                      
                      return (
                        <div key={alert.id} className={`p-2.5 rounded-xl border space-y-1 cursor-pointer transition-colors ${bgClass}`} onClick={() => { setShowAlertModal(false); if (onNavigateToTab) onNavigateToTab('alerts'); }}>
                          <span className="font-bold block">{alert.title}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{alert.district} • {timeStr}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Login / Auth Page Button */}
          {authUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="px-2 sm:px-3 py-1.5 min-h-[36px] sm:min-h-[38px] rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d48] text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-all hover:bg-slate-100 dark:hover:bg-[#1e2d48]"
              >
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden shrink-0">
                  {authUser.avatar ? <img src={authUser.avatar} alt="Avatar" className="h-full w-full object-cover" /> : <User className="h-3.5 w-3.5" />}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{authUser.name}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0f1628] border border-slate-200 dark:border-[#1a2540] rounded-2xl shadow-xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-[#1a2540] mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{authUser.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{authUser.role}</p>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('auth')}
              className="px-2 sm:px-2.5 py-1.5 min-h-[36px] sm:min-h-[38px] rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
              title="Sign In or Register Account"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Search Dropdown Row */}
      {mobileSearchOpen && (
        <div className="md:hidden sticky top-14 z-20 bg-white/98 dark:bg-[#0a0f1e]/98 backdrop-blur-xl border-b border-slate-200 dark:border-[#141d32] px-3 py-2.5 shadow-lg">
          <form onSubmit={handleSearch} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className={`h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${searchFocused ? 'text-blue-500' : 'text-slate-400'}`} />
              <input
                type="text"
                autoFocus
                placeholder="Search city, district, PIN code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d48] rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm shrink-0 hover:from-blue-500 hover:to-cyan-500 transition-all shadow-md"
            >
              Go
            </button>
          </form>
          {/* Quick suggestions */}
          <div className="flex gap-2 mt-2 overflow-x-auto pb-0.5 no-scrollbar">
            {['Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Wayanad', 'Prayagraj'].map(city => (
              <button
                key={city}
                onClick={() => { onSearchSubmit(city); setMobileSearchOpen(false); setSearchQuery(''); }}
                className="shrink-0 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
