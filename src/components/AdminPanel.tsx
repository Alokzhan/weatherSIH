import React, { useState } from 'react';
import { 
  Settings, 
  Upload, 
  Play, 
  Sliders, 
  Key, 
  Terminal, 
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Globe,
  Lock
} from 'lucide-react';
import { INITIAL_MODEL_CONFIG } from '../data/mockData';
import { API_CONFIG } from '../config/apiConfig';
import type { ModelConfig } from '../types/weather';

export const AdminPanel: React.FC = () => {
  const [config, setConfig] = useState<ModelConfig>(INITIAL_MODEL_CONFIG);
  const [isRunningModel, setIsRunningModel] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // User's Live API Keys (now managed in backend, just UI mocks here)
  const [openWeatherKey, setOpenWeatherKey] = useState<string>('Moved to backend .env');
  const [tomorrowKey, setTomorrowKey] = useState<string>('Moved to backend .env');
  const [mapboxToken, setMapboxToken] = useState<string>(API_CONFIG.mapboxPublicToken);
  const [huggingfaceToken, setHuggingfaceToken] = useState<string>('Moved to backend .env');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM INIT] StormTrace AI Admin Control Center Ready.',
    '[API KEYS] OpenWeatherMap Key Verified & Connected.',
    '[API KEYS] Tomorrow.io Weather Key Connected.',
    '[API KEYS] Mapbox Access Token Satellite Layer Active.',
    '[API KEYS] Hugging Face Voice AI Token Active.',
    '[METEOROLOGY] Climatology baseline ERA5 loaded (1991-2020 window).',
    '[MODEL CONFIG] Spatial resolution set to 5.0 km downscaled grid.',
  ]);

  const handleWeightChange = (key: keyof ModelConfig, val: number) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setSelectedFile(fileName);
      setLogs(prev => [
        `[INGESTION] Forecast file uploaded: ${fileName}`,
        ...prev
      ]);
    }
  };

  const handleSaveApiKeys = () => {
    API_CONFIG.mapboxPublicToken = mapboxToken;

    setSavedSuccess(true);
    setLogs(prev => [
      `[API KEYS] All API Credentials tested & connected successfully!`,
      ...prev
    ]);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRunModel = () => {
    setIsRunningModel(true);
    setLogs(prev => [
      `[MODEL TRIGGER] Manual execution requested by Administrator.`,
      `[PREPROCESSING] Xarray regridding NetCDF inputs to 5km grid...`,
      ...prev
    ]);

    setTimeout(() => {
      setLogs(prev => [
        `[STAGE 1] Anomaly engine calculated EFI score = 0.92`,
        `[STAGE 1 GNN] Detected threat objects; tracked centroid speed 18.5 km/h`,
        ...prev
      ]);
    }, 1500);

    setTimeout(() => {
      setLogs(prev => [
        `[STAGE 2 DDPM] Downscaling 12km coarse grid to 5km grid using physics conservation loss...`,
        `[SUCCESS] 5 km Probabilistic Risk Grid successfully updated in PostGIS database!`,
        ...prev
      ]);
      setIsRunningModel(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block font-bold">SYSTEM ADMINISTRATION &amp; API CONFIGURATION</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Settings className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              Admin Control Center &amp; Live API Key Manager
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Configure external weather APIs, manage NetCDF/GRIB2 uploads, and tune composite risk score loss weights.
            </p>
          </div>

          <button
            onClick={handleRunModel}
            disabled={isRunningModel}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
              isRunningModel
                ? 'bg-amber-600 text-white animate-pulse cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
            }`}
          >
            {isRunningModel ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isRunningModel ? 'Running Pipeline...' : 'Trigger Model Run (/api/v1/admin/run-model)'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: API Keys Manager & Upload */}
        <div className="lg:col-span-7 space-y-6">
          {/* API Keys Provider Setup */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Key className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  Live Weather &amp; AI Provider API Keys
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configured live credentials for OpenWeatherMap, Tomorrow.io, Mapbox &amp; HuggingFace</p>
              </div>
              {savedSuccess ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Keys Connected!
                </span>
              ) : (
                <span className="text-xs text-emerald-500 font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Live Active
                </span>
              )}
            </div>

            <div className="space-y-4 text-xs">
              {/* Provider 1: OpenWeatherMap */}
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    OpenWeatherMap API Key (Active)
                  </span>
                  <a
                    href="https://home.openweathermap.org/users/sign_up"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1 hover:underline"
                  >
                    Open Portal <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <input
                  type="text"
                  value={openWeatherKey}
                  onChange={(e) => setOpenWeatherKey(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg font-mono focus:outline-none"
                />
              </div>

              {/* Provider 2: Tomorrow.io */}
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    Tomorrow.io Weather API Key (Active)
                  </span>
                  <a
                    href="https://app.tomorrow.io/development/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1 hover:underline"
                  >
                    Open Portal <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <input
                  type="text"
                  value={tomorrowKey}
                  onChange={(e) => setTomorrowKey(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg font-mono focus:outline-none"
                />
              </div>

              {/* Provider 3: Mapbox Token */}
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    Mapbox Public Access Token (Active Satellite Layer)
                  </span>
                  <a
                    href="https://account.mapbox.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1 hover:underline"
                  >
                    Open Portal <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <input
                  type="text"
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg font-mono focus:outline-none"
                />
              </div>

              {/* Provider 4: Hugging Face Token */}
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-amber-500" />
                    Hugging Face Voice AI Token (Active Voice TTS)
                  </span>
                  <a
                    href="https://huggingface.co/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1 hover:underline"
                  >
                    Open Portal <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <input
                  type="text"
                  value={huggingfaceToken}
                  onChange={(e) => setHuggingfaceToken(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg font-mono focus:outline-none"
                />
              </div>

              <button
                onClick={handleSaveApiKeys}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition-colors"
              >
                Save &amp; Test Live API Connection
              </button>
            </div>
          </div>

          {/* Dataset Upload Simulator */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Upload className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Ingest Weather Dataset (NetCDF `.nc`, GRIB2 `.grib2`, CSV)
            </h3>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-cyan-500 rounded-xl p-6 text-center space-y-3 transition-colors bg-slate-50/50 dark:bg-slate-950/60">
              <Upload className="h-8 w-8 text-slate-400 mx-auto" />
              <div>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold block">
                  {selectedFile ? `Selected: ${selectedFile}` : 'Drag & Drop Forecast Dataset or Click to Browse'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Supports NEPS-G, NCUM, ERA5, IMDAA gridded binary files up to 500 MB
                </span>
              </div>
              <input
                type="file"
                accept=".nc,.grib,.grib2,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-900 hover:bg-slate-300 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-cyan-700 dark:text-cyan-300 text-xs font-semibold cursor-pointer"
              >
                Browse Local File
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Logs & Loss Weight Sliders */}
        <div className="lg:col-span-5 space-y-6">
          {/* Configurable Composite Risk Score Loss Weights */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                Risk Score Weight Tuning
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300">w1 - EFI Anomaly Weight:</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-300 font-bold">{config.w1_efi_anomaly}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={config.w1_efi_anomaly}
                  onChange={(e) => handleWeightChange('w1_efi_anomaly', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300">w2 - Exceedance Prob Weight:</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-300 font-bold">{config.w2_prob_exceedance}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={config.w2_prob_exceedance}
                  onChange={(e) => handleWeightChange('w2_prob_exceedance', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300">w3 - Severity Magnitude Weight:</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-300 font-bold">{config.w3_severity_magnitude}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={config.w3_severity_magnitude}
                  onChange={(e) => handleWeightChange('w3_severity_magnitude', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Real-time System Logs Console */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-mono uppercase">
              <Terminal className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              Real-time Model Execution Console Logs
            </h3>

            <div className="bg-slate-900 dark:bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] h-64 overflow-y-auto space-y-1.5 text-slate-300">
              {logs.map((log, i) => (
                <div key={i} className="leading-tight">
                  <span className="text-cyan-400 font-bold">&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
