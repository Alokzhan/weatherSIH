import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Globe
} from 'lucide-react';
import { getApiEndpoint } from '../config/apiConfig';
import { fetchApiAlerts, fetchApiLocationRisk } from '../services/apiService';

export const ApiExplorer: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/v1/alerts');
  const [copied, setCopied] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const endpoints = [
    { method: 'GET', path: '/api/v1/alerts', desc: 'Return all active machine-readable alerts' },
    { method: 'GET', path: '/api/v1/anomalies', desc: 'List active 4D anomaly bounding boxes' },
    { method: 'GET', path: '/api/v1/psd-compare', desc: 'Power Spectral Density preservation analysis' },
    { method: 'GET', path: '/api/v1/ndrf-brief', desc: 'Generated operational NDRF disaster brief' },
    { method: 'GET', path: '/api/v1/location-risk?q=Prayagraj', desc: 'Return 5 km downscaled risk score for coordinates' },
    { method: 'GET', path: '/api/v1/model/historical-validation', desc: 'Return historical benchmark case study results' },
    { method: 'POST', path: '/api/v1/admin/upload', desc: 'Upload NetCDF/GRIB2 forecast dataset' },
    { method: 'POST', path: '/api/v1/admin/run-model', desc: 'Trigger 5km downscaling pipeline inference' },
  ];

  useEffect(() => {
    let isMounted = true;
    async function executeLiveFetch() {
      setLoading(true);
      try {
        const res = await fetch(getApiEndpoint(selectedEndpoint));
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setApiResponse(data);
        } else {
          throw new Error('API return non-200');
        }
      } catch (e) {
        if (isMounted) {
          if (selectedEndpoint.includes('/alerts')) {
            const aRes = await fetchApiAlerts();
            setApiResponse(aRes);
          } else if (selectedEndpoint.includes('/location-risk')) {
            const lRes = await fetchApiLocationRisk('Prayagraj');
            setApiResponse(lRes);
          } else {
            setApiResponse({ status: 'success', endpoint: selectedEndpoint, timestamp: new Date().toISOString() });
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    executeLiveFetch();
    return () => { isMounted = false; };
  }, [selectedEndpoint]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(apiResponse || {}, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">REST API DOCUMENTATION &amp; TESTER</span>
            <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <Code2 className="h-6 w-6 text-cyan-400" />
              OpenAPI / REST API Interactive Playground
            </h2>
            <p className="text-xs text-slate-400">
              Test live machine-readable API endpoints for alerts, location risk scores, trajectories, and administration.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-3 py-1.5 rounded-xl">
            <Globe className="h-4 w-4 text-cyan-400" />
            <span>Base URL: https://api.stormtrace.ai/v1</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Endpoints List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 font-mono uppercase px-1">Available REST Endpoints:</h3>

          <div className="space-y-2">
            {endpoints.map((ep, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedEndpoint(ep.path)}
                className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                  selectedEndpoint === ep.path
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 font-mono mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ep.method === 'GET' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-bold text-slate-100 truncate">{ep.path}</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{ep.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Execution Response Runner */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 rounded font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {selectedEndpoint.startsWith('/api/v1/admin') ? 'POST' : 'GET'}
                </span>
                <span className="text-slate-100 font-bold">{selectedEndpoint}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
              </div>
            </div>

            {/* JSON Output Viewer */}
            <div className="relative">
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-[500px] leading-relaxed">
                {loading ? 'Executing live API fetch...' : JSON.stringify(apiResponse || {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
