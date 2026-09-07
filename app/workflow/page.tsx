'use client';

import { useState, useEffect } from 'react';
import { 
  Server, Network, Database, BrainCircuit, Search, 
  Bell, UserCheck, ShieldCheck, ArrowRight
} from 'lucide-react';

export default function WorkflowPage() {
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 12);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const steps = [
    { id: 1, name: 'Workload arrives', icon: Network, group: 'Ingestion' },
    { id: 2, name: 'Cloud resources scale', icon: Server, group: 'Ingestion' },
    { id: 3, name: 'Billing events arrive', icon: Database, group: 'Ingestion' },
    { id: 4, name: 'Detector calculates baseline', icon: BrainCircuit, group: 'Detection' },
    { id: 5, name: 'Anomaly detected', icon: Search, group: 'Detection' },
    { id: 6, name: 'Resource identified', icon: Server, group: 'Attribution' },
    { id: 7, name: 'Deployment identified', icon: Network, group: 'Attribution' },
    { id: 8, name: 'Evidence assembled', icon: Database, group: 'Attribution' },
    { id: 9, name: 'Owner notified', icon: Bell, group: 'Response' },
    { id: 10, name: 'Human reviews', icon: UserCheck, group: 'Response' },
    { id: 11, name: 'Action approved/rejected', icon: ShieldCheck, group: 'Response' },
    { id: 12, name: 'Audit trail updated', icon: Database, group: 'Resolution' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Operational Workflow</h1>
        <p className="mt-1 text-sm text-slate-400">End-to-end lifecycle of an anomalous cloud event.</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          
          {['Ingestion', 'Detection', 'Attribution', 'Response'].map((group, idx) => (
            <div key={group} className="space-y-4 relative z-10">
              <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-6 text-center">{group}</h3>
              <div className="space-y-4">
                {steps.filter(s => s.group === group).map((step) => {
                  const isActive = steps.findIndex(s => s.id === step.id) === activeStep;
                  const isPast = steps.findIndex(s => s.id === step.id) < activeStep;
                  
                  return (
                    <div 
                      key={step.id} 
                      className={`relative flex items-center p-4 rounded-lg border transition-all duration-300 ${
                        isActive ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-105 z-20' : 
                        isPast ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 
                        'bg-slate-900/50 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 shrink-0 ${
                        isActive ? 'bg-indigo-500 text-white' : 
                        isPast ? 'bg-slate-700 text-slate-300' : 
                        'bg-slate-800 text-slate-600'
                      }`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-xs font-mono mb-1 ${isActive ? 'text-indigo-300' : 'text-slate-500'}`}>Step {step.id}</p>
                        <p className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>{step.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Desktop connecting lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-slate-800/50 -z-0"></div>
        </div>
      </div>
    </div>
  );
}
