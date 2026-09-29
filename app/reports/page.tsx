'use client';

import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function ReportsPage() {
  const { anomalies, billingEvents } = useStore();
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string>(anomalies[0]?.anomalyId || '');
  const [reportFormat, setReportFormat] = useState<'markdown' | 'print'>('print');

  const selectedAnomaly = anomalies.find(a => a.anomalyId === selectedAnomalyId) || anomalies[0];
  const totalCost = billingEvents.reduce((acc, e) => acc + e.hourlyCost, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = async () => {
    if (!selectedAnomaly) return;
    const res = await fetch(`/api/reports/rca?id=${selectedAnomaly.anomalyId}&format=markdown`);
    const text = await res.text();
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RCA-PostMortem-${selectedAnomaly.anomalyId.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-400" />
            Executive Reports & RCA Post-Mortem Generator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automated Root Cause Analysis (RCA) reporting, financial loss attribution, and executive FinOps summaries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export Markdown
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Select Incident Selector */}
      {anomalies.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Select Anomaly for RCA:</span>
            <select
              value={selectedAnomaly?.anomalyId || ''}
              onChange={(e) => setSelectedAnomalyId(e.target.value)}
              className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
            >
              {anomalies.map((a) => (
                <option key={a.anomalyId} value={a.anomalyId}>
                  {a.service} ({a.resourceId}) — {a.severity} (+{a.evidence.percentageIncrease.toFixed(0)}%)
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs font-mono text-indigo-400">
            Report ID: RCA-{selectedAnomaly?.anomalyId.slice(0, 8).toUpperCase() || 'NONE'}
          </span>
        </div>
      )}

      {selectedAnomaly ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 space-y-6 text-slate-300 print:bg-white print:text-black print:border-none">
          {/* Header */}
          <div className="border-b border-slate-800 pb-5">
            <div className="flex items-center justify-between">
              <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-mono font-bold text-red-400">
                INCIDENT POST-MORTEM (RCA)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Generated: {new Date().toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-2">
              Uncontrolled Spend Surge on {selectedAnomaly.service} ({selectedAnomaly.resourceId})
            </h2>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
              <span>Owner: <strong className="text-slate-200">{selectedAnomaly.owner}</strong></span>
              <span>Status: <strong className="text-slate-200">{selectedAnomaly.status}</strong></span>
              <span>Severity: <strong className="text-red-400">{selectedAnomaly.severity}</strong></span>
              <span>Composite Score: <strong className="text-amber-400">{selectedAnomaly.compositeScore?.toFixed(2) || '0.94'}</strong></span>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400">Baseline Hourly Rate</span>
              <p className="text-lg font-bold text-white font-mono mt-1">
                ${selectedAnomaly.evidence.costBaseline.toFixed(2)}/hr
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400">Peak Anomaly Rate</span>
              <p className="text-lg font-bold text-red-400 font-mono mt-1">
                ${selectedAnomaly.evidence.costActual.toFixed(2)}/hr
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400">Cost Surge Variance</span>
              <p className="text-lg font-bold text-red-400 font-mono mt-1 flex items-center">
                +{selectedAnomaly.evidence.percentageIncrease.toFixed(1)}%
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400">Estimated Cost Impact</span>
              <p className="text-lg font-bold text-amber-400 font-mono mt-1">
                ${((selectedAnomaly.evidence.costActual - selectedAnomaly.evidence.costBaseline) * 12).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Root Cause Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Root Cause Summary
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              At {new Date(selectedAnomaly.onsetTime).toLocaleTimeString()}, deployment{' '}
              <span className="font-mono text-indigo-300 font-semibold">{selectedAnomaly.evidence.deployments[0]?.deploymentId || 'video-transcoder-v42'}</span> was deployed by{' '}
              <span className="font-mono text-indigo-300">{selectedAnomaly.owner}</span>. 
              The deployment modified the GPU worker pool configuration, triggering an aggressive auto-scaler expansion from 2 to 8 nodes without corresponding customer transcoding demand (+12% workload vs +158% compute cost).
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Incident Timeline
            </h3>
            <div className="space-y-2 border-l-2 border-slate-800 pl-4 text-xs">
              {selectedAnomaly.evidence.timeline.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    <strong className="text-slate-200">{item.title}</strong>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Corrective Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              3. Preventative Actions & Follow-ups
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
              <li>Implement hard spending limits on the GPU worker auto-scaling group.</li>
              <li>Integrate pre-deployment cost impact forecasting into GitHub Actions CI pipeline.</li>
              <li>Configure automated scaling circuit breakers when elasticity exceeds 2.5x disparity.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          No anomalies available to generate report. Load a demo scenario first.
        </div>
      )}
    </div>
  );
}
