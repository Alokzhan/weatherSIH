import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Bell,
  MessageSquare,
  Send,
  Sliders
} from 'lucide-react';
import type { AlertItem, AcknowledgementStatus } from '../types/weather';
import { generateAlertSummaryPDF, exportToCSV } from '../utils/exportUtils';
import { getStoredAlerts, updateAlertAcknowledgement } from '../services/apiService';

export const AlertCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>(getStoredAlerts());
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchDistrict, setSearchDistrict] = useState<string>('');

  // Threshold Config Modal State
  const [showThresholdModal, setShowThresholdModal] = useState<boolean>(false);
  const [threshold3h, setThreshold3h] = useState<number>(50);
  const [threshold6h, setThreshold6h] = useState<number>(100);
  const [threshold24h, setThreshold24h] = useState<number>(150);

  // Officer Notes Modal State
  const [activeNoteAlertId, setActiveNoteAlertId] = useState<string | null>(null);
  const [officerStatus, setOfficerStatus] = useState<AcknowledgementStatus>('action_taken');
  const [officerName, setOfficerName] = useState<string>('DEOC Officer (Prayagraj / Shahjahanpur)');
  const [officerNote, setOfficerNote] = useState<string>('Pre-positioned pumps and notified local disaster quick response unit.');
  const [broadcastLog, setBroadcastLog] = useState<string | null>(null);

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter !== 'all' && a.riskLevel !== severityFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (searchDistrict && !a.district.toLowerCase().includes(searchDistrict.toLowerCase())) return false;
    return true;
  });

  const handleSaveAcknowledgement = async () => {
    if (!activeNoteAlertId) return;
    try {
      const res = await updateAlertAcknowledgement(activeNoteAlertId, officerStatus, officerName, officerNote);
      setAlerts(prev => prev.map(a => a.id === activeNoteAlertId ? res.alert : a));
      setActiveNoteAlertId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateSmsBroadcast = (district: string) => {
    setBroadcastLog(`✅ SMS & WhatsApp Warning sent to 214 registered farmers & 12 officers in ${district}!`);
    setTimeout(() => setBroadcastLog(null), 5000);
  };

  const handleExportPDF = () => {
    generateAlertSummaryPDF(filteredAlerts);
  };

  const handleExportCSV = () => {
    const csvRows = filteredAlerts.map(a => ({
      Alert_ID: a.id,
      Title: a.title,
      District: a.district,
      Severity: a.riskLevel,
      Issued_At: a.issuedAt,
      Valid_Until: a.validUntil,
      Status: a.status,
      Ack_Status: a.acknowledgementStatus || 'pending',
      Ack_By: a.acknowledgedBy || 'N/A',
      Tehsils: a.affectedTehsils.join('; '),
      Summary: a.summary,
    }));
    exportToCSV(`StormTrace_Alerts_${Date.now()}.csv`, csvRows);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Broadcast Toast Notification */}
      {broadcastLog && (
        <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold text-xs flex items-center justify-between shadow-2xl animate-pulse">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-emerald-400" />
            <span>{broadcastLog}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">BROADCAST SUCCESSFUL</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">FR-07 &amp; FR-09 ALERT DISPATCH &amp; OFFICER WORKFLOW</span>
            <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <Bell className="h-6 w-6 text-red-400 animate-bounce" />
              Active Alerts &amp; Decision Support Command
            </h2>
            <p className="text-xs text-slate-400">
              Severity-based machine-readable hazard warnings, officer acknowledgement workflow, configurable thresholds, and Kisan SMS dispatch.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowThresholdModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Sliders className="h-4 w-4" />
              Config Thresholds
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg"
            >
              <Download className="h-4 w-4" />
              Export Bulletin (PDF)
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              CSV
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Search District */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by district (Prayagraj, Shahjahanpur...)"
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Severity filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-slate-400 shrink-0">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Severities</option>
              <option value="critical" className="bg-slate-900">Critical (Red Alert)</option>
              <option value="severe" className="bg-slate-900">Severe (Orange Warning)</option>
              <option value="moderate" className="bg-slate-900">Moderate (Yellow Alert)</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-slate-400 shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Statuses</option>
              <option value="active" className="bg-slate-900">Active Warnings</option>
              <option value="mitigated" className="bg-slate-900">Acknowledged / Mitigated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Threshold Config Modal */}
      {showThresholdModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="h-5 w-5 text-amber-400" />
                Configure Region Risk Thresholds
              </h3>
              <button onClick={() => setShowThresholdModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">3-Hour Accumulation Threshold (mm):</label>
                <input
                  type="number"
                  value={threshold3h}
                  onChange={(e) => setThreshold3h(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">6-Hour Accumulation Threshold (mm):</label>
                <input
                  type="number"
                  value={threshold6h}
                  onChange={(e) => setThreshold6h(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">24-Hour Cumulative Threshold (mm):</label>
                <input
                  type="number"
                  value={threshold24h}
                  onChange={(e) => setThreshold24h(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowThresholdModal(false)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Save Thresholds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Officer Acknowledgement Modal */}
      {activeNoteAlertId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Officer Acknowledgement &amp; Status Workflow
              </h3>
              <button onClick={() => setActiveNoteAlertId(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Officer Name &amp; Designation:</label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Workflow Action Status:</label>
                <select
                  value={officerStatus}
                  onChange={(e) => setOfficerStatus(e.target.value as AcknowledgementStatus)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-semibold cursor-pointer"
                >
                  <option value="seen">Seen / Logged</option>
                  <option value="under_review">Under Review by DEOC</option>
                  <option value="action_taken">Action Taken (NDRF / Pumps Deployed)</option>
                  <option value="closed">Closed / Mitigated</option>
                  <option value="false_alarm">Flagged as False Alarm</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Operational Action Notes:</label>
                <textarea
                  rows={3}
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveNoteAlertId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAcknowledgement}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
              >
                Save &amp; Update Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 text-slate-400 text-sm">
            No alerts match the selected filters.
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const badgeClass = 
              alert.riskLevel === 'critical' ? 'badge-critical' :
              alert.riskLevel === 'severe' ? 'badge-severe' :
              alert.riskLevel === 'moderate' ? 'badge-moderate' : 'badge-low';

            return (
              <div key={alert.id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider ${badgeClass}`}>
                      {alert.riskLevel}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{alert.id}</span>
                    <span className="text-xs text-slate-400">District: <strong className="text-slate-200">{alert.district}</strong></span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                      Confidence: {alert.confidencePercent || 94}%
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    Issued: {alert.issuedAt} • Valid: {alert.validUntil}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-100 mb-1">{alert.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{alert.summary}</p>

                  <div className="text-xs space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800 mb-3">
                    <span className="text-slate-400 font-bold block mb-1">Recommended Response Actions:</span>
                    {alert.recommendedActions.map((action, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Tehsils: <strong className="text-slate-200">{alert.affectedTehsils.join(', ')}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleSimulateSmsBroadcast(alert.district)}
                      className="px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Dispatch SMS/WhatsApp
                    </button>

                    {alert.acknowledgementStatus ? (
                      <button
                        onClick={() => setActiveNoteAlertId(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors font-mono"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        Status: <span className="uppercase text-emerald-300 font-bold">{alert.acknowledgementStatus}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveNoteAlertId(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Acknowledge Alert
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

