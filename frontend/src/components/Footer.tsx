import React from 'react';
import { ShieldAlert, Cpu, Globe } from 'lucide-react';

export const Footer: React.FC = React.memo(() => {
  return (
    <footer className="border-t border-slate-200 dark:border-[#141d32] bg-white dark:bg-[#060a14] text-slate-500 dark:text-slate-400 text-xs py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-sm">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">StormTrace AI</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
            From coarse weather forecasts to precise, probability-based local disaster alerts. Built for real-time disaster preparedness across India.
          </p>
          <div className="text-[11px] text-blue-600 dark:text-cyan-400 font-mono font-semibold">
            Pan-India Coverage • 5 km Grid Precision
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-blue-500 dark:text-cyan-400" />
            AI & Meteorology Pipeline
          </h4>
          <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
            <li>• NEPS-G & NCUM 12km Ensemble Inputs</li>
            <li>• ERA5 & IMDAA Climatology Engine</li>
            <li>• Conditional DDPM 5km Spatial Downscaling</li>
            <li>• GNN Threat Footprint Trajectory Tracker</li>
            <li>• EFI (Extreme Forecast Index) Anomaly Engine</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-blue-500 dark:text-cyan-400" />
            Pan-India Coverage Zones
          </h4>
          <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
            <li>• Delhi-NCR & Yamuna Basin</li>
            <li>• Uttar Pradesh / Ganges Basin</li>
            <li>• Mumbai & Konkan Coast</li>
            <li>• Wayanad / Western Ghats</li>
            <li>• Assam & Brahmaputra Basin</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Operational Notice</h4>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
            StormTrace AI is a decision-support system designed to complement official IMD / NCMRWF weather products. It does not replace official statutory warnings.
          </p>
          <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="font-mono text-[11px]">System Status: Operational (5 km Grid)</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 border-t border-slate-200 dark:border-[#141d32] pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <div>
          © 2026 StormTrace AI • Pan-India Disaster Management Intelligence
        </div>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors">Architecture Spec</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors">API OpenAPI Schema</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors">Data Privacy Policy</span>
        </div>
      </div>
    </footer>
  );
});
