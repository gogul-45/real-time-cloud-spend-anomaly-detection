'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Gauge, 
  BarChart2, 
  Zap,
  RefreshCw 
} from 'lucide-react';
import { generateCalibrationCurve } from '@/lib/monitoring/drift';

export default function ModelMonitoringPage() {
  const [driftIndex, setDriftIndex] = useState(0.12);
  const [driftStatus, setDriftStatus] = useState<'STABLE' | 'MODERATE_DRIFT' | 'ACTION_REQUIRED'>('STABLE');
  const [ksStatistic, setKsStatistic] = useState(0.14);
  const [pValue, setPValue] = useState(0.82);
  const [selectedThreshold, setSelectedThreshold] = useState(0.60);
  const calibrationPoints = generateCalibrationCurve();

  const handleSimulateDrift = () => {
    setDriftIndex(0.68);
    setDriftStatus('ACTION_REQUIRED');
    setKsStatistic(0.48);
    setPValue(0.002);
  };

  const handleResetBaseline = () => {
    setDriftIndex(0.12);
    setDriftStatus('STABLE');
    setKsStatistic(0.14);
    setPValue(0.82);
  };

  const currentPoint = calibrationPoints.find(p => Math.abs(p.threshold - selectedThreshold) < 0.05) || calibrationPoints[3];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Gauge className="h-6 w-6 text-indigo-400" />
            Detector Health, Concept Drift & Calibration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Continuous verification of detection quality, distribution shift, statistical significance, and ROC calibration.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateDrift}
            className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            Simulate Cloud Workload Drift
          </button>
          <button
            onClick={handleResetBaseline}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="h-3 w-3" /> Re-calibrate Baseline
          </button>
        </div>
      </div>

      {/* KPI Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Concept Drift Index</span>
            <Activity className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">
            {driftIndex.toFixed(2)}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${
              driftStatus === 'STABLE' ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'
            }`} />
            <span className={`text-xs font-semibold ${
              driftStatus === 'STABLE' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {driftStatus === 'STABLE' ? 'Stable (Within Bounds)' : 'Distribution Drift Detected'}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">KS-Test Statistic</span>
            <BarChart2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">
            {ksStatistic.toFixed(2)}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            p-value = <span className="font-mono text-slate-200">{pValue.toFixed(3)}</span> ({pValue > 0.05 ? 'No sig shift' : 'Statistically significant shift'})
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Detector Precision</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
            {(currentPoint.precision * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Recall: <span className="text-slate-200 font-semibold font-mono">{(currentPoint.truePositiveRate * 100).toFixed(1)}%</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">False Positive Rate (FPR)</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2 font-mono">
            {(currentPoint.falsePositiveRate * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-2">
            F1-Score: <span className="text-slate-200 font-semibold font-mono">{currentPoint.f1Score.toFixed(2)}</span>
          </p>
        </div>
      </div>

      {/* Threshold Calibration Slider & ROC Details */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-400" />
              Dynamic Threshold Calibration & Operating Point
            </h2>
            <span className="font-mono text-sm text-indigo-300 font-bold bg-indigo-950/60 border border-indigo-500/30 px-2.5 py-1 rounded">
              Score Threshold: {selectedThreshold.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tune operating sensitivity to balance false alarm mitigation against early anomaly detection velocity.
          </p>
          <input
            type="range"
            min="0.20"
            max="0.90"
            step="0.05"
            value={selectedThreshold}
            onChange={(e) => setSelectedThreshold(parseFloat(e.target.value))}
            className="w-full mt-4 accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* ROC Table Points */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono">
              <tr>
                <th className="p-3">Operating Threshold</th>
                <th className="p-3">True Positive Rate (Recall)</th>
                <th className="p-3">False Positive Rate (FPR)</th>
                <th className="p-3">Precision</th>
                <th className="p-3">F1-Score</th>
                <th className="p-3">Operating Regime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {calibrationPoints.map((pt) => {
                const isClosest = Math.abs(pt.threshold - selectedThreshold) < 0.05;
                return (
                  <tr key={pt.threshold} className={isClosest ? 'bg-indigo-950/40 text-white font-medium' : 'text-slate-300 hover:bg-slate-800/40'}>
                    <td className="p-3 font-mono">
                      {pt.threshold.toFixed(2)} {isClosest && <span className="text-[10px] text-indigo-400 ml-1.5">(Selected)</span>}
                    </td>
                    <td className="p-3 font-mono text-emerald-400">{(pt.truePositiveRate * 100).toFixed(0)}%</td>
                    <td className="p-3 font-mono text-amber-400">{(pt.falsePositiveRate * 100).toFixed(0)}%</td>
                    <td className="p-3 font-mono">{(pt.precision * 100).toFixed(0)}%</td>
                    <td className="p-3 font-mono font-bold">{pt.f1Score.toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        pt.threshold >= 0.7 ? 'bg-blue-500/10 text-blue-400' :
                        pt.threshold >= 0.5 ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {pt.threshold >= 0.7 ? 'High Precision' : pt.threshold >= 0.5 ? 'Balanced (Production)' : 'High Recall / Sensitive'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
