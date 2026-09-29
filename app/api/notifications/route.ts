import { NextResponse } from 'next/server';
import { useStore } from '@/store/useStore';
import { loadDemoScenario } from '@/lib/demoData';

export async function GET() {
  const store = useStore.getState();
  if (store.notifications.length === 0) {
    loadDemoScenario();
  }

  const notifications = useStore.getState().notifications;
  return NextResponse.json({
    count: notifications.length,
    notifications
  });
}
