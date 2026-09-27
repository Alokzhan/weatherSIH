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
  Wifi,
  WifiOff
} from 'lucide-react';

import { INDIA_REGION_PRESETS } from '../data/mockData';
import type { IndiaRegionId } from '../types/weather';
import { subscribeBackendStatus, checkBackendHealth } from '../services/apiService';

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
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    checkBackendHealth();
    const unsub = subscribeBackendStatus((status) => setIsLive(status));
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
    }
  }, [searchQuery, onSearchSubmit]);

  return (
    <header className="h-14 bg-white/95 dark:bg-[#0a0f1e]/95 backdrop-blur-xl border-b border-slate-200 dark:border-[#141d32] px-2.5 sm:px-4 flex items-center justify-between gap-2 md:gap-4 sticky top-0 z-30 transition-colors">
      
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#1e2d48] transition-colors shrink-0"
          aria-label="Open Mobile Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Touch-Friendly Quick Feature Pills (Desktop/Tablet) */}
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

      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex-1 max-w-sm relative hidden md:block">
        <Search className={`h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${searchFocused ? 'text-blue-500' : 'text-slate-400'}`} />
        <input
          type="text"
          placeholder="Search Prayagraj, Mumbai, Wayanad, PIN 211001..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d48] rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 dark:focus:ring-blue-500/10 transition-all"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Backend Connection Status Badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border text-[10px] sm:text-[11px] font-bold transition-colors ${
          isLive 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
            : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
        }`}>
          {isLive ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <span>LIVE API</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-amber-500" />
              <span>CACHED</span>
            </>
          )}
        </div>

        {/* Live Clock */}
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
            className="bg-transparent text-[11px] sm:text-xs font-semibold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200 max-w-[70px] sm:max-w-none"
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
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
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
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {showAlertModal && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 bg-white dark:bg-[#0f1628] border border-slate-200 dark:border-[#1a2540] rounded-2xl shadow-2xl p-3.5 z-50 text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-[#1e2d48] pb-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Active Severe Alerts (4)
                </span>
                <button onClick={() => setShowAlertModal(false)}>
                  <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 space-y-1 cursor-pointer hover:border-red-400 dark:hover:border-red-700 transition-colors">
                  <span className="font-bold text-red-600 dark:text-red-400 block">Severe Thunderstorm Alert</span>
                  <span className="text-[10px] text-slate-500 block">Prayagraj / Phulpur • 29m ago</span>
                </div>
                <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/30 space-y-1 cursor-pointer hover:border-orange-400 dark:hover:border-orange-700 transition-colors">
                  <span className="font-bold text-orange-600 dark:text-orange-400 block">Heavy Rainfall Warning</span>
                  <span className="text-[10px] text-slate-500 block">Mumbai Suburban • 1h ago</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 space-y-1 cursor-pointer hover:border-amber-400 dark:hover:border-amber-700 transition-colors">
                  <span className="font-bold text-amber-600 dark:text-amber-400 block">Flash Flood Risk</span>
                  <span className="text-[10px] text-slate-500 block">Wayanad / Western Ghats • 2h ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Login / Auth Page Button */}
        <button
          onClick={() => onNavigateToTab && onNavigateToTab('auth')}
          className="px-2 sm:px-2.5 py-1.5 min-h-[36px] sm:min-h-[38px] rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
          title="Sign In or Register Account"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign In</span>
        </button>
      </div>

    </header>
  );
};
