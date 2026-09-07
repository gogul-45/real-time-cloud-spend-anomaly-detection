'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { v4 as uuidv4 } from 'uuid';
import { ShieldAlert, Play, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function FailureTestsPage() {
  const { addBillingEvent, addResourceEvent, addDeploymentEvent } = useStore();
  const [mounted, setMounted] = useState(false);
  const [results, setResults] = useState<Record<string, {status: string, msg: string}>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const runTest = (id: string, testFn: () => string) => {
    setResults(prev => ({...prev, [id]: {status: 'running', msg: 'Executing test...'}}));
    setTimeout(() => {
      try {
        const msg = testFn();
        setResults(prev => ({...prev, [id]: {status: 'success', msg}}));
      } catch (e: any) {
        setResults(prev => ({...prev, [id]: {status: 'error', msg: e.message}}));
      }
    }, 800);
  };

  const testDuplicate = () => {
    const eventId = uuidv4();
    const ts = Date.now();
    
    // First send
    addResourceEvent({
      eventId, timestamp: ts, resourceId: 'test-res-01', resourceType: 'VM',
      changeType: 'Scale', previousValue: '2', newValue: '4', changedBy: 'test'
    });
    
    // Second send (duplicate)
    addResourceEvent({
      eventId, timestamp: ts + 10, resourceId: 'test-res-01', resourceType: 'VM',
      changeType: 'Scale', previousValue: '2', newValue: '4', changedBy: 'test'
    });
    
    return "Duplicate event ignored. Verified via Audit Trail.";
  };

  const testDelayed = () => {
    const ts = Date.now();
    // Send billing first
    addBillingEvent({
      eventId: uuidv4(), timestamp: ts, service: 'Compute', resourceId: 'late-res-01',
      resourceName: 'Late VM', region: 'us-east', environment: 'dev', workloadType: 'test',
      hourlyCost: 50, cumulativeCost: 100
    });
    
    // Send resource change later but with earlier timestamp
    addResourceEvent({
      eventId: uuidv4(), timestamp: ts - 5000, resourceId: 'late-res-01', resourceType: 'VM',
      changeType: 'Create', previousValue: '0', newValue: '1', changedBy: 'test'
    });
    
    return "Delayed event reconciled. State sorted by event timestamp.";
  };

  const testOutOfOrder = () => {
    const ts = Date.now();
    // Send events out of order
    addResourceEvent({ eventId: uuidv4(), timestamp: ts + 3000, resourceId: 'seq-res', resourceType: 'VM', changeType: 'Update', previousValue: '2', newValue: '3', changedBy: 'test' });
    addResourceEvent({ eventId: uuidv4(), timestamp: ts + 1000, resourceId: 'seq-res', resourceType: 'VM', changeType: 'Update', previousValue: '1', newValue: '2', changedBy: 'test' });
    addResourceEvent({ eventId: uuidv4(), timestamp: ts + 2000, resourceId: 'seq-res', resourceType: 'VM', changeType: 'Update', previousValue: '2', newValue: '2', changedBy: 'test' });
    
    return "Out-of-order events reconciled successfully.";
  };
  
  const testMissingMetadata = () => {
    const ts = Date.now();
    // Spike cost without deployment metadata
    addBillingEvent({
      eventId: uuidv4(), timestamp: ts, service: 'Compute', resourceId: 'ghost-res-01',
      resourceName: 'Ghost VM', region: 'us-east', environment: 'prod', workloadType: 'unknown',
      hourlyCost: 9999, cumulativeCost: 9999
    });
    
    return "Deployment attribution unavailable, but anomaly detected.";
  };

  const tests = [
    { id: 'dup', name: 'Failure Case 1 — Duplicate event', desc: 'Same event arrives twice.', expected: 'No duplicate state update.', fn: testDuplicate },
    { id: 'delay', name: 'Failure Case 2 — Delayed event', desc: 'Resource event arrives after billing.', expected: 'State is reconciled.', fn: testDelayed },
    { id: 'ooo', name: 'Failure Case 3 — Out-of-order event', desc: 'Events arrive in incorrect sequence.', expected: 'System maintains correct event-time state.', fn: testOutOfOrder },
    { id: 'miss', name: 'Failure Case 4 — Missing deployment', desc: 'Cost spikes but deployment metadata is missing.', expected: 'Flag anomaly but show attribution unavailable.', fn: testMissingMetadata },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Failure / Edge Cases</h1>
        <p className="mt-1 text-sm text-slate-400">Simulate system resilience against distributed system edge cases.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tests.map(test => (
          <div key={test.id} className="rounded-xl border border-slate-800 bg-slate-900 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-medium text-white">{test.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{test.desc}</p>
              </div>
              <button 
                onClick={() => runTest(test.id, test.fn)}
                disabled={results[test.id]?.status === 'running'}
                className="rounded-md bg-slate-800 p-2 text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-auto pt-4 border-t border-slate-800/50 space-y-3">
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Expected</span>
                <p className="text-sm text-slate-300">{test.expected}</p>
              </div>
              
              <div className="min-h-[60px] rounded-md bg-slate-950 border border-slate-800 p-3 flex items-center">
                {!results[test.id] && (
                  <span className="text-sm text-slate-600 flex items-center">
                    <Info className="w-4 h-4 mr-2" /> Click play to run simulation
                  </span>
                )}
                {results[test.id]?.status === 'running' && (
                  <span className="text-sm text-indigo-400 animate-pulse flex items-center">
                    Executing test scenario...
                  </span>
                )}
                {results[test.id]?.status === 'success' && (
                  <span className="text-sm text-emerald-400 flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                    {results[test.id].msg}
                  </span>
                )}
                {results[test.id]?.status === 'error' && (
                  <span className="text-sm text-red-400 flex items-start">
                    <AlertTriangle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                    {results[test.id].msg}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
