import { NextRequest, NextResponse } from 'next/server';
import { useStore } from '@/store/useStore';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const store = useStore.getState();
    const now = Date.now();

    const scenario = body.scenario || 'gpu-spike';

    if (scenario === 'gpu-spike') {
      // 1. Deployment
      store.addDeploymentEvent({
        eventId: uuidv4(),
        deploymentId: `DEP-${Math.floor(Math.random() * 8999 + 1000)}`,
        timestamp: now - (5 * 60 * 1000),
        application: 'video-transcoder',
        version: 'v42.2-patch',
        environment: 'production',
        owner: 'Media Processing Team',
        changeSummary: 'Autoscaler minimum capacity adjusted upward.'
      });

      // 2. Resource scale
      store.addResourceEvent({
        eventId: uuidv4(),
        timestamp: now - (3 * 60 * 1000),
        resourceId: 'GPU-TRANSCODER-07',
        resourceType: 'NVIDIA-A10G',
        changeType: 'Autoscaling Capacity Jump',
        previousValue: '8',
        newValue: '24',
        changedBy: 'k8s-autoscaler'
      });

      // 3. Workload metric
      store.addWorkloadMetric({
        eventId: uuidv4(),
        timestamp: now - (2 * 60 * 1000),
        workloadType: 'video-transcoding',
        jobsPerHour: 1310,
        activeStreams: 340,
        cpuUtilization: 68,
        gpuUtilization: 88,
        queueDepth: 5,
        processingTime: 1.05
      });

      // 4. Billing spike
      store.addBillingEvent({
        eventId: uuidv4(),
        timestamp: now,
        service: 'GPU Compute',
        resourceId: 'GPU-TRANSCODER-07',
        resourceName: 'Primary Video Transcoder Fleet',
        region: 'us-east-1',
        environment: 'production',
        workloadType: 'video-transcoding',
        hourlyCost: 215.00,
        cumulativeCost: 3500.00
      });

      return NextResponse.json({
        success: true,
        message: 'Injected live GPU spend runaway scenario (cost surged to $215/hr).'
      });
    }

    return NextResponse.json({ success: true, message: 'Simulation executed.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
