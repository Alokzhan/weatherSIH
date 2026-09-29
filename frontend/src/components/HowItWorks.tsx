import React from 'react';
import { 
  BookOpen, 
  Cpu, 
  ShieldAlert, 
  Sparkles, 
  Map, 
  Info, 
  Eye, 
  Compass, 
  Smartphone
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 bg-gradient-to-r from-slate-900 via-[#0f172a] to-[#1e1b4b] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">How It Works & User Guide</h2>
            <p className="text-xs text-slate-300">Complete documentation on system architecture, risk level indicators, GIS map controls, and mobile navigation.</p>
          </div>
        </div>
      </div>

      {/* ── 0. AASAN BHASHA MEIN SAMJHEIN & HOW TO USE GUIDE ── */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-[#090f1f]/90 space-y-5 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sparkles className="h-5 w-5 text-cyan-400 animate-pulse" />
          <h3 className="text-lg font-black text-white">💡 Aasan Bhasha Mein Samjhein Guide (How to Use)</h3>
        </div>

        {/* Risk Color Legend Cards */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">🔴 Khatra Levels (Risk Color Codes):</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 space-y-1 shadow-md">
              <strong className="block text-red-400 font-bold text-sm">🔴 Red (Critical Khatra):</strong>
              <p className="text-[11px] text-red-300">Atyadhik Bhaari Baarish (&gt;150mm). Flood & Landslide threat. Surakshit jagah par rahein!</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-950/50 border border-orange-800/60 text-orange-200 space-y-1 shadow-md">
              <strong className="block text-orange-400 font-bold text-sm">🟠 Orange (Severe Savdhan):</strong>
              <p className="text-[11px] text-orange-300">Bhaari Baarish (100-150mm). Zaroori kaam hone par hi bahar niklein.</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-800/60 text-amber-200 space-y-1 shadow-md">
              <strong className="block text-amber-400 font-bold text-sm">🟡 Yellow (Moderate Alert):</strong>
              <p className="text-[11px] text-amber-300">Madhyam Baarish (50-100mm). Weather updates ke liye alert rahein.</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-200 space-y-1 shadow-md">
              <strong className="block text-emerald-400 font-bold text-sm">🟢 Green (Normal Weather):</strong>
              <p className="text-[11px] text-emerald-300">Normal mausam (&lt;50mm rain). No danger or disruption expected.</p>
            </div>
          </div>
        </div>

        {/* Feature Usage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Compass className="h-4 w-4 text-cyan-400" />
              <span>🌀 Cyclone Tracker (Windy Style)</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Multi-model forecast tracks (IMD, ECMWF, GFS, UKMET, StormTrace AI) se toofan ki exact direction, pressure hPa, wind knots aur estimated landfall ETA check karein. Timeline scrubber drag karke historical vs forecast hours dekhein.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Map className="h-4 w-4 text-cyan-400" />
              <span>🗺️ Live Weather GIS Map</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Real-time Doppler rain radar, EFI climatology anomalies, 5km sub-grid risk cells, district boundaries aur river basin flood zones overlay karein. 3D Globe mode switch karke elevation view dekhein.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Eye className="h-4 w-4 text-cyan-400" />
              <span>👁️ Independent Eye Buttons</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Left Eye button (`top-left`) se Left Layer Panel ko hide/show karein. Right Eye button (`top-right`) se 5km Sub-Grid Cell Inspection Panel ko independently toggle karein taaki full map cleanly visible rahe.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Smartphone className="h-4 w-4 text-cyan-400" />
              <span>📱 Mobile Phone 1-Tap Access</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Smartphone users top bar quick pills (`🌀 Cyclone`, `🗺️ Map`) ya mobile menu (`☰`) se 1-tap me kisi bhi screen par navigate kar sakte hain. Sub-grid cards mobile screen par auto-fit hote hain.
            </p>
          </div>

        </div>
      </div>

      {/* ── TECHNICAL ARCHITECTURE & MODULE SECTIONS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Cpu className="h-5 w-5 text-emerald-400" />
            1. Core AI Architecture
          </h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li>
              <strong className="text-cyan-300 block">Spherical Icosahedral GNN (Stage 1)</strong>
              Detects extreme weather anomalies (Cyclones, Heatwaves, Coldwaves) on a spherical mesh to avoid 2D distortions, creating 4D Anomaly Bounding Boxes (4D-ABBs).
            </li>
            <li>
              <strong className="text-cyan-300 block">Conditional DDPM Downscaling (Stage 2)</strong>
              Downscales 12 km coarse NWP forecasts to 5 km/1 km resolution while strictly preserving PSD (Power Spectral Density). This avoids the spectral smoothing common in old U-Net models.
            </li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            2. StormTrace Copilot & Gen AI Chatbot
          </h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li>
              <strong className="text-cyan-300 block">StormTrace Copilot AI Weather Chatbot</strong>
              Interactive floating assistant powered by Web Speech Voice Recognition, Text-to-Speech, and FastAPI backend (<span className="font-mono bg-slate-900 px-1 rounded text-cyan-300">/api/v1/chatbot/query</span>). Automatically parses location queries in English/Hinglish (e.g. <em>"shahajahanpur weather kab tak rain rahe gi"</em>, <em>"lucknow weather"</em>) and calculates exact rain duration & clearing times.
            </li>
            <li>
              <strong className="text-cyan-300 block">Gen AI Incident Briefing & Dispatch</strong>
              Generates multi-hazard incident briefings and coordinates NDRF/SDRF disaster response battalion dispatches for downstream tehsils.
            </li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Map className="h-5 w-5 text-amber-400" />
            3. 3D GIS Radar & Live Tracking
          </h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li>
              <strong className="text-cyan-300 block">Pan-India Coverage</strong>
              Supports real-time mapping of extreme rainfall, heat domes, cyclones, and wind extremes.
            </li>
            <li>
              <strong className="text-cyan-300 block">Interactive Globe</strong>
              Use the <span className="font-mono bg-slate-900 px-1 rounded">Weather Map</span> tab to view the DDPM-generated 5 km risk grid and extreme probability contours.
            </li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
            <ShieldAlert className="h-5 w-5 text-red-400" />
            4. Real-time Alerts & Bulletins
          </h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li>
              <strong className="text-cyan-300 block">Active Dispatch Center</strong>
              The <span className="font-mono bg-slate-900 px-1 rounded">Risk & Alerts</span> tab aggregates multi-hazard alerts generated by the system and provides one-click PDF/CSV exports for disaster authorities.
            </li>
          </ul>
        </div>
        
        <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4 md:col-span-2">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Info className="h-5 w-5 text-purple-400" />
            5. Map Legend & Symbol Glossary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-slate-300">
            <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse shrink-0 mt-0.5 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
              <div>
                <strong className="text-red-400 block text-xs">Critical Threat Centroid</strong>
                <span className="text-[11px]">Marks the center of a severe weather anomaly (e.g., Eye of Cyclone).</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <div className="w-8 h-4 border-t-2 border-dashed border-cyan-400 shrink-0 mt-1"></div>
              <div>
                <strong className="text-cyan-400 block text-xs">GNN Trajectory Track</strong>
                <span className="text-[11px]">Dashed line predicting the future path of the 4D anomaly.</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <div className="w-6 h-6 border-2 border-red-500 bg-red-500/20 rounded shrink-0"></div>
              <div>
                <strong className="text-red-300 block text-xs">4D Anomaly Bounding Box</strong>
                <span className="text-[11px]">The geographical area impacted by the extreme event.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <div className="w-4 h-4 rounded bg-amber-500 shrink-0 mt-0.5"></div>
              <div>
                <strong className="text-amber-400 block text-xs">Moderate / Severe Risk (Orange)</strong>
                <span className="text-[11px]">Indicates areas with a high probability of severe weather.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <div className="w-4 h-4 rounded-full bg-cyan-500/50 border border-cyan-400 shrink-0 mt-0.5"></div>
              <div>
                <strong className="text-cyan-300 block text-xs">5km Risk Grid Cell</strong>
                <span className="text-[11px]">Hover over these squares on the map to see local precipitation/temperature.</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <div className="w-5 h-5 bg-emerald-950 border border-emerald-800 rounded flex items-center justify-center shrink-0">
                <span className="text-[10px]">🤖</span>
              </div>
              <div>
                <strong className="text-emerald-400 block text-xs">Agentic / Gen AI Badges</strong>
                <span className="text-[11px]">Indicates modules powered by autonomous LLM workflows.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
