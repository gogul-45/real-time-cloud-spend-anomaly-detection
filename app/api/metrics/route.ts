import { NextRequest, NextResponse } from 'next/server';
import { globalMetrics } from '@/lib/observability/metrics';
import { useStore } from '@/store/useStore';

export async function GET(req: NextRequest) {
  const store = useStore.getState();
  const format = req.nextUrl.searchParams.get('format');

  // Update dynamic metrics from current store
  const activeCount = store.anomalies.filter(a => a.status !== 'RESOLVED').length;
  const criticalCount = store.anomalies.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const totalCost = store.billingEvents.reduce((acc, e) => acc + e.hourlyCost, 0);
  const currentHourlySpend = store.billingEvents.length > 0 ? store.billingEvents[store.billingEvents.length - 1].hourlyCost : 0;

  globalMetrics.setGauge('finops_active_anomalies_count', 'Current active detected anomalies', activeCount);
  globalMetrics.setGauge('finops_critical_anomalies_count', 'Current critical severity anomalies', criticalCount);
  globalMetrics.setGauge('finops_hourly_spend_rate_dollars', 'Current hourly cloud spend in USD', currentHourlySpend);
  globalMetrics.setGauge('finops_total_accumulated_spend_dollars', 'Total accumulated monitored spend in USD', totalCost);
  globalMetrics.setGauge('finops_total_events_in_memory', 'Total billing events stored in memory', store.billingEvents.length);

  if (format === 'json') {
    return NextResponse.json(globalMetrics.getSummaryJson());
  }

  const prometheusBody = globalMetrics.exportPrometheusFormat();

  return new NextResponse(prometheusBody, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
    },
  });
}
