'use client';

import { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Trash2, 
  Lock, 
  Eye, 
  EyeOff, 
  Database, 
  CheckCircle2, 
  Clock, 
  Sparkles 
} from 'lucide-react';
import { DEFAULT_RETENTION_POLICIES, maskPII } from '@/lib/governance/retention';
import { useStore } from '@/store/useStore';

export default function GovernancePage() {
  const { billingEvents, auditTrail, anomalies, addSystemLog } = useStore();
  const [purgeStatus, setPurgeStatus] = useState<string | null>(null);
  const [sampleRawText, setSampleRawText] = useState(
    'Audit: User john.doe@cloudsentinel.io executed scaling override on AWS Account 123456789012 instance 10.240.12.98'
  );
  const [maskedOutput, setMaskedOutput] = useState<string | null>(null);

  const handleSimulatePurge = () => {
    setPurgeStatus('Executing retention policy scan...');
    setTimeout(() => {
      const archived = Math.round(billingEvents.length * 0.2);
      setPurgeStatus(`Policy Check Completed: ${billingEvents.length} events scanned. ${archived} records past 30-day window marked for Glacier cold archival. Audit records retained permanently under SOX 404.`);
      addSystemLog({
        level: 'INFO',
        message: `Data Retention Purge simulation completed. ${archived} raw events archived.`,
        source: 'governance'
      });
    }, 600);
  };

  const handleMaskTest = () => {
    setMaskedOutput(maskPII(sampleRawText));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
            Data Retention, Privacy & Compliance Governance
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise retention schedules, automated cold-storage tiering, SOX 404 audit preservation, and PII anonymization.
          </p>
        </div>
        <button
          onClick={handleSimulatePurge}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Simulate Policy Archival Run
        </button>
      </div>

      {purgeStatus && (
        <div className="rounded-lg p-3.5 border border-emerald-500/30 bg-emerald-950/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{purgeStatus}</span>
        </div>
      )}

      {/* Retention Policies Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-400" />
          Configured Retention Policies & Tiers
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono">
              <tr>
                <th className="p-3">Data Domain</th>
                <th className="p-3">Retention Period</th>
                <th className="p-3">Storage Tier</th>
                <th className="p-3">Compliance Standard</th>
                <th className="p-3">Lifecycle Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {DEFAULT_RETENTION_POLICIES.map((p) => (
                <tr key={p.dataType} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-medium text-white">{p.dataType}</td>
                  <td className="p-3 font-mono text-indigo-300">{p.retentionDays} days</td>
                  <td className="p-3">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                      {p.storageTier}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{p.complianceRequirement}</td>
                  <td className="p-3 text-emerald-400 font-mono text-[11px]">
                    {p.storageTier === 'IMMUTABLE_WORM' ? 'Locked (WORM)' : 'Tier to Glacier'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PII & Account Redaction Testbed */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-indigo-400" />
            PII & Cloud Credential Anonymization Sandbox
          </h2>
          <span className="text-xs text-slate-400">GDPR & SOC2 Privacy Guard</span>
        </div>
        <p className="text-xs text-slate-400">
          Redacts 12-digit AWS Account IDs, operator email addresses, and private cluster IPs before streaming to non-admin UI.
        </p>
        <div className="space-y-3">
          <textarea
            value={sampleRawText}
            onChange={(e) => setSampleRawText(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
            rows={2}
          />
          <button
            onClick={handleMaskTest}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Test PII Masking Algorithm
          </button>
          {maskedOutput && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs font-mono text-emerald-300">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Masked Output:</span>
              {maskedOutput}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
