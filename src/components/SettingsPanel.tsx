import React, { useState } from 'react';
import { Settings, Bell, Shield, Cloud, Smartphone, Moon, Sun, Globe } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-[#070b16] p-4 md:p-6 lg:p-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="relative rounded-2xl md:rounded-[32px] overflow-hidden bg-gradient-to-br from-slate-900 to-[#0f1628] p-6 md:p-10 shadow-2xl border border-[#1e2d48]">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                <Settings className="h-3.5 w-3.5" />
                SYSTEM PREFERENCES
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
                Settings & Configuration
              </h1>
              <p className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed font-medium">
                Customize your StormTrace AI experience. Adjust display units, notification preferences, and application appearance.
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <Settings className="w-64 h-64 md:w-96 md:h-96 text-white animate-[spin_60s_linear_infinite]" />
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-[#0f1628] rounded-2xl border border-slate-200 dark:border-[#1e2d48] shadow-sm overflow-hidden">
          
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-slate-200 dark:border-[#1e2d48] custom-scrollbar">
            {['general', 'notifications', 'appearance', 'security'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-bold capitalize whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8 space-y-8">
            
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" /> General Preferences
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Temperature Unit</label>
                    <select className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d48] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                      <option>Celsius (°C)</option>
                      <option>Fahrenheit (°F)</option>
                      <option>Kelvin (K)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Rainfall Unit</label>
                    <select className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d48] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                      <option>Millimeters (mm)</option>
                      <option>Inches (in)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Default Region</label>
                    <select className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d48] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                      <option>Pan-India Overview</option>
                      <option>Mumbai Coast</option>
                      <option>Uttar Pradesh (Ganges)</option>
                      <option>Kerala / Western Ghats</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Time Format</label>
                    <select className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d48] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                      <option>12-hour (AM/PM)</option>
                      <option>24-hour</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-500" /> Alert & Notification Settings
                </h3>
                
                <div className="space-y-4">
                  {[
                    { title: "Critical Weather Alerts", desc: "Receive immediate push notifications for extreme weather events (Red/Orange alerts).", default: true },
                    { title: "Daily Forecast Summary", desc: "Get a morning briefing on expected conditions in your region.", default: false },
                    { title: "System Health & API Status", desc: "Notify when background models complete or if API endpoints fail.", default: true },
                    { title: "Farmer Advisories", desc: "Receive automated crop risk recommendations.", default: false }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start justify-between p-4 rounded-xl border border-slate-100 dark:border-[#1e2d48] hover:bg-slate-50 dark:hover:bg-[#111827] transition-colors">
                      <div className="space-y-1 pr-4">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                        <input type="checkbox" className="sr-only peer" defaultChecked={item.default} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sun className="h-5 w-5 text-amber-500" /> Appearance & Theme
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border-2 border-blue-500 bg-slate-900 text-white cursor-pointer relative overflow-hidden flex flex-col items-center gap-3">
                    <Moon className="h-8 w-8 text-blue-400" />
                    <span className="font-bold text-sm">Dark Theme (Active)</span>
                    <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-blue-500"></div>
                  </div>
                  <div className="p-4 rounded-xl border-2 border-slate-200 dark:border-[#1e2d48] bg-slate-50 text-slate-900 cursor-pointer flex flex-col items-center gap-3 hover:border-slate-300 dark:hover:border-slate-600">
                    <Sun className="h-8 w-8 text-amber-500" />
                    <span className="font-bold text-sm dark:text-slate-300">Light Theme</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Map Style</label>
                  <select className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#1e2d48] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                    <option>Dark Topographic (Default)</option>
                    <option>Satellite Hybrid</option>
                    <option>Street View</option>
                    <option>Monochrome</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-500" /> Security & Session
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1e2d48] bg-slate-50 dark:bg-[#111827] flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Current Session</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Logged in via Windows PC • IP: 192.168.1.100</p>
                    </div>
                    <button className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg text-xs font-bold transition-colors">
                      Sign Out
                    </button>
                  </div>
                  
                  <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-red-600 dark:text-red-400">Clear Application Data</h4>
                      <p className="text-xs text-red-500/80 dark:text-red-400/70 mt-1">Remove all cached models, local alerts, and preferences.</p>
                    </div>
                    <button className="px-4 py-2 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/80 text-red-700 dark:text-red-300 rounded-lg text-xs font-bold transition-colors">
                      Clear Cache
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button Placeholder */}
            <div className="pt-8 flex justify-end">
              <button className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all">
                Save Changes
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
