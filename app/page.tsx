'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { loadDemoScenario } from '@/lib/demoData';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ComposedChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { format } from 'date-fns';
import { ShieldAlert, ArrowUpRight, ArrowDownRight, Clock, Activity, HardDrive } from 'lucide-react';

export default function Dashboard() {
  const { billingEvents, workloadMetrics, anomalies, isSimulating } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (billingEvents.length === 0) {
      loadDemoScenario();
    }
  }, [billingEvents.length]);

  if (!mounted) return null;

  // KPI Calculations
  const latestBilling = billingEvents[billingEvents.length - 1];
  const previousBilling = billingEvents[billingEvents.length - 2];
  
  const currentSpend = latestBilling?.hourlyCost || 0;
  const previousSpend = previousBilling?.hourlyCost || 0;
  
  const spendVariance = previousSpend > 0 ? ((currentSpend - previousSpend) / previousSpend) * 100 : 0;
  
  const activeAnomalies = anomalies.filter(a => a.status === 'OPEN').length;
  const criticalAnomalies = anomalies.filter(a => a.status === 'OPEN' && a.severity === 'CRITICAL').length;
  
  // Chart Data: Spend Trend
  const spendData = billingEvents.slice(-24).map(e => ({
    time: format(new Date(e.timestamp), 'HH:mm'),
    cost: e.hourlyCost,
  }));

  // Chart Data: Workload vs Spend
  const workloadSpendData = billingEvents.slice(-24).map(e => {
    const wl = workloadMetrics.find(w => w.timestamp === e.timestamp);
    return {
      time: format(new Date(e.timestamp), 'HH:mm'),
      cost: e.hourlyCost,
      workload: wl ? wl.jobsPerHour : 0
    };
  });

  // Chart Data: Resource contribution (simulated based on latest)
  const resourceData = [
    { name: 'transcoder-gpu-01', value: currentSpend },
    { name: 'livestream-cluster-01', value: 240 },
    { name: 'rendering-cluster-01', value: 180 },
    { name: 'video-worker-01', value: 90 },
  ];
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'WARNING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Banner */}
      {isSimulating && (
        <div className="rounded-md border border-indigo-500/30 bg-indigo-500/10 p-4">
          <div className="flex items-center">
            <Activity className="h-5 w-5 animate-pulse text-indigo-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-indigo-300">Live Simulation Active</h3>
              <p className="text-xs text-indigo-400/80 mt-1">Events are being ingested and analyzed in real-time.</p>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">Current Hourly Spend</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800">
              <span className="text-slate-300">$</span>
            </span>
          </div>
          <div className="mt-4 flex items-baseline">
            <p className="text-3xl font-semibold text-white">$${currentSpend.toFixed(0)}</p>
            <p className={`ml-2 flex items-baseline text-sm font-semibold ${spendVariance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {spendVariance > 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
              {Math.abs(spendVariance).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">Active Anomalies</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800">
              <ShieldAlert className="h-4 w-4 text-slate-300" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-semibold text-white">{activeAnomalies}</p>
            <p className="mt-1 text-sm text-slate-400">
              <span className="text-red-400 font-medium">{criticalAnomalies} critical</span> requiring action
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">Avg Detection Latency</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800">
              <Clock className="h-4 w-4 text-slate-300" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline">
            <p className="text-3xl font-semibold text-white">4.2s</p>
            <p className="ml-2 text-sm text-slate-400">Target: &lt;5s</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">Notification Latency</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800">
              <Activity className="h-4 w-4 text-slate-300" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline">
            <p className="text-3xl font-semibold text-white">12.5s</p>
            <p className="ml-2 text-sm text-slate-400">Target: &lt;30s</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-base font-medium text-white mb-6">Hourly Spend Trend (24h)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Line type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#6366f1', stroke: '#0f172a' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-base font-medium text-white mb-6">Spend vs Workload</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={workloadSpendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar yAxisId="right" dataKey="workload" fill="#334155" name="Workload (Jobs/hr)" radius={[2, 2, 0, 0]} />
                <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={2} dot={false} name="Cost ($/hr)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="border-b border-slate-800 px-6 py-4 flex justify-between items-center">
          <h3 className="text-base font-medium text-white">Recent Anomalies</h3>
          <Link href="/anomalies" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            View All &rarr;
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Severity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Resource</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Cost Inc.</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Owner</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900">
              {anomalies.slice(0, 5).map((anomaly) => (
                <tr key={anomaly.anomalyId} className="hover:bg-slate-800/50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                    {format(new Date(anomaly.detectionTime), 'HH:mm:ss')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                    <div className="flex items-center">
                      <HardDrive className="h-4 w-4 mr-2 text-slate-500" />
                      {anomaly.resourceId}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-red-400">
                    +{anomaly.evidence.percentageIncrease.toFixed(0)}%
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                    {anomaly.owner}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {anomaly.status === 'OPEN' ? (
                      <span className="text-yellow-400 flex items-center"><Activity className="w-3 h-3 mr-1 animate-pulse" /> Investigating</span>
                    ) : (
                      <span className="text-slate-400">{anomaly.status}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link href={`/anomalies/${anomaly.anomalyId}`} className="text-indigo-400 hover:text-indigo-300">
                      Investigate
                    </Link>
                  </td>
                </tr>
              ))}
              {anomalies.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                    No anomalies detected recently.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
