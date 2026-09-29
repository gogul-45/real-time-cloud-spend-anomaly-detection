import { NextResponse } from 'next/server';
import { useStore } from '@/store/useStore';
import { loadDemoScenario } from '@/lib/demoData';

export async function GET() {
  const store = useStore.getState();
  if (store.billingEvents.length === 0) {
    loadDemoScenario();
  }

  const state = useStore.getState();
  const latestBilling = state.billingEvents[state.billingEvents.length - 1];
  const previousBilling = state.billingEvents[state.billingEvents.length - 2];
  
  const currentHourlySpend = latestBilling ? latestBilling.hourlyCost : 186.0;
  const previousHourlySpend = previousBilling ? previousBilling.hourlyCost : 72.0;
  const baseline = 72.0;

  const totalSpendToday = state.billingEvents.reduce((acc, curr) => acc + curr.hourlyCost, 0);
  const activeAnomalies = state.anomalies.filter(a => a.status !== 'RESOLVED' && a.status !== 'SUPPRESSED');
  const criticalAnomalies = activeAnomalies.filter(a => a.severity === 'CRITICAL');

  const dq = state.getDataQualityMetrics();

  return NextResponse.json({
    kpis: {
      totalSpendToday: Number(totalSpendToday.toFixed(2)),
      currentHourlySpend,
      previousHourlySpend,
      baseline,
      forecastNext6h: 208.0,
      activeAnomaliesCount: activeAnomalies.length,
      criticalAnomaliesCount: criticalAnomalies.length,
      detectionLatencySeconds: 4.2,
      notificationLatencySeconds: 11.5,
      potentialExcessCost6h: 732.0,
      dataQualityScore: dq.overallQuality
    },
    activeAnomalies,
    latestEvents: state.billingEvents.slice(-10),
    systemStatus: 'OPERATIONAL'
  });
}
