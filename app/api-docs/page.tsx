'use client';

import { useState } from 'react';
import { 
  FileCode2, 
  Play, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Code2, 
  Server,
  Layers
} from 'lucide-react';

interface Endpoint {
  method: 'GET' | 'POST';
  path: string;
  category: string;
  summary: string;
  description: string;
  params?: Array<{ name: string; type: string; required: boolean; desc: string }>;
  sampleBody?: string;
  sampleResponse: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/health',
    category: 'System & Probes',
    summary: 'System Health & Readiness',
    description: 'Returns health probe status of detection engine, ingestion pipeline, database, and system memory.',
    sampleResponse: JSON.stringify({
      status: 'HEALTHY',
      version: '1.0.0',
      uptimeSeconds: 340,
      checks: {
        detectionEngine: { status: 'UP', activeAnomalies: 1 },
        ingestionPipeline: { status: 'UP', eventsIngestedTotal: 48 },
        database: { status: 'UP', driver: 'SQLite/Memory-Sync' }
      }
    }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/metrics',
    category: 'Observability',
    summary: 'Prometheus Metrics Exposition',
    description: 'Returns Prometheus exposition text format or JSON telemetry.',
    params: [
      { name: 'format', type: 'string', required: false, desc: 'Optional: "json" or default Prometheus text' }
    ],
    sampleResponse: `# HELP finops_active_anomalies_count Current active detected anomalies\n# TYPE finops_active_anomalies_count gauge\nfinops_active_anomalies_count 1\n# HELP finops_hourly_spend_rate_dollars Current hourly cloud spend in USD\n# TYPE finops_hourly_spend_rate_dollars gauge\nfinops_hourly_spend_rate_dollars 186.4`
  },
  {
    method: 'GET',
    path: '/api/anomalies',
    category: 'Anomaly Engine',
    summary: 'List Detected Anomalies',
    description: 'Retrieves all active, acknowledged, or resolved anomalies with scorecard evidence and attribution.',
    sampleResponse: JSON.stringify([
      {
        anomalyId: 'anom-8f9a-1c',
        resourceId: 'GPU-TRANSCODER-07',
        service: 'Compute Engine',
        severity: 'CRITICAL',
        compositeScore: 0.94,
        status: 'DETECTED',
        owner: 'video-platform-team@company.com'
      }
    ], null, 2)
  },
  {
    method: 'POST',
    path: '/api/simulate',
    category: 'Simulation',
    summary: 'Inject Synthetic Scenario',
    description: 'Injects runaway GPU compute spike, legitimate scaling, out-of-order arrival, or delayed event.',
    sampleBody: JSON.stringify({
      scenario: 'RUNAWAY_GPU',
      resourceId: 'GPU-TRANSCODER-07'
    }, null, 2),
    sampleResponse: JSON.stringify({
      success: true,
      message: 'Simulated RUNAWAY_GPU event injected successfully.',
      anomalyId: 'anom-9c3f-2b'
    }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/adapters',
    category: 'Cloud Providers',
    summary: 'Cloud Provider Status & Latency',
    description: 'Tests connectivity to AWS CUR, Azure Cost API, GCP BigQuery, or Simulator.',
    params: [
      { name: 'provider', type: 'string', required: false, desc: 'AWS, AZURE, GCP, or SIMULATOR' }
    ],
    sampleResponse: JSON.stringify({
      activeProvider: 'AWS',
      providerName: 'Amazon Web Services (CUR & CloudWatch)',
      connection: { success: true, latencyMs: 78, message: 'Athena connected.' }
    }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/reports/rca',
    category: 'Reporting & RCA',
    summary: 'Generate Root Cause Analysis (RCA)',
    description: 'Generates comprehensive post-mortem report in JSON or Markdown format.',
    params: [
      { name: 'id', type: 'string', required: false, desc: 'Specific anomalyId' },
      { name: 'format', type: 'string', required: false, desc: 'json or markdown' }
    ],
    sampleResponse: JSON.stringify({
      reportId: 'RCA-8F9A1C',
      incidentTitle: 'Post-Mortem: Severe Cloud Spend Anomaly on Compute Engine',
      financialImpact: { baselineHourlyRate: '$72.00/hr', peakAnomalyRate: '$186.40/hr', increasePercentage: '+158.9%' },
      rootCauseAttribution: { primaryCause: 'Configuration mismatch in deployment video-transcoder-v42' }
    }, null, 2)
  }
];

export default function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(ENDPOINTS[0]);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    setTestOutput(null);
    try {
      const res = await fetch(selectedEndpoint.path, {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: selectedEndpoint.method === 'POST' ? selectedEndpoint.sampleBody : undefined
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        setTestOutput(JSON.stringify(data, null, 2));
      } else {
        const text = await res.text();
        setTestOutput(text);
      }
    } catch (err) {
      setTestOutput(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileCode2 className="h-6 w-6 text-indigo-400" />
            Interactive API Explorer & OpenAPI 3.0 Documentation
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete production specification for FinOps Sentinel REST endpoints, health probes, and metrics.
          </p>
        </div>
        <a
          href="/api/openapi.json"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Raw OpenAPI JSON
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoint List Sidebar */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-400 font-mono px-1">
            API Endpoints ({ENDPOINTS.length})
          </span>
          <div className="space-y-1.5">
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
              return (
                <div
                  key={`${ep.method}-${ep.path}`}
                  onClick={() => {
                    setSelectedEndpoint(ep);
                    setTestOutput(null);
                  }}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 text-white'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold font-mono ${
                      ep.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-semibold">{ep.path}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{ep.summary}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Endpoint Details & Live Runner */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className={`rounded px-2 py-0.5 text-xs font-bold font-mono ${
                  selectedEndpoint.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {selectedEndpoint.method}
                </span>
                <span className="text-base font-mono font-bold text-white">{selectedEndpoint.path}</span>
              </div>
              <button
                onClick={handleExecute}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Play className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Executing...' : 'Try It Out (Live)'}
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedEndpoint.description}
            </p>

            {selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase font-mono">Query Parameters</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-500 font-mono">
                      <tr>
                        <th className="pb-1.5">Name</th>
                        <th className="pb-1.5">Type</th>
                        <th className="pb-1.5">Required</th>
                        <th className="pb-1.5">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {selectedEndpoint.params.map(p => (
                        <tr key={p.name}>
                          <td className="py-1.5 font-mono text-indigo-300">{p.name}</td>
                          <td className="py-1.5 font-mono text-slate-400">{p.type}</td>
                          <td className="py-1.5 text-slate-400">{p.required ? 'Yes' : 'No'}</td>
                          <td className="py-1.5 text-slate-400">{p.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Response Viewer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>{testOutput ? 'Live Server Response' : 'Example Response Payload'}</span>
                <span className="font-mono text-emerald-400">{testOutput ? 'STATUS: 200 OK' : 'HTTP 200'}</span>
              </div>
              <pre className="rounded-lg bg-slate-950 p-4 text-[11px] font-mono text-slate-200 overflow-x-auto max-h-72 border border-slate-800">
                {testOutput || selectedEndpoint.sampleResponse}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
