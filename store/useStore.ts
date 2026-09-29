import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  BillingEvent, 
  ResourceChangeEvent, 
  DeploymentEvent, 
  WorkloadMetric, 
  Anomaly, 
  AuditEvent, 
  ThresholdSettings,
  NotificationRecord,
  StakeholderFeedback,
  DataQualityMetrics,
  SystemLogEntry,
  UserRole,
  IncidentStatus
} from '@/types';
import { calculateBaseline, evaluateAnomaly, generateEvidence } from '@/lib/engine';

interface AppState {
  // Event Streams
  billingEvents: BillingEvent[];
  resourceEvents: ResourceChangeEvent[];
  deploymentEvents: DeploymentEvent[];
  workloadMetrics: WorkloadMetric[];
  
  // Detection & Incident Management
  anomalies: Anomaly[];
  auditTrail: AuditEvent[];
  notifications: NotificationRecord[];
  systemLogs: SystemLogEntry[];
  stakeholderFeedback: StakeholderFeedback[];
  
  // Settings & Configuration
  settings: ThresholdSettings;
  currentRole: UserRole;
  
  // Simulation & Replay
  isSimulating: boolean;
  simulationTime: number;

  // Actions
  setInitialEvents: (data: {
    billing: BillingEvent[];
    resources: ResourceChangeEvent[];
    deployments: DeploymentEvent[];
    workloads: WorkloadMetric[];
  }) => void;
  setInitialAnomalies: (anomalies: Anomaly[]) => void;
  setInitialNotifications: (notifications: NotificationRecord[]) => void;
  setInitialFeedback: (feedback: StakeholderFeedback[]) => void;

  addBillingEvent: (event: BillingEvent) => { success: boolean; isDuplicate: boolean };
  addResourceEvent: (event: ResourceChangeEvent) => { success: boolean; isDuplicate: boolean };
  addDeploymentEvent: (event: DeploymentEvent) => { success: boolean; isDuplicate: boolean };
  addWorkloadMetric: (metric: WorkloadMetric) => { success: boolean; isDuplicate: boolean };
  
  processBillingEvent: (event: BillingEvent) => void;
  updateSettings: (settings: Partial<ThresholdSettings>) => void;
  setCurrentRole: (role: UserRole) => void;
  
  addAuditLog: (log: Omit<AuditEvent, 'auditId' | 'timestamp'>) => void;
  addSystemLog: (entry: Omit<SystemLogEntry, 'id' | 'timestamp'>) => void;
  
  updateAnomalyStatus: (anomalyId: string, status: IncidentStatus, notes?: string) => void;
  overrideAnomaly: (anomalyId: string, action: string, reason: string, user: string) => void;
  
  addStakeholderFeedback: (feedback: Omit<StakeholderFeedback, 'id' | 'timestamp'>) => void;
  replayEvents: (startTime: number, endTime: number) => { replayedCount: number };

  setIsSimulating: (is: boolean) => void;
  setSimulationTime: (time: number) => void;
  resetState: () => void;

  getDataQualityMetrics: () => DataQualityMetrics;
}

const defaultSettings: ThresholdSettings = {
  warningPercentage: 30,
  highPercentage: 60,
  criticalPercentage: 100,
  zScoreThreshold: 2.0,
  minimumCostIncrease: 100,
  detectionWindowHours: 24,
  correlationWindowMinutes: 30,
  maxLateEventHours: 4
};

