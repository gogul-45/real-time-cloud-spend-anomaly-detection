import { NextRequest, NextResponse } from 'next/server';
import { useStore } from '@/store/useStore';

export async function GET(req: NextRequest) {
  const store = useStore.getState();
  const anomalyId = req.nextUrl.searchParams.get('id');
  const format = req.nextUrl.searchParams.get('format') || 'json';

  const anomaly = anomalyId 
    ? store.anomalies.find(a => a.anomalyId === anomalyId) 
    : store.anomalies[0];

  if (!anomaly) {
    return NextResponse.json({ error: 'No anomalies found for report generation' }, { status: 404 });
  }

  const durationHours = Math.max(1, Math.round((Date.now() - anomaly.onsetTime) / 3600000));
  const excessCost = ((anomaly.evidence.costActual - anomaly.evidence.costBaseline) * durationHours).toFixed(2);

  const reportData = {
    reportId: `RCA-${anomaly.anomalyId.slice(0, 8).toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    incidentTitle: `Post-Mortem: Severe Cloud Spend Anomaly on ${anomaly.service} (${anomaly.resourceId})`,
    severity: anomaly.severity,
    status: anomaly.status,
    incidentOwner: anomaly.owner,
    financialImpact: {
      baselineHourlyRate: `$${anomaly.evidence.costBaseline.toFixed(2)}/hr`,
      peakAnomalyRate: `$${anomaly.evidence.costActual.toFixed(2)}/hr`,
      increasePercentage: `+${anomaly.evidence.percentageIncrease.toFixed(1)}%`,
      estimatedTotalLoss: `$${excessCost}`,
    },
    rootCauseAttribution: {
      primaryCause: anomaly.evidence.deployments.length > 0 
        ? `Configuration mismatch in deployment ${anomaly.evidence.deployments[0].deploymentId}`
        : 'Unauthorized unconstrained resource auto-scaling',
      correlatedDeployment: anomaly.evidence.deployments[0] || null,
      correlatedResourceChange: anomaly.evidence.resourceChanges[0] || null,
      workloadGrowthDisparity: anomaly.evidence.workloadBefore && anomaly.evidence.workloadAfter 
        ? `Workload grew +${(((anomaly.evidence.workloadAfter.jobsPerHour - anomaly.evidence.workloadBefore.jobsPerHour) / anomaly.evidence.workloadBefore.jobsPerHour) * 100).toFixed(1)}% while cost spiked +${anomaly.evidence.percentageIncrease.toFixed(1)}%`
        : 'Disproportionate cost growth detected',
    },
    timeline: anomaly.evidence.timeline.map(t => ({
      time: new Date(t.timestamp).toLocaleTimeString(),
      event: t.title,
      description: t.description,
    })),
    containmentActionTaken: anomaly.recommendedAction,
    preventativeMeasures: [
      'Enforce hard budget capping limits on GPU node pool autoscaling groups.',
      'Require mandatory FinOps cost estimation CI checks for deployment pull requests.',
      'Deploy real-time automated canary scaling constraints on new microservice releases.',
      'Enable automated circuit breakers when hourly spend exceeds 150% baseline without matching queue depth.'
    ]
  };

  if (format === 'markdown') {
    const md = `
# INCIDENT ROOT CAUSE ANALYSIS (RCA) POST-MORTEM
**Incident Report ID:** ${reportData.reportId}
**Date:** ${new Date().toLocaleDateString()}
**Service:** ${anomaly.service} | **Resource:** ${anomaly.resourceId}
**Severity:** ${reportData.severity} | **Status:** ${reportData.status}
**Accountable Owner:** ${reportData.incidentOwner}

---

## 1. Executive Financial Summary
- **Baseline Cost:** ${reportData.financialImpact.baselineHourlyRate}
- **Peak Cost:** ${reportData.financialImpact.peakAnomalyRate}
- **Cost Surge:** ${reportData.financialImpact.increasePercentage}
- **Total Financial Excess:** ${reportData.financialImpact.estimatedTotalLoss}

---

## 2. Root Cause Summary
${reportData.rootCauseAttribution.primaryCause}

${reportData.rootCauseAttribution.workloadGrowthDisparity}

---

## 3. Incident Timeline
${reportData.timeline.map(t => `- **${t.time}**: ${t.event} — ${t.description}`).join('\n')}

---

## 4. Preventative Measures & Action Items
${reportData.preventativeMeasures.map((m, i) => `${i + 1}. ${m}`).join('\n')}
    `.trim();

    return new NextResponse(md, {
      status: 200,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
    });
  }

  return NextResponse.json(reportData);
}
