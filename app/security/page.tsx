'use client';

import { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Key, 
  FileText, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Server 
} from 'lucide-react';

export default function SecurityPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const rbacMatrix = [
    { permission: 'View Dashboard & Stream', operator: true, finops: true, owner: true, admin: true },
    { permission: 'Acknowledge Anomalies', operator: true, finops: true, owner: true, admin: true },
    { permission: 'Propose Containment Actions', operator: true, finops: true, owner: true, admin: true },
    { permission: 'Execute Manual Overrides', operator: true, finops: false, owner: true, admin: true },
    { permission: 'Modify Detection Thresholds', operator: false, finops: true, owner: false, admin: true },
    { permission: 'Replay Ingestion Streams', operator: true, finops: false, owner: false, admin: true },
    { permission: 'Export Forensic Incident Reports', operator: true, finops: true, owner: true, admin: true },
    { permission: 'Configure Ingestion Endpoints', operator: false, finops: false, owner: false, admin: true },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Security, RBAC & Governance</h1>
          <p className="mt-1 text-sm text-slate-400">
            Enterprise authorization controls, immutable audit logging, and cloud security architecture.
          </p>
        </div>
        <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 text-xs font-mono text-indigo-300">
          Simulated Controls & Production Blueprint
        </div>
      </div>

      {/* RBAC Matrix (Section 22 & 23) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Role-Based Access Control (RBAC) Matrix</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enforces strict segregation of duties between operational response, financial analysis, and administrative configuration.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase">
              <tr>
                <th className="px-6 py-3.5 text-left">Functional Capability</th>
                <th className="px-6 py-3.5 text-center">Operator</th>
                <th className="px-6 py-3.5 text-center">FinOps Analyst</th>
                <th className="px-6 py-3.5 text-center">Service Owner</th>
                <th className="px-6 py-3.5 text-center">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900 text-slate-300">
              {rbacMatrix.map((row) => (
                <tr key={row.permission} className="hover:bg-slate-800/40">
                  <td className="px-6 py-3.5 font-medium text-white">{row.permission}</td>
                  <td className="px-6 py-3.5 text-center">
                    {row.operator ? <span className="text-emerald-400 font-bold">&#10003;</span> : <span className="text-slate-600">&mdash;</span>}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    {row.finops ? <span className="text-emerald-400 font-bold">&#10003;</span> : <span className="text-slate-600">&mdash;</span>}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    {row.owner ? <span className="text-emerald-400 font-bold">&#10003;</span> : <span className="text-slate-600">&mdash;</span>}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    {row.admin ? <span className="text-emerald-400 font-bold">&#10003;</span> : <span className="text-slate-600">&mdash;</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Pillars Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Lock className="w-4 h-4" />
            <h3 className="text-sm font-semibold text-white">Immutable Audit Design</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every status transition, threshold update, and manual override is recorded as an immutable append-only event with cryptographic UUIDs, 
            actor attribution, and timestamping. Entries cannot be modified or deleted through the operator interface.
          </p>
          <div className="flex items-center text-[11px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Prototype Implementation: Append-only Zustand & SQLite state
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
            <h3 className="text-sm font-semibold text-white">Non-Destructive Principle</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The system strictly decouples recommendation generation from destructive execution. The engine will 
            <strong> never automatically delete, scale down, or terminate production nodes</strong> without an explicit, authenticated human-in-the-loop sign-off.
          </p>
          <div className="flex items-center text-[11px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Enforced in engine and recommendation layer
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Key className="w-4 h-4" />
            <h3 className="text-sm font-semibold text-white">Secrets & Credentials Isolation</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Cloud provider IAM credentials, service accounts, and API webhook tokens are stored in environment variables (server-side only) 
            and never exposed to client bundles or browser localStorage.
          </p>
          <div className="flex items-center text-[11px] text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2" />
            Production Target: HashiCorp Vault / AWS Secrets Manager
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Server className="w-4 h-4" />
            <h3 className="text-sm font-semibold text-white">Ingestion Buffer Integrity</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Idempotency checks reject duplicate payloads within a rolling ingestion cache. Sequence number alignment 
            prevents race conditions and guarantees causal correlation across CI/CD and billing streams.
          </p>
          <div className="flex items-center text-[11px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Verified via automated Failure Test Center
          </div>
        </div>
      </div>
    </div>
  );
}
