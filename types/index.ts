export type Severity = 'NORMAL' | 'WARNING' | 'HIGH' | 'CRITICAL';

export type UserRole = 'OPERATOR' | 'FINOPS_ANALYST' | 'SERVICE_OWNER' | 'ADMIN';

export type IncidentStatus = 
  | 'DETECTED' 
  | 'INVESTIGATING' 
  | 'ACKNOWLEDGED' 
  | 'ACTION_PROPOSED' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'RESOLVED' 
  | 'SUPPRESSED';

export type NotificationChannel = 'DASHBOARD' | 'EMAIL' | 'SLACK' | 'TEAMS';

export interface BillingEvent {
  eventId: string;
  timestamp: number;
  ingestionTime?: number;
  source?: string;
  sequenceNumber?: number;
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
  ingestionTime?: number;
  source?: string;
  sequenceNumber?: number;
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
  ingestionTime?: number;
  source?: string;
  sequenceNumber?: number;
  application: string;
  version: string;
  environment: string;
  owner: string;
  changeSummary: string;
}

export interface WorkloadMetric {
  eventId: string;
  timestamp: number;
  ingestionTime?: number;
  source?: string;
  sequenceNumber?: number;
  workloadType: string;
  jobsPerHour: number;
  activeStreams: number;
  cpuUtilization: number;
  gpuUtilization: number;
  queueDepth: number;
  processingTime: number;
}

export interface ExplanationScorecard {
  costDeviationSeverity: Severity;
  resourceScalingSeverity: Severity;
  workloadMismatchSeverity: Severity;
  deploymentCorrelationSeverity: Severity;
  historicalDeviationSeverity: Severity;
  explanationFactors: string[];
}

export interface TimelineSignal {
  timestamp: number;
  type: 'DEPLOYMENT' | 'RESOURCE_SCALE' | 'WORKLOAD_CHANGE' | 'BILLING_SPIKE' | 'ANOMALY_DETECTED' | 'OWNER_NOTIFIED' | 'STATUS_CHANGE';
  title: string;
  description: string;
  impact?: string;
}

export interface CostAttributionItem {
  name: string;
  cost: number;
  percentage: number;
  type: 'RESOURCE' | 'SERVICE' | 'DEPLOYMENT' | 'REGION';
}

export interface CostForecast {
  currentHourlyCost: number;
  expectedHourlyCost: number;
  forecastNext1h: number;
  forecastNext6h: number;
  forecastNext24h: number;
  projectedExcessCost1h: number;
  projectedExcessCost6h: number;
  projectedExcessCost24h: number;
}

export interface RecommendedActionPlan {
  action: string;
  reason: string;
  expectedImpact: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Evidence {
  costBaseline: number;
  costActual: number;
  percentageIncrease: number;
  resourceChanges: ResourceChangeEvent[];
  deployments: DeploymentEvent[];
  workloadBefore: WorkloadMetric | null;
  workloadAfter: WorkloadMetric | null;
  
  // Advanced 70% additions
  scorecard: ExplanationScorecard;
  timeline: TimelineSignal[];
  resourceAttribution: CostAttributionItem[];
  serviceAttribution: CostAttributionItem[];
  deploymentAttribution: CostAttributionItem[];
  regionAttribution: CostAttributionItem[];
  forecast: CostForecast;
  recommendationPlan: RecommendedActionPlan;
  
  // Detector comparisons
  detectorScores: {
    ruleScore: number;
    statisticalScore: number;
    workloadScore: number;
    resourceScore: number;
    deploymentScore: number;
    compositeScore: number;
  };
}

export interface Anomaly {
  anomalyId: string;
  onsetTime: number;
  detectionTime: number;
  resourceId: string;
  service: string;
  severity: Severity;
  anomalyScore: number;
  compositeScore?: number;
  evidence: Evidence;
  owner: string;
  notificationTime?: number;
  notificationStatus: 'PENDING' | 'SENT' | 'DELIVERED' | 'ACKNOWLEDGED';
  status: IncidentStatus;
  recommendedAction: string;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  resolvedAt?: number;
  resolutionNotes?: string;
}

export interface AuditEvent {
  auditId: string;
  timestamp: number;
  actor: string;
  role?: UserRole;
  anomalyId?: string;
  action: string;
  previousState?: string;
  newState?: string;
  reason?: string;
  evidenceReference?: string;
}

export interface NotificationRecord {
  notificationId: string;
  anomalyId: string;
  recipient: string;
  ownerTeam: string;
  channel: NotificationChannel;
  timestamp: number;
  deliveryStatus: 'SENT' | 'DELIVERED' | 'ACKNOWLEDGED';
  latencyMs: number;
  title: string;
  message: string;
}

export interface StakeholderFeedback {
  id: string;
  timestamp: number;
  author: string;
  role: string;
  organization: string;
  q1_understandable: number;
  q2_evidence_sufficient: number;
  q3_owner_clear: number;
  q4_notification_useful: number;
  q5_override_understandable: number;
  q6_audit_sufficient: number;
  q7_reduce_time: number;
  comments: string;
}

export interface DataQualityIssue {
  id: string;
  timestamp: number;
  type: 'MISSING_FIELD' | 'DUPLICATE_EVENT' | 'LATE_EVENT' | 'INVALID_TIMESTAMP' | 'INCONSISTENT_RESOURCE' | 'ORPHAN_DEPLOYMENT' | 'MISSING_OWNER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  affectedEventId?: string;
}

export interface DataQualityMetrics {
  billingCompleteness: number;
  resourceValidity: number;
  deploymentMapping: number;
  overallQuality: number;
  issues: DataQualityIssue[];
}

export interface SystemLogEntry {
  id: string;
  timestamp: number;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'ANOMALY' | 'AUDIT';
  message: string;
  source: string;
}

export interface ThresholdSettings {
  warningPercentage: number;
  highPercentage: number;
  criticalPercentage: number;
  zScoreThreshold: number;
  minimumCostIncrease: number;
  detectionWindowHours: number;
  correlationWindowMinutes: number;
  maxLateEventHours: number;
}
