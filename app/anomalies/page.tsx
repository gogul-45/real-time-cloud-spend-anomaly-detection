'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { ShieldAlert, HardDrive, Filter, Activity } from 'lucide-react';

export default function AnomaliesPage() {
  const { anomalies } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Anomalies</h1>
          <p className="mt-1 text-sm text-slate-400">View and investigate detected cloud spend anomalies.</p>
        </div>
        <button className="flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 border border-slate-800 hover:bg-slate-800 transition-colors">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Detection Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Severity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Resource</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Cost Increase</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Owner</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Notification</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900">
              {anomalies.map((anomaly) => (
                <tr key={anomaly.anomalyId} className="hover:bg-slate-800/50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                    <div>{format(new Date(anomaly.detectionTime), 'MMM dd, yyyy')}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{format(new Date(anomaly.detectionTime), 'HH:mm:ss.SSS')}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                    <div className="flex flex-col">
                      <span className="flex items-center">
                        <HardDrive className="h-3 w-3 mr-1.5 text-slate-500" />
                        {anomaly.resourceId}
                      </span>
                      <span className="text-xs text-slate-500 mt-1">{anomaly.service}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-red-400">+{anomaly.evidence.percentageIncrease.toFixed(1)}%</span>
                      <span className="text-xs text-slate-500 mt-1">
                        $${anomaly.evidence.costBaseline.toFixed(0)} &rarr; $${anomaly.evidence.costActual.toFixed(0)}/hr
                      </span>
                    </div>
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
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                    {anomaly.notificationStatus === 'SENT' ? (
                      <span className="text-emerald-400 text-xs">Sent at {format(new Date(anomaly.notificationTime || anomaly.detectionTime), 'HH:mm:ss')}</span>
                    ) : (
                      <span className="text-slate-500 text-xs">Pending</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link href={`/anomalies/${anomaly.anomalyId}`} className="text-indigo-400 hover:text-indigo-300">
                      Investigate &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
              {anomalies.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500">
                    <ShieldAlert className="mx-auto h-8 w-8 text-slate-700 mb-3" />
                    No anomalies have been detected.
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
