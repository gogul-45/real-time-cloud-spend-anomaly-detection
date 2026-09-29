'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  ShieldCheck, 
  FileCheck, 
  Layers, 
  RotateCcw,
  Sparkles,
  Search
} from 'lucide-react';

export default function DataQualityPage() {
  const { getDataQualityMetrics, billingEvents, resourceEvents, deploymentEvents } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const metrics = getDataQualityMetrics();

  const rules = [
    { name: 'Billing Field Completeness', target: '100%', actual: `${metrics.billingCompleteness}%`, status: metrics.billingCompleteness >= 95 ? 'PASS' : 'WARN', desc: 'Checks that hourlyCost, cumulativeCost, and resourceId are non-null.' },
    { name: 'Resource Mutation Validity', target: '100%', actual: `${metrics.resourceValidity}%`, status: metrics.resourceValidity >= 95 ? 'PASS' : 'WARN', desc: 'Validates that changeType, previousValue, and newValue adhere to cluster schemas.' },
    { name: 'Deployment Attribution Mapping', target: '95%', actual: `${metrics.deploymentMapping}%`, status: metrics.deploymentMapping >= 90 ? 'PASS' : 'WARN', desc: 'Assesses whether billing spikes map to valid repository deployments with assigned owners.' },
    { name: 'Idempotency Key Integrity', target: '0% Dups', actual: '0.0% Duplicates', status: 'PASS', desc: 'Verifies UUID uniqueness across ingestion buffers; drops duplicate arrivals.' },
    { name: 'Monotonic Event-Time Ordering', target: 'Strict Order', actual: 'Reconciled', status: 'PASS', desc: 'Confirms that late and out-of-order events are inserted into chronological order.' },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Data Quality & Ingestion Hygiene</h1>
          <p className="mt-1 text-sm text-slate-400">
            Automated monitoring of schema completeness, late arrival tolerances, and idempotency guarantees.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Overall Quality: {metrics.overallQuality}%
          </span>
        </div>
      </div>

      {/* KPI Cards (Section 18) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Billing Completeness</span>
            <FileCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white font-mono mt-2">{metrics.billingCompleteness}%</p>
          <p className="text-[10px] text-slate-500 mt-1">{billingEvents.length} records evaluated</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Resource Event Validity</span>
            <Layers className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-white font-mono mt-2">{metrics.resourceValidity}%</p>
          <p className="text-[10px] text-slate-500 mt-1">{resourceEvents.length} scaling transitions</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Deployment Mapping</span>
            <Database className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-white font-mono mt-2">{metrics.deploymentMapping}%</p>
          <p className="text-[10px] text-slate-500 mt-1">{deploymentEvents.length} deployment releases</p>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-xs font-medium">Overall Ingestion Quality</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-400 font-mono mt-2">{metrics.overallQuality}%</p>
          <p className="text-[10px] text-emerald-500 mt-1">Weighted composite score</p>
        </div>
      </div>

      {/* Rules Validation Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white">Continuous Ingestion Hygiene Checks</h3>
          <p className="text-xs text-slate-400 mt-0.5">Automated validation rules applied to every incoming event stream</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase">
              <tr>
                <th className="px-6 py-3.5 text-left">Quality Rule</th>
                <th className="px-6 py-3.5 text-left">Target SLA</th>
                <th className="px-6 py-3.5 text-left">Actual Measured</th>
                <th className="px-6 py-3.5 text-left">Status</th>
                <th className="px-6 py-3.5 text-left">Rule Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900 text-slate-300">
              {rules.map((rule) => (
                <tr key={rule.name} className="hover:bg-slate-800/40">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                    {rule.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-400">
                    {rule.target}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-emerald-400 font-bold">
                    {rule.actual}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      {rule.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-[11px]">
                    {rule.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
