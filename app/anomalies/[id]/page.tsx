'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { 
  ShieldAlert, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  User, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  Sparkles,
  Download,
  Share2,
  Lock,
  GitCommit,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import Link from 'next/link';
import { IncidentStatus } from '@/types';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6'];

export default function AnomalyDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { anomalies, overrideAnomaly, updateAnomalyStatus, currentRole, notifications } = useStore();
  
  const [mounted, setMounted] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [overrideAction, setOverrideAction] = useState('Rollback Deployment and Clamp Max Replicas to 12');
  const [overrideReason, setOverrideReason] = useState('Workload metrics show only 12% traffic rise; 22 GPU nodes are grossly over-provisioned.');
  const [activeTab, setActiveTab] = useState<'evidence' | 'timeline' | 'attribution' | 'forecast' | 'notifications'>('evidence');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const anomaly = anomalies.find(a => a.anomalyId === id) || anomalies[0];

  if (!anomaly) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-slate-500" />
        <h2 className="text-xl font-semibold text-white">Anomaly Not Found</h2>
        <p className="text-sm text-slate-400">The incident ID you requested does not exist in active memory.</p>
        <Link href="/anomalies" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          Back to Anomalies
        </Link>
      </div>
    );
  }

  const { evidence } = anomaly;
  const excessCost = Math.max(0, evidence.costActual - evidence.costBaseline);
  const scalingMult = evidence.resourceChanges.length > 0 && evidence.resourceChanges[0].previousValue
    ? Number(evidence.resourceChanges[0].newValue) / (Number(evidence.resourceChanges[0].previousValue) || 1)
    : 2.75;

  const handleStatusTransition = (newStatus: IncidentStatus) => {
    updateAnomalyStatus(anomaly.anomalyId, newStatus, `Transitioned to ${newStatus} by ${currentRole}`);
  };

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    overrideAnomaly(anomaly.anomalyId, overrideAction, overrideReason, `${currentRole} Operator`);
    setOverrideModalOpen(false);
  };

  // Export Incident Report
  const handleExportJSON = () => {
    const report = {
      incidentId: anomaly.anomalyId,
      severity: anomaly.severity,
      compositeScore: anomaly.compositeScore || anomaly.anomalyScore,
      resourceId: anomaly.resourceId,
      service: anomaly.service,
      owner: anomaly.owner,
      onsetTime: new Date(anomaly.onsetTime).toISOString(),
      detectionTime: new Date(anomaly.detectionTime).toISOString(),
      baselineCostHourly: evidence.costBaseline,
      actualCostHourly: evidence.costActual,
      excessCostHourly: excessCost,
      workloadIncreasePct: evidence.workloadAfter && evidence.workloadBefore 
        ? ((evidence.workloadAfter.jobsPerHour - evidence.workloadBefore.jobsPerHour) / evidence.workloadBefore.jobsPerHour) * 100 
        : 12,
      recommendation: evidence.recommendationPlan,
      attribution: evidence.resourceAttribution,
      timeline: evidence.timeline,
      status: anomaly.status
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-report-${anomaly.anomalyId}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <Link href="/anomalies" className="rounded-md bg-slate-900 p-2 text-slate-400 hover:text-white border border-slate-800 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{anomaly.resourceId}</h1>
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                anomaly.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                anomaly.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {anomaly.severity}
              </span>
              <span className="text-xs text-slate-400 font-mono">[{anomaly.anomalyId}]</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Service: <span className="text-slate-200">{anomaly.service}</span> • Accountable Owner: <span className="text-indigo-400 font-medium">{anomaly.owner}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Generate Incident Report
          </button>
          <button
            onClick={() => setOverrideModalOpen(true)}
            className="flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-900"
          >
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Manual Override
          </button>
        </div>
      </div>

      {/* Incident Lifecycle Bar (Section 11) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lifecycle State:</span>
            <span className="rounded bg-indigo-500/20 px-2.5 py-1 text-xs font-mono font-bold text-indigo-300 border border-indigo-500/30">
              {anomaly.status}
            </span>
          </div>
          
          {/* Status Transitions */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => handleStatusTransition('INVESTIGATING')}
              className={`px-2.5 py-1 rounded transition-colors ${anomaly.status === 'INVESTIGATING' ? 'bg-purple-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              Investigating
            </button>
            <button
              onClick={() => handleStatusTransition('ACKNOWLEDGED')}
              className={`px-2.5 py-1 rounded transition-colors ${anomaly.status === 'ACKNOWLEDGED' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              Acknowledge
            </button>
            <button
              onClick={() => handleStatusTransition('ACTION_PROPOSED')}
              className={`px-2.5 py-1 rounded transition-colors ${anomaly.status === 'ACTION_PROPOSED' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              Propose Action
            </button>
            <button
              onClick={() => handleStatusTransition('APPROVED')}
              className={`px-2.5 py-1 rounded transition-colors ${anomaly.status === 'APPROVED' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              Approve Rollback
            </button>
            <button
              onClick={() => handleStatusTransition('RESOLVED')}
              className={`px-2.5 py-1 rounded transition-colors ${anomaly.status === 'RESOLVED' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              Resolve
            </button>
            <button
              onClick={() => handleStatusTransition('SUPPRESSED')}
              className={`px-2.5 py-1 rounded transition-colors ${anomaly.status === 'SUPPRESSED' ? 'bg-slate-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              Suppress
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('evidence')}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'evidence' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          Explainability & Scorecard
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          Root-Cause Timeline
        </button>
        <button
          onClick={() => setActiveTab('attribution')}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'attribution' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          Cost Attribution
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'forecast' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          Forecasting & Impact
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'notifications' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          Multi-Channel Notifications
        </button>
      </div>

      {/* TAB 1: Explainability & Scorecard */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <span className="text-xs text-slate-400 font-medium">Composite Anomaly Score</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-red-400 font-mono">
                  {(anomaly.compositeScore || anomaly.anomalyScore).toFixed(2)}
                </span>
                <span className="text-[10px] text-red-400 font-semibold uppercase">CRITICAL</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Ensemble of 5 distinct signals</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <span className="text-xs text-slate-400 font-medium">Excess Burn Rate</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white font-mono">+${excessCost.toFixed(2)}/h</span>
                <span className="text-[10px] text-red-400 font-semibold">+{evidence.percentageIncrease.toFixed(0)}%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Current: ${evidence.costActual.toFixed(2)} vs ${evidence.costBaseline.toFixed(2)}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <span className="text-xs text-slate-400 font-medium">Capacity Jump</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white font-mono">
                  {scalingMult.toFixed(1)}x
                </span>
                <span className="text-[10px] text-amber-400 font-semibold">8 &rarr; 22 nodes</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Autoscaler scale-out trigger</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <span className="text-xs text-slate-400 font-medium">Workload Growth Disparity</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-indigo-300 font-mono">+12.0%</span>
                <span className="text-[10px] text-rose-400 font-semibold">Severe Mismatch</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Cost grew 13.2x faster than workload</p>
            </div>
          </div>

          {/* Explanation Scorecard (Section 5) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-white">Explanation Scorecard</h3>
                <span className="text-xs text-slate-400 font-mono">Multi-Signal Audit</span>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Cost Deviation', val: evidence.scorecard?.costDeviationSeverity || 'CRITICAL', desc: `Cost rose ${evidence.percentageIncrease.toFixed(0)}% above 24h baseline.` },
                  { label: 'Resource Scaling', val: evidence.scorecard?.resourceScalingSeverity || 'CRITICAL', desc: `GPU cluster capacity increased ${scalingMult.toFixed(1)}x.` },
                  { label: 'Workload Mismatch', val: evidence.scorecard?.workloadMismatchSeverity || 'CRITICAL', desc: 'Workload only increased 12% during same interval.' },
                  { label: 'Deployment Correlation', val: evidence.scorecard?.deploymentCorrelationSeverity || 'HIGH', desc: 'Deployment video-transcoder-v42 pushed 15m prior.' },
                  { label: 'Historical Deviation', val: evidence.scorecard?.historicalDeviationSeverity || 'HIGH', desc: 'Statistical Z-score = 3.82 (&gt;2.0 severe outlier).' },
                ].map((factor) => (
                  <div key={factor.label} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div>
                      <p className="text-xs font-medium text-white">{factor.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{factor.desc}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      factor.val === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      factor.val === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {factor.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Factor Breakdown */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-white">Root-Cause Evidence Trail</h3>
                <span className="text-xs text-indigo-400 font-mono">Traceable Signals</span>
              </div>

              <div className="space-y-3">
                {evidence.scorecard?.explanationFactors?.map((factor, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">{factor}</p>
                  </div>
                )) || (
                  <p className="text-xs text-slate-400">Evidence factors compiling...</p>
                )}
              </div>

              {/* Recommendation Box */}
              <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-4 mt-4">
                <div className="flex items-center space-x-2 text-indigo-300 font-semibold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Recommendation Engine Plan</span>
                  <span className="ml-auto text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200">
                    Risk: {evidence.recommendationPlan?.risk || 'MEDIUM'}
                  </span>
                </div>
                <p className="text-xs text-white font-medium mt-2">
                  {evidence.recommendationPlan?.action || anomaly.recommendedAction}
                </p>
                <p className="text-[11px] text-slate-300 mt-1">
                  <strong>Reason:</strong> {evidence.recommendationPlan?.reason}
                </p>
                <p className="text-[11px] text-emerald-400 mt-1 font-medium">
                  <strong>Expected Impact:</strong> {evidence.recommendationPlan?.expectedImpact}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Root-Cause Timeline (Section 6) */}
      {activeTab === 'timeline' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Event-Time Causal Timeline</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Reconstructed sequence across CI/CD, cluster autoscaling, workload telemetry, and billing ingestion (window: &plusmn;15m)
              </p>
            </div>
            <span className="rounded bg-slate-800 px-2.5 py-1 text-xs font-mono text-slate-300">
              Deterministic Sequence
            </span>
          </div>

          <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {evidence.timeline?.map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Node icon */}
                <div className="absolute -left-6 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 border border-slate-700">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    item.type === 'DEPLOYMENT' ? 'bg-amber-400' :
                    item.type === 'RESOURCE_SCALE' ? 'bg-purple-400' :
                    item.type === 'WORKLOAD_CHANGE' ? 'bg-blue-400' :
                    item.type === 'BILLING_SPIKE' ? 'bg-red-500' :
                    item.type === 'ANOMALY_DETECTED' ? 'bg-rose-400' :
                    'bg-emerald-400'
                  }`} />
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 transition-all hover:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center">
                      {item.title}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {format(new Date(item.timestamp), 'HH:mm:ss')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{item.description}</p>
                  {item.impact && (
                    <div className="mt-2 text-[11px] text-indigo-400 font-mono">
                      &rarr; Impact: {item.impact}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Cost Attribution (Section 7) */}
      {activeTab === 'attribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resource Attribution */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Resource Contribution Breakdown</h3>
            <p className="text-xs text-slate-400">Excess cost distributed across cluster instances</p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={evidence.resourceAttribution} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#475569" fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={150} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    formatter={(val: any) => [`${val}%`, 'Contribution']}
                  />
                  <Bar dataKey="percentage" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16}>
                    {evidence.resourceAttribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Service & Region Attribution */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Service & Region Distribution</h3>
            <div className="space-y-4 mt-2">
              <div>
                <span className="text-xs font-semibold text-slate-300">Service Level</span>
                <div className="space-y-2 mt-2">
                  {evidence.serviceAttribution?.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{s.name}</span>
                      <span className="font-mono text-white">${s.cost.toFixed(2)}/h ({s.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <span className="text-xs font-semibold text-slate-300">Cloud Region Level</span>
                <div className="space-y-2 mt-2">
                  {evidence.regionAttribution?.map(r => (
                    <div key={r.name} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{r.name}</span>
                      <span className="font-mono text-white">${r.cost.toFixed(2)}/h ({r.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Forecasting & Impact (Section 8) */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Short-Term Cost Projections (Simulated Data)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Regression & moving-trend extrapolation if runaway autoscaling remains uncontained
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase bg-slate-800 px-2 py-1 rounded text-slate-400">
                Forecast Horizon: 24 Hours
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <span className="text-xs text-slate-400">Next 1 Hour Forecast</span>
                <p className="text-2xl font-bold text-white font-mono mt-1">
                  ${evidence.forecast?.forecastNext1h || 194.00}/hr
                </p>
                <p className="text-xs text-red-400 mt-2">
                  Projected Excess: <strong>+${evidence.forecast?.projectedExcessCost1h || 122.00}/hr</strong>
                </p>
              </div>

              <div className="rounded-lg border border-rose-500/30 bg-rose-950/10 p-4">
                <span className="text-xs text-rose-300">Next 6 Hours Forecast</span>
                <p className="text-2xl font-bold text-rose-400 font-mono mt-1">
                  ${evidence.forecast?.forecastNext6h || 208.00}/hr
                </p>
                <p className="text-xs text-rose-300 mt-2">
                  Estimated Additional Cost: <strong>${evidence.forecast?.projectedExcessCost6h || 732.00}</strong> over next 6 hours
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <span className="text-xs text-slate-400">Next 24 Hours Forecast</span>
                <p className="text-2xl font-bold text-white font-mono mt-1">
                  ${evidence.forecast?.forecastNext24h || 220.00}/hr
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Cumulative Risk: <strong>${evidence.forecast?.projectedExcessCost24h || 2928.00}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Multi-Channel Notifications (Section 12 & 13) */}
      {activeTab === 'notifications' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Multi-Channel Incident Dispatch Records</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulated dispatches with exact millisecond delivery latencies and acknowledgement tracking
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-800">
            {notifications.map((notif) => (
              <div key={notif.notificationId} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 font-mono">
                      {notif.channel}
                    </span>
                    <span className="text-xs font-semibold text-white">{notif.title}</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-medium">
                      [{notif.deliveryStatus}]
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{notif.message}</p>
                  <p className="text-[11px] text-slate-500">
                    Recipient: <span className="text-slate-300">{notif.recipient}</span> • Team: <span className="text-indigo-400">{notif.ownerTeam}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {(notif.latencyMs / 1000).toFixed(1)}s latency
                  </span>
                  <p className="text-[10px] text-slate-500">Dispatched in real-time</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Override Modal */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Manual Override Decision Layer</h3>
            <p className="text-xs text-slate-400 mt-1">
              Apply human-in-the-loop decision to contain or approve autoscaler intervention. Recorded immutably in Audit Trail.
            </p>

            <form onSubmit={handleApplyOverride} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Approved Action</label>
                <input
                  type="text"
                  value={overrideAction}
                  onChange={(e) => setOverrideAction(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Technical Justification</label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center">
                <Info className="w-4 h-4 mr-2 shrink-0" />
                This will trigger an immutable audit event attributed to role: <strong>{currentRole}</strong>.
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-4 py-2 rounded text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Confirm Override & Record Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incident Report Modal (Section 20) */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Structured Incident Report: {anomaly.anomalyId}</h3>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 font-mono bg-slate-950 p-4 rounded-lg border border-slate-800 leading-relaxed">
              <p>====================================================</p>
              <p>INCIDENT REPORT: {anomaly.anomalyId}</p>
              <p>SEVERITY: {anomaly.severity} | COMPOSITE SCORE: {(anomaly.compositeScore || anomaly.anomalyScore).toFixed(2)}</p>
              <p>RESOURCE: {anomaly.resourceId} ({anomaly.service})</p>
              <p>DEPLOYMENT: {evidence.deployments[0]?.deploymentId || 'video-transcoder-v42'}</p>
              <p>ACCOUNTABLE OWNER: {anomaly.owner}</p>
              <p>----------------------------------------------------</p>
              <p>COST IMPACT:</p>
              <p>  - Baseline Rate: ${evidence.costBaseline.toFixed(2)}/hr</p>
              <p>  - Actual Ingested Rate: ${evidence.costActual.toFixed(2)}/hr (+{evidence.percentageIncrease.toFixed(1)}%)</p>
              <p>  - Hourly Excess: +${excessCost.toFixed(2)}/hr</p>
              <p>  - Projected 6h Excess Cost: ${evidence.forecast?.projectedExcessCost6h || 732.00}</p>
              <p>WORKLOAD TELEMETRY:</p>
              <p>  - Jobs/Hour Growth: +12.0% (Disparity: 13.2x cost elasticity surge)</p>
              <p>RECOMMENDED ACTION:</p>
              <p>  - {evidence.recommendationPlan?.action}</p>
              <p>AUDIT TRAIL STATUS: {anomaly.status}</p>
              <p>====================================================</p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex space-x-2">
                <button
                  onClick={handleExportJSON}
                  className="px-3 py-1.5 rounded bg-slate-800 text-xs text-white hover:bg-slate-700 flex items-center"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download JSON
                </button>
                <button
                  onClick={() => {
                    const csvContent = `data:text/csv;charset=utf-8,IncidentId,Resource,CostActual,CostBaseline,ExcessCost,Status\n${anomaly.anomalyId},${anomaly.resourceId},${evidence.costActual},${evidence.costBaseline},${excessCost},${anomaly.status}`;
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `incident-${anomaly.anomalyId}.csv`);
                    document.body.appendChild(link);
                    link.click();
                  }}
                  className="px-3 py-1.5 rounded bg-slate-800 text-xs text-white hover:bg-slate-700 flex items-center"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download CSV
                </button>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-1.5 rounded bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
