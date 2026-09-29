import { NextRequest, NextResponse } from 'next/server';
import { useStore } from '@/store/useStore';
import { loadDemoScenario } from '@/lib/demoData';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = useStore.getState();
  if (store.anomalies.length === 0) {
    loadDemoScenario();
  }

  const anomaly = useStore.getState().anomalies.find(a => a.anomalyId === id);
  if (!anomaly) {
    return NextResponse.json({ error: 'Anomaly not found' }, { status: 404 });
  }

  return NextResponse.json(anomaly);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { status, notes } = body;
    
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    useStore.getState().updateAnomalyStatus(id, status, notes);
    const updated = useStore.getState().anomalies.find(a => a.anomalyId === id);

    return NextResponse.json({ success: true, anomaly: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
