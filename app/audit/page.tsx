'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { FileText, User, Settings, ShieldAlert, Zap, Search } from 'lucide-react';
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
    (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getActorIcon = (actor: string) => {
    if (actor === 'System' || actor.includes('Engine')) return <Settings className="w-4 h-4 text-slate-500" />;
    if (actor.includes('Notif')) return <Zap className="w-4 h-4 text-amber-500" />;
    return <User className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Audit Trail</h1>
          <p className="mt-1 text-sm text-slate-400">Immutable record of system events and manual decisions.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search logs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 rounded-md border border-slate-700 bg-slate-900 py-2 pl-9 pr-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-48">Timestamp</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-40">Actor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Reason / Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-32">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900">
              {filteredLogs.map((log) => (
                <tr key={log.auditId} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 text-sm text-slate-300 align-top">
                    <div className="font-mono text-xs">{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300 align-top">
                    <div className="flex items-center">
                      {getActorIcon(log.actor)}
                      <span className="ml-2 font-medium">{log.actor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm align-top">
                    <span className={`inline-flex items-center rounded bg-slate-800 px-2 py-1 text-xs font-medium ${
                      log.action.includes('Manual Override') ? 'text-indigo-400 border border-indigo-500/20' :
                      log.action.includes('Anomaly Detected') ? 'text-red-400 border border-red-500/20' :
                      log.action.includes('Duplicate') ? 'text-yellow-400 border border-yellow-500/20' :
                      'text-slate-300'
                    }`}>
                      {log.action}
                    </span>
                    {log.newState && (
                      <span className="ml-2 text-xs text-slate-500 font-mono">
                        &rarr; {log.newState}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 align-top break-words max-w-md">
                    {log.reason || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 align-top">
                    {log.anomalyId ? (
                      <Link href={`/anomalies/${log.anomalyId}`} className="text-indigo-400 hover:text-indigo-300 flex items-center text-xs font-mono">
                        <ShieldAlert className="w-3 h-3 mr-1" />
                        {log.anomalyId.substring(0, 8)}...
                      </Link>
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                    <FileText className="mx-auto h-8 w-8 text-slate-700 mb-3" />
                    No audit records found.
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
