'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { FileText, User, Settings, ShieldAlert, Zap, Search, Download, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AuditTrailPage() {
  const { auditTrail } = useStore();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredLogs = auditTrail.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.role && log.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getActorIcon = (actor: string) => {
    if (actor === 'System' || actor.includes('Engine') || actor.includes('Reconciliation')) return <Settings className="w-4 h-4 text-slate-500" />;
    if (actor.includes('Notif')) return <Zap className="w-4 h-4 text-amber-500" />;
    return <User className="w-4 h-4 text-indigo-400" />;
  };

  const handleExportCSV = () => {
    const header = "AuditId,Timestamp,Actor,Role,Action,NewState,Reason,AnomalyId\n";
    const rows = filteredLogs.map(l => 
      `"${l.auditId}","${new Date(l.timestamp).toISOString()}","${l.actor}","${l.role || ''}","${l.action}","${l.newState || ''}","${(l.reason || '').replace(/"/g, '""')}","${l.anomalyId || ''}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Immutable Audit Trail</h1>
          <p className="mt-1 text-sm text-slate-400">
            Append-only verification log of system detections, role transitions, and manual human overrides.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search audit trail..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-60 rounded-md border border-slate-700 bg-slate-900 py-1.5 pl-9 pr-4 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center rounded-md bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left w-48">Timestamp</th>
                <th scope="col" className="px-6 py-3.5 text-left w-44">Actor & Role</th>
                <th scope="col" className="px-6 py-3.5 text-left">Action Executed</th>
                <th scope="col" className="px-6 py-3.5 text-left">Justification / Technical Details</th>
                <th scope="col" className="px-6 py-3.5 text-left w-36">Incident Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900 text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.auditId} className="hover:bg-slate-800/30">
                  <td className="px-6 py-3.5 align-top font-mono text-slate-400 whitespace-nowrap">
                    {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td className="px-6 py-3.5 align-top whitespace-nowrap">
                    <div className="flex items-center">
                      {getActorIcon(log.actor)}
                      <span className="ml-2 font-medium text-white">{log.actor}</span>
                    </div>
                    {log.role && (
                      <span className="text-[10px] text-indigo-400 font-mono ml-6 block">
                        Role: {log.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 align-top">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium font-mono ${
                      log.action.includes('Manual Override') ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold' :
                      log.action.includes('Anomaly Detected') ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      log.action.includes('Duplicate') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      log.action.includes('Reconciled') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {log.action}
                    </span>
                    {log.newState && (
                      <span className="ml-2 text-xs text-slate-400 font-mono">
                        &rarr; {log.newState}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 align-top text-slate-400 break-words max-w-md">
                    {log.reason || '-'}
                  </td>
                  <td className="px-6 py-3.5 align-top whitespace-nowrap">
                    {log.anomalyId ? (
                      <Link href={`/anomalies/${log.anomalyId}`} className="text-indigo-400 hover:text-indigo-300 flex items-center font-mono">
                        <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                        {log.anomalyId.substring(0, 10)}...
                      </Link>
                    ) : (
                      <span className="text-slate-600">&mdash;</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <FileText className="mx-auto h-8 w-8 text-slate-700 mb-2" />
                    No audit records match search.
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
