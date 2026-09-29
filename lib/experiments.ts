export interface ExperimentScenario {
  id: number;
  name: string;
  category: 'TP' | 'TN' | 'FP' | 'FN';
  description: string;
  costDeltaPct: number;
  workloadDeltaPct: number;
  hasDeployment: boolean;
  resourceScaleMultiplier: number;
  expectedAnomaly: boolean;
  ruleScore: number;
  statScore: number;
  workloadScore: number;
  ensembleScore: number;
}

export const EXPERIMENT_SCENARIOS: ExperimentScenario[] = [
  // 1. True Positives (Actual anomaly, flagged)
  { id: 1, name: 'GPU Runaway Scaling', category: 'TP', description: 'Capacity 8 -> 22, workload +12%, cost +158%. Caught in 4.2s.', costDeltaPct: 158, workloadDeltaPct: 12, hasDeployment: true, resourceScaleMultiplier: 2.75, expectedAnomaly: true, ruleScore: 0.94, statScore: 0.92, workloadScore: 0.95, ensembleScore: 0.94 },
  { id: 2, name: 'Unauthorized GPU Deployment', category: 'TP', description: 'Cost surged 210% following unapproved night deploy DEP-1099.', costDeltaPct: 210, workloadDeltaPct: 5, hasDeployment: true, resourceScaleMultiplier: 3.0, expectedAnomaly: true, ruleScore: 0.96, statScore: 0.95, workloadScore: 0.98, ensembleScore: 0.96 },
  { id: 3, name: 'Redundant DB Replica Cluster', category: 'TP', description: 'DB instance provisioned twice; reads unchanged, cost doubled.', costDeltaPct: 105, workloadDeltaPct: 0, hasDeployment: false, resourceScaleMultiplier: 2.0, expectedAnomaly: true, ruleScore: 0.88, statScore: 0.86, workloadScore: 0.92, ensembleScore: 0.89 },
  { id: 4, name: 'Zombie Transcoding Workers', category: 'TP', description: 'GPU nodes idle for 3 hours after batch job completed.', costDeltaPct: 140, workloadDeltaPct: -30, hasDeployment: false, resourceScaleMultiplier: 2.5, expectedAnomaly: true, ruleScore: 0.90, statScore: 0.89, workloadScore: 0.96, ensembleScore: 0.92 },
  { id: 5, name: 'Infinite Egress Loop', category: 'TP', description: 'NAT gateway loop sent 80TB egress in 45 minutes.', costDeltaPct: 320, workloadDeltaPct: 10, hasDeployment: true, resourceScaleMultiplier: 1.0, expectedAnomaly: true, ruleScore: 0.99, statScore: 0.98, workloadScore: 0.97, ensembleScore: 0.98 },
  { id: 6, name: 'Memory Leak Triggering Node Expansion', category: 'TP', description: 'Node pool expanded 5x to prevent OOM crash.', costDeltaPct: 180, workloadDeltaPct: 15, hasDeployment: true, resourceScaleMultiplier: 5.0, expectedAnomaly: true, ruleScore: 0.95, statScore: 0.94, workloadScore: 0.93, ensembleScore: 0.94 },

  // 2. True Negatives (Legitimate behavior, not flagged)
  { id: 7, name: 'Live Sports Broadcast Peak', category: 'TN', description: 'Workload surged +140%, cost rose proportionally (+150%). Elastic and expected.', costDeltaPct: 150, workloadDeltaPct: 140, hasDeployment: false, resourceScaleMultiplier: 2.4, expectedAnomaly: false, ruleScore: 0.75, statScore: 0.70, workloadScore: 0.15, ensembleScore: 0.42 },
  { id: 8, name: 'Scheduled Database Backup', category: 'TN', description: 'High IOPS tier active during 2:00 AM maintenance window.', costDeltaPct: 35, workloadDeltaPct: 30, hasDeployment: false, resourceScaleMultiplier: 1.2, expectedAnomaly: false, ruleScore: 0.25, statScore: 0.30, workloadScore: 0.20, ensembleScore: 0.26 },
  { id: 9, name: 'Seasonal Evening Traffic Surge', category: 'TN', description: 'Video streams rose 80% during prime time; compute scaled 75%.', costDeltaPct: 75, workloadDeltaPct: 80, hasDeployment: false, resourceScaleMultiplier: 1.8, expectedAnomaly: false, ruleScore: 0.55, statScore: 0.45, workloadScore: 0.18, ensembleScore: 0.38 },
  { id: 10, name: 'New Region Pre-Warming', category: 'TN', description: 'Planned EU-central launch with scheduled budget sign-off.', costDeltaPct: 40, workloadDeltaPct: 35, hasDeployment: true, resourceScaleMultiplier: 1.4, expectedAnomaly: false, ruleScore: 0.32, statScore: 0.35, workloadScore: 0.22, ensembleScore: 0.31 },
  { id: 11, name: 'Off-Peak Daily Fluctuation', category: 'TN', description: 'Minor 8% oscillation in Redis caching layer cost.', costDeltaPct: 8, workloadDeltaPct: 10, hasDeployment: false, resourceScaleMultiplier: 1.0, expectedAnomaly: false, ruleScore: 0.10, statScore: 0.12, workloadScore: 0.08, ensembleScore: 0.10 },
  { id: 12, name: 'Expected Model Retraining Run', category: 'TN', description: 'Authorized 4-hour batch job with explicit FinOps tag.', costDeltaPct: 60, workloadDeltaPct: 55, hasDeployment: false, resourceScaleMultiplier: 1.6, expectedAnomaly: false, ruleScore: 0.48, statScore: 0.40, workloadScore: 0.22, ensembleScore: 0.36 },

  // 3. False Positives (Initially flagged or rule-only flagged when legitimate)
  { id: 13, name: 'Rapid Video Transcode Burst', category: 'FP', description: 'Rule detector flagged spike (+70%), but workload grew +68%. Ensemble correctly suppressed.', costDeltaPct: 70, workloadDeltaPct: 68, hasDeployment: false, resourceScaleMultiplier: 1.7, expectedAnomaly: false, ruleScore: 0.82, statScore: 0.65, workloadScore: 0.12, ensembleScore: 0.46 },
  { id: 14, name: 'Missing Deployment Tag on Hotfix', category: 'FP', description: 'Legitimate manual scale by SRE lacked deployment ID tag.', costDeltaPct: 85, workloadDeltaPct: 40, hasDeployment: false, resourceScaleMultiplier: 1.9, expectedAnomaly: false, ruleScore: 0.78, statScore: 0.72, workloadScore: 0.45, ensembleScore: 0.62 },
  { id: 15, name: 'Cross-AZ Storage Migration', category: 'FP', description: 'One-off transfer cost triggered volume warning.', costDeltaPct: 65, workloadDeltaPct: 20, hasDeployment: false, resourceScaleMultiplier: 1.1, expectedAnomaly: false, ruleScore: 0.72, statScore: 0.68, workloadScore: 0.50, ensembleScore: 0.58 },

  // 4. False Negatives (Subtle or slow leaks that evade raw thresholds)
  { id: 16, name: 'Slow Crawling Memory Leak', category: 'FN', description: 'Cost crept +1.5% each hour for 48 hours; rolling baseline normalized the leak.', costDeltaPct: 72, workloadDeltaPct: 5, hasDeployment: false, resourceScaleMultiplier: 1.7, expectedAnomaly: true, ruleScore: 0.42, statScore: 0.48, workloadScore: 0.68, ensembleScore: 0.54 },
  { id: 17, name: 'Micro-Zombie Container Drift', category: 'FN', description: 'Abandoned micro-instances totaling $45/hr (below $100 absolute threshold).', costDeltaPct: 35, workloadDeltaPct: 0, hasDeployment: false, resourceScaleMultiplier: 1.3, expectedAnomaly: true, ruleScore: 0.30, statScore: 0.38, workloadScore: 0.60, ensembleScore: 0.44 },
  { id: 18, name: 'Uncompressed Log Export Drift', category: 'FN', description: 'Log volume doubled gradually over 2 weeks without trigger.', costDeltaPct: 45, workloadDeltaPct: 15, hasDeployment: false, resourceScaleMultiplier: 1.0, expectedAnomaly: true, ruleScore: 0.38, statScore: 0.41, workloadScore: 0.55, ensembleScore: 0.46 },

  // Extra scenarios to complete full set of 20
  { id: 19, name: 'Unauthorized Cryptomining Container', category: 'TP', description: 'Compromised cluster spawned 16 spot GPU instances with zero transcode jobs.', costDeltaPct: 280, workloadDeltaPct: -10, hasDeployment: false, resourceScaleMultiplier: 4.0, expectedAnomaly: true, ruleScore: 0.98, statScore: 0.97, workloadScore: 0.99, ensembleScore: 0.98 },
  { id: 20, name: 'Black Friday Traffic Spike', category: 'TN', description: 'User traffic spiked 300%, architecture handled 320% cost gracefully.', costDeltaPct: 320, workloadDeltaPct: 300, hasDeployment: false, resourceScaleMultiplier: 4.2, expectedAnomaly: false, ruleScore: 0.90, statScore: 0.85, workloadScore: 0.18, ensembleScore: 0.52 }
];

