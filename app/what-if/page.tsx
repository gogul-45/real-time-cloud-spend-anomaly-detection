'use client';

import { useState, useEffect } from 'react';
import { 
  Sliders, 
  DollarSign, 
  TrendingDown, 
  Info, 
  RotateCcw, 
  ShieldAlert, 
  Server,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell 
} from 'recharts';

export default function WhatIfPage() {
  const [mounted, setMounted] = useState(false);

  // Simulation parameters
  const [gpuInstances, setGpuInstances] = useState(12); // Reduced from 22
  const [cpuInstances, setCpuInstances] = useState(30);
  const [workloadMultiplier, setWorkloadMultiplier] = useState(1.0);
  const [autoscalerLimit, setAutoscalerLimit] = useState(14);
  const [deploymentState, setDeploymentState] = useState<'v42_current' | 'v41_rollback'>('v41_rollback');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Baseline and current values
  const currentHourlySpend = 186.0; // Current anomalous rate with 22 GPUs on v42
  const baselineHourlySpend = 72.0;

  // Unit costs:
  // GPU cost ~ $6.50/instance/hr
  // CPU cost ~ $0.80/instance/hr
  // Baseline storage/network overhead ~ $15/hr
  const gpuUnitCost = 6.50;
  const cpuUnitCost = 0.80;
  const fixedOverhead = deploymentState === 'v41_rollback' ? 12.0 : 25.0; // v42 had egress leak overhead

  // Calculate simulated hourly cost
  const simulatedGpuCost = gpuInstances * gpuUnitCost * (workloadMultiplier > 1.2 ? 1.05 : 1.0);
  const simulatedCpuCost = cpuInstances * cpuUnitCost;
  const estimatedHourlyCost = Number((simulatedGpuCost + simulatedCpuCost + fixedOverhead).toFixed(2));

  // Savings
  const estimatedHourlySavings = Number((currentHourlySpend - estimatedHourlyCost).toFixed(2));
  const estimated24hSavings = Number((estimatedHourlySavings * 24).toFixed(2));
  const estimatedMonthlySavings = Number((estimated24hSavings * 30).toFixed(2));

  const comparisonData = [
    {
      scenario: 'Current Runaway State',
      cost: currentHourlySpend,
      gpus: 22,
      desc: '22 GPUs active on v42 deployment'
    },
    {
      scenario: 'What-If Simulated',
      cost: estimatedHourlyCost,
      gpus: gpuInstances,
      desc: `${gpuInstances} GPUs, ${deploymentState === 'v41_rollback' ? 'v41 rollback' : 'v42 config'}`
    },
    {
      scenario: 'Target Baseline',
      cost: baselineHourlySpend,
      gpus: 8,
      desc: 'Normal historical operating rate'
    }
  ];

  const handleResetToCurrent = () => {
    setGpuInstances(22);
    setCpuInstances(30);
    setWorkloadMultiplier(1.0);
    setAutoscalerLimit(24);
    setDeploymentState('v42_current');
  };

  const handleApplyRecommended = () => {
    setGpuInstances(12);
    setCpuInstances(30);
    setWorkloadMultiplier(1.0);
    setAutoscalerLimit(14);
    setDeploymentState('v41_rollback');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Disclaimer Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-300 flex items-start space-x-3">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
        <div>
          <strong className="font-semibold text-white">What-If Analysis & Cost Simulation Sandbox:</strong>
          <p className="mt-0.5">
            This module models the financial impact of autoscaling cap adjustments and deployment rollbacks. 
            Modifications here are entirely simulated and will <strong>NOT</strong> execute live cloud infrastructure mutations.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">What-If Cost Impact Simulation</h1>
          <p className="mt-1 text-sm text-slate-400">
            Model infrastructure right-sizing, autoscaling ceilings, and deployment rollback savings in real time.
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleApplyRecommended}
            className="px-3 py-1.5 rounded-md bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Load Recommended Config
          </button>
          <button
            onClick={handleResetToCurrent}
            className="flex items-center px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset to Current
          </button>
        </div>
      </div>

      {/* KPI Savings Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs text-slate-400 font-medium">Simulated Hourly Spend</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">${estimatedHourlyCost}/h</span>
            <span className="text-xs text-slate-500">Current: $186/h</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Based on modeled parameters</p>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
          <span className="text-xs text-emerald-300 font-medium">Estimated Hourly Savings</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400 font-mono">+${estimatedHourlySavings}/h</span>
            <TrendingDown className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-[10px] text-emerald-500 mt-1">{((estimatedHourlySavings / currentHourlySpend) * 100).toFixed(0)}% cost reduction</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs text-slate-400 font-medium">Projected 24h Savings</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">${estimated24hSavings}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Single day avoidance</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-xs text-slate-400 font-medium">Estimated Monthly Avoided Spend</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-indigo-400 font-mono">${estimatedMonthlySavings.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-indigo-300 mt-1">30-day projection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column (1 col) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
          <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-3">Simulation Controls</h3>

          {/* Slider 1: GPU Instances */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">GPU Transcoder Replicas</span>
              <span className="font-mono text-indigo-400 font-bold">{gpuInstances} nodes</span>
            </div>
            <input
              type="range"
              min={6}
              max={30}
              step={1}
              value={gpuInstances}
              onChange={(e) => setGpuInstances(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Baseline: 8</span>
              <span>Recommended: 12</span>
              <span>Current: 22</span>
            </div>
          </div>

          {/* Slider 2: CPU Instances */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Supporting CPU Pods</span>
              <span className="font-mono text-indigo-400 font-bold">{cpuInstances} pods</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={2}
              value={cpuInstances}
              onChange={(e) => setCpuInstances(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Min: 10</span>
              <span>Max: 60</span>
            </div>
          </div>

          {/* Slider 3: Workload Multiplier */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Workload Volume Factor</span>
              <span className="font-mono text-indigo-400 font-bold">{workloadMultiplier.toFixed(1)}x traffic</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.1}
              value={workloadMultiplier}
              onChange={(e) => setWorkloadMultiplier(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0.5x (Night)</span>
              <span>1.0x (Normal)</span>
              <span>2.5x (Peak)</span>
            </div>
          </div>

          {/* Slider 4: Autoscaler Max Limit */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Autoscaler Upper Ceiling</span>
              <span className="font-mono text-amber-400 font-bold">{autoscalerLimit} max replicas</span>
            </div>
            <input
              type="range"
              min={10}
              max={32}
              step={1}
              value={autoscalerLimit}
              onChange={(e) => setAutoscalerLimit(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Prevents runaway cluster expansion during queue spikes</p>
          </div>

          {/* Deployment State Toggle */}
          <div className="border-t border-slate-800 pt-4">
            <span className="block text-xs font-semibold text-slate-300 mb-2">Target Deployment Version</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setDeploymentState('v41_rollback')}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  deploymentState === 'v41_rollback'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white font-semibold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <div>v41 (Stable Rollback)</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Known good config</div>
              </button>
              <button
                onClick={() => setDeploymentState('v42_current')}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  deploymentState === 'v42_current'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white font-semibold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <div>v42 (Keep Current)</div>
                <div className="text-[10px] text-red-400 mt-0.5">Over-scaled limits</div>
              </button>
            </div>
          </div>
        </div>

        {/* Visualizations Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Cost Comparison by Operating Scenario</h3>
                <p className="text-xs text-slate-400 mt-0.5">Hourly cloud spend ($/hr) based on simulated parameters</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="scenario" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    formatter={(val: any) => [`$${val}/hr`, 'Hourly Spend']}
                  />
                  <Bar dataKey="cost" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={42}>
                    <Cell fill="#ef4444" />
                    <Cell fill="#10b981" />
                    <Cell fill="#64748b" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
              {comparisonData.map(c => (
                <div key={c.scenario} className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                  <div className="font-semibold text-white">${c.cost.toFixed(2)}/h</div>
                  <div className="text-[11px] text-slate-400">{c.scenario}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sizing Recommendations Advice */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">FinOps Analysis & Feasibility</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Reducing the GPU fleet from <strong>22</strong> to <strong>12</strong> instances maintains 
              sufficient transcoding headroom for the observed 12% workload increase, bringing GPU utilization 
              back to an optimal <strong>74%</strong> without causing queue latency degradation.
            </p>
            <div className="flex items-center text-xs text-emerald-400 font-semibold pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></span>
              Recommended Action: Rollback deployment to v41 and clamp max autoscaling replicas to 14.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
