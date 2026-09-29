import { NextRequest, NextResponse } from 'next/server';
import { useStore } from '@/store/useStore';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'all';
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const state = useStore.getState();
  
  if (type === 'billing') {
    return NextResponse.json({ events: state.billingEvents.slice(-limit) });
  } else if (type === 'resource') {
    return NextResponse.json({ events: state.resourceEvents.slice(-limit) });
  } else if (type === 'deployment') {
    return NextResponse.json({ events: state.deploymentEvents.slice(-limit) });
  } else if (type === 'workload') {
    return NextResponse.json({ events: state.workloadMetrics.slice(-limit) });
  }

  return NextResponse.json({
    billing: state.billingEvents.slice(-limit),
    resources: state.resourceEvents.slice(-limit),
    deployments: state.deploymentEvents.slice(-limit),
    workloads: state.workloadMetrics.slice(-limit)
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, ...data } = body;
    const store = useStore.getState();

    if (eventType === 'billing') {
      const res = store.addBillingEvent({
        eventId: data.eventId || uuidv4(),
        timestamp: data.timestamp || Date.now(),
        service: data.service || 'GPU Compute',
        resourceId: data.resourceId || 'GPU-TRANSCODER-07',
        resourceName: data.resourceName || 'Transcoder Node',
        region: data.region || 'us-east-1',
        environment: data.environment || 'production',
        workloadType: data.workloadType || 'video-transcoding',
        hourlyCost: Number(data.hourlyCost) || 100,
        cumulativeCost: Number(data.cumulativeCost) || 1000
      });
      return NextResponse.json(res);
    } else if (eventType === 'resource') {
      const res = store.addResourceEvent({
        eventId: data.eventId || uuidv4(),
        timestamp: data.timestamp || Date.now(),
        resourceId: data.resourceId || 'GPU-TRANSCODER-07',
        resourceType: data.resourceType || 'GPU Cluster',
        changeType: data.changeType || 'Scale-Up',
        previousValue: String(data.previousValue || '8'),
        newValue: String(data.newValue || '22'),
        changedBy: data.changedBy || 'autoscaler'
      });
      return NextResponse.json(res);
    } else if (eventType === 'deployment') {
      const res = store.addDeploymentEvent({
        eventId: data.eventId || uuidv4(),
        deploymentId: data.deploymentId || `DEP-${Date.now().toString().slice(-4)}`,
        timestamp: data.timestamp || Date.now(),
        application: data.application || 'video-transcoder',
        version: data.version || 'v42.0.1',
        environment: data.environment || 'production',
        owner: data.owner || 'Media Processing Team',
        changeSummary: data.changeSummary || 'Live autoscaler patch'
      });
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: 'Unknown eventType' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
