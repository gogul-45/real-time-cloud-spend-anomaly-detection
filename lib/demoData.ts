import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/store/useStore';
import { 
  BillingEvent, 
  ResourceChangeEvent, 
  DeploymentEvent, 
  WorkloadMetric, 
  Anomaly, 
  NotificationRecord, 
  StakeholderFeedback 
} from '@/types';
import { generateEvidence } from '@/lib/engine';

export function loadDemoScenario() {
  const store = useStore.getState();
  store.resetState();
  
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  const start = now - (24 * ONE_HOUR);

  const initialBilling: BillingEvent[] = [];
  const initialResources: ResourceChangeEvent[] = [];
  const initialDeployments: DeploymentEvent[] = [];
  const initialWorkloads: WorkloadMetric[] = [];
  const initialNotifications: NotificationRecord[] = [];

  // Generate 23 hours of normal background baseline data around $72/hr
  let currentCumulative = 0;
  for (let i = 0; i < 23; i++) {
    const ts = start + (i * ONE_HOUR);
    // Baseline is $72/hr with minor variance (+/- $3)
    const hourly = Number((70 + Math.random() * 4).toFixed(2));
    currentCumulative += hourly;
    
    initialWorkloads.push({
      eventId: `wrk-${i}-001`,
      timestamp: ts,
      ingestionTime: ts + 200,
      source: 'telemetry-agent',
      sequenceNumber: i * 4 + 1,
      workloadType: 'video-transcoding',
      jobsPerHour: 1200 + Math.floor(Math.random() * 40),
      activeStreams: 320 + Math.floor(Math.random() * 20),
      cpuUtilization: 48 + Math.random() * 4,
      gpuUtilization: 54 + Math.random() * 5,
      queueDepth: 8 + Math.random() * 2,
      processingTime: 1.15
    });

    initialBilling.push({
      eventId: `bil-${i}-001`,
      timestamp: ts,
      ingestionTime: ts + 350,
      source: 'cloud-billing-stream',
      sequenceNumber: i * 4 + 2,
      service: 'GPU Compute',
      resourceId: 'GPU-TRANSCODER-07',
      resourceName: 'Primary Video Transcoder Fleet',
      region: 'us-east-1',
      environment: 'production',
      workloadType: 'video-transcoding',
      hourlyCost: hourly,
      cumulativeCost: Number(currentCumulative.toFixed(2))
    });
  }

  // Baseline deployment earlier in history
  initialDeployments.push({
    eventId: uuidv4(),
    deploymentId: 'video-transcoder-v41',
    timestamp: start + 2 * ONE_HOUR,
    ingestionTime: start + 2 * ONE_HOUR + 500,
    source: 'github-actions-cd',
    sequenceNumber: 100,
    application: 'video-transcoder',
    version: 'v41.2.0',
    environment: 'production',
    owner: 'Media Processing Team',
    changeSummary: 'Scheduled patch for H.265 encoder stability.'
  });

  // THE 70% DEMO CRITICAL SCENARIO (Section 32):
  // Resource: GPU-TRANSCODER-07
  // Application: video-transcoder
  // Deployment: video-transcoder-v42
  // Owner: Media Processing Team
  // Baseline: $72/hour
  // Actual: $186/hour
  // Resource count: 8 -> 22
  // GPU utilization: 54% -> 91%
  // Workload: +12%
  // Anomaly score: 0.94
  // Severity: CRITICAL
  const anomalyTs = now - (35 * 60 * 1000); // 35 minutes ago

  // 1. Deployment video-transcoder-v42 (15 minutes before spike)
  const criticalDeploy: DeploymentEvent = {
    eventId: uuidv4(),
    deploymentId: 'video-transcoder-v42',
    timestamp: anomalyTs - (15 * 60 * 1000),
    ingestionTime: anomalyTs - (15 * 60 * 1000) + 120,
    source: 'github-actions-cd',
    sequenceNumber: 101,
    application: 'video-transcoder',
    version: 'v42.0.0-rc',
    environment: 'production',
    owner: 'Media Processing Team',
    changeSummary: 'Aggressive autoscaling config pushed without queue-drain guardrail.'
  };
  initialDeployments.push(criticalDeploy);

  // 2. Resource scaling event: 8 -> 22 instances
  const criticalResource: ResourceChangeEvent = {
    eventId: uuidv4(),
    timestamp: anomalyTs - (12 * 60 * 1000),
    ingestionTime: anomalyTs - (12 * 60 * 1000) + 150,
    source: 'k8s-cluster-autoscaler',
    sequenceNumber: 102,
    resourceId: 'GPU-TRANSCODER-07',
    resourceType: 'NVIDIA-A10G-Cluster',
    changeType: 'Autoscaler Scale-Out',
    previousValue: '8',
    newValue: '22',
    changedBy: 'autoscaler-service'
  };
  initialResources.push(criticalResource);

  // 3. Workload rises by only +12% (1200 -> 1344 jobs/hr), GPU util hits 91%
  const criticalWorkload: WorkloadMetric = {
    eventId: uuidv4(),
    timestamp: anomalyTs - (6 * 60 * 1000),
    ingestionTime: anomalyTs - (6 * 60 * 1000) + 180,
    source: 'telemetry-agent',
    sequenceNumber: 103,
    workloadType: 'video-transcoding',
    jobsPerHour: 1344, // +12%
    activeStreams: 358,
    cpuUtilization: 72,
    gpuUtilization: 91, // 54% -> 91%
    queueDepth: 4,
    processingTime: 0.92
  };
  initialWorkloads.push(criticalWorkload);

  // 4. Billing spike: jumps from $72/hr baseline to $186/hr
  const criticalBilling: BillingEvent = {
    eventId: uuidv4(),
    timestamp: anomalyTs,
    ingestionTime: anomalyTs + 320,
    source: 'cloud-billing-stream',
    sequenceNumber: 104,
    service: 'GPU Compute',
    resourceId: 'GPU-TRANSCODER-07',
    resourceName: 'Primary Video Transcoder Fleet',
    region: 'us-east-1',
    environment: 'production',
    deploymentId: 'video-transcoder-v42',
    workloadType: 'video-transcoding',
    hourlyCost: 186.00,
    cumulativeCost: Number((currentCumulative + 186).toFixed(2))
  };
  initialBilling.push(criticalBilling);

  // Additional secondary anomaly for variety: CDN Egress spike (High severity)
  const cdnTs = now - (90 * 60 * 1000);
  initialBilling.push({
    eventId: uuidv4(),
    timestamp: cdnTs,
    ingestionTime: cdnTs + 400,
    source: 'cloud-billing-stream',
    sequenceNumber: 95,
    service: 'Cloud CDN',
    resourceId: 'CDN-EDGE-CACHE-US',
    resourceName: 'Edge Distribution Cache US',
    region: 'us-east-1',
    environment: 'production',
    workloadType: 'video-transcoding',
    hourlyCost: 114.50,
    cumulativeCost: Number((currentCumulative + 114.5).toFixed(2))
  });

  // Commit initial raw events into store
  store.setInitialEvents({
    billing: initialBilling,
    resources: initialResources,
    deployments: initialDeployments,
    workloads: initialWorkloads
  });

  // Generate Evidence & Anomaly for the Section 32 Critical Incident
  const baselineCost = 72.00;
  const percentageIncrease = ((186.00 - baselineCost) / baselineCost) * 100; // +158.3%
  
  const evidence = generateEvidence(
    criticalBilling,
    baselineCost,
    percentageIncrease,
    initialResources,
    initialDeployments,
    initialWorkloads,
    24,
    30
  );

  // Overwrite specific fields to guarantee matching exact Section 32 specs
  evidence.detectorScores.compositeScore = 0.94;
  evidence.forecast.currentHourlyCost = 186.00;
  evidence.forecast.expectedHourlyCost = 72.00;
  evidence.forecast.forecastNext1h = 194.00;
  evidence.forecast.forecastNext6h = 208.00;
  evidence.forecast.projectedExcessCost1h = 122.00;
  evidence.forecast.projectedExcessCost6h = 732.00; // Exactly $732 over next 6 hours

  const criticalAnomalyId = 'ANOM-2026-GPU-07';
  const detectionLatencyMs = 4200; // 4.2 seconds
  const notificationLatencyMs = 11500; // 11.5 seconds

  const primaryAnomaly: Anomaly = {
    anomalyId: criticalAnomalyId,
    onsetTime: anomalyTs - (10 * 60 * 1000),
    detectionTime: anomalyTs + detectionLatencyMs,
    resourceId: 'GPU-TRANSCODER-07',
    service: 'GPU Compute',
    severity: 'CRITICAL',
    anomalyScore: 0.94,
    compositeScore: 0.94,
    evidence,
    owner: 'Media Processing Team',
    notificationTime: anomalyTs + detectionLatencyMs + notificationLatencyMs,
    notificationStatus: 'DELIVERED',
    status: 'ACTION_PROPOSED',
    recommendedAction: 'Rollback deployment video-transcoder-v42 and cap max autoscaler instances to 12.',
    acknowledgedBy: 'Operator (Alex Rivera)',
    acknowledgedAt: anomalyTs + 45000
  };

  // Add multi-channel notification records
  initialNotifications.push(
    {
      notificationId: uuidv4(),
      anomalyId: criticalAnomalyId,
      recipient: 'media-platform-oncall@company.com',
      ownerTeam: 'Media Processing Team',
      channel: 'EMAIL',
      timestamp: anomalyTs + 15700,
      deliveryStatus: 'DELIVERED',
      latencyMs: 11500,
      title: '🚨 CRITICAL: Runaway Cloud Spend on GPU-TRANSCODER-07',
      message: 'Hourly spend escalated from $72/hr to $186/hr (+158%) following deployment video-transcoder-v42. Workload only increased by 12%.'
    },
    {
      notificationId: uuidv4(),
      anomalyId: criticalAnomalyId,
      recipient: '#finops-critical-alerts',
      ownerTeam: 'Media Processing Team',
      channel: 'SLACK',
      timestamp: anomalyTs + 12200,
      deliveryStatus: 'ACKNOWLEDGED',
      latencyMs: 8000,
      title: '🔥 FinOps Sentinel Alert: GPU-TRANSCODER-07',
      message: 'Composite Anomaly Score: 0.94 [CRITICAL]. Scaling 8 -> 22 instances. Excess burn rate: $114/hr.'
    },
    {
      notificationId: uuidv4(),
      anomalyId: criticalAnomalyId,
      recipient: 'Operator Dashboard UI',
      ownerTeam: 'FinOps SRE',
      channel: 'DASHBOARD',
      timestamp: anomalyTs + 4200,
      deliveryStatus: 'ACKNOWLEDGED',
      latencyMs: 4200,
      title: 'Real-Time Alert Dispatch',
      message: 'Real-time telemetry flagged runaway expenditure with high confidence.'
    }
  );

  // Pre-seed stakeholder feedback records
  const feedbackSeeds: StakeholderFeedback[] = [
    {
      id: 'FB-01',
      timestamp: now - 86400000 * 2,
      author: 'Marcus Vance',
      role: 'Staff FinOps Architect',
      organization: 'Media Stream Corp',
      q1_understandable: 5,
      q2_evidence_sufficient: 5,
      q3_owner_clear: 4,
      q4_notification_useful: 5,
      q5_override_understandable: 4,
      q6_audit_sufficient: 5,
      q7_reduce_time: 5,
      comments: 'The workload elasticity comparison (cost vs transcoding jobs) immediately clarifies if an autoscaling spike was justified or rogue.'
    },
    {
      id: 'FB-02',
      timestamp: now - 86400000,
      author: 'Elena Rostova',
      role: 'Lead Media Pipeline SRE',
      organization: 'Global Video Delivery',
      q1_understandable: 4,
      q2_evidence_sufficient: 5,
      q3_owner_clear: 5,
      q4_notification_useful: 4,
      q5_override_understandable: 5,
      q6_audit_sufficient: 4,
      q7_reduce_time: 5,
      comments: 'Having deployment correlation with commit hash and owner prevents finger-pointing between FinOps and developer on-call.'
    }
  ];

  store.setInitialAnomalies([primaryAnomaly]);
  store.setInitialNotifications(initialNotifications);
  store.setInitialFeedback(feedbackSeeds);

  // Pre-seed Audit Trail
  store.addAuditLog({
    actor: 'System Ingestion',
    action: 'Synthetic Scenario Loaded',
    reason: 'Loaded 24h realistic video platform benchmark data.'
  });
  store.addAuditLog({
    actor: 'Detection Engine',
    anomalyId: criticalAnomalyId,
    action: 'Anomaly Detected',
    newState: 'CRITICAL',
    reason: 'Composite score 0.94 exceeded critical threshold (0.82).'
  });
  store.addAuditLog({
    actor: 'Notification Engine',
    anomalyId: criticalAnomalyId,
    action: 'Multi-Channel Alert Dispatched',
    reason: 'Dispatched notifications to Slack, Email, and Dashboard.'
  });
  store.addAuditLog({
    actor: 'Operator (Alex Rivera)',
    anomalyId: criticalAnomalyId,
    action: 'Status Transition',
    previousState: 'DETECTED',
    newState: 'ACTION_PROPOSED',
    reason: 'Investigated GPU scaling disparity and recommended deployment rollback.'
  });
}
