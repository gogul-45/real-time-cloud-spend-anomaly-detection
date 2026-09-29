'use client';

import { useState, useEffect } from 'react';
import { 
  Gauge, 
  Play, 
  CheckCircle2, 
  Activity, 
  Cpu, 
  Zap, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { 
  calculateBaseline, 
  runRuleBasedDetector, 
  runStatisticalDetector, 
  runWorkloadAwareDetector,
  calculateCompositeScore 
} from '@/lib/engine';
import { BillingEvent } from '@/types';

interface BenchmarkResult {
  eventCount: number;
  ingestionMs: number;
  detectionMs: number;
  reconciliationMs: number;
  totalMs: number;
  throughputEventsPerSec: number;
  anomaliesDetected: number;
}

export default function PerformancePage() {
  const [mounted, setMounted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScale, setSelectedScale] = useState<number>(5000);
  const [results, setResults] = useState<BenchmarkResult[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const runBenchmark = async (count: number) => {
    setIsRunning(true);
    // Yield execution so UI updates
    await new Promise(r => setTimeout(r, 100));

    const now = Date.now();
    const mockBilling: BillingEvent[] = [];
    
    // 1. Measure Ingestion generation time
    const t0 = performance.now();
    for (let i = 0; i < count; i++) {
      const isSpike = i % 250 === 0;
      mockBilling.push({
        eventId: `bench-bil-${i}`,
        timestamp: now - (count - i) * 60000,
        service: 'GPU Compute',
        resourceId: `GPU-NODE-${i % 8}`,
        resourceName: 'Benchmark Transcoder',
        region: 'us-east-1',
        environment: 'production',
        workloadType: 'video-transcoding',
        hourlyCost: isSpike ? 220 : 72 + Math.random() * 5,
        cumulativeCost: i * 72
      });
    }
    const t1 = performance.now();
    const ingestionMs = Number((t1 - t0).toFixed(2));

    // 2. Measure Reconciliation (sorting & deduplication)
    const t2 = performance.now();
    const seen = new Set<string>();
    const deduplicated = mockBilling.filter(e => {
      if (seen.has(e.eventId)) return false;
      seen.add(e.eventId);
      return true;
    });
    deduplicated.sort((a, b) => a.timestamp - b.timestamp);
    const t3 = performance.now();
    const reconciliationMs = Number((t3 - t2).toFixed(2));

    // 3. Measure Detection Pipeline execution
    const t4 = performance.now();
    let anomaliesDetected = 0;
    const defaultThresholds = {
      warningPercentage: 30,
      highPercentage: 60,
      criticalPercentage: 100,
      zScoreThreshold: 2.0,
      minimumCostIncrease: 100,
      detectionWindowHours: 24,
      correlationWindowMinutes: 30,
      maxLateEventHours: 4
    };

    for (let i = 0; i < deduplicated.length; i++) {
      const event = deduplicated[i];
      const baselineCost = 72.0;
      const rule = runRuleBasedDetector(event, baselineCost, defaultThresholds);
      const stat = runStatisticalDetector(event, { baselineCost, zScore: (event.hourlyCost - baselineCost) / 10, stdDev: 10, ewma: baselineCost });
      const composite = calculateCompositeScore({
        ruleScore: rule.score,
        statisticalScore: stat.score,
        workloadScore: 0.2,
        resourceScore: 0.1,
        deploymentScore: 0.1
      });

      if (composite.severity === 'CRITICAL' || composite.severity === 'HIGH') {
        anomaliesDetected++;
      }
    }
    const t5 = performance.now();
    const detectionMs = Number((t5 - t4).toFixed(2));

    const totalMs = Number((ingestionMs + reconciliationMs + detectionMs).toFixed(2));
    const throughput = Math.round((count / (totalMs / 1000)));

    const result: BenchmarkResult = {
      eventCount: count,
      ingestionMs,
      detectionMs,
      reconciliationMs,
      totalMs,
      throughputEventsPerSec: throughput,
      anomaliesDetected
    };

    setResults(prev => [result, ...prev.filter(r => r.eventCount !== count)]);
    setIsRunning(false);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pipeline Performance Benchmark</h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time benchmarking measuring ingestion throughput, reconciliation latency, and detection execution.
          </p>
        </div>
      </div>

      {/* Benchmark Controls */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Execute High-Throughput Ingestion Benchmark</h3>
        <p className="text-xs text-slate-400">
          Synthesizes continuous event streams in the browser to stress-test the detection pipeline and measure actual hardware execution duration.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {[1000, 5000, 10000, 25000].map((size) => (
            <button
              key={size}
              onClick={() => setSelectedScale(size)}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-colors ${
                selectedScale === size 
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900' 
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {size.toLocaleString()} Events
            </button>
          ))}

          <button
            onClick={() => runBenchmark(selectedScale)}
            disabled={isRunning}
            className="flex items-center px-5 py-2 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm shadow-emerald-900 disabled:opacity-50 ml-auto"
          >
            {isRunning ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⟳</span> Benchmarking {selectedScale.toLocaleString()} events...
              </span>
            ) : (
              <span className="flex items-center">
                <Play className="w-3.5 h-3.5 mr-1.5" /> Start Benchmark Run
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Measured Benchmark Runs</h3>
          <span className="text-[11px] text-slate-500 font-mono">Actual browser-timed measurements</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase">
              <tr>
                <th className="px-6 py-3.5 text-left">Event Volume</th>
                <th className="px-6 py-3.5 text-left">Ingestion Duration</th>
                <th className="px-6 py-3.5 text-left">Reconciliation</th>
                <th className="px-6 py-3.5 text-left">Detection Engine</th>
                <th className="px-6 py-3.5 text-left">Total Pipeline Time</th>
                <th className="px-6 py-3.5 text-left">Throughput</th>
                <th className="px-6 py-3.5 text-left">Anomalies Flagged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900 text-slate-300">
              {results.map((res) => (
                <tr key={res.eventCount} className="hover:bg-slate-800/40">
                  <td className="px-6 py-4 whitespace-nowrap text-white font-bold">
                    {res.eventCount.toLocaleString()} events
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                    {res.ingestionMs} ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                    {res.reconciliationMs} ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-indigo-400 font-semibold">
                    {res.detectionMs} ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white font-bold">
                    {res.totalMs} ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-emerald-400 font-bold">
                    {res.throughputEventsPerSec.toLocaleString()} events/sec
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-amber-400">
                    {res.anomaliesDetected} anomalies
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-sans">
                    Click &quot;Start Benchmark Run&quot; above to measure execution speed against 1k to 25k continuous events.
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
