import { NextRequest, NextResponse } from 'next/server';
import { useStore } from '@/store/useStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { anomalyId, action, reason, user } = body;

    if (!anomalyId || !action) {
      return NextResponse.json({ error: 'Missing required fields: anomalyId and action.' }, { status: 400 });
    }

    useStore.getState().overrideAnomaly(anomalyId, action, reason || 'Manual human operator override', user || 'Operator (Alex Rivera)');

    return NextResponse.json({
      success: true,
      message: `Manual override "${action}" executed and recorded to immutable audit log.`,
      anomalyId
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
