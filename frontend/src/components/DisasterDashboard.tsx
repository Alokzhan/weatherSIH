import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Users, 
  ShieldAlert, 
  Download, 
  Building2, 
  Anchor,
  Loader2
} from 'lucide-react';
import { fetchApiDisasterResources } from '../services/apiService';

export const DisasterDashboard: React.FC = () => {
  const [districtList, setDistrictList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      const data = await fetchApiDisasterResources();
      if (isMounted) {
        setDistrictList(data);
        setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const totalNdrf = districtList.reduce((acc, curr) => acc + (curr.ndrfTeams || 0), 0);
  const totalBoats = districtList.reduce((acc, curr) => acc + (curr.evacuationBoats || 0), 0);
  const totalCamps = districtList.reduce((acc, curr) => acc + (curr.reliefCamps || 0), 0);

  const handlePrintBriefing = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16 space-x-3">
        <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
        <span className="text-sm font-mono text-slate-400">Loading operational disaster resource matrix...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">STATE EMERGENCY OPERATIONS ROOM</span>
            <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <Radio className="h-6 w-6 text-red-400 animate-pulse" />
              Disaster Response Briefing &amp; Resource Allocation Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Multi-district operational briefing for Prayagraj, Varanasi, Mirzapur, Kaushambi and Pratapgarh.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintBriefing}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg"
            >
              <Download className="h-4 w-4" />
              Print / Save Briefing Summary
            </button>
          </div>
        </div>
      </div>

      {/* Resource Allocation Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-950 text-red-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">NDRF / SDRF Deployed</span>
              <span className="text-xl font-bold text-slate-100 font-mono">{totalNdrf} Teams</span>
              <span className="text-[10px] text-red-400 block">Active Search &amp; Rescue</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950 text-cyan-400">
              <Anchor className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Evacuation Boats</span>
              <span className="text-xl font-bold text-cyan-300 font-mono">{totalBoats} Boats</span>
              <span className="text-[10px] text-slate-400 block">Pre-positioned at Ghats</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Relief Camps Active</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">{totalCamps} Camps</span>
              <span className="text-[10px] text-slate-400 block">Food &amp; Medical Ready</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-950 text-amber-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Affected Population</span>
              <span className="text-xl font-bold text-amber-300 font-mono">~480,000</span>
              <span className="text-[10px] text-slate-400 block">Ganges-Yamuna Belt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-District Resource Deployment Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-cyan-400" />
          Multi-District Resource Deployment Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">District</th>
                <th className="p-3">Alert Status</th>
                <th className="p-3">NDRF Teams</th>
                <th className="p-3">SDRF Teams</th>
                <th className="p-3">Motor Boats</th>
                <th className="p-3">Relief Shelters</th>
                <th className="p-3">High Risk Villages</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {districtList.map((d, i) => (
                <tr key={i} className="hover:bg-slate-900/60">
                  <td className="p-3 font-bold text-slate-100">{d.district}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      d.status === 'High Alert' ? 'bg-red-950 text-red-400 border border-red-800' :
                      d.status === 'Alert' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                      'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-cyan-300 font-bold">{d.ndrfTeams}</td>
                  <td className="p-3 font-mono text-slate-300">{d.sdrfTeams}</td>
                  <td className="p-3 font-mono text-slate-300">{d.evacuationBoats}</td>
                  <td className="p-3 font-mono text-emerald-400 font-bold">{d.reliefCamps}</td>
                  <td className="p-3 font-mono text-red-400 font-bold">{d.highRiskVillages}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
