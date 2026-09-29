import { NextRequest, NextResponse } from 'next/server';
import { useStore } from '@/store/useStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startTime, endTime } = body;

    const start = Number(startTime) || Date.now() - 3600000;
    const end = Number(endTime) || Date.now();

    const res = useStore.getState().replayEvents(start, end);
    return NextResponse.json({
      success: true,
      message: `Replayed ${res.replayedCount} events successfully into reconciliation pipeline.`,
      replayedCount: res.replayedCount
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
