'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Settings as SettingsIcon, Save, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, currentRole } = useStore();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setFormData(settings);
  }, [settings]);

  if (!mounted) return null;

  const canEdit = currentRole === 'FINOPS_ANALYST' || currentRole === 'ADMIN';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Detection & Pipeline Settings</h1>
          <p className="mt-1 text-sm text-slate-400">
            Configure multi-signal thresholds, correlation windows, and ingestion tolerances.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">Active Role:</span>
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
            {currentRole}
          </span>
        </div>
      </div>

      {!canEdit && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-300 flex items-center space-x-3">
          <Lock className="w-5 h-5 shrink-0 text-amber-400" />
          <div>
            <strong>Read-Only Access:</strong> Modifying detection thresholds requires either the 
            <strong> FinOps Analyst</strong> or <strong>Admin</strong> role (switch role via header dropdown).
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
          <div className="flex items-center border-b border-slate-800 pb-3">
            <SettingsIcon className="w-4 h-4 text-indigo-400 mr-2" />
            <h3 className="text-sm font-semibold text-white">Multi-Signal Threshold Parameters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Warning Threshold (%)</label>
              <input 
                type="number"
                disabled={!canEdit}
                value={formData.warningPercentage}
                onChange={e => setFormData({...formData, warningPercentage: Number(e.target.value)})}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              />
              <p className="mt-1 text-[11px] text-slate-500">Minimum percentage increase to trigger a WARNING alert.</p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">High Threshold (%)</label>
              <input 
                type="number"
                disabled={!canEdit}
                value={formData.highPercentage}
                onChange={e => setFormData({...formData, highPercentage: Number(e.target.value)})}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              />
              <p className="mt-1 text-[11px] text-slate-500">Minimum percentage increase to trigger a HIGH severity incident.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Critical Threshold (%)</label>
              <input 
                type="number"
                disabled={!canEdit}
                value={formData.criticalPercentage}
                onChange={e => setFormData({...formData, criticalPercentage: Number(e.target.value)})}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              />
              <p className="mt-1 text-[11px] text-slate-500">Threshold for immediate CRITICAL multi-channel escalation.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Z-Score Cutoff</label>
              <input 
                type="number"
                step="0.1"
                disabled={!canEdit}
                value={formData.zScoreThreshold}
                onChange={e => setFormData({...formData, zScoreThreshold: Number(e.target.value)})}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              />
              <p className="mt-1 text-[11px] text-slate-500">Number of statistical standard deviations from baseline (default: 2.0).</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Minimum Absolute Cost Jump ($)</label>
              <input 
                type="number"
                disabled={!canEdit}
                value={formData.minimumCostIncrease}
                onChange={e => setFormData({...formData, minimumCostIncrease: Number(e.target.value)})}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              />
              <p className="mt-1 text-[11px] text-slate-500">Suppresses percentage alerts if dollar deviation is below this cutoff.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Rolling Baseline Window (Hours)</label>
              <input 
                type="number"
                disabled={!canEdit}
                value={formData.detectionWindowHours}
                onChange={e => setFormData({...formData, detectionWindowHours: Number(e.target.value)})}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              />
              <p className="mt-1 text-[11px] text-slate-500">Rolling window duration used to compute moving average and EWMA.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Correlation Window (&plusmn; Minutes)</label>
              <input 
                type="number"
                disabled={!canEdit}
                value={formData.correlationWindowMinutes || 30}
                onChange={e => setFormData({...formData, correlationWindowMinutes: Number(e.target.value)})}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              />
              <p className="mt-1 text-[11px] text-slate-500">Time window to correlate deployments and scaling events with spend surges.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Max Late Event Arrival (Hours)</label>
              <input 
                type="number"
                disabled={!canEdit}
                value={formData.maxLateEventHours || 4}
                onChange={e => setFormData({...formData, maxLateEventHours: Number(e.target.value)})}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              />
              <p className="mt-1 text-[11px] text-slate-500">Max allowable out-of-order latency for retroactive reconciliation.</p>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-800">
            {saved && (
              <span className="text-xs text-emerald-400 mr-4 flex items-center font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Threshold configuration updated & logged to audit trail!
              </span>
            )}
            <button 
              type="submit"
              disabled={!canEdit}
              className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-900 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
