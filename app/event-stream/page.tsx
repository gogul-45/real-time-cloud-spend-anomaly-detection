'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Activity, Zap, Play, FileText } from 'lucide-react';

export default function EventStreamPage() {
  const { 
    addBillingEvent, addResourceEvent, addDeploymentEvent, addWorkloadMetric, 
    billingEvents, resourceEvents, deploymentEvents, workloadMetrics 
  } = useStore();
  
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<{time: number; msg: string}[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const logEvent = (msg: string) => {
    setLogs(prev => [{time: Date.now(), msg}, ...prev].slice(0, 50));
  };

  const handleGenerateNormal = () => {
    const ts = Date.now();
    addWorkloadMetric({
      eventId: uuidv4(), timestamp: ts, workloadType: 'Video Transcoding', jobsPerHour: 1250,
      activeStreams: 300, cpuUtilization: 45, gpuUtilization: 50, queueDepth: 10, processingTime: 1.2
    });
    logEvent('WORKLOAD_METRIC received');

    setTimeout(() => {
      addBillingEvent({
        eventId: uuidv4(), timestamp: ts + 100, service: 'GPU Compute', resourceId: 'transcoder-gpu-01',
        resourceName: 'Primary Transcoder', region: 'us-east-1', environment: 'production',
        workloadType: 'Video Transcoding', hourlyCost: 480, cumulativeCost: 10000
      });
      logEvent('BILLING_EVENT received (Normal)');
    }, 100);
  };

  const handleInjectCostSpike = () => {
    const ts = Date.now();
    const deployId = uuidv4();
    
    addDeploymentEvent({
      eventId: uuidv4(), deploymentId: deployId, timestamp: ts, application: 'Video Transcoding',
      version: 'v3.0.0', environment: 'production', owner: 'Media Platform Team', changeSummary: 'Major update'
    });
    logEvent('DEPLOYMENT_EVENT received');

    setTimeout(() => {
      addResourceEvent({
        eventId: uuidv4(), timestamp: ts + 100, resourceId: 'transcoder-gpu-01', resourceType: 'GPU Cluster',
        changeType: 'Capacity Increase', previousValue: '4', newValue: '32', changedBy: 'autoscaler'
      });
      logEvent('RESOURCE_CHANGE received');
    }, 100);

    setTimeout(() => {
      addWorkloadMetric({
        eventId: uuidv4(), timestamp: ts + 200, workloadType: 'Video Transcoding', jobsPerHour: 1300,
        activeStreams: 320, cpuUtilization: 50, gpuUtilization: 20, queueDepth: 2, processingTime: 0.5
      });
      logEvent('WORKLOAD_METRIC received');
    }, 200);

    setTimeout(() => {
      addBillingEvent({
        eventId: uuidv4(), timestamp: ts + 300, service: 'GPU Compute', resourceId: 'transcoder-gpu-01',
        resourceName: 'Primary Transcoder', region: 'us-east-1', environment: 'production', deploymentId: deployId,
        workloadType: 'Video Transcoding', hourlyCost: 1550, cumulativeCost: 11550
      });
      logEvent('BILLING_EVENT received (Spike)');
    }, 300);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-12">
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Data Ingestion Simulator</h1>
          <p className="mt-1 text-sm text-slate-400">Manually inject events to test the detection engine.</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-2">Simulation Controls</h3>
          
          <button 
            onClick={handleGenerateNormal}
            className="w-full flex items-center justify-between rounded-md bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <span className="flex items-center"><Activity className="w-4 h-4 mr-2 text-emerald-400" /> Generate Normal Data</span>
            <Play className="w-4 h-4 text-slate-500" />
          </button>

          <button 
            onClick={handleInjectCostSpike}
            className="w-full flex items-center justify-between rounded-md bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <span className="flex items-center"><Zap className="w-4 h-4 mr-2 text-red-400" /> Inject Cost Spike (Anomaly)</span>
            <Play className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-4">Current Data Store</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-400"><span>Billing Events</span> <span className="font-mono text-slate-200">{billingEvents.length}</span></div>
            <div className="flex justify-between text-slate-400"><span>Resource Events</span> <span className="font-mono text-slate-200">{resourceEvents.length}</span></div>
            <div className="flex justify-between text-slate-400"><span>Deployment Events</span> <span className="font-mono text-slate-200">{deploymentEvents.length}</span></div>
            <div className="flex justify-between text-slate-400"><span>Workload Metrics</span> <span className="font-mono text-slate-200">{workloadMetrics.length}</span></div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-950 flex flex-col overflow-hidden">
        <div className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center">
          <FileText className="w-5 h-5 text-slate-400 mr-2" />
          <h3 className="text-base font-medium text-white">Event Stream Log</h3>
        </div>
        <div className="flex-1 p-6 overflow-y-auto font-mono text-sm space-y-2">
          {logs.map((log, i) => (
            <div key={i} className="flex space-x-4 border-b border-slate-800/50 pb-2">
              <span className="text-slate-500 shrink-0">{format(new Date(log.time), 'HH:mm:ss.SSS')}</span>
              <span className={
                log.msg.includes('Spike') ? 'text-red-400 font-semibold' : 
                log.msg.includes('DETECTED') ? 'text-orange-400 font-semibold' :
                'text-slate-300'
              }>
                {log.msg}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-slate-600 text-center mt-10">
              Awaiting events...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
