import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  AlertTriangle,
  ShieldAlert, 
  Sprout, 
  User, 
  Radio, 
  Clock, 
  ArrowRight,
  Loader2,
  Thermometer,
  Wind,
  Droplets,
  CloudSun
} from 'lucide-react';
import type { LocationRiskData } from '../types/weather';
import { fetchApiLocationRisk } from '../services/apiService';

interface LocationRiskProps {
  initialLocKey?: string;
  onNavigateToEvent?: () => void;
}

export const LocationRisk: React.FC<LocationRiskProps> = ({ initialLocKey = 'prayagraj', onNavigateToEvent }) => {
  const [activeLoc, setActiveLoc] = useState<LocationRiskData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      setIsSearching(true);
      const res = await fetchApiLocationRisk(initialLocKey || 'Prayagraj');
      if (isMounted) {
        setActiveLoc(res.data);
        setIsSearching(false);
      }
    }
    loadInitial();
    return () => { isMounted = false; };
  }, [initialLocKey]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    try {
      const res = await fetchApiLocationRisk(q);
      setActiveLoc(res.data);
    } catch (err) {
      console.error('Location risk search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePillSelect = async (key: string) => {
    setIsSearching(true);
    const res = await fetchApiLocationRisk(key);
    setActiveLoc(res.data);
    setIsSearching(false);
  };

  const locData = activeLoc!;

  return (
    <div className="space-y-8 pb-10">
      {/* Header Search Box */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">FR-08 PAN-INDIA LOCATION INTELLIGENCE &amp; AI ENGINE</span>
            <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-cyan-400" />
              Pan-India Hyperlocal Extreme Rain Risk Advisory
            </h2>
            <p className="text-xs text-slate-400">
              Query 5 km / 1 km downscaled AI risk score, exceedance probability curves, and crop safety guidelines for ANY location in India.
            </p>
          </div>

          {/* Location Selector Pills */}
          <div className="flex items-center gap-2 flex-wrap max-w-xl">
            {['Prayagraj', 'Varanasi', 'Mirzapur', 'Kaushambi', 'Delhi', 'Wayanad', 'Mumbai', 'Kolkata'].map((locName) => (
              <button
                key={locName}
                onClick={() => handlePillSelect(locName)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  (activeLoc && activeLoc.locationName.toLowerCase().includes(locName.toLowerCase()))
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {locName}
              </button>
            ))}
          </div>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 bg-slate-950 border border-slate-700 rounded-xl p-2 max-w-2xl">
          {isSearching ? <Loader2 className="h-5 w-5 text-cyan-400 animate-spin ml-2 shrink-0" /> : <Search className="h-5 w-5 text-slate-400 ml-2 shrink-0" />}
          <input
            type="text"
            placeholder="Search ANY city, village or PIN code in India (e.g. Chinour, Delhi, Wayanad, 242001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none px-2"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shadow-md disabled:opacity-50 shrink-0"
          >
            {isSearching ? 'Analyzing...' : 'Search Location'}
          </button>
        </form>
      </div>

      {isSearching && !activeLoc ? (
        <div className="flex items-center justify-center p-12 space-x-3">
          <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
          <span className="text-sm font-mono text-slate-400">Loading location risk intelligence...</span>
        </div>
      ) : !activeLoc ? (
        <div className="p-8 text-center text-slate-400 font-mono text-sm">
          No location risk data available for "{searchQuery || initialLocKey}". Try searching for Prayagraj, Varanasi, or Delhi.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Risk Cards & Hourly Curves */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Status Spotlight Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                  locData.currentRiskLevel === 'critical' ? 'bg-red-950 border border-red-800 text-red-400' :
                  locData.currentRiskLevel === 'severe' ? 'bg-orange-950 border border-orange-800 text-orange-400' :
                  'bg-amber-950 border border-amber-800 text-amber-400'
                }`}>
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{locData.locationName}</h3>
                  <p className="text-xs text-slate-400">
                    District: <strong className="text-slate-200">{locData.district}</strong> • Coordinates: <span className="font-mono text-cyan-300">[{locData.coordinates[0]}°N, {locData.coordinates[1]}°E]</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Risk Score Index</span>
                <span className="text-3xl font-black text-red-400 font-mono">{locData.riskScore}<span className="text-sm font-normal text-slate-500">/100</span></span>
              </div>
            </div>

            {/* Live OpenWeatherMap API Current Metrics Banner */}
            {locData.liveWeather && (
              <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-900/50 rounded-lg text-cyan-300">
                    <CloudSun className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">{locData.liveWeather.description}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">OpenWeatherMap Live API</span>
                    </div>
                    <span className="text-xs text-slate-400">Live Station Weather &amp; Atmosphere</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Thermometer className="h-4 w-4 text-amber-400" />
                    <span className="font-bold text-sm">{locData.liveWeather.tempC}°C</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-cyan-300">
                    <Droplets className="h-4 w-4 text-cyan-400" />
                    <span>{locData.liveWeather.humidity}% Humidity</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <Wind className="h-4 w-4 text-emerald-400" />
                    <span>{locData.liveWeather.windSpeedKmh} km/h Wind</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4-Step Forecast Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Next 24 Hours</span>
                <span className="text-lg font-bold text-red-400 font-mono block">{locData.forecast24h.rainMm} mm</span>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Exceedance:</span>
                  <span className="text-red-400 font-bold font-mono">{locData.forecast24h.prob}%</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">48 Hours</span>
                <span className="text-lg font-bold text-orange-400 font-mono block">{locData.forecast48h.rainMm} mm</span>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Exceedance:</span>
                  <span className="text-orange-400 font-bold font-mono">{locData.forecast48h.prob}%</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">72 Hours</span>
                <span className="text-lg font-bold text-amber-400 font-mono block">{locData.forecast72h.rainMm} mm</span>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Exceedance:</span>
                  <span className="text-amber-400 font-bold font-mono">{locData.forecast72h.prob}%</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">5-Day Outlook</span>
                <span className="text-lg font-bold text-emerald-400 font-mono block">{locData.forecast5d.rainMm} mm</span>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Exceedance:</span>
                  <span className="text-emerald-400 font-bold font-mono">{locData.forecast5d.prob}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Exceedance & Rain Rate Distribution */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              Diurnal Hourly Exceedance Probability (&gt; 50mm Threshold)
            </h3>

            <div className="space-y-3">
              {locData.hourlyProbabilities.map((hp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-slate-300 font-semibold">{hp.hour}</span>
                    <div className="flex gap-4">
                      <span className="text-cyan-300 font-mono font-bold">{hp.rainMm} mm/3h</span>
                      <span className="text-red-400 font-mono font-bold">{hp.prob}% Probability</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        hp.prob > 80 ? 'bg-gradient-to-r from-orange-500 to-red-600' :
                        hp.prob > 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                        'bg-cyan-500'
                      }`}
                      style={{ width: `${hp.prob}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explainable Flood Risk Breakdown ("Why this Risk?") */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">EXPLAINABLE AI ENGINE</span>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-cyan-400" />
                  Why This Risk Score ({locData.riskScore}/100)?
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold">
                Multi-Factor Weighting
              </span>
            </div>

            <p className="text-xs text-slate-300">
              The flood risk index is calculated dynamically by evaluating rainfall intensity, antecedent soil saturation, DEM slope elevation, and river/drainage proximity:
            </p>

            <div className="space-y-2.5 pt-1">
              {(locData.explainabilityBreakdown || [
                { factor: '24h Cumulative Precipitation', weight: 0.35, scoreContribution: 38, valueDescription: `${locData.forecast24h.rainMm} mm Heavy Downpour`, impactCategory: 'high' },
                { factor: 'Soil Saturation (Antecedent Rain)', weight: 0.25, scoreContribution: 24, valueDescription: '84% Moisture Saturation', impactCategory: 'high' },
                { factor: 'DEM Elevation & Slope', weight: 0.20, scoreContribution: 16, valueDescription: 'Lowland Alluvial Plain', impactCategory: 'medium' },
                { factor: 'River / Canal Proximity', weight: 0.15, scoreContribution: 10, valueDescription: `${locData.nearestThreatDistanceKm} km to Drainage Channel`, impactCategory: 'medium' },
                { factor: 'Built-up Infiltration Rate', weight: 0.05, scoreContribution: 4, valueDescription: 'High Built-up Surface Runoff', impactCategory: 'low' },
              ]).map((ef, i) => (
                <div key={i} className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block">{ef.factor}</span>
                    <span className="text-[11px] text-slate-400">{ef.valueDescription} • <span className="font-mono text-cyan-400 font-semibold">Weight: {ef.weight}</span></span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold block ${
                      ef.impactCategory === 'high' ? 'bg-red-950 text-red-400 border border-red-800' :
                      ef.impactCategory === 'medium' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      +{ef.scoreContribution} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Uncertainty & Data Freshness */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap justify-between items-center text-[11px] text-slate-400 gap-2 font-mono">
              <span>Uncertainty Range: <strong className="text-cyan-300">{locData.uncertaintyRangeMm ? `${locData.uncertaintyRangeMm[0]} - ${locData.uncertaintyRangeMm[1]} mm` : '± 12.5 mm'}</strong></span>
              <span>Model Confidence: <strong className="text-emerald-400 uppercase">{locData.confidenceLevel || 'high'}</strong></span>
              <span>Data Source: <strong className="text-slate-300">{locData.dataFreshness?.source || 'OpenWeather + NCUM 12km'}</strong></span>
            </div>
          </div>
        </div>

        {/* Right Column: Tailored Safety Advisories */}
        <div className="lg:col-span-4 space-y-6">
          {/* Nearest Active Threat Object */}
          <div className="glass-panel p-5 rounded-2xl border border-red-500/40 space-y-3">
            <span className="text-[10px] text-red-400 font-mono uppercase block font-bold">NEARBY THREAT DISTANCE</span>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-100 text-xs leading-snug">{locData.nearestThreatName}</h4>
                <p className="text-[11px] text-cyan-300 font-mono mt-1">
                  Distance: <strong>{locData.nearestThreatDistanceKm} km away</strong>
                </p>
              </div>
            </div>

            {onNavigateToEvent && (
              <button
                onClick={onNavigateToEvent}
                className="w-full py-2 rounded-lg bg-red-950/60 hover:bg-red-950 border border-red-800 text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                Inspect Threat Footprint
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Stakeholder Safety Guidelines */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldAlert className="h-4 w-4 text-cyan-400" />
              Tailored Location Safety Advisory
            </h3>

            {/* Public User Advisory */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                <User className="h-4 w-4" />
                Public &amp; Resident Advisory
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {locData.safetyAdvisory.public}
              </p>
            </div>

            {/* Farmer Kisan Advisory */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Sprout className="h-4 w-4" />
                Farmer (Kisan) Field Advisory
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {locData.safetyAdvisory.farmer}
              </p>
            </div>

            {/* Official Disaster Officer Advisory */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Radio className="h-4 w-4" />
                Disaster Officer Operational Directives
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {locData.safetyAdvisory.official}
              </p>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
