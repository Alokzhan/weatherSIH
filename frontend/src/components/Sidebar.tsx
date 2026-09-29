import React, { useState, useCallback, useMemo } from 'react';
import { 
  CloudLightning, 
  LayoutDashboard, 
  Map, 
  Target, 
  Cpu, 
  ShieldAlert, 
  History, 
  BarChart2, 
  Database, 
  FileText, 
  Settings, 
  ChevronRight,
  ChevronLeft,
  Sprout,
  Radio,
  BookOpen,
  LogIn,
  Compass,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (isOpen: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  section: 'core' | 'analysis' | 'tools' | 'admin';
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'core' },
  { id: 'cyclone', label: 'Cyclone Tracker', icon: Compass, badge: 'Windy 🌀', section: 'core' },
  { id: 'map', label: 'Weather Map', icon: Map, badge: 'Live', section: 'core' },
  { id: 'event', label: '4D Anomaly Tracking', icon: Target, section: 'core' },
  { id: 'location', label: 'Location Risk', icon: ShieldAlert, section: 'analysis' },
  { id: 'models', label: 'AI Analysis', icon: Cpu, badge: '5 km', section: 'analysis' },
  { id: 'alerts', label: 'Risk & Alerts', icon: ShieldAlert, badge: '4', section: 'analysis' },
  { id: 'historical', label: 'Historical Explorer', icon: History, section: 'tools' },
  { id: 'evaluation', label: 'Model Evaluation', icon: BarChart2, section: 'tools' },
  { id: 'farmer', label: 'Farmer Advisory', icon: Sprout, section: 'tools' },
  { id: 'disaster', label: 'Operations Room', icon: Radio, section: 'tools' },
  { id: 'how-it-works', label: 'How It Works Guide', icon: BookOpen, section: 'tools' },
  { id: 'auth', label: 'Login / Sign Up', icon: LogIn, badge: 'Auth', section: 'admin' },
  { id: 'admin', label: 'Data Center', icon: Database, section: 'admin' },
  { id: 'api', label: 'Weather APIs', icon: FileText, section: 'admin' },
  { id: 'settings', label: 'Settings', icon: Settings, section: 'admin' },
];


const SECTIONS = {
  core: 'Command Center',
  analysis: 'AI Analysis',
  tools: 'Tools & Reports',
  admin: 'Administration',
};

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleTabClick = useCallback((id: string) => {
    setActiveTab(id);
  }, [setActiveTab]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof MENU_ITEMS[number][]> = {};
    MENU_ITEMS.forEach(item => {
      if (!groups[item.section]) groups[item.section] = [];
      groups[item.section].push(item);
    });
    return groups;
  }, []);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${isCollapsed ? 'w-[68px]' : 'w-64'} 
          bg-[#060a14] text-slate-300 flex flex-col h-screen 
          fixed md:sticky top-0 left-0 z-50 md:z-40 border-r border-[#141d32] shrink-0 select-none 
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
      {/* Brand Header */}
      <div className="p-4 border-b border-[#141d32]/80 flex items-center gap-3 relative">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/25 shrink-0">
          <CloudLightning className="h-5 w-5" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h1 className="font-black text-sm tracking-wider text-white whitespace-nowrap">
              STORMTRACE AI
            </h1>
            <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
              Smarter Forecasts. Safer Tomorrow.
            </p>
          </div>
        )}

        {/* Collapse toggle (Desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#111827] border border-[#1e2d48] items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all z-50 shadow-md"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        {/* Close toggle (Mobile) */}
        <button
          onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
          className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#111827] border border-[#1e2d48] flex items-center justify-center text-slate-400 hover:text-white transition-all z-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto">
        {Object.entries(groupedItems).map(([section, items]) => (
          <div key={section}>
            {!isCollapsed && (
              <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600 px-3 mb-1.5 font-mono">
                {SECTIONS[section as keyof typeof SECTIONS]}
              </div>
            )}
            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-600/20 font-bold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#111827]/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge ? (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                        isActive ? 'bg-white/15 text-white' :
                        item.badge === 'Live' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' :
                        item.badge.includes('4') ? 'bg-red-950/60 text-red-400 border border-red-800/40' :
                        'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                      }`}>
                        {item.badge}
                      </span>
                    ) : (
                      !isCollapsed && isActive && <ChevronRight className="h-3.5 w-3.5 text-white/50" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer User Card */}
      <div className="p-2.5 border-t border-[#141d32]/80 bg-[#040710]">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} p-2 rounded-xl bg-[#0a0f1e] border border-[#141d32] text-xs`}>
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <ShieldAlert className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-[11px] text-slate-400 font-semibold truncate">Disaster Officer</span>
          )}
        </div>
      </div>
    </aside>
    </>
  );
};