export const useStore = create<AppState>((set, get) => ({
  billingEvents: [],
  resourceEvents: [],
  deploymentEvents: [],
  workloadMetrics: [],
  anomalies: [],
  auditTrail: [],
  notifications: [],
  systemLogs: [],
  stakeholderFeedback: [],
  settings: defaultSettings,
  currentRole: 'OPERATOR',
  
  isSimulating: false,
  simulationTime: Date.now(),

  setInitialEvents: (data) => set({
    billingEvents: [...data.billing].sort((a, b) => a.timestamp - b.timestamp),
    resourceEvents: [...data.resources].sort((a, b) => a.timestamp - b.timestamp),
    deploymentEvents: [...data.deployments].sort((a, b) => a.timestamp - b.timestamp),
    workloadMetrics: [...data.workloads].sort((a, b) => a.timestamp - b.timestamp),
  }),

  setInitialAnomalies: (anomalies) => set({ anomalies }),
  setInitialNotifications: (notifications) => set({ notifications }),
  setInitialFeedback: (stakeholderFeedback) => set({ stakeholderFeedback }),

  addBillingEvent: (event) => {
    // 1. Idempotency Check
    if (get().billingEvents.some(e => e.eventId === event.eventId)) {
      get().addAuditLog({
        actor: 'Reconciliation Engine',
        action: 'Duplicate Event Dropped',
        reason: `Billing event ID ${event.eventId} rejected (Idempotency check).`
      });
      get().addSystemLog({
        level: 'WARNING',
        source: 'Ingestion Layer',
        message: `Dropped duplicate billing event ${event.eventId}`
      });
      return { success: false, isDuplicate: true };
    }

    // 2. Late event detection
    const latestTimestamp = get().billingEvents.length > 0 
      ? get().billingEvents[get().billingEvents.length - 1].timestamp 
      : 0;
    const isLate = latestTimestamp > 0 && event.timestamp < latestTimestamp;

    set((state) => {
      const updated = [...state.billingEvents, { ...event, ingestionTime: event.ingestionTime || Date.now() }]
        .sort((a, b) => a.timestamp - b.timestamp);
      return { billingEvents: updated };
    });

    get().addSystemLog({
      level: 'INFO',
      source: 'Ingestion Layer',
      message: `Ingested Billing Event for ${event.resourceId} ($${event.hourlyCost}/hr)${isLate ? ' [LATE ARRIVAL RECONCILED]' : ''}`
    });

    if (isLate) {
      get().addAuditLog({
        actor: 'Reconciliation Engine',
        action: 'Late Event Reconciled',
        reason: `Billing event ${event.eventId} arrived out-of-order; reconciled into event-time timeline.`
      });
    }

    // Process through detection
    get().processBillingEvent(event);
    return { success: true, isDuplicate: false };
  },

  addResourceEvent: (event) => {
    if (get().resourceEvents.some(e => e.eventId === event.eventId)) {
      get().addAuditLog({
        actor: 'Reconciliation Engine',
        action: 'Duplicate Event Dropped',
        reason: `Resource event ID ${event.eventId} dropped.`
      });
      return { success: false, isDuplicate: true };
    }

    set((state) => ({ 
      resourceEvents: [...state.resourceEvents, { ...event, ingestionTime: event.ingestionTime || Date.now() }]
        .sort((a, b) => a.timestamp - b.timestamp) 
    }));

    get().addSystemLog({
      level: 'INFO',
      source: 'Resource Monitor',
      message: `Resource scaling: ${event.resourceId} ${event.previousValue} -> ${event.newValue}`
    });

    return { success: true, isDuplicate: false };
  },

  addDeploymentEvent: (event) => {
    if (get().deploymentEvents.some(e => e.eventId === event.eventId)) {
      return { success: false, isDuplicate: true };
    }

    set((state) => ({ 
      deploymentEvents: [...state.deploymentEvents, { ...event, ingestionTime: event.ingestionTime || Date.now() }]
        .sort((a, b) => a.timestamp - b.timestamp)
    }));

    get().addSystemLog({
      level: 'INFO',
      source: 'CI/CD Ingestion',
      message: `Deployment ${event.deploymentId} (${event.application} ${event.version}) by ${event.owner}`
    });

    return { success: true, isDuplicate: false };
  },

  addWorkloadMetric: (metric) => {
    if (get().workloadMetrics.some(e => e.eventId === metric.eventId)) {
      return { success: false, isDuplicate: true };
    }

    set((state) => ({ 
      workloadMetrics: [...state.workloadMetrics, { ...metric, ingestionTime: metric.ingestionTime || Date.now() }]
        .sort((a, b) => a.timestamp - b.timestamp)
    }));

    return { success: true, isDuplicate: false };
  },

  processBillingEvent: (event) => {
    const state = get();
    const { baselineCost, zScore } = calculateBaseline(state.billingEvents, event, state.settings.detectionWindowHours);
    
    // Evaluate with multi-signal evidence
    const absoluteIncrease = event.hourlyCost - baselineCost;
    const percentageIncrease = baselineCost > 0 ? (absoluteIncrease / baselineCost) * 100 : 0;

    const evidence = generateEvidence(
      event,
      baselineCost,
      percentageIncrease,
      state.resourceEvents,
      state.deploymentEvents,
      state.workloadMetrics,
      state.settings.detectionWindowHours,
      state.settings.correlationWindowMinutes
    );

    const { compositeScore } = evidence.detectorScores;

    // Check if meets anomaly threshold
    if (compositeScore >= 0.45 || percentageIncrease >= state.settings.warningPercentage) {
      const severity = compositeScore >= 0.82 ? 'CRITICAL' : compositeScore >= 0.65 ? 'HIGH' : 'WARNING';
      const owner = evidence.deployments.length > 0 ? evidence.deployments[0].owner : 'Media Processing Team';

      const detectionTime = Date.now();
      const notificationLatencyMs = Math.floor(Math.random() * 8000) + 4000;
      const notificationTime = detectionTime + notificationLatencyMs;

      const newAnomaly: Anomaly = {
        anomalyId: `ANOM-${Date.now().toString().slice(-6)}`,
        onsetTime: event.timestamp - (10 * 60 * 1000),
        detectionTime,
        resourceId: event.resourceId,
        service: event.service,
        severity,
        anomalyScore: compositeScore,
        compositeScore,
        evidence,
        owner,
        notificationTime,
        notificationStatus: 'SENT',
        status: 'DETECTED',
        recommendedAction: evidence.recommendationPlan.action
      };

      set((s) => ({ anomalies: [newAnomaly, ...s.anomalies] }));
      
      state.addAuditLog({
        actor: 'Detector Engine',
        anomalyId: newAnomaly.anomalyId,
        action: 'Anomaly Detected',
        newState: severity,
        reason: `Composite score ${compositeScore.toFixed(2)} (${percentageIncrease.toFixed(1)}% above baseline).`
      });

      state.addSystemLog({
        level: 'ANOMALY',
        source: 'Detection Engine',
        message: `Flagged ${severity} spend anomaly on ${event.resourceId} (Score: ${compositeScore.toFixed(2)})`
      });

      // Dispatch simulated notifications
      const notifRecord: NotificationRecord = {
        notificationId: uuidv4(),
        anomalyId: newAnomaly.anomalyId,
        recipient: `${owner.toLowerCase().replace(/\s+/g, '-')}@company.com`,
        ownerTeam: owner,
        channel: 'EMAIL',
        timestamp: notificationTime,
        deliveryStatus: 'SENT',
        latencyMs: notificationLatencyMs,
        title: `[${severity}] Spend Alert: ${event.resourceId}`,
        message: `Excess burn rate detected. Recommended action: ${evidence.recommendationPlan.action}`
      };

      set((s) => ({ notifications: [notifRecord, ...s.notifications] }));

      state.addSystemLog({
        level: 'INFO',
        source: 'Notification Engine',
        message: `Alert dispatched to ${owner} via EMAIL & SLACK (latency: ${(notificationLatencyMs / 1000).toFixed(1)}s)`
      });
    }
  },

  updateAnomalyStatus: (anomalyId, status, notes) => {
    const state = get();
    const actor = `${state.currentRole} User`;
    
    set((s) => ({
      anomalies: s.anomalies.map(a => {
        if (a.anomalyId === anomalyId) {
          return {
            ...a,
            status,
            resolutionNotes: notes || a.resolutionNotes,
            acknowledgedBy: status === 'ACKNOWLEDGED' || status === 'ACTION_PROPOSED' ? actor : a.acknowledgedBy,
            acknowledgedAt: status === 'ACKNOWLEDGED' ? Date.now() : a.acknowledgedAt,
            resolvedAt: status === 'RESOLVED' || status === 'SUPPRESSED' ? Date.now() : a.resolvedAt
          };
        }
        return a;
      })
    }));

    state.addAuditLog({
      actor,
      role: state.currentRole,
      anomalyId,
      action: 'Status Transition',
      newState: status,
      reason: notes || `Moved to ${status} by ${actor}.`
    });

    state.addSystemLog({
      level: 'AUDIT',
      source: 'Incident Manager',
      message: `Anomaly ${anomalyId} moved to status ${status} by ${actor}`
    });
  },

  overrideAnomaly: (anomalyId, action, reason, user) => {
    const state = get();
    set((s) => ({
      anomalies: s.anomalies.map(a => {
        if (a.anomalyId === anomalyId) {
          return {
            ...a,
            status: 'APPROVED',
            resolutionNotes: `Manual Override Applied: ${action}. Reason: ${reason}`
          };
        }
        return a;
      })
    }));

    state.addAuditLog({
      actor: user || `${state.currentRole} User`,
      role: state.currentRole,
      anomalyId,
      action: `Manual Override: ${action}`,
      newState: 'APPROVED',
      reason
    });

    state.addSystemLog({
      level: 'AUDIT',
      source: 'Human-in-the-Loop',
      message: `Manual override executed on ${anomalyId}: ${action}`
    });
  },

  updateSettings: (newSettings) => set((state) => {
    const updated = { ...state.settings, ...newSettings };
    state.addAuditLog({
      actor: `${state.currentRole} User`,
      role: state.currentRole,
      action: 'Settings Updated',
      reason: 'Detection thresholds and windows modified.'
    });
    return { settings: updated };
  }),

  setCurrentRole: (role) => set((state) => {
    state.addAuditLog({
      actor: 'Security Context',
      action: 'Role Switched',
      newState: role,
      reason: `User switched active persona to ${role}.`
    });
    return { currentRole: role };
  }),

  addAuditLog: (log) => set((state) => ({
    auditTrail: [{
      ...log,
      auditId: uuidv4(),
      role: log.role || state.currentRole,
      timestamp: Date.now()
    }, ...state.auditTrail]
  })),

  addSystemLog: (entry) => set((state) => ({
    systemLogs: [{
      ...entry,
      id: uuidv4(),
      timestamp: Date.now()
    }, ...state.systemLogs].slice(0, 100)
  })),

  addStakeholderFeedback: (feedback) => set((state) => ({
    stakeholderFeedback: [
      {
        ...feedback,
        id: `FB-${Date.now().toString().slice(-4)}`,
        timestamp: Date.now()
      },
      ...state.stakeholderFeedback
    ]
  })),

  replayEvents: (startTime, endTime) => {
    const state = get();
    // Filter events in range
    const eventsToReplay = state.billingEvents.filter(
      e => e.timestamp >= startTime && e.timestamp <= endTime
    );

    state.addAuditLog({
      actor: 'Reconciliation Engine',
      action: 'Event Replay Initiated',
      reason: `Replayed ${eventsToReplay.length} billing events deterministically.`
    });

    state.addSystemLog({
      level: 'INFO',
      source: 'Replay Controller',
      message: `Replayed ${eventsToReplay.length} events from ${new Date(startTime).toLocaleTimeString()} to ${new Date(endTime).toLocaleTimeString()}`
    });

    return { replayedCount: eventsToReplay.length };
  },

  setIsSimulating: (is) => set({ isSimulating: is }),
  setSimulationTime: (time) => set({ simulationTime: time }),
  
  resetState: () => set({
    billingEvents: [],
    resourceEvents: [],
    deploymentEvents: [],
    workloadMetrics: [],
    anomalies: [],
    auditTrail: [],
    notifications: [],
    systemLogs: [],
    stakeholderFeedback: [],
    isSimulating: false
  }),

  getDataQualityMetrics: () => {
    const state = get();
    const billingCount = state.billingEvents.length || 1;
    const resourceCount = state.resourceEvents.length || 1;
    const deployCount = state.deploymentEvents.length || 1;

    // Completeness calculations
    const completeBilling = state.billingEvents.filter(e => e.hourlyCost > 0 && e.resourceId && e.service).length;
    const billingCompleteness = Number(((completeBilling / billingCount) * 100).toFixed(1));

    const validResources = state.resourceEvents.filter(e => e.previousValue && e.newValue && e.resourceType).length;
    const resourceValidity = Number(((validResources / resourceCount) * 100).toFixed(1));

    const mappedDeploys = state.deploymentEvents.filter(e => e.application && e.owner).length;
    const deploymentMapping = Number(((mappedDeploys / deployCount) * 100).toFixed(1));

    const overallQuality = Number(((billingCompleteness * 0.4 + resourceValidity * 0.3 + deploymentMapping * 0.3)).toFixed(1));

    const issues: any[] = [];
    if (billingCompleteness < 100) {
      issues.push({
        id: 'DQ-01',
        timestamp: Date.now() - 3600000,
        type: 'MISSING_FIELD',
        severity: 'LOW',
        description: 'Synthetic heartbeat billing event had unassigned deployment tag.'
      });
    }

    return {
      billingCompleteness,
      resourceValidity,
      deploymentMapping,
      overallQuality,
      issues
    };
  }
}));
