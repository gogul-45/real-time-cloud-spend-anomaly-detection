'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { v4 as uuidv4 } from 'uuid';
import { 
  Activity, 
  Play, 
  RotateCcw, 
  Layers, 
  Server, 
  Database, 
  TrendingUp, 
  Send, 
  CheckCircle2, 
  Clock, 
  History 
} from 'lucide-react';
import { format } from 'date-fns';

export default function EventStreamPage() {
  const { 
    billingEvents, 
    resourceEvents, 
    deploymentEvents, 
    workloadMetrics,
    addBillingEvent, 
    addResourceEvent, 
    addDeploymentEvent, 
    replayEvents 
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'billing' | 'resources' | 'deployments' | 'workloads'>('billing');
  
  // Custom Injection state
  const [customCost, setCustomCost] = useState(240);
  const [customResource, setCustomResource] = useState('GPU-TRANSCODER-07');
  const [injectSuccess, setInjectSuccess] = useState<string | null>(null);

  // Replay State
  const [replayCount, setReplayCount] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleInjectCustomSpike = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    addBillingEvent({
      eventId: uuidv4(),
      timestamp: now,
      service: 'GPU Compute',
      resourceId: customResource,
      resourceName: 'Manual Injected Fleet',
      region: 'us-east-1',
      environment: 'production',
      workloadType: 'video-transcoding',
      hourlyCost: Number(customCost),
      cumulativeCost: 5000
    });
    setInjectSuccess(`Injected $${customCost}/hr billing surge on ${customResource}. System evaluated in real-time.`);
    setTimeout(() => setInjectSuccess(null), 4000);
  };

  const handleReplayLastHour = () => {
    const now = Date.now();
    const res = replayEvents(now - 3600000, now);
    setReplayCount(res.replayedCount);
    setTimeout(() => setReplayCount(null), 4000);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Real-Time Event Stream & Replay</h1>
          <p className="mt-1 text-sm text-slate-400">
            Monitor ingested event buffers, trigger custom synthetic spikes, and execute deterministic event replay.
          </p>
        </div>
        <button
          onClick={handleReplayLastHour}
          className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-900 shrink-0"
        >
          <History className="w-4 h-4 mr-2" />
          Replay Last Hour of Events
        </button>
      </div>

      {replayCount !== null && (
        <div className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Successfully replayed <strong>{replayCount}</strong> events deterministically through reconciliation pipeline.
        </div>
      )}

      {/* Simulator Controls Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-sm font-semibold text-white mb-1">Live Ingestion Injection Sandbox</h3>
        <p className="text-xs text-slate-400 mb-4">
          Inject arbitrary spikes into the streaming pipeline to observe instant baseline deviation, score updates, and notification dispatches.
        </p>

        <form onSubmit={handleInjectCustomSpike} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Cloud Resource</label>
            <input
              type="text"
              value={customResource}
              onChange={(e) => setCustomResource(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Hourly Billing Spend ($/hr)</label>
            <input
              type="number"
              min={10}
              max={1500}
              value={customCost}
              onChange={(e) => setCustomCost(Number(e.target.value))}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center rounded-md bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors shadow-sm shadow-rose-900"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Inject Billing Surge
          </button>
        </form>

        {injectSuccess && (
          <p className="mt-3 text-xs text-emerald-400 font-medium">{injectSuccess}</p>
        )}
      </div>

      {/* Streams Tabs */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="border-b border-slate-800 flex items-center justify-between px-4">
          <div className="flex space-x-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab('billing')}
              className={`py-3 border-b-2 transition-colors ${activeTab === 'billing' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              Billing Events ({billingEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-3 border-b-2 transition-colors ${activeTab === 'resources' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              Resource Changes ({resourceEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('deployments')}
              className={`py-3 border-b-2 transition-colors ${activeTab === 'deployments' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              Deployments ({deploymentEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('workloads')}
              className={`py-3 border-b-2 transition-colors ${activeTab === 'workloads' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              Workload Telemetry ({workloadMetrics.length})
            </button>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Sorted by event_time</span>
        </div>

        {/* Tab 1: Billing Events */}
        {activeTab === 'billing' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Event ID / Time</th>
                  <th className="px-6 py-3 text-left">Resource & Service</th>
                  <th className="px-6 py-3 text-left">Hourly Cost</th>
                  <th className="px-6 py-3 text-left">Cumulative Cost</th>
                  <th className="px-6 py-3 text-left">Environment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900 text-slate-300 font-mono">
                {billingEvents.slice().reverse().map((b) => (
                  <tr key={b.eventId} className="hover:bg-slate-800/40">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="text-white font-semibold">{b.eventId.slice(0, 16)}...</div>
                      <div className="text-[10px] text-slate-500">{format(new Date(b.timestamp), 'yyyy-MM-dd HH:mm:ss')}</div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="text-indigo-300">{b.resourceId}</div>
                      <div className="text-[10px] text-slate-400">{b.service}</div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={`font-bold ${b.hourlyCost > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                        ${b.hourlyCost.toFixed(2)}/h
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-slate-300">
                      ${b.cumulativeCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                        {b.environment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Resource Changes */}
        {activeTab === 'resources' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Timestamp</th>
                  <th className="px-6 py-3 text-left">Resource ID</th>
                  <th className="px-6 py-3 text-left">Change Type</th>
                  <th className="px-6 py-3 text-left">Scaling Transition</th>
                  <th className="px-6 py-3 text-left">Changed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900 text-slate-300 font-mono">
                {resourceEvents.slice().reverse().map((r) => (
                  <tr key={r.eventId} className="hover:bg-slate-800/40">
                    <td className="px-6 py-3 whitespace-nowrap text-slate-400">
                      {format(new Date(r.timestamp), 'HH:mm:ss')}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-white font-semibold">
                      {r.resourceId}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-indigo-400">
                      {r.changeType}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-amber-400 font-bold">
                      {r.previousValue} &rarr; {r.newValue}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-slate-400">
                      {r.changedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Deployments */}
        {activeTab === 'deployments' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Deployment ID</th>
                  <th className="px-6 py-3 text-left">Timestamp</th>
                  <th className="px-6 py-3 text-left">Application & Version</th>
                  <th className="px-6 py-3 text-left">Accountable Owner</th>
                  <th className="px-6 py-3 text-left">Change Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900 text-slate-300">
                {deploymentEvents.slice().reverse().map((d) => (
                  <tr key={d.eventId} className="hover:bg-slate-800/40">
                    <td className="px-6 py-3 whitespace-nowrap font-mono text-indigo-400 font-bold">
                      {d.deploymentId}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap font-mono text-slate-400">
                      {format(new Date(d.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-white">
                      {d.application} <span className="font-mono text-xs text-slate-400">({d.version})</span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-slate-300">
                      {d.owner}
                    </td>
                    <td className="px-6 py-3 text-slate-400 text-xs max-w-sm truncate">
                      {d.changeSummary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Workload Telemetry */}
        {activeTab === 'workloads' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Timestamp</th>
                  <th className="px-6 py-3 text-left">Workload Type</th>
                  <th className="px-6 py-3 text-left">Jobs / Hour</th>
                  <th className="px-6 py-3 text-left">Active Streams</th>
                  <th className="px-6 py-3 text-left">GPU Util %</th>
                  <th className="px-6 py-3 text-left">Queue Depth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900 text-slate-300 font-mono">
                {workloadMetrics.slice().reverse().map((w) => (
                  <tr key={w.eventId} className="hover:bg-slate-800/40">
                    <td className="px-6 py-3 whitespace-nowrap text-slate-400">
                      {format(new Date(w.timestamp), 'HH:mm:ss')}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-white">
                      {w.workloadType}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-indigo-400 font-bold">
                      {w.jobsPerHour}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-slate-300">
                      {w.activeStreams}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-emerald-400">
                      {w.gpuUtilization.toFixed(1)}%
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-slate-400">
                      {w.queueDepth}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
