'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { ShieldAlert, Search, Filter, ArrowRight, Download, CheckCircle2 } from 'lucide-react';
import { Severity, IncidentStatus } from '@/types';

export default function AnomaliesPage() {
  const { anomalies } = useStore();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'WARNING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'APPROVED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'ACTION_PROPOSED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'ACKNOWLEDGED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'INVESTIGATING':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  const filtered = anomalies.filter(a => {
    const matchesSearch = 
      a.resourceId.toLowerCase().includes(search.toLowerCase()) ||
      a.anomalyId.toLowerCase().includes(search.toLowerCase()) ||
      a.service.toLowerCase().includes(search.toLowerCase()) ||
      a.owner.toLowerCase().includes(search.toLowerCase());
    
    const matchesSeverity = selectedSeverity === 'ALL' || a.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cloud Spend Anomalies</h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time multi-signal incident investigation, attribution, and containment workflow.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by resource, service, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 py-1.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 shrink-0">Severity:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 py-1.5 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="WARNING">Warning</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 shrink-0">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 py-1.5 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Lifecycle Statuses</option>
            <option value="DETECTED">Detected</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="ACTION_PROPOSED">Action Proposed</option>
            <option value="APPROVED">Approved (Override)</option>
            <option value="RESOLVED">Resolved</option>
            <option value="SUPPRESSED">Suppressed</option>
          </select>
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-950">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Detection Time</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Severity / Score</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Resource & Service</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Spend Surge</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Accountable Owner</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Lifecycle Status</th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900 text-xs">
              {filtered.map((anomaly) => (
                <tr key={anomaly.anomalyId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-slate-300 font-mono">
                    {format(new Date(anomaly.detectionTime), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold ${getSeverityBadge(anomaly.severity)}`}>
                        {anomaly.severity}
                      </span>
                      <span className="font-mono text-slate-300 font-semibold">
                        {(anomaly.compositeScore || anomaly.anomalyScore).toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{anomaly.resourceId}</div>
                    <div className="text-slate-400 text-[11px]">{anomaly.service}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-white">
                    <div className="font-semibold text-red-400">
                      ${anomaly.evidence.costActual.toFixed(2)}/hr
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Baseline: ${anomaly.evidence.costBaseline.toFixed(2)}/hr (+{anomaly.evidence.percentageIncrease.toFixed(0)}%)
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-300">
                    <div className="font-medium">{anomaly.owner}</div>
                    <div className="text-[10px] text-slate-500">Channel: Multi-channel (Slack/Email)</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadge(anomaly.status)}`}>
                      {anomaly.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <Link
                      href={`/anomalies/${anomaly.anomalyId}`}
                      className="inline-flex items-center rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-900"
                    >
                      Investigate
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <ShieldAlert className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                    No anomalies match current filter criteria.
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
