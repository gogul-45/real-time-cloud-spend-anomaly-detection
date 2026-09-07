export type Severity = 'NORMAL' | 'WARNING' | 'HIGH' | 'CRITICAL';

export interface BillingEvent {
  eventId: string;
  timestamp: number;
  service: string;
  resourceId: string;
  resourceName: string;
  region: string;
  environment: string;
  deploymentId?: string;
  workloadType: string;
  hourlyCost: number;
  cumulativeCost: number;
}

export interface ResourceChangeEvent {
  eventId: string;
  timestamp: number;
  resourceId: string;
  resourceType: string;
  changeType: string;
  previousValue: string;
  newValue: string;
  changedBy: string;
}

export interface DeploymentEvent {
  eventId: string;
  deploymentId: string;
  timestamp: number;
  application: string;
  version: string;
  environment: string;
  owner: string;
  changeSummary: string;
}

export interface WorkloadMetric {
  eventId: string;
  timestamp: number;
  workloadType: string;
  jobsPerHour: number;
  activeStreams: number;
  cpuUtilization: number;
  gpuUtilization: number;
  queueDepth: number;
  processingTime: number;
}

export interface Evidence {
  costBaseline: number;
  costActual: number;
  percentageIncrease: number;
  resourceChanges: ResourceChangeEvent[];
  deployments: DeploymentEvent[];
  workloadBefore: WorkloadMetric | null;
  workloadAfter: WorkloadMetric | null;
}

export interface Anomaly {
  anomalyId: string;
  onsetTime: number;
  detectionTime: number;
  resourceId: string;
  service: string;
  severity: Severity;
  anomalyScore: number;
  evidence: Evidence;
  owner: string;
  notificationTime?: number;
  notificationStatus: 'PENDING' | 'SENT' | 'FAILED';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'SUPPRESSED' | 'RESOLVED';
  recommendedAction: string;
}

export interface AuditEvent {
  auditId: string;
  timestamp: number;
  actor: string;
  anomalyId?: string;
  action: string;
  previousState?: string;
  newState?: string;
  reason?: string;
  evidenceReference?: string;
}

export interface ThresholdSettings {
  warningPercentage: number;
  highPercentage: number;
  criticalPercentage: number;
  zScoreThreshold: number;
  minimumCostIncrease: number;
  detectionWindowHours: number;
}
