import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  CloudRain, 
  Wind, 
  Droplets, 
  Navigation, 
  Clock,
  Loader2
} from 'lucide-react';
import type { LocationRiskData } from '../types/weather';
import { fetchApiLocationRisk } from '../services/apiService';

interface LocalityExplorerProps {
  initialSearchQuery?: string;
}

export const LocalityExplorer: React.FC<LocalityExplorerProps> = ({ initialSearchQuery }) => {
  const [activeLoc, setActiveLoc] = useState<LocationRiskData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery || '');
  const [isSearching, setIsSearching] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const query = (initialSearchQuery && initialSearchQuery.trim()) || 'Prayagraj';
    setIsSearching(true);
    fetchApiLocationRisk(query)
      .then(res => {
        if (isMounted) setActiveLoc(res.data);
      })
      .catch(err => console.error('Error fetching locality risk:', err))
      .finally(() => {
        if (isMounted) setIsSearching(false);
      });
    return () => { isMounted = false; };
  }, [initialSearchQuery]);

  if (isSearching && !activeLoc) {
    return (
      <div className="flex items-center justify-center p-12 space-x-3">
        <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
        <span className="text-sm font-mono text-slate-400">Loading downscaled locality forecast...</span>
      </div>
    );
  }

  if (!activeLoc) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono text-sm">
        No location risk data available for "{searchQuery}". Try searching for Prayagraj, Varanasi, Delhi, or Wayanad.
      </div>
    );
  }

  const loc: LocationRiskData = activeLoc;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    try {
      const res = await fetchApiLocationRisk(q);
      setActiveLoc(res.data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search Header Bar */}
      <div className="storm-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">HYPERLOCAL PAN-INDIA WEATHER &amp; RADAR EXPLORER</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            {loc.locationName}
          </h2>
          <p className="text-xs text-slate-500">
            District: <strong>{loc.district}</strong> • Coordinates: <span className="font-mono">[{loc.coordinates[0]}°N, {loc.coordinates[1]}°E]</span>
          </p>
        </div>

        {/* Quick Search Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
          {isSearching ? <Loader2 className="h-4 w-4 text-blue-500 animate-spin ml-2 shrink-0" /> : <Search className="h-4 w-4 text-slate-400 ml-2 shrink-0" />}
          <input
            type="text"
            placeholder="Search ANY City, Village or PIN in India (e.g. Chinour, Delhi, Wayanad)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none px-2"
          />
          <button type="submit" disabled={isSearching} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 disabled:opacity-50">
            {isSearching ? 'Analyzing...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Grid View: Current Weather + Forecast + Radar Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 60%: Weather Card & Next 3 Hours */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Weather Card — LIVE DATA */}
          <div className="storm-card p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-slate-500 block uppercase flex items-center gap-1.5">
                  Current Weather
                  {loc.liveWeather && (
                    <span className="inline-flex items-center gap-1 text-[9px] text-emerald-500 font-mono">
                      <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
                      LIVE
                    </span>
                  )}
                </span>
                <h2 className="text-5xl font-black text-white font-mono mt-2">
                  {loc.liveWeather ? `${loc.liveWeather.tempC}°C` : `${Math.round(25 + loc.coordinates[0] % 5)}°C`}
                </h2>
                <p className="text-base font-bold text-blue-400 mt-1">
                  {loc.liveWeather?.description || (loc.forecast24h.rainMm > 50 ? 'Heavy Rain' : loc.forecast24h.rainMm > 10 ? 'Light Rain' : 'Clear')}
                </p>
              </div>

              <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase ${
                loc.currentRiskLevel === 'critical' ? 'badge-critical' :
                loc.currentRiskLevel === 'severe' ? 'badge-severe' :
                loc.currentRiskLevel === 'moderate' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800' :
                'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              }`}>
                {loc.currentRiskLevel} RISK
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 block text-[10px] flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5 text-blue-500" /> Humidity
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  {loc.liveWeather ? `${loc.liveWeather.humidity}%` : '—'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 block text-[10px] flex items-center gap-1">
                  <Wind className="h-3.5 w-3.5 text-cyan-500" /> Wind Speed
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  {loc.liveWeather ? `${loc.liveWeather.windSpeedKmh} km/h` : '—'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 block text-[10px] flex items-center gap-1">
                  <CloudRain className="h-3.5 w-3.5 text-blue-600" /> Rainfall (24h)
                </span>
                <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">{loc.forecast24h.rainMm} mm</span>
              </div>
            </div>

            {loc.liveWeather && (
              <div className="text-[9px] text-slate-500 dark:text-slate-600 font-mono pt-1 border-t border-slate-200 dark:border-slate-800">
                Source: {loc.liveWeather.source} • Pressure: {loc.liveWeather.pressureMb} hPa
              </div>
            )}
          </div>

          {/* Next 3 Hours Forecast — LIVE from hourlyProbabilities */}
          <div className="storm-card p-6 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Hourly Forecast Timeline
            </h3>

            <div className={`grid gap-3 text-xs ${loc.hourlyProbabilities.length >= 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {loc.hourlyProbabilities.slice(0, 4).map((hp, idx) => {
                const isHighRain = hp.rainMm >= 5;
                const rainLabel = hp.rainMm >= 10 ? 'Heavy Rain' : hp.rainMm >= 2 ? 'Moderate Rain' : hp.rainMm > 0 ? 'Light Rain' : 'No Rain';
                const rainColor = hp.rainMm >= 10 ? 'text-red-500' : hp.rainMm >= 2 ? 'text-amber-500' : hp.rainMm > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-500';
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl text-center space-y-1 ${
                      isHighRain
                        ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50'
                        : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className={`text-[10px] font-mono block ${isHighRain ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500'}`}>
                      {hp.hour}
                    </span>
                    <span className={`font-bold text-base font-mono block ${isHighRain ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {hp.rainMm} mm
                    </span>
                    <span className={`text-[10px] font-semibold block ${rainColor}`}>
                      {rainLabel}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block">
                      {hp.prob}% prob
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 40%: Nearby Rain Cells + Multi-day Forecast */}
        <div className="lg:col-span-5 space-y-6">
          {/* Nearby Rain Cells Radar Cards — dynamic from loc data */}
          <div className="storm-card p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Navigation className="h-4 w-4 text-blue-600" />
              Nearest Detected Threat Cell
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[200px]">{loc.nearestThreatName}</span>
                  <span className="text-[10px] text-slate-500">
                    {loc.liveWeather ? `Wind: ${loc.liveWeather.windSpeedKmh} km/h` : 'Tracking active'}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-bold text-sm block ${loc.nearestThreatDistanceKm <= 5 ? 'text-red-500' : 'text-blue-600'}`}>
                    {loc.nearestThreatDistanceKm} km
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    loc.currentRiskLevel === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300' :
                    loc.currentRiskLevel === 'severe' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300' :
                    loc.currentRiskLevel === 'moderate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' :
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                  }`}>
                    {loc.currentRiskLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-day Forecast — LIVE */}
          <div className="storm-card p-6 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Multi-Day Forecast</h3>
            <div className="space-y-2 text-xs">
              {[
                { label: '24h', data: loc.forecast24h },
                { label: '48h', data: loc.forecast48h },
                { label: '72h', data: loc.forecast72h },
                { label: '5 Day', data: loc.forecast5d },
              ].map((f) => (
                <div key={f.label} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-300 w-12">{f.label}</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{f.data.rainMm} mm</span>
                  <span className="font-mono text-slate-400">{f.data.prob}%</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    f.data.risk === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300' :
                    f.data.risk === 'severe' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300' :
                    f.data.risk === 'moderate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' :
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                  }`}>
                    {f.data.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Advisory */}
          <div className="storm-card p-5 text-xs space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">⚠️ Safety Advisory</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{loc.safetyAdvisory.public}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
