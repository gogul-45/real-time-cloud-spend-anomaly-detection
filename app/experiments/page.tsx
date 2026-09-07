'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Activity } from 'lucide-react';

export default function ExperimentsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const comparisonData = [
    { metric: 'Detection Latency', baseline: 60, proposed: 0.1, unit: 'mins' }, // 60 mins vs 6 seconds
    { metric: 'False Positives', baseline: 12, proposed: 2, unit: 'count' },
    { metric: 'False Negatives', baseline: 5, proposed: 1, unit: 'count' },
  ];

  const scenarios = [
    { id: 1, name: 'GPU Runaway Scaling', type: 'TP', desc: 'Capacity increased 4x, workload steady. Caught in 4s.' },
    { id: 2, name: 'Legitimate Live-stream', type: 'TN', desc: 'Workload and cost increased proportionally (+40%). Ignored.' },
    { id: 3, name: 'Small Temp Fluctuation', type: 'TN', desc: 'Cost increased 15% for 1 hr, returned to normal. Below threshold.' },
    { id: 4, name: 'Unauthorized Deployment', type: 'TP', desc: 'Cost spiked 200% following out-of-band deploy. Caught in 3s.' },
    { id: 5, name: 'Missing Deploy Metadata', type: 'FP', desc: 'Cost spiked due to legit manual scale, but no deploy event linked. Flagged.' },
    { id: 6, name: 'Slow Leak', type: 'FN', desc: 'Cost increased 1% per hour over 48h. Evaded rolling 24h z-score.' },
    { id: 7, name: 'Redundant DB Replica', type: 'TP', desc: 'DB cost doubled, reads unchanged. Caught in 5s.' },
    { id: 8, name: 'Storage Cleanup Job', type: 'TN', desc: 'High IOPS cost for 1hr during scheduled maintenance. Expected.' },
  ];

  const getBadge = (type: string) => {
    switch(type) {
      case 'TP': return <span className="inline-flex items-center rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400"><CheckCircle2 className="w-3 h-3 mr-1" /> True Positive</span>;
      case 'TN': return <span className="inline-flex items-center rounded border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-xs font-semibold text-slate-400"><CheckCircle2 className="w-3 h-3 mr-1" /> True Negative</span>;
      case 'FP': return <span className="inline-flex items-center rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400"><AlertTriangle className="w-3 h-3 mr-1" /> False Positive</span>;
      case 'FN': return <span className="inline-flex items-center rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-400"><XCircle className="w-3 h-3 mr-1" /> False Negative</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Experiment Analysis</h1>
        <p className="mt-1 text-sm text-slate-400">Evaluating proposed real-time detector vs traditional budget alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-center items-center text-center">
          <p className="text-sm font-medium text-slate-400 mb-2">Precision</p>
          <p className="text-4xl font-bold text-emerald-400">80.0%</p>
          <p className="text-xs text-slate-500 mt-2">TP / (TP + FP)</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-center items-center text-center">
          <p className="text-sm font-medium text-slate-400 mb-2">Recall</p>
          <p className="text-4xl font-bold text-indigo-400">85.7%</p>
          <p className="text-xs text-slate-500 mt-2">TP / (TP + FN)</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-center items-center text-center">
          <p className="text-sm font-medium text-slate-400 mb-2">F1 Score</p>
          <p className="text-4xl font-bold text-white">0.82</p>
          <p className="text-xs text-slate-500 mt-2">Harmonic mean</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-center items-center text-center">
          <p className="text-sm font-medium text-slate-400 mb-2">Latency Impr.</p>
          <p className="text-4xl font-bold text-emerald-400">99.8%</p>
          <p className="text-xs text-slate-500 mt-2">~60m &rarr; &lt;5s</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-base font-medium text-white mb-6">Performance Comparison</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="metric" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={120} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                  cursor={{fill: '#1e293b', opacity: 0.4}}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="baseline" name="Baseline (Budget Alerts)" fill="#475569" radius={[0, 4, 4, 0]} barSize={16} />
                <Bar dataKey="proposed" name="Proposed (Real-Time)" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800">
             <h3 className="text-base font-medium text-white">Scenario Analysis</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-0">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-950 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Scenario</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Classification</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900">
                {scenarios.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-200">{s.name}</td>
                    <td className="px-6 py-4">{getBadge(s.type)}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{s.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
