import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/store/useStore';

export function loadDemoScenario() {
  const store = useStore.getState();
  store.resetState();
  
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  const start = now - (24 * ONE_HOUR);

  // Generate 24 hours of normal background data
  let currentCumulative = 0;
  for (let i = 0; i < 23; i++) {
    const ts = start + (i * ONE_HOUR);
    const hourly = 450 + Math.random() * 50;
    currentCumulative += hourly;
    
    store.addWorkloadMetric({
      eventId: uuidv4(),
      timestamp: ts,
      workloadType: 'Video Transcoding',
      jobsPerHour: 1200 + Math.floor(Math.random() * 100),
      activeStreams: 300,
      cpuUtilization: 45 + Math.random() * 10,
      gpuUtilization: 50 + Math.random() * 10,
      queueDepth: 10 + Math.random() * 5,
      processingTime: 1.2
    });

    store.addBillingEvent({
      eventId: uuidv4(),
      timestamp: ts,
      service: 'GPU Compute',
      resourceId: 'transcoder-gpu-01',
      resourceName: 'Primary Transcoder',
      region: 'us-east-1',
      environment: 'production',
      workloadType: 'Video Transcoding',
      hourlyCost: hourly,
      cumulativeCost: currentCumulative
    });
  }

  // The Anomaly at hour 23 (approx 1 hour ago)
  const anomalyTs = now - ONE_HOUR;
  
  // 1. Deployment occurs
  store.addDeploymentEvent({
    eventId: uuidv4(),
    deploymentId: 'DEP-1042',
    timestamp: anomalyTs - (5 * 60 * 1000), // 5 mins before
    application: 'Video Transcoding',
    version: 'v2.8.3',
    environment: 'production',
    owner: 'Media Platform Team',
    changeSummary: 'Updated transcoder logic and increased GPU limits.'
  });

  // 2. Resource changes
  store.addResourceEvent({
    eventId: uuidv4(),
    timestamp: anomalyTs - (4 * 60 * 1000),
    resourceId: 'transcoder-gpu-01',
    resourceType: 'GPU Cluster',
    changeType: 'Capacity Increase',
    previousValue: '4',
    newValue: '16',
    changedBy: 'autoscaler-service'
  });

  // 3. Workload rises slightly (19%)
  store.addWorkloadMetric({
    eventId: uuidv4(),
    timestamp: anomalyTs - (2 * 60 * 1000),
    workloadType: 'Video Transcoding',
    jobsPerHour: 1428, // +19%
    activeStreams: 350,
    cpuUtilization: 65,
    gpuUtilization: 40, // GPU util dropped because capacity increased too much
    queueDepth: 5,
    processingTime: 0.8
  });

  // 4. Billing spike (+127%)
  const spikeHourly = 1082;
  currentCumulative += spikeHourly;
  store.addBillingEvent({
    eventId: uuidv4(),
    timestamp: anomalyTs,
    service: 'GPU Compute',
    resourceId: 'transcoder-gpu-01',
    resourceName: 'Primary Transcoder',
    region: 'us-east-1',
    environment: 'production',
    deploymentId: 'DEP-1042',
    workloadType: 'Video Transcoding',
    hourlyCost: spikeHourly,
    cumulativeCost: currentCumulative
  });

  // Also simulate current hour partial data
  const currentHourly = 1100;
  store.addBillingEvent({
    eventId: uuidv4(),
    timestamp: now,
    service: 'GPU Compute',
    resourceId: 'transcoder-gpu-01',
    resourceName: 'Primary Transcoder',
    region: 'us-east-1',
    environment: 'production',
    deploymentId: 'DEP-1042',
    workloadType: 'Video Transcoding',
    hourlyCost: currentHourly,
    cumulativeCost: currentCumulative + currentHourly
  });
}
