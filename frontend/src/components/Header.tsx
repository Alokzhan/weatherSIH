import React from 'react';
import { 
  ShieldAlert, 
  Map, 
  Search, 
  AlertTriangle, 
  History, 
  Sprout, 
  Activity, 
  Settings, 
  Code2, 
  Radio, 
  UserCheck,
  Cpu,
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import type { UserRole, IndiaRegionId } from '../types/weather';
import { INDIA_REGION_PRESETS } from '../data/mockData';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  selectedRegion: IndiaRegionId;
  setSelectedRegion: (region: IndiaRegionId) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  lang: 'en' | 'hi' | 'hinglish';
  setLang: (lang: 'en' | 'hi' | 'hinglish') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  selectedRegion,
  setSelectedRegion,
  theme,
  setTheme,
  lang,
  setLang,
}) => {
  const tabs = [
    { id: 'landing', label: 'Pan-India Overview', icon: ShieldAlert },
    { id: 'map', label: 'Live GIS Risk Map', icon: Map, badge: '5 km Grid' },
    { id: 'models', label: 'AI & ML Models', icon: Cpu, badge: 'PI-UNet' },
    { id: 'location', label: 'Location Risk', icon: Search },
    { id: 'event', label: 'Event Detail', icon: Activity },
    { id: 'alerts', label: 'Alert Center', icon: AlertTriangle, badge: '4 Active' },
    { id: 'historical', label: 'Historical Replay', icon: History },
    { id: 'farmer', label: 'Farmer Portal', icon: Sprout },
    { id: 'disaster', label: 'Operations Briefing', icon: Radio },
    { id: 'admin', label: 'Admin Control', icon: Settings },
    { id: 'api', label: 'REST APIs', icon: Code2 },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      {/* Ticker Banner */}
      <div className="bg-red-600 text-white dark:bg-red-950/80 dark:text-red-300 border-b border-red-700/50 dark:border-red-900/50 px-4 py-1.5 text-xs flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-2 font-medium shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <span className="font-black tracking-wider uppercase text-[11px]">PAN-INDIA EMERGENCY RADAR NODE:</span>
        </div>

        <div className="overflow-hidden relative w-full mx-4">
          <div className="whitespace-nowrap inline-block animate-marquee text-white dark:text-slate-200">
            🚨 <strong>WAYANAD (KERALA) EXTREME OROGRAPHIC RED ALERT:</strong> 99% Exceedance Prob for &gt;200mm/24h Rain | 🚨 <strong>MUMBAI SUBURBAN RED ALERT:</strong> Mithi River High Tide Inundation | ⚡ <strong>PRAYAGRAJ CONFLUENCE:</strong> 94% Prob Exceedance | 🏔️ <strong>CHAMOLI HIMALAYAN SURGE:</strong> 125mm/h Peak Intensity
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-[11px] opacity-90">
          <span className="hidden sm:inline">Coverage: All India (3.28M km²)</span>
          <span className="px-2 py-0.5 rounded bg-black/20 font-mono font-bold">
            DDPM + GNN Active
          </span>
        </div>
      </div>

      {/* Main Nav Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform text-white">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wider text-slate-900 dark:text-white">
                StormTrace
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-600/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-mono font-bold">
                Pan-India v2.0
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                REAL DATA MODE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pan-India Extreme Weather Tracking &amp; Forecasting System
            </p>
          </div>
        </div>

        {/* Right Tools: Region, Theme, Role & Language */}
        <div className="flex items-center gap-2.5">
          {/* Theme Switcher Button */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="h-4 w-4 text-slate-700" /> : <Sun className="h-4 w-4 text-amber-400" />}
          </button>

          {/* Pan-India Region Dropdown */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200">
            <Globe className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as IndiaRegionId)}
              className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200"
            >
              {INDIA_REGION_PRESETS.map(r => (
                <option key={r.id} value={r.id} className="bg-white dark:bg-slate-900">{r.name}</option>
              ))}
            </select>
          </div>

          {/* Language Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                lang === 'en' ? 'bg-cyan-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                lang === 'hi' ? 'bg-cyan-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLang('hinglish')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                lang === 'hinglish' ? 'bg-cyan-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Hinglish
            </button>
          </div>

          {/* User Role Switcher */}
          <div className="relative flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-300">
            <UserCheck className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-1 text-slate-800 dark:text-slate-200"
            >
              <option value="public" className="bg-white dark:bg-slate-900">Public User</option>
              <option value="farmer" className="bg-white dark:bg-slate-900">Farmer (Kisan)</option>
              <option value="disaster_officer" className="bg-white dark:bg-slate-900">Disaster Officer</option>
              <option value="meteorologist" className="bg-white dark:bg-slate-900">Meteorologist / Analyst</option>
              <option value="administrator" className="bg-white dark:bg-slate-900">Administrator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Subnav */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-white/20 text-white' :
                    tab.badge.includes('UNet') ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' :
                    tab.badge.includes('Grid') ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
