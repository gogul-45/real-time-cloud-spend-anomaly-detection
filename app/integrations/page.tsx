'use client';

import { useState } from 'react';
import { CloudProviderType, cloudAdapters } from '@/lib/adapters/cloud-providers';
import { 
  Cloud, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Database,
  ExternalLink
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function IntegrationsPage() {
  const [selectedProvider, setSelectedProvider] = useState<CloudProviderType>('AWS');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; message: string } | null>(null);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const { addBillingEvent, addSystemLog } = useStore();

  const handleTestConnection = async (provider: CloudProviderType) => {
    setTesting(true);
    setTestResult(null);
    try {
      const adapter = cloudAdapters[provider];
      const res = await adapter.testConnection();
      setTestResult(res);
    } catch {
      setTestResult({ success: false, latencyMs: 0, message: 'Connection test failed.' });
    } finally {
      setTesting(false);
    }
  };

  const handleIngestSampleBatch = async (provider: CloudProviderType) => {
    setIngestStatus('Ingesting sample cloud billing records...');
    try {
      const adapter = cloudAdapters[provider];
      const records = await adapter.fetchBillingEvents();
      records.forEach((rec) => {
        addBillingEvent(rec);
      });
      addSystemLog({
        level: 'INFO',
        message: `Cloud Adapter [${provider}] ingested ${records.length} billing records into pipeline.`,
        source: 'cloud-adapter'
      });
      setIngestStatus(`Successfully ingested ${records.length} records from ${adapter.providerName}!`);
      setTimeout(() => setIngestStatus(null), 4000);
    } catch (err) {
      setIngestStatus(`Ingestion failed: ${(err as Error).message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cloud className="h-6 w-6 text-indigo-400" />
            Cloud Provider Adapters & Ingestion Normalizer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pluggable provider abstraction layer translating proprietary cloud telemetry into unified FinOps domain events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Normalization Engine Active
          </span>
        </div>
      </div>

      {/* Provider Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { id: 'SIMULATOR', name: 'FinOps Testbed', type: 'Synthetic Engine', desc: 'Pre-configured scenarios with rapid event generation.' },
          { id: 'AWS', name: 'Amazon Web Services', type: 'CUR + Athena + CloudTrail', desc: 'Parses AWS Cost & Usage Reports, CloudWatch metrics, EC2 ASG.' },
          { id: 'AZURE', name: 'Microsoft Azure', type: 'Cost API + Azure Monitor', desc: 'Consumes Azure Cost Management API exports and VMSS events.' },
          { id: 'GCP', name: 'Google Cloud Platform', type: 'BigQuery Billing Export', desc: 'Queries Cloud Billing BigQuery schema and Cloud Audit logs.' },
        ].map((p) => {
          const isSelected = selectedProvider === p.id;
          return (
            <div
              key={p.id}
              onClick={() => {
                setSelectedProvider(p.id as CloudProviderType);
                setTestResult(null);
              }}
              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-indigo-400">{p.id}</span>
                {isSelected && <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />}
              </div>
              <h3 className="mt-2 text-base font-semibold text-white">{p.name}</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">{p.type}</p>
              <p className="text-xs text-slate-500 mt-2">{p.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Selected Provider Details & Action Workbench */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              Adapter Configuration: {cloudAdapters[selectedProvider].providerName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Protocol: <span className="font-mono text-slate-300">Push/Pull Event Broker</span> • Schema Version: <span className="font-mono text-slate-300">v1.2.0</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTestConnection(selectedProvider)}
              disabled={testing}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testing...' : 'Test Provider Connection'}
            </button>
            <button
              onClick={() => handleIngestSampleBatch(selectedProvider)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
            >
              <Database className="h-3.5 w-3.5" />
              Ingest Sample Telemetry Batch
            </button>
          </div>
        </div>

        {/* Test Result Toast */}
        {testResult && (
          <div className={`rounded-lg p-3.5 border text-xs flex items-center justify-between ${
            testResult.success 
              ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300' 
              : 'border-red-500/30 bg-red-950/40 text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{testResult.message}</span>
            </div>
            <span className="font-mono font-semibold">Latency: {testResult.latencyMs}ms</span>
          </div>
        )}

        {ingestStatus && (
          <div className="rounded-lg p-3 border border-indigo-500/30 bg-indigo-950/40 text-xs text-indigo-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{ingestStatus}</span>
          </div>
        )}

        {/* Normalization Architecture Schema Mapping */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-400">
              <span>Raw Provider Payload (Cloud Source)</span>
              <span className="font-mono text-indigo-400">{selectedProvider}_SCHEMA</span>
            </div>
            <pre className="mt-3 text-[11px] font-mono text-amber-300/90 overflow-x-auto leading-relaxed">
{selectedProvider === 'AWS' && `{
  "lineItem_ResourceId": "arn:aws:ec2:us-east-1:123456789012:instance/i-0a88bf79b",
  "lineItem_ProductCode": "AmazonEC2",
  "lineItem_UsageStartDate": "2026-09-28T14:00:00Z",
  "lineItem_UnblendedCost": 194.20,
  "product_region": "us-east-1",
  "resourceTags_user_Environment": "production",
  "resourceTags_user_Application": "media-transcoder",
  "resourceTags_user_DeploymentId": "deploy-aws-v42"
}`}
{selectedProvider === 'AZURE' && `{
  "resourceId": "/subscriptions/sub-1/rg-media-prod/virtualMachines/vm-nc6s-v3",
  "serviceName": "Virtual Machines (Tesla V100)",
  "usageDateTime": "2026-09-28T14:00:00Z",
  "preTaxCost": 178.90,
  "resourceLocation": "eastus",
  "tags": {
    "Environment": "production",
    "Application": "video-rendering-azure",
    "DeploymentId": "azure-rel-42"
  }
}`}
{selectedProvider === 'GCP' && `{
  "resource_global_name": "//compute.googleapis.com/instances/a2-highgpu-1g",
  "service_description": "Compute Engine (NVIDIA A100 GPU)",
  "usage_start_time": "2026-09-28T14:00:00Z",
  "cost": 182.50,
  "location_region": "us-central1",
  "labels": [
    { "key": "env", "value": "production" },
    { "key": "app", "value": "video-transcoder" },
    { "key": "deploy_id", "value": "gcp-rel-v42" }
  ]
}`}
{selectedProvider === 'SIMULATOR' && `{
  "service": "Compute Engine",
  "resourceId": "GPU-TRANSCODER-07",
  "hourlyCost": 186.40,
  "deploymentId": "video-transcoder-v42",
  "workloadType": "video-transcoding"
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ArrowRight className="h-3.5 w-3.5" />
                Normalized FinOps Domain Event (Canonical Model)
              </span>
              <span className="font-mono text-emerald-400">BillingEvent</span>
            </div>
            <pre className="mt-3 text-[11px] font-mono text-emerald-300/90 overflow-x-auto leading-relaxed">
{`{
  "eventId": "bil-norm-8f2a1b9c",
  "timestamp": 1790604000000,
  "source": "${cloudAdapters[selectedProvider].providerName}",
  "service": "Compute Engine",
  "resourceId": "GPU-TRANSCODER-07",
  "hourlyCost": 186.40,
  "region": "us-east-1",
  "environment": "production",
  "deploymentId": "deploy-v42",
  "workloadType": "gpu-accelerated-compute"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
