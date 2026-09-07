'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { 
  ArrowLeft, HardDrive, Package, Activity, Clock, ShieldAlert, 
  CheckCircle2, XCircle, AlertTriangle, FileText
} from 'lucide-react';
import Link from 'next/link';

export default function AnomalyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { anomalies, overrideAnomaly } = useStore();
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overrideData, setOverrideData] = useState({
    user: 'Admin User',
    decision: 'Keep resource unchanged',
    reason: ''
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const anomaly = anomalies.find(a => a.anomalyId === id);

  if (!anomaly) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        Anomaly not found.
      </div>
    );
  }

  const { evidence } = anomaly;
  const notificationLatency = anomaly.notificationTime 
    ? ((anomaly.notificationTime - anomaly.onsetTime) / 1000).toFixed(1) 
    : 'N/A';
    
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'WARNING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    overrideAnomaly(anomaly.anomalyId, overrideData.decision, overrideData.reason, overrideData.user);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Anomaly Investigation</h1>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getSeverityColor(anomaly.severity)}`}>
                {anomaly.severity}
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                {anomaly.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400 font-mono text-xs">{anomaly.anomalyId}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          {anomaly.status === 'OPEN' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-900"
            >
              Manual Override
            </button>
          )}
          <Link href="/audit" className="flex items-center rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">
            <FileText className="mr-2 h-4 w-4" />
            Audit Log
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Summary & Timings */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-base font-medium text-white mb-4">Detection Timeline</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/60">
                <span className="text-sm text-slate-400">Onset Time</span>
                <span className="text-sm text-slate-200">{format(new Date(anomaly.onsetTime), 'HH:mm:ss')}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/60">
                <span className="text-sm text-slate-400">Detection Time</span>
                <span className="text-sm text-slate-200">{format(new Date(anomaly.detectionTime), 'HH:mm:ss')}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/60">
                <span className="text-sm text-slate-400">Owner Notified</span>
                <span className="text-sm text-slate-200">
                  {anomaly.notificationTime ? format(new Date(anomaly.notificationTime), 'HH:mm:ss') : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-medium text-slate-300">Notification Latency</span>
                <span className="text-sm font-bold text-indigo-400">{notificationLatency}s</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-base font-medium text-white mb-4">Ownership</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Accountable Team</span>
                <span className="text-sm font-medium text-slate-200">{anomaly.owner}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Notification Status</span>
                <span className="text-sm text-slate-200 flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" />
                  Delivered
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle/Right Column: Evidence & Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-base font-medium text-white mb-4">Anomaly Explanation</h3>
            <div className="rounded-md bg-slate-950 p-4 border border-slate-800 space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">What Happened?</span>
                <p className="text-sm text-slate-300">
                  Hourly cloud spend for <strong className="text-white">{anomaly.resourceId}</strong> increased by <strong className="text-red-400">{evidence.percentageIncrease.toFixed(1)}%</strong> above the expected baseline.
                </p>
              </div>
              
              {evidence.resourceChanges.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">What Changed?</span>
                  <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                    {evidence.resourceChanges.map(rc => (
                      <li key={rc.eventId}>
                        {rc.resourceType} capacity changed: <strong className="text-slate-400">{rc.previousValue}</strong> &rarr; <strong className="text-white">{rc.newValue}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {evidence.deployments.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Which Deployment?</span>
                  <div className="text-sm text-slate-300 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-indigo-400" />
                    {evidence.deployments[0].deploymentId} / {evidence.deployments[0].application} {evidence.deployments[0].version}
                  </div>
                </div>
              )}

              {evidence.workloadBefore && evidence.workloadAfter && (
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Workload Evidence</span>
                  <p className="text-sm text-slate-300">
                    Workload ({evidence.workloadAfter.workloadType}) changed from {evidence.workloadBefore.jobsPerHour} to {evidence.workloadAfter.jobsPerHour} jobs/hr.
                  </p>
                  <p className="text-sm text-amber-400 mt-2 p-3 bg-amber-500/10 rounded border border-amber-500/20">
                    <AlertTriangle className="inline w-4 h-4 mr-1.5 -mt-0.5" />
                    <strong>Why is this suspicious:</strong> Resource growth is significantly higher than workload growth.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-base font-medium text-white mb-4">Billing Impact</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Baseline Cost (avg)</p>
                  <p className="text-2xl font-medium text-slate-300">$${evidence.costBaseline.toFixed(2)}<span className="text-sm text-slate-500">/hr</span></p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Actual Cost</p>
                  <p className="text-2xl font-medium text-red-400">$${evidence.costActual.toFixed(2)}<span className="text-sm text-red-500/50">/hr</span></p>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-sm text-slate-400 mb-1">Z-Score</p>
                  <div className="flex items-center">
                    <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-sm font-mono text-slate-300">
                      {anomaly.anomalyScore.toFixed(2)}
                    </span>
                    <span className="ml-3 text-xs text-slate-500">(&gt; 2.0 indicates severe outlier)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-base font-medium text-white mb-4">Recommended Action</h3>
              <div className="p-4 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                <ShieldAlert className="w-6 h-6 text-indigo-400 mb-2" />
                <p className="text-sm text-indigo-100 leading-relaxed">
                  {anomaly.recommendedAction}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Override Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-1">Manual Override</h2>
            <p className="text-sm text-slate-400 mb-6">Review the anomaly and record a manual decision.</p>
            
            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">User</label>
                <input 
                  type="text" 
                  value={overrideData.user}
                  onChange={e => setOverrideData({...overrideData, user: e.target.value})}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Decision</label>
                <select
                  value={overrideData.decision}
                  onChange={e => setOverrideData({...overrideData, decision: e.target.value})}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option>Keep resource unchanged (Suppress)</option>
                  <option>Approve recommended action (Rollback)</option>
                  <option>Escalate to engineering</option>
                  <option>False positive (Ignore)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Reason / Comment</label>
                <textarea 
                  value={overrideData.reason}
                  onChange={e => setOverrideData({...overrideData, reason: e.target.value})}
                  rows={3}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., Live sports event currently running, scaling is legitimate."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                  Save Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
