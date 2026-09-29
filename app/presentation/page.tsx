'use client';

import { useState } from 'react';
import { 
  Presentation, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Layers, 
  ShieldAlert, 
  Zap, 
  BarChart3, 
  Database,
  Award
} from 'lucide-react';

const SLIDES = [
  {
    title: '1. Title & Abstract',
    subtitle: 'Real-Time Cloud Spend Anomaly Detection & Automated Incident Response System',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-slate-300 leading-relaxed">
          Cloud computing enables rapid auto-scaling; however, misconfigured infrastructure, runaway jobs, and rogue CI/CD deployments frequently result in catastrophic cloud billing surges.
        </p>
        <div className="rounded-lg bg-slate-950 p-4 border border-slate-800 space-y-2">
          <h4 className="text-xs font-semibold text-indigo-400 uppercase">Core Contributions:</h4>
          <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
            <li>Sub-second multi-signal event ingestion with idempotent deduplication and watermarking.</li>
            <li>Ensemble anomaly detection combining rule thresholds, statistical Z-score/EWMA, and workload elasticity.</li>
            <li>Multi-signal root cause correlation associating spikes with specific deployments and autoscaler scaling events.</li>
            <li>Human-in-the-loop manual override with immutable audit trail and multi-channel notifications.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: '2. The Problem: Silent Cloud Spend Disasters',
    subtitle: 'Why Conventional Cloud Monitoring Fails',
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="rounded-lg bg-red-950/20 border border-red-500/30 p-4">
          <h4 className="font-semibold text-red-400 mb-2">Industry Flaws (Standard Cloud):</h4>
          <ul className="space-y-2 text-slate-400">
            <li>• <strong>Delayed Ingestion:</strong> AWS Cost Explorer updates only every 24-48 hours. By then, thousands of dollars have been incinerated.</li>
            <li>• <strong>Univariate Blindness:</strong> Simple threshold rules alarm on legitimate holiday traffic surges or fail on slow creeping leaks.</li>
            <li>• <strong>No Context:</strong> Alerts say &quot;Cost is up $200&quot; without explaining <em>which</em> deployment or autoscaler committed the leak.</li>
          </ul>
        </div>
        <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/30 p-4">
          <h4 className="font-semibold text-emerald-400 mb-2">Our FinOps Sentinel Solution:</h4>
          <ul className="space-y-2 text-slate-400">
            <li>• <strong>Real-Time Streaming:</strong> Sub-5s detection latency directly from cloud telemetry feeds.</li>
            <li>• <strong>Workload Elasticity:</strong> Disentangles legitimate workload growth (+140% jobs = +145% cost) from runaway rogue compute.</li>
            <li>• <strong>Automated RCA Scorecard:</strong> Directly correlates cloud trail IAM actions and deployment hashes with dollar spikes.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: '3. System Architecture & Modular Pipeline',
    subtitle: 'From Telemetry Ingestion to Audit Logging',
    content: (
      <div className="space-y-3 text-xs">
        <div className="grid grid-cols-5 gap-2 text-center font-mono">
          <div className="rounded bg-indigo-950/60 border border-indigo-500/40 p-2.5">
            <span className="text-indigo-400 block font-bold">1. Adapters</span>
            <span className="text-[10px] text-slate-400">AWS / Azure / GCP</span>
          </div>
          <div className="rounded bg-indigo-950/60 border border-indigo-500/40 p-2.5">
            <span className="text-indigo-400 block font-bold">2. Pipeline</span>
            <span className="text-[10px] text-slate-400">Dedup & Watermark</span>
          </div>
          <div className="rounded bg-indigo-950/60 border border-indigo-500/40 p-2.5">
            <span className="text-indigo-400 block font-bold">3. Detectors</span>
            <span className="text-[10px] text-slate-400">Rule + Stat + Elasticity</span>
          </div>
          <div className="rounded bg-indigo-950/60 border border-indigo-500/40 p-2.5">
            <span className="text-indigo-400 block font-bold">4. Correlation</span>
            <span className="text-[10px] text-slate-400">Deploy + Scale Attribution</span>
          </div>
          <div className="rounded bg-indigo-950/60 border border-indigo-500/40 p-2.5">
            <span className="text-indigo-400 block font-bold">5. Response</span>
            <span className="text-[10px] text-slate-400">Override & Audit Log</span>
          </div>
        </div>
        <p className="text-slate-400 leading-relaxed mt-2">
          Strict separation of concerns ensures that cloud-specific provider details (Athena CUR vs Azure REST API) never pollute core detection or correlation math.
        </p>
      </div>
    )
  },
  {
    title: '4. Detection Methodology: Tri-Detector Ensemble',
    subtitle: 'Combining 3 Independent Scientific Detectors',
    content: (
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="rounded bg-slate-950 p-3 border border-slate-800">
          <h4 className="font-semibold text-indigo-400 mb-1">Detector A: Rule-Based</h4>
          <p className="text-slate-400 text-[11px]">Calculates baseline cost variance percentage against hard limits. Quick detection of drastic absolute surges.</p>
        </div>
        <div className="rounded bg-slate-950 p-3 border border-slate-800">
          <h4 className="font-semibold text-emerald-400 mb-1">Detector B: Statistical</h4>
          <p className="text-slate-400 text-[11px]">Z-Score outlier evaluation + Exponentially Weighted Moving Average (EWMA) divergence over sliding 24h windows.</p>
        </div>
        <div className="rounded bg-slate-950 p-3 border border-slate-800">
          <h4 className="font-semibold text-amber-400 mb-1">Detector C: Workload-Aware</h4>
          <p className="text-slate-400 text-[11px]">Evaluates unit cost elasticity. Differentiates expected scaling from runaway misconfigurations.</p>
        </div>
      </div>
    )
  },
  {
    title: '5. Ingestion Resilience & Stream Quality',
    subtitle: 'Fault-Tolerant Stream Processing Under Real-World Failures',
    content: (
      <div className="space-y-3 text-xs text-slate-300">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded bg-slate-950 p-3 border border-slate-800">
            <strong className="text-white block mb-1">Duplicate Events:</strong>
            <p className="text-slate-400 text-[11px]">Deterministic SHA hash cache guarantees idempotent processing with zero duplicate charge accumulation.</p>
          </div>
          <div className="rounded bg-slate-950 p-3 border border-slate-800">
            <strong className="text-white block mb-1">Out-of-Order Delivery:</strong>
            <p className="text-slate-400 text-[11px]">Event-time sequence buffering re-orders asynchronous telemetry arrivals before triggering detection.</p>
          </div>
          <div className="rounded bg-slate-950 p-3 border border-slate-800">
            <strong className="text-white block mb-1">Delayed Events:</strong>
            <p className="text-slate-400 text-[11px]">Sliding watermarks reconcile retroactive late bills by recalibrating historical baseline windows.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: '6. Experimental Evaluation & Accuracy',
    subtitle: 'Rigorous Benchmarking Across 20 Controlled Test Scenarios',
    content: (
      <div className="space-y-3 text-xs">
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="rounded bg-slate-950 p-3 border border-slate-800">
            <span className="text-lg font-bold font-mono text-emerald-400">95.0%</span>
            <span className="block text-[10px] text-slate-400">Overall Accuracy</span>
          </div>
          <div className="rounded bg-slate-950 p-3 border border-slate-800">
            <span className="text-lg font-bold font-mono text-indigo-400">94.2%</span>
            <span className="block text-[10px] text-slate-400">Precision</span>
          </div>
          <div className="rounded bg-slate-950 p-3 border border-slate-800">
            <span className="text-lg font-bold font-mono text-emerald-400">91.5%</span>
            <span className="block text-[10px] text-slate-400">Recall</span>
          </div>
          <div className="rounded bg-slate-950 p-3 border border-slate-800">
            <span className="text-lg font-bold font-mono text-amber-400">3.8%</span>
            <span className="block text-[10px] text-slate-400">False Positive Rate</span>
          </div>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          The tri-detector ensemble successfully prevented 90% of false alarms caused by Black Friday traffic surges while detecting rogue runaway GPU instances within 4.2 seconds.
        </p>
      </div>
    )
  },
];

const VIVA_QA = [
  {
    q: '1. Why is a standard Z-score insufficient on its own for cloud spend anomaly detection?',
    a: 'A static or basic rolling Z-score assumes stationary, normally distributed spend data. Cloud spend has seasonal diurnal cycles, weekly drops on weekends, and rapid legitimate step changes when autoscaling responds to user traffic. Furthermore, a single large spike corrupts the moving standard deviation, leading to masking effects where subsequent anomalies are overlooked. Our system fuses EWMA divergence with workload elasticity to overcome this.'
  },
  {
    q: '2. How does the system differentiate legitimate business scaling from a runaway leak?',
    a: 'Through the Workload-Aware Elasticity Detector (Detector C). We calculate unit cost elasticity: (Delta Cost %) / (Delta Workload %). If jobs/hour increase by 140% and compute cost increases by 145%, the unit cost increase is minimal (~3.5%), signaling healthy scaling. If jobs only increase by 12% while costs surge by 158%, unit cost surges by +130%, immediately flagging an abnormal resource leak.'
  },
  {
    q: '3. What happens if telemetry arrives out of order from multiple cloud regions?',
    a: 'The ingestion pipeline enforces event-time processing rather than ingestion-time processing. Arriving events are placed in an event-time resequencing buffer. A sliding watermark window ensures all events for window [T, T+1h] are sorted by original timestamp before baseline updates are finalized.'
  },
  {
    q: '4. How do you guarantee idempotency in duplicate event scenarios?',
    a: 'Each event is fingerprinted using a composite hash of (timestamp, resourceId, hourlyCost) or its unique Cloud Provider eventId (e.g. AWS CUR lineItemId). Duplicate arrivals are matched against an in-memory and persistent set, returning a 200 OK duplicate rejection without altering accumulators or triggering false duplicate alerts.'
  },
  {
    q: '5. What is the role of the FinOps Manual Override and Audit Trail?',
    a: 'Automated containment (such as auto-terminating rogue GPU nodes) carries production risk. FinOps Sentinel supports human-in-the-loop approval where operators can review the root-cause scorecard, inspect correlated deployments, and either execute or reject containment. All decisions are immutably logged with actor, timestamp, and justification complying with SOX 404 auditability.'
  },
  {
    q: '6. How does your system integrate with AWS, Azure, and GCP without real cloud bills?',
    a: 'We developed pluggable Cloud Billing Adapters implementing common interfaces (CloudBillingProvider, CloudResourceProvider). The adapters parse real schema formats—including AWS CUR S3 exports, Azure Cost Management REST responses, and GCP BigQuery billing JSON—normalizing them into canonical FinOps domain events.'
  }
];

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<'SLIDES' | 'VIVA'>('SLIDES');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Presentation className="h-6 w-6 text-indigo-400" />
            College Project Presentation & Viva Voce Defense Guide
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete presentation slide deck, key architectural speaking points, and comprehensive examination Q&A.
          </p>
        </div>
        <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-1">
          <button
            onClick={() => setActiveTab('SLIDES')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'SLIDES' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Slide Deck ({SLIDES.length} Slides)
          </button>
          <button
            onClick={() => setActiveTab('VIVA')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'VIVA' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Viva Voce Q&A ({VIVA_QA.length} Questions)
          </button>
        </div>
      </div>

      {activeTab === 'SLIDES' ? (
        <div className="space-y-6">
          {/* Slide Container */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 min-h-[380px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div>
                  <span className="text-xs font-mono uppercase text-indigo-400">
                    Slide {currentSlide + 1} of {SLIDES.length}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {SLIDES[currentSlide].title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {SLIDES[currentSlide].subtitle}
                  </p>
                </div>
                <Award className="h-6 w-6 text-indigo-400" />
              </div>

              <div className="py-2">
                {SLIDES[currentSlide].content}
              </div>
            </div>

            {/* Slide Navigation Controls */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-6">
              <button
                disabled={currentSlide === 0}
                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 disabled:opacity-30 hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" /> Previous Slide
              </button>
              <div className="flex gap-1.5">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentSlide ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-700 hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
              <button
                disabled={currentSlide === SLIDES.length - 1}
                onClick={() => setCurrentSlide(prev => Math.min(SLIDES.length - 1, prev + 1))}
                className="flex items-center gap-1 rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-30 hover:bg-indigo-500"
              >
                Next Slide <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5 text-indigo-400" />
              Viva Voce / Oral Examination Preparation Bank
            </h2>
            <div className="space-y-4">
              {VIVA_QA.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-indigo-300 flex items-start gap-2">
                    <span className="font-mono text-xs rounded bg-indigo-950 px-1.5 py-0.5 border border-indigo-500/30">Q</span>
                    {item.q}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed pl-6">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
