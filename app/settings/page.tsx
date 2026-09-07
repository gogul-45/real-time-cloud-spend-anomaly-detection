'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings } = useStore();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setFormData(settings);
  }, [settings]);

  if (!mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">System Settings</h1>
        <p className="mt-1 text-sm text-slate-400">Configure anomaly detection thresholds and rules.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center mb-6 border-b border-slate-800 pb-4">
            <SettingsIcon className="w-5 h-5 text-indigo-400 mr-2" />
            <h3 className="text-lg font-medium text-white">Detection Thresholds</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Warning Threshold (%)</label>
              <input 
                type="number"
                value={formData.warningPercentage}
                onChange={e => setFormData({...formData, warningPercentage: Number(e.target.value)})}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-slate-500">Minimum % increase to trigger a WARNING.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">High Threshold (%)</label>
              <input 
                type="number"
                value={formData.highPercentage}
                onChange={e => setFormData({...formData, highPercentage: Number(e.target.value)})}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-slate-500">Minimum % increase to trigger a HIGH.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Critical Threshold (%)</label>
              <input 
                type="number"
                value={formData.criticalPercentage}
                onChange={e => setFormData({...formData, criticalPercentage: Number(e.target.value)})}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-slate-500">Minimum % increase to trigger a CRITICAL.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Z-Score Threshold</label>
              <input 
                type="number"
                step="0.1"
                value={formData.zScoreThreshold}
                onChange={e => setFormData({...formData, zScoreThreshold: Number(e.target.value)})}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-slate-500">Statistical standard deviations from baseline (e.g., 2.0).</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Minimum Cost Increase ($)</label>
              <input 
                type="number"
                value={formData.minimumCostIncrease}
                onChange={e => setFormData({...formData, minimumCostIncrease: Number(e.target.value)})}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-slate-500">Ignore percentage spikes if total dollar increase is below this.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Detection Window (Hours)</label>
              <input 
                type="number"
                value={formData.detectionWindowHours}
                onChange={e => setFormData({...formData, detectionWindowHours: Number(e.target.value)})}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-slate-500">Rolling window to calculate baseline (e.g., 24 hrs).</p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end">
            {saved && <span className="text-sm text-emerald-400 mr-4">Settings saved successfully!</span>}
            <button 
              type="submit"
              className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-900"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
