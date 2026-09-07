import { BillingEvent, ResourceChangeEvent, DeploymentEvent, WorkloadMetric, Anomaly, ThresholdSettings, Evidence, AuditEvent } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function calculateBaseline(
  billingEvents: BillingEvent[],
  currentEvent: BillingEvent,
  windowHours: number
): { baselineCost: number; zScore: number; stdDev: number } {
  const windowMs = windowHours * 60 * 60 * 1000;
  const recentEvents = billingEvents.filter(
    (e) => e.resourceId === currentEvent.resourceId && e.timestamp < currentEvent.timestamp && e.timestamp >= currentEvent.timestamp - windowMs
  );

  if (recentEvents.length === 0) {
    return { baselineCost: currentEvent.hourlyCost, zScore: 0, stdDev: 0 };
  }

  const costs = recentEvents.map((e) => e.hourlyCost);
  const mean = costs.reduce((a, b) => a + b, 0) / costs.length;
  
  if (costs.length === 1) {
    return { baselineCost: mean, zScore: 0, stdDev: 0 };
  }

  const variance = costs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (costs.length - 1);
  const stdDev = Math.sqrt(variance);
  
  const zScore = stdDev > 0 ? (currentEvent.hourlyCost - mean) / stdDev : 0;

  return { baselineCost: mean, zScore, stdDev };
}

export function evaluateAnomaly(
  currentEvent: BillingEvent,
  baselineCost: number,
  zScore: number,
  thresholds: ThresholdSettings
): { isAnomaly: boolean; severity: 'NORMAL' | 'WARNING' | 'HIGH' | 'CRITICAL'; percentageIncrease: number } {
  if (baselineCost === 0) return { isAnomaly: false, severity: 'NORMAL', percentageIncrease: 0 };

  const absoluteIncrease = currentEvent.hourlyCost - baselineCost;
  const percentageIncrease = (absoluteIncrease / baselineCost) * 100;

  if (absoluteIncrease < thresholds.minimumCostIncrease) {
    return { isAnomaly: false, severity: 'NORMAL', percentageIncrease };
  }

  if (percentageIncrease > thresholds.criticalPercentage && zScore > thresholds.zScoreThreshold) {
    return { isAnomaly: true, severity: 'CRITICAL', percentageIncrease };
  } else if (percentageIncrease > thresholds.highPercentage && zScore > (thresholds.zScoreThreshold * 0.75)) {
    return { isAnomaly: true, severity: 'HIGH', percentageIncrease };
  } else if (percentageIncrease > thresholds.warningPercentage) {
    return { isAnomaly: true, severity: 'WARNING', percentageIncrease };
  }

  return { isAnomaly: false, severity: 'NORMAL', percentageIncrease };
}

export function generateEvidence(
  currentEvent: BillingEvent,
  baselineCost: number,
  percentageIncrease: number,
  resourceEvents: ResourceChangeEvent[],
  deploymentEvents: DeploymentEvent[],
  workloadMetrics: WorkloadMetric[],
  windowHours: number
): Evidence {
  const windowMs = windowHours * 60 * 60 * 1000;
  
  // Find related resource changes in the window
  const relatedResourceChanges = resourceEvents.filter(
    (e) => e.resourceId === currentEvent.resourceId && e.timestamp <= currentEvent.timestamp && e.timestamp >= currentEvent.timestamp - windowMs
  );

  // Find related deployments
  // If the billing event has a deploymentId, match it directly. Otherwise look for recent deployments affecting the environment/workload.
  const relatedDeployments = deploymentEvents.filter(
    (e) => (currentEvent.deploymentId && e.deploymentId === currentEvent.deploymentId) || 
           (!currentEvent.deploymentId && e.timestamp <= currentEvent.timestamp && e.timestamp >= currentEvent.timestamp - windowMs)
  );

  // Workload before (baseline average or start of window)
  const windowWorkloads = workloadMetrics.filter(
    (e) => e.workloadType === currentEvent.workloadType && e.timestamp <= currentEvent.timestamp && e.timestamp >= currentEvent.timestamp - windowMs
  );
  
  const workloadBefore = windowWorkloads.length > 1 ? windowWorkloads[0] : null;
  const workloadAfter = windowWorkloads.length > 0 ? windowWorkloads[windowWorkloads.length - 1] : null;

  return {
    costBaseline: baselineCost,
    costActual: currentEvent.hourlyCost,
    percentageIncrease,
    resourceChanges: relatedResourceChanges,
    deployments: relatedDeployments,
    workloadBefore,
    workloadAfter
  };
}

export function recommendAction(severity: string, evidence: Evidence): string {
  if (severity === 'CRITICAL') {
    if (evidence.deployments.length > 0 && evidence.resourceChanges.length > 0) {
      return `Review scaling configuration for ${evidence.resourceChanges[0].resourceType} and consider rolling back deployment ${evidence.deployments[0].deploymentId} if unauthorized.`;
    }
    return 'Immediate investigation required into resource capacity changes.';
  }
  if (severity === 'HIGH') {
    return 'Investigate workload vs resource growth disparity.';
  }
  return 'Monitor closely.';
}
