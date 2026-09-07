import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  BillingEvent, 
  ResourceChangeEvent, 
  DeploymentEvent, 
  WorkloadMetric, 
  Anomaly, 
  AuditEvent, 
  ThresholdSettings 
} from '@/types';
import { calculateBaseline, evaluateAnomaly, generateEvidence, recommendAction } from '@/lib/engine';

interface AppState {
  billingEvents: BillingEvent[];
  resourceEvents: ResourceChangeEvent[];
  deploymentEvents: DeploymentEvent[];
  workloadMetrics: WorkloadMetric[];
  anomalies: Anomaly[];
  auditTrail: AuditEvent[];
  settings: ThresholdSettings;
  
  // Simulation State
  isSimulating: boolean;
  simulationTime: number;

  // Actions
  addBillingEvent: (event: BillingEvent) => void;
  addResourceEvent: (event: ResourceChangeEvent) => void;
  addDeploymentEvent: (event: DeploymentEvent) => void;
  addWorkloadMetric: (metric: WorkloadMetric) => void;
  
  processBillingEvent: (event: BillingEvent) => void;
  
  updateSettings: (settings: Partial<ThresholdSettings>) => void;
  
  addAuditLog: (log: Omit<AuditEvent, 'auditId' | 'timestamp'>) => void;
  
  overrideAnomaly: (anomalyId: string, action: string, reason: string, user: string) => void;
  
  setIsSimulating: (is: boolean) => void;
  setSimulationTime: (time: number) => void;
  
  resetState: () => void;
}

const defaultSettings: ThresholdSettings = {
  warningPercentage: 30,
  highPercentage: 60,
  criticalPercentage: 100,
  zScoreThreshold: 2.0,
  minimumCostIncrease: 100,
  detectionWindowHours: 24
};

export const useStore = create<AppState>((set, get) => ({
  billingEvents: [],
  resourceEvents: [],
  deploymentEvents: [],
  workloadMetrics: [],
  anomalies: [],
  auditTrail: [],
  settings: defaultSettings,
  
  isSimulating: false,
  simulationTime: Date.now(),

  addBillingEvent: (event) => {
    // Deduplication check
    if (get().billingEvents.some(e => e.eventId === event.eventId)) {
      get().addAuditLog({
        actor: 'System',
        action: 'Duplicate Event Ignored',
        reason: `Billing event ${event.eventId} already exists.`
      });
      return;
    }

    set((state) => {
      // Handle out-of-order by sorting
      const newEvents = [...state.billingEvents, event].sort((a, b) => a.timestamp - b.timestamp);
      return { billingEvents: newEvents };
    });
    
    // Process for anomalies
    get().processBillingEvent(event);
  },

  addResourceEvent: (event) => {
    if (get().resourceEvents.some(e => e.eventId === event.eventId)) {
       get().addAuditLog({
        actor: 'System',
        action: 'Duplicate Event Ignored',
        reason: `Resource event ${event.eventId} already exists.`
      });
      return;
    }
    set((state) => ({ 
      resourceEvents: [...state.resourceEvents, event].sort((a, b) => a.timestamp - b.timestamp) 
    }));
  },

  addDeploymentEvent: (event) => {
     if (get().deploymentEvents.some(e => e.eventId === event.eventId)) return;
    set((state) => ({ 
      deploymentEvents: [...state.deploymentEvents, event].sort((a, b) => a.timestamp - b.timestamp)
    }));
  },

  addWorkloadMetric: (metric) => {
     if (get().workloadMetrics.some(e => e.eventId === metric.eventId)) return;
    set((state) => ({ 
      workloadMetrics: [...state.workloadMetrics, metric].sort((a, b) => a.timestamp - b.timestamp)
    }));
  },

  processBillingEvent: (event) => {
    const state = get();
    const { baselineCost, zScore } = calculateBaseline(state.billingEvents, event, state.settings.detectionWindowHours);
    
    const { isAnomaly, severity, percentageIncrease } = evaluateAnomaly(event, baselineCost, zScore, state.settings);

    if (isAnomaly) {
      const evidence = generateEvidence(
        event,
        baselineCost,
        percentageIncrease,
        state.resourceEvents,
        state.deploymentEvents,
        state.workloadMetrics,
        state.settings.detectionWindowHours
      );
      
      const owner = evidence.deployments.length > 0 ? evidence.deployments[0].owner : 'Cloud Infrastructure Team';

      // Simulate notification delay (e.g. 5 - 30 seconds latency)
      const notificationLatencyMs = Math.floor(Math.random() * 25000) + 5000; 
      
      const newAnomaly: Anomaly = {
        anomalyId: uuidv4(),
        onsetTime: event.timestamp - (15 * 60 * 1000), // simulate onset was a bit before detection
        detectionTime: Date.now(),
        resourceId: event.resourceId,
        service: event.service,
        severity,
        anomalyScore: zScore,
        evidence,
        owner,
        notificationTime: Date.now() + notificationLatencyMs,
        notificationStatus: 'SENT',
        status: 'OPEN',
        recommendedAction: recommendAction(severity, evidence)
      };

      set((s) => ({ anomalies: [newAnomaly, ...s.anomalies] }));
      
      state.addAuditLog({
        actor: 'Detector Engine',
        anomalyId: newAnomaly.anomalyId,
        action: 'Anomaly Detected',
        newState: severity,
        reason: `Cost increased by ${percentageIncrease.toFixed(1)}% above baseline.`,
      });
      
      // Simulate Owner Notified Log (delayed)
      setTimeout(() => {
        get().addAuditLog({
          actor: 'Notification System',
          anomalyId: newAnomaly.anomalyId,
          action: 'Owner Notified',
          newState: 'SENT',
          reason: `Notified ${owner}`
        });
      }, notificationLatencyMs);
    }
  },

  updateSettings: (newSettings) => set((state) => {
    const updated = { ...state.settings, ...newSettings };
    state.addAuditLog({
      actor: 'Admin',
      action: 'Settings Updated',
      reason: 'Thresholds modified.'
    });
    return { settings: updated };
  }),

  addAuditLog: (log) => set((state) => ({
    auditTrail: [{
      ...log,
      auditId: uuidv4(),
      timestamp: Date.now()
    }, ...state.auditTrail]
  })),

  overrideAnomaly: (anomalyId, action, reason, user) => set((state) => {
    const anomalies = state.anomalies.map(a => {
      if (a.anomalyId === anomalyId) {
        return { ...a, status: 'ACKNOWLEDGED' as const };
      }
      return a;
    });
    
    state.addAuditLog({
      actor: user,
      anomalyId,
      action: `Manual Override: ${action}`,
      reason
    });
    
    return { anomalies };
  }),

  setIsSimulating: (is) => set({ isSimulating: is }),
  setSimulationTime: (time) => set({ simulationTime: time }),
  
  resetState: () => set({
    billingEvents: [],
    resourceEvents: [],
    deploymentEvents: [],
    workloadMetrics: [],
    anomalies: [],
    auditTrail: [],
    isSimulating: false
  })
}));