export function computeMetricsForThreshold(threshold: number, model: 'ensemble' | 'rule' | 'stat' | 'workload') {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;

  for (const s of EXPERIMENT_SCENARIOS) {
    let score = s.ensembleScore;
    if (model === 'rule') score = s.ruleScore;
    if (model === 'stat') score = s.statScore;
    if (model === 'workload') score = s.workloadScore;

    const predictedAnomaly = score >= threshold;
    const actualAnomaly = s.expectedAnomaly;

    if (predictedAnomaly && actualAnomaly) tp++;
    else if (predictedAnomaly && !actualAnomaly) fp++;
    else if (!predictedAnomaly && !actualAnomaly) tn++;
    else if (!predictedAnomaly && actualAnomaly) fn++;
  }

  const accuracy = (tp + tn) / (tp + tn + fp + fn || 1);
  const precision = tp / (tp + fp || 1);
  const recall = tp / (tp + fn || 1);
  const f1 = (2 * precision * recall) / (precision + recall || 1);
  const fpr = fp / (fp + tn || 1);
  const fnr = fn / (fn + tp || 1);

  return {
    tp,
    fp,
    tn,
    fn,
    accuracy: Number(accuracy.toFixed(3)),
    precision: Number(precision.toFixed(3)),
    recall: Number(recall.toFixed(3)),
    f1: Number(f1.toFixed(3)),
    fpr: Number(fpr.toFixed(3)),
    fnr: Number(fnr.toFixed(3))
  };
}
