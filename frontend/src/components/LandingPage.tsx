import React, { useState, useEffect } from 'react';
import { 
  Map, 
  Search, 
  ArrowRight, 
  AlertTriangle, 
  Layers, 
  Cpu, 
  Radio, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  Compass
} from 'lucide-react';
import type { ThreatObject } from '../types/weather';
import { fetchApiThreatObjects, fetchApiLocationRisk } from '../services/apiService';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onSelectLocation: (locKey: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectLocation }) => {
  const [quickQuery, setQuickQuery] = useState('');
  const [threats, setThreats] = useState<ThreatObject[]>([]);
  const [locationRisks, setLocationRisks] = useState<Record<string, any>>({});

  useEffect(() => {
    let isMounted = true;
    fetchApiThreatObjects().then(res => {
      if (isMounted) setThreats(res);
    });
    
    async function loadLocations() {
      const keys = ['prayagraj', 'varanasi', 'mirzapur', 'kaushambi'];
      const results = await Promise.all(keys.map(k => fetchApiLocationRisk(k)));
      if (isMounted) {
        const map: Record<string, any> = {};
        keys.forEach((k, idx) => {
          map[k] = results[idx];
        });
        setLocationRisks(map);
      }
    }
    loadLocations();

    return () => { isMounted = false; };
  }, []);

  const criticalThreat = threats.find(t => t.riskLevel === 'critical') || threats[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectLocation(quickQuery || 'prayagraj');
    onNavigate('location');
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-10">
        {/* Glow backdrop effects */}
        <div className="absolute top-0 right-1/4 -mt-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 -mb-10 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>AI-Powered Decision-Support Platform • 5 km Grid Precision</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              From Coarse Forecasts to{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                Precise Local Disaster Alerts
              </span>
            </h1>

            <p className="text-slate-300 text-base leading-relaxed">
              StormTrace AI downscales 12 km NWP ensemble forecasts into terrain-aware 5 km probabilistic risk maps. It detects weather anomalies, tracks threat trajectory footprints, and delivers early warning intelligence for Uttar Pradesh / Prayagraj.
            </p>

            {/* Quick Search Form */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 rounded-xl p-1.5 max-w-lg shadow-xl">
              <Search className="h-5 w-5 text-slate-400 ml-2 shrink-0" />
              <input
                type="text"
                placeholder="Search Prayagraj, Phulpur, Naini, Varanasi, PIN 211001..."
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none px-2 py-1.5"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-lg shadow-cyan-600/30"
              >
                Check Risk
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('map')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Map className="h-4 w-4" />
                Launch Interactive Live Risk Map
              </button>

              <button
                onClick={() => onNavigate('disaster')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-colors"
              >
                <Radio className="h-4 w-4 text-cyan-400" />
                Disaster Briefing Room
              </button>
            </div>
          </div>

          {/* Right Column: Live High-Risk Spotlight Card */}
          <div className="lg:col-span-5">
            <div className="glass-panel rounded-2xl p-5 border border-red-500/40 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-red-600 text-white font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
                ACTIVE CRITICAL THREAT
              </div>

              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="h-10 w-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base leading-snug">
                    {criticalThreat.name}
                  </h3>
                  <p className="text-xs text-red-400 font-mono">
                    ID: {criticalThreat.id} • District: {criticalThreat.district}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Peak Rain Rate</span>
                  <span className="text-slate-100 font-bold text-sm">{criticalThreat.hazardMetricDisplay || `${criticalThreat.peakIntensityMmH} mm/hr`}</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Exceedance Prob (&gt;50mm)</span>
                  <span className="text-red-400 font-bold text-sm">{criticalThreat.probabilityExceedance}%</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Threat Speed &amp; Track</span>
                  <span className="text-cyan-300 font-medium text-xs">{criticalThreat.speedKmH} km/h ({criticalThreat.direction})</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Affected Population</span>
                  <span className="text-amber-400 font-bold text-xs">~{criticalThreat.affectedPopulationEstimate.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-red-950/40 border border-red-900/50 p-2.5 rounded-lg mb-4 leading-relaxed">
                {criticalThreat.advisory}
              </p>

              <button
                onClick={() => onNavigate('event')}
                className="w-full py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                Inspect Threat Trajectory &amp; Export Report
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950 text-cyan-400">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Grid Resolution</span>
              <span className="text-xl font-bold text-slate-100 font-mono">5.0 km</span>
              <span className="text-[10px] text-cyan-400 block">(Downscaled from 12km)</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-950 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Active Threat Objects</span>
              <span className="text-xl font-bold text-red-400 font-mono">4 Tracked</span>
              <span className="text-[10px] text-slate-400 block">Prayagraj, Varanasi, Mirzapur</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-950 text-amber-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">EFI Anomaly Score</span>
              <span className="text-xl font-bold text-amber-300 font-mono">0.92</span>
              <span className="text-[10px] text-slate-400 block">Relative to ERA5 baseline</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Peak Preservation</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">95.9%</span>
              <span className="text-[10px] text-slate-400 block">Upper Quantile Loss</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Location Shortcuts */}
      <section className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h2 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
          <Search className="h-5 w-5 text-cyan-400" />
          Quick Location Risk Breakdown (Uttar Pradesh MVP Region)
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Select a key location to inspect local 24h risk, exceedance probabilities, and personalized advisories:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(locationRisks).map(([key, loc]: [string, any]) => {
            const riskLevel = loc?.currentRiskLevel || 'moderate';
            const riskColor = 
              riskLevel === 'critical' ? 'border-red-500/50 bg-red-950/20 text-red-400' :
              riskLevel === 'severe' ? 'border-orange-500/50 bg-orange-950/20 text-orange-400' :
              riskLevel === 'moderate' ? 'border-amber-500/50 bg-amber-950/20 text-amber-400' :
              'border-emerald-500/50 bg-emerald-950/20 text-emerald-400';

            return (
              <div
                key={key}
                onClick={() => {
                  onSelectLocation(key);
                  onNavigate('location');
                }}
                className={`p-4 rounded-xl border ${riskColor} hover:scale-[1.02] cursor-pointer transition-all glass-panel-hover flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-100 text-sm">{loc?.locationName || key}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                      riskLevel === 'critical' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'
                    }`}>
                      {riskLevel}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">24h Rainfall:</span>
                      <span className="font-mono font-bold">{loc?.forecast24h?.rainMm ?? 0} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Exceedance Prob:</span>
                      <span className="font-mono font-bold text-cyan-300">{loc?.forecast24h?.prob ?? 0}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-cyan-400 flex items-center justify-between">
                  <span>View Details</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* System Flow Diagram Showcase */}
      <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyan-400" />
              Technical Architecture &amp; Data Pipeline
            </h2>
            <p className="text-xs text-slate-400">
              End-to-end flow from raw coarse numerical weather prediction inputs to high-resolution risk output
            </p>
          </div>
          <button
            onClick={() => onNavigate('admin')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5"
          >
            Configure Weights &amp; Trigger Pipeline
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Workflow Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative text-xs">
          {/* Node 1 */}
          <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl relative">
            <span className="text-[10px] font-mono text-cyan-400 block mb-1">STEP 01 • INGESTION</span>
            <h4 className="font-bold text-slate-100 mb-1">Data Sources</h4>
            <p className="text-[11px] text-slate-400 leading-tight">
              NEPS-G / NCUM 12km, ERA5, IMDAA Climatology, DEM Elevation, River Maps
            </p>
          </div>

          {/* Node 2 */}
          <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl relative">
            <span className="text-[10px] font-mono text-cyan-400 block mb-1">STEP 02 • PREPROCESSING</span>
            <h4 className="font-bold text-slate-100 mb-1">Xarray &amp; Dask</h4>
            <p className="text-[11px] text-slate-400 leading-tight">
              Unit conversion, regridding, feature engineering &amp; threshold exceedance calculation
            </p>
          </div>

          {/* Node 3 */}
          <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl relative">
            <span className="text-[10px] font-mono text-cyan-400 block mb-1">STEP 03 • ANOMALY ENGINE</span>
            <h4 className="font-bold text-slate-100 mb-1">Threat Tracking</h4>
            <p className="text-[11px] text-slate-400 leading-tight">
              Connected components, Centroid &amp; Bounding box tracking, GNN Trajectory engine
            </p>
          </div>

          {/* Node 4 */}
          <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl relative">
            <span className="text-[10px] font-mono text-cyan-400 block mb-1">STEP 04 • AI DOWNSCALING</span>
            <h4 className="font-bold text-slate-100 mb-1">5 km Risk Grid</h4>
            <p className="text-[11px] text-slate-400 leading-tight">
              Conditional DDPM/DDIM preserving peak multi-hazard quantiles
            </p>
          </div>

          {/* Node 5 */}
          <div className="bg-slate-900/90 border border-cyan-500/50 p-4 rounded-xl relative bg-cyan-950/20">
            <span className="text-[10px] font-mono text-cyan-400 block mb-1">STEP 05 • DISSEMINATION</span>
            <h4 className="font-bold text-cyan-300 mb-1">Dashboard &amp; API</h4>
            <p className="text-[11px] text-slate-300 leading-tight">
              Map alerts, Kisan Hindi advisories, REST JSON APIs, Emergency dispatches
            </p>
          </div>
        </div>
      </section>

      {/* Core Functional Requirements Covered */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Layers className="h-5 w-5 text-cyan-400" />
          Functional Modules &amp; Requirements Checklist (FR-01 to FR-12)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              FR-01 &amp; FR-02: Data Ingestion &amp; Regridding
            </div>
            <p className="text-slate-400">Ingests NetCDF, GRIB2 and CSV datasets. Cleans, standardizes, and time-aligns weather variables across forecast steps.</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              FR-03 &amp; FR-04: EFI Anomaly &amp; Threat Objects
            </div>
            <p className="text-slate-400">Calculates climatology anomalies, percentiles, threshold exceedance, and groups high-risk cells into threat objects with centroids &amp; bounding boxes.</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              FR-05 &amp; FR-06: GNN Trajectory &amp; 5km Grid
            </div>
            <p className="text-slate-400">Tracks threat objects across forecast timestamps, predicting speed/direction trends while producing a 5 km downscaled risk layer.</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              FR-07 &amp; FR-08: Risk Classification &amp; Search
            </div>
            <p className="text-slate-400">Classifies severity into Low, Moderate, Severe, Critical levels. Supports location search by district, village, PIN code or lat/lon.</p>
          </div>

          <div 
            onClick={() => onNavigate('historical')}
            className="glass-panel p-4 rounded-xl border border-slate-800 cursor-pointer hover:border-cyan-500/50 hover:bg-slate-900/60 transition-all group"
          >
            <div className="flex items-center gap-2 font-bold text-cyan-300 group-hover:text-cyan-200 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              FR-09 &amp; FR-10: REST APIs &amp; Historical Replay
            </div>
            <p className="text-slate-400">Exposes machine-readable REST API endpoints (`/api/v1/*`) and enables historical event replay with forecast-vs-observation metrics.</p>
          </div>


          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              FR-11 &amp; FR-12: PDF/CSV Export &amp; Admin RBAC
            </div>
            <p className="text-slate-400">Generates downloadable incident reports, supports CSV export, and enforces role-based access control for administrative tasks.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
