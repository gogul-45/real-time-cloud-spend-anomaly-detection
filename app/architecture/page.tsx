'use client';

import { useState, useEffect } from 'react';
import { 
  Server, Database, BrainCircuit, LineChart, 
  Settings, Network, ArrowRight, ShieldCheck, Mail
} from 'lucide-react';

export default function ArchitecturePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">System Architecture</h1>
        <p className="mt-1 text-sm text-slate-400">High-level diagram of the Real-Time Anomaly Detection system.</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 overflow-x-auto">
        <div className="min-w-[800px] py-12 flex flex-col items-center space-y-12">
          
          {/* Data Sources */}
          <div className="flex w-full justify-around relative">
            <div className="flex flex-col items-center">
              <div className="w-40 h-24 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-300">
                <Database className="w-6 h-6 mb-2 text-indigo-400" />
                <span className="text-sm font-medium">Billing Stream</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-40 h-24 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-300">
                <Server className="w-6 h-6 mb-2 text-emerald-400" />
                <span className="text-sm font-medium">Resource Events</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-40 h-24 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-300">
                <Network className="w-6 h-6 mb-2 text-amber-400" />
                <span className="text-sm font-medium">Deployments</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-40 h-24 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-300">
                <LineChart className="w-6 h-6 mb-2 text-rose-400" />
                <span className="text-sm font-medium">Workload Metrics</span>
              </div>
            </div>
          </div>

          {/* Ingestion & State */}
          <div className="w-3/4 rounded-xl border border-slate-700 bg-slate-800/50 p-6 flex flex-col items-center text-center relative">
            <div className="absolute -top-12 w-full flex justify-around">
              <ArrowRight className="w-6 h-6 text-slate-600 rotate-90" />
              <ArrowRight className="w-6 h-6 text-slate-600 rotate-90" />
              <ArrowRight className="w-6 h-6 text-slate-600 rotate-90" />
              <ArrowRight className="w-6 h-6 text-slate-600 rotate-90" />
            </div>
            <Settings className="w-8 h-8 mb-3 text-slate-400" />
            <h3 className="text-lg font-medium text-white mb-2">Event Ingestion & Normalization</h3>
            <p className="text-sm text-slate-400">Reconciles out-of-order and duplicate events</p>
          </div>

          {/* Core Engine */}
          <div className="w-2/3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-6 flex flex-col items-center text-center relative">
            <div className="absolute -top-12 w-full flex justify-center">
              <ArrowRight className="w-6 h-6 text-slate-600 rotate-90" />
            </div>
            <BrainCircuit className="w-8 h-8 mb-3 text-indigo-400" />
            <h3 className="text-lg font-medium text-white mb-2">Anomaly Detection Engine</h3>
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              <div className="bg-slate-900 rounded p-3 border border-slate-800 text-sm text-slate-300">Baseline Calculator</div>
              <div className="bg-slate-900 rounded p-3 border border-slate-800 text-sm text-slate-300">Attribution Engine</div>
            </div>
          </div>

          {/* Outputs */}
          <div className="flex w-2/3 justify-around relative">
            <div className="absolute -top-12 w-full flex justify-around">
              <ArrowRight className="w-6 h-6 text-slate-600 rotate-90" />
              <ArrowRight className="w-6 h-6 text-slate-600 rotate-90" />
              <ArrowRight className="w-6 h-6 text-slate-600 rotate-90" />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-48 h-24 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-300">
                <Mail className="w-6 h-6 mb-2 text-indigo-400" />
                <span className="text-sm font-medium">Notification Engine</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-48 h-24 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-300">
                <ShieldCheck className="w-6 h-6 mb-2 text-emerald-400" />
                <span className="text-sm font-medium">Manual Decision Layer</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-48 h-24 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-300">
                <Database className="w-6 h-6 mb-2 text-amber-400" />
                <span className="text-sm font-medium">Audit Trail</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
