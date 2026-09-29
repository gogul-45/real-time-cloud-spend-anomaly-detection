import { NextRequest, NextResponse } from 'next/server';
import { useStore } from '@/store/useStore';
import { loadDemoScenario } from '@/lib/demoData';

export async function GET(req: NextRequest) {
  const store = useStore.getState();
  if (store.billingEvents.length === 0) {
    loadDemoScenario();
  }

  const state = useStore.getState();
  const { searchParams } = new URL(req.url);
  const service = searchParams.get('service');
  const environment = searchParams.get('environment');
  const severity = searchParams.get('severity');

  let filteredBilling = state.billingEvents;
  if (service) filteredBilling = filteredBilling.filter(b => b.service === service);
  if (environment) filteredBilling = filteredBilling.filter(b => b.environment === environment);

  let filteredAnomalies = state.anomalies;
  if (severity) filteredAnomalies = filteredAnomalies.filter(a => a.severity.toLowerCase() === severity.toLowerCase());

  const totalCloudSpend = filteredBilling.reduce((sum, b) => sum + b.hourlyCost, 0);
  const baselineCostEstimate = filteredBilling.length * 72; // $72/hr benchmark
  const anomalousSpend = Math.max(0, totalCloudSpend - baselineCostEstimate);
  const avoidedPotentialExcessSpend = 732.0;

  // Breakdown by service
  const serviceMap: Record<string, number> = {};
  filteredBilling.forEach(b => {
    serviceMap[b.service] = (serviceMap[b.service] || 0) + b.hourlyCost;
  });
  const serviceBreakdown = Object.entries(serviceMap).map(([name, spend]) => ({
    name,
    spend: Number(spend.toFixed(2)),
    percentage: Number(((spend / (totalCloudSpend || 1)) * 100).toFixed(1))
  }));

  // Hourly timeline
  const hourlyTrends = filteredBilling.slice(-24).map(b => ({
    time: new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    hourlyCost: b.hourlyCost,
    baseline: 72,
    service: b.service
  }));

  return NextResponse.json({
    metrics: {
      totalCloudSpend: Number(totalCloudSpend.toFixed(2)),
      anomalousSpend: Number(anomalousSpend.toFixed(2)),
      avoidedPotentialExcessSpend,
      totalAnomaliesCount: filteredAnomalies.length,
      criticalAnomaliesCount: filteredAnomalies.filter(a => a.severity === 'CRITICAL').length,
      averageDetectionLatencySecs: 4.2,
      averageNotificationLatencySecs: 11.5,
      resourceScalingEventsCount: state.resourceEvents.length
    },
    serviceBreakdown,
    hourlyTrends,
    recentAnomalies: filteredAnomalies.slice(0, 10)
  });
}
