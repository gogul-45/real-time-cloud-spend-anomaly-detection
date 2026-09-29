import { NextRequest, NextResponse } from 'next/server';
import { cloudAdapters, CloudProviderType } from '@/lib/adapters/cloud-providers';

export async function GET(req: NextRequest) {
  const provider = (req.nextUrl.searchParams.get('provider') || 'SIMULATOR').toUpperCase() as CloudProviderType;
  const adapter = cloudAdapters[provider] || cloudAdapters.SIMULATOR;

  const testResult = await adapter.testConnection();
  const sampleBilling = await adapter.fetchBillingEvents();
  const sampleResource = await adapter.fetchResourceChanges();
  const sampleDeployments = await adapter.fetchDeployments();
  const sampleWorkload = await adapter.fetchWorkloadMetrics();

  return NextResponse.json({
    activeProvider: provider,
    providerName: adapter.providerName,
    connection: testResult,
    samplePayloads: {
      billingRecordsCount: sampleBilling.length,
      sampleBilling: sampleBilling[0] || null,
      sampleResourceChange: sampleResource[0] || null,
      sampleDeployment: sampleDeployments[0] || null,
      sampleWorkload: sampleWorkload[0] || null,
    },
    availableProviders: [
      { id: 'SIMULATOR', name: 'Synthetic FinOps Engine (Built-in)', status: 'ACTIVE' },
      { id: 'AWS', name: 'Amazon Web Services (CUR + Athena + CloudWatch)', status: 'AVAILABLE' },
      { id: 'AZURE', name: 'Microsoft Azure (Cost Management API + Monitor)', status: 'AVAILABLE' },
      { id: 'GCP', name: 'Google Cloud Platform (BigQuery Export + Metrics)', status: 'AVAILABLE' },
    ]
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetProvider = (body.provider || 'SIMULATOR').toUpperCase() as CloudProviderType;
    const adapter = cloudAdapters[targetProvider] || cloudAdapters.SIMULATOR;

    const test = await adapter.testConnection();

    return NextResponse.json({
      success: true,
      message: `Active ingestion provider switched to ${adapter.providerName}`,
      provider: targetProvider,
      details: test
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 400 });
  }
}
