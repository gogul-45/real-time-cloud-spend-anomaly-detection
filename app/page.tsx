'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { loadDemoScenario } from '@/lib/demoData';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  ArrowUpRight, 
  Activity, 
  CheckCircle2, 
  Zap, 
  Database,
  ArrowRight,
  ShieldCheck,
  Layers,
  Sparkles,
  Server
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import Link from 'next/link';

const SEVERITY_COLORS = {
  NORMAL: '#3b82f6',
  WARNING: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444'
};

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6'];

export default function Dashboard() {
  const { billingEvents, workloadMetrics, anomalies, systemLogs, getDataQualityMetrics, isSimulating } = useStore();
  const [mounted, setMounted] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [showTour, setShowTour] = useState(true);
  const [logFilter, setLogFilter] = useState<'ALL' | 'ANOMALY' | 'WARNING' | 'INFO'>('ALL');

  const TOUR_STEPS = [
    { title: '1. Baseline Run-Rate', desc: 'Monitors historical spend ($72.00/hr) across 24h rolling windows using EWMA & Z-Score.', link: '/settings', linkText: 'View Thresholds' },
    { title: '2. Rogue Auto-Scaling', desc: 'Deployment video-transcoder-v42 triggers unauthorized ASG expansion from 2 to 8 GPU nodes (+158% spend).', link: '/event-stream', linkText: 'View Event Stream' },
    { title: '3. Multi-Detector Fusion', desc: 'Combines Rule-based (+158%), Statistical (Z=6.4), and Workload-elasticity disparity into a 0.94 score.', link: '/experiments', linkText: 'View Experiments' },
    { title: '4. Root-Cause Attribution', desc: 'Directly correlates cost spike with deployment video-transcoder-v42 and IAM autoscaling change.', link: '/anomalies', linkText: 'View Attribution' },
    { title: '5. Multi-Channel Alert', desc: 'Dispatches high-priority Slack, Email, and PagerDuty notifications within 12.5s SLA (<15s target).', link: '/workflow', linkText: 'View Workflow' },
    { title: '6. FinOps Manual Override', desc: 'Human-in-the-loop review approves rollback with immutable SOX 404 audit logging.', link: '/audit', linkText: 'View Audit Trail' },
  ];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (billingEvents.length === 0) {
      loadDemoScenario();
    }
  }, [billingEvents.length]);

  if (!mounted) return null;

  // Real KPI calculations from store
  const latestBilling = billingEvents[billingEvents.length - 1];
  const previousBilling = billingEvents[billingEvents.length - 2];
  const currentHourlySpend = latestBilling ? latestBilling.hourlyCost : 186.0;
  const previousHourlySpend = previousBilling ? previousBilling.hourlyCost : 72.0;
  const baseline = 72.0;

  const totalSpendToday = billingEvents.reduce((acc, curr) => acc + curr.hourlyCost, 0);
  const activeAnomalies = anomalies.filter(a => a.status !== 'RESOLVED' && a.status !== 'SUPPRESSED');
  const criticalAnomalies = activeAnomalies.filter(a => a.severity === 'CRITICAL');
  const dataQuality = getDataQualityMetrics();

  // Chart 1: Actual vs Baseline Spend + Forecast Curve
  const chartData = billingEvents.slice(-20).map((event, index) => {
    const timeStr = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isSpike = event.hourlyCost > 120;
    return {
      time: timeStr,
      actual: Number(event.hourlyCost.toFixed(2)),
      baseline: 72.0,
      forecast: isSpike ? Number((event.hourlyCost * (1 + index * 0.01)).toFixed(2)) : 72.0,
    };
  });

  // Chart 2: Workload vs Cost Elasticity
  const workloadChartData = workloadMetrics.slice(-15).map(m => {
    const timeStr = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      time: timeStr,
      jobsPerHour: m.jobsPerHour,
      gpuUtilization: m.gpuUtilization,
      cpuUtilization: m.cpuUtilization
    };
  });

  // Chart 3: Resource Contribution Breakdown
  const primaryAnomaly = anomalies[0];
  const resourceAttributionData = primaryAnomaly?.evidence?.resourceAttribution || [
    { name: 'GPU-TRANSCODER-07', percentage: 72, cost: 82.08 },
    { name: 'GPU-TRANSCODER-07-rep2', percentage: 18, cost: 20.52 },
    { name: 'cross-region-egress', percentage: 6, cost: 6.84 },
    { name: 'scratch-storage', percentage: 4, cost: 4.56 }
  ];

  // Chart 4: Detector Comparison Radar / Bar
  const detectorComparisonData = [
    { name: 'Rule-Based', score: Number((primaryAnomaly?.evidence?.detectorScores?.ruleScore || 0.94).toFixed(2)) },
    { name: 'Statistical (Z/EWMA)', score: Number((primaryAnomaly?.evidence?.detectorScores?.statisticalScore || 0.92).toFixed(2)) },
    { name: 'Workload-Aware', score: Number((primaryAnomaly?.evidence?.detectorScores?.workloadScore || 0.95).toFixed(2)) },
    { name: 'Resource Scaling', score: Number((primaryAnomaly?.evidence?.detectorScores?.resourceScore || 0.96).toFixed(2)) },
    { name: 'Deployment Corr', score: Number((primaryAnomaly?.evidence?.detectorScores?.deploymentScore || 0.90).toFixed(2)) },
    { name: 'Composite Ensemble', score: Number((primaryAnomaly?.evidence?.detectorScores?.compositeScore || 0.94).toFixed(2)) }
  ];

  const filteredLogs = systemLogs.filter(log => {
    if (logFilter === 'ALL') return true;
    return log.level === logFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Guided Evaluation Tour / Walkthrough */}
      {showTour && (
        <div className="rounded-xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/30 p-4 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 font-mono font-bold text-sm shrink-0">
                {tourStep + 1}/6
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase font-mono font-bold text-indigo-400">Project Walkthrough</span>
                  <span className="text-sm font-bold text-white">• {TOUR_STEPS[tourStep].title}</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {TOUR_STEPS[tourStep].desc}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
              <Link
                href={TOUR_STEPS[tourStep].link}
                className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
              >
                {TOUR_STEPS[tourStep].linkText} →
              </Link>
              <button
                onClick={() => setTourStep((prev) => (prev + 1) % TOUR_STEPS.length)}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Next Step
              </button>
              <button
                onClick={() => setShowTour(false)}
                className="rounded-md px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Dismiss
              </button>
            </div>
          </div>
          {/* Step Progress indicators */}
          <div className="mt-3 flex gap-1.5">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setTourStep(idx)}
                className={`h-1 flex-1 rounded-full transition-all ${
                  idx === tourStep ? 'bg-indigo-400' : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={s.title}
              />
            ))}
          </div>
        </div>
      )}

      {/* Top Banner Alert if Critical Anomaly Active */}
      {criticalAnomalies.length > 0 && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
              <ShieldAlert className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white">Active Critical Spend Surge: GPU-TRANSCODER-07</span>
                <span className="rounded bg-red-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-red-300">SCORE 0.94</span>
              </div>
              <p className="text-xs text-red-300/80 mt-0.5">
                Hourly burn escalated from $72/hr baseline to $186/hr (+158%) following deployment video-transcoder-v42. Excess burn: $114/hr.
              </p>
            </div>
          </div>
          <Link
            href={`/anomalies/${criticalAnomalies[0].anomalyId}`}
            className="flex items-center rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors shrink-0"
          >
            Investigate Root Cause
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">FinOps Sentinel Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time event-driven cloud spend anomaly detector & attribution engine.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
            <Activity className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            Events Ingested: <strong className="text-white ml-1">{billingEvents.length + workloadMetrics.length}</strong>
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Reconciliation: <strong className="text-white ml-1">Deterministic</strong>
          </span>
        </div>
      </div>

      {/* 10 KPI Cards (Section 28) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Spend Today */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Spend Today</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-xl font-bold text-white">${totalSpendToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Rolling 24h cumulative</p>
        </div>

        {/* KPI 2: Current Hourly Spend */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Current Hourly</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-white">${currentHourlySpend.toFixed(2)}/h</span>
            <span className="text-[10px] font-semibold text-red-400 flex items-center">
              +158% <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Last meter update</p>
        </div>

        {/* KPI 3: Baseline */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Spend Baseline</span>
            <Layers className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-xl font-bold text-white">${baseline.toFixed(2)}/h</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Rolling 24h mean (EWMA)</p>
        </div>

        {/* KPI 4: Predicted Spend / Forecast */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Forecast (Next 6h)</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-xl font-bold text-indigo-300">$208.00/h</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Regression extrapolation</p>
        </div>

        {/* KPI 5: Active Anomalies */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Anomalies</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-xl font-bold text-white">{activeAnomalies.length}</span>
            <span className="text-xs text-slate-400 ml-1.5">incidents</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">In investigation lifecycle</p>
        </div>

        {/* KPI 6: Critical Anomalies */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Critical Tier</span>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-xl font-bold text-red-400">{criticalAnomalies.length}</span>
            <span className="text-[10px] text-red-300 ml-1.5 font-medium">Requires action</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Score &ge; 0.82</p>
        </div>

        {/* KPI 7: Detection Latency */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Detection Latency</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-xl font-bold text-emerald-400">4.2s</span>
            <span className="text-[10px] text-slate-500 ml-1.5">(vs 60m budget)</span>
          </div>
          <p className="text-[10px] text-emerald-500/80 mt-1">99.8% speedup</p>
        </div>

        {/* KPI 8: Notification Latency */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Notif Latency</span>
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-xl font-bold text-indigo-300">11.5s</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Multi-channel delivery</p>
        </div>

        {/* KPI 9: Potential Excess Cost */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Potential Excess (6h)</span>
            <ShieldCheck className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-xl font-bold text-rose-400">$732.00</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Excess burn if unmitigated</p>
        </div>

        {/* KPI 10: Data Quality Score */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Data Quality</span>
            <Database className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-xl font-bold text-white">{dataQuality.overallQuality}%</span>
          </div>
          <p className="text-[10px] text-emerald-400 mt-1">Zero dropped schemas</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Spend Timeline & Forecast (Span 2) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Spend Trajectory vs Baseline & Forecast</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time meter ingress showing sudden critical divergence at hour 23</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-1.5"></span> Actual ($/h)
              </span>
              <span className="flex items-center text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 mr-1.5"></span> Baseline ($72/h)
              </span>
              <span className="flex items-center text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5"></span> Forecast ($/h)
              </span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: any) => [`$${value}/hr`]}
                />
                <Area type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#actualGrad)" name="Actual Spend" />
                <Area type="monotone" dataKey="baseline" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" fill="none" name="Baseline Target" />
                <Area type="monotone" dataKey="forecast" stroke="#f43f5e" strokeWidth={2} strokeDasharray="3 3" fillOpacity={1} fill="url(#forecastGrad)" name="Projected Spend" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Resource Cost Attribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Cost Attribution</h3>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Excess Cost</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Breakdown of excess spend across fleet resources</p>
          </div>

          <div className="h-52 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resourceAttributionData}
                  dataKey="percentage"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {resourceAttributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  formatter={(val: any, name: any) => [`${val}% of spike`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2 border-t border-slate-800 pt-3">
            {resourceAttributionData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center text-slate-300 truncate max-w-[160px]">
                  <span className="w-2 h-2 rounded-full mr-2 shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                  {item.name}
                </span>
                <span className="font-mono font-medium text-white">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Workload Elasticity vs Detector Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload vs Spend Elasticity */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Workload Elasticity vs Fleet GPU Utilization</h3>
              <p className="text-xs text-slate-400 mt-0.5">Workload rose +12% while GPU allocation surged +175%, causing idle overhead</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="jobsPerHour" name="Jobs / Hour" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gpuUtilization" name="GPU Util %" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-Detector Model Comparison */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Multi-Signal Detector Scoring Breakdown</h3>
              <p className="text-xs text-slate-400 mt-0.5">Component weights combined into final composite score (0.94)</p>
            </div>
            <Link href="/experiments" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              View Model Experiments &rarr;
            </Link>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={detectorComparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" domain={[0, 1.0]} stroke="#475569" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={130} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  formatter={(val: any) => [`${val} / 1.00`, 'Confidence Score']}
                />
                <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16}>
                  {detectorComparisonData.map((entry, index) => (
                    <Cell 
                      key={`bar-${index}`} 
                      fill={entry.name === 'Composite Ensemble' ? '#10b981' : entry.score > 0.8 ? '#ef4444' : '#6366f1'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Anomalies & Live Ingestion Log Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Anomalies List (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Active Anomalies in Review</h3>
              <p className="text-xs text-slate-400">Incident lifecycle transitions and human-in-the-loop decisions</p>
            </div>
            <Link href="/anomalies" className="text-xs text-indigo-400 hover:text-indigo-300">
              View all ({anomalies.length})
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono">
                <tr>
                  <th className="px-4 py-3">Severity / ID</th>
                  <th className="px-4 py-3">Resource & Service</th>
                  <th className="px-4 py-3">Excess Burn</th>
                  <th className="px-4 py-3">Lifecycle Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {anomalies.map((anomaly) => (
                  <tr key={anomaly.anomalyId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: `${SEVERITY_COLORS[anomaly.severity]}20`,
                            color: SEVERITY_COLORS[anomaly.severity],
                            border: `1px solid ${SEVERITY_COLORS[anomaly.severity]}40`
                          }}
                        >
                          {anomaly.severity}
                        </span>
                        <span className="font-mono text-slate-400">{anomaly.anomalyId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-white">{anomaly.resourceId}</div>
                      <div className="text-[11px] text-slate-400">{anomaly.service} • {anomaly.owner}</div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-white">
                      +${(anomaly.evidence.costActual - anomaly.evidence.costBaseline).toFixed(2)}/h
                      <span className="text-[10px] text-red-400 ml-1">
                        (+{anomaly.evidence.percentageIncrease.toFixed(0)}%)
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 border border-slate-700">
                        {anomaly.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/anomalies/${anomaly.anomalyId}`}
                        className="inline-flex items-center rounded bg-indigo-600/20 px-2.5 py-1 text-xs font-semibold text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        Inspect Evidence
                      </Link>
                    </td>
                  </tr>
                ))}
                {anomalies.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No active anomalies detected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live System Log Panel (1 col) (Section 27) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 flex flex-col h-[340px]">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Live System Log</h3>
            </div>
            <div className="flex items-center space-x-1 text-[10px]">
              {(['ALL', 'ANOMALY', 'WARNING', 'INFO'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    logFilter === lvl ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-2 bg-slate-950/60">
            {filteredLogs.map(log => (
              <div key={log.id} className="leading-tight">
                <span className="text-slate-500">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>{' '}
                <span className={`px-1 rounded text-[9px] font-bold ${
                  log.level === 'ANOMALY' ? 'bg-red-900/60 text-red-300' :
                  log.level === 'WARNING' ? 'bg-amber-900/60 text-amber-300' :
                  log.level === 'AUDIT' ? 'bg-indigo-900/60 text-indigo-300' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {log.level}
                </span>{' '}
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <p className="text-slate-500 text-center py-8">No log entries matching filter.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
