import { NextRequest, NextResponse } from 'next/server';
import { EXPERIMENT_SCENARIOS, computeMetricsForThreshold } from '@/lib/experiments';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const threshold = parseFloat(searchParams.get('threshold') || '0.65');

  const ensembleMetrics = computeMetricsForThreshold(threshold, 'ensemble');
  const ruleMetrics = computeMetricsForThreshold(threshold, 'rule');
  const statMetrics = computeMetricsForThreshold(threshold, 'stat');
  const workloadMetrics = computeMetricsForThreshold(threshold, 'workload');

  return NextResponse.json({
    threshold,
    models: {
      ensemble: ensembleMetrics,
      ruleBased: ruleMetrics,
      statistical: statMetrics,
      workloadAware: workloadMetrics
    },
    latencyExperiment: {
      baselineProcessMins: 60,
      proposedSystemSecs: 4.2,
      latencyImprovementPct: 99.88,
      detectionLatencySecs: 4.2,
      notificationLatencySecs: 11.5,
      acknowledgementLatencySecs: 45.0,
      endToEndSecs: 60.7
    },
    scenarios: EXPERIMENT_SCENARIOS
  });
}
