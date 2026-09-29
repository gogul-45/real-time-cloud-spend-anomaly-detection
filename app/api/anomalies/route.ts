import { NextRequest, NextResponse } from 'next/server';
import { useStore } from '@/store/useStore';
import { loadDemoScenario } from '@/lib/demoData';

export async function GET(req: NextRequest) {
  const store = useStore.getState();
  if (store.anomalies.length === 0) {
    loadDemoScenario();
  }

  const { searchParams } = new URL(req.url);
  const severity = searchParams.get('severity');
  const status = searchParams.get('status');
  const service = searchParams.get('service');

  let list = useStore.getState().anomalies;
  if (severity) list = list.filter(a => a.severity.toLowerCase() === severity.toLowerCase());
  if (status) list = list.filter(a => a.status.toLowerCase() === status.toLowerCase());
  if (service) list = list.filter(a => a.service.toLowerCase().includes(service.toLowerCase()));

  return NextResponse.json({
    count: list.length,
    anomalies: list
  });
}
