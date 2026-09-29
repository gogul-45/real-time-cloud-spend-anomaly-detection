import { NextResponse } from 'next/server';
import { useStore } from '@/store/useStore';
import { loadDemoScenario } from '@/lib/demoData';

export async function GET() {
  const store = useStore.getState();
  if (store.auditTrail.length === 0) {
    loadDemoScenario();
  }
  return NextResponse.json({
    count: store.auditTrail.length,
    auditTrail: store.auditTrail
  });
}
