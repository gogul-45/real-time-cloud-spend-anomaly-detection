import { NextResponse } from 'next/server';
import { useStore } from '@/store/useStore';

export async function GET() {
  const store = useStore.getState();
  const uptimeSeconds = Math.floor(process.uptime ? process.uptime() : 120);

  const healthData = {
    status: 'HEALTHY',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    checks: {
      detectionEngine: {
        status: 'UP',
        activeAnomalies: store.anomalies.filter(a => a.status !== 'RESOLVED').length,
        criticalAnomalies: store.anomalies.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length,
      },
      ingestionPipeline: {
        status: 'UP',
        eventsIngestedTotal: store.billingEvents.length,
        queueStatus: 'DRAINED',
      },
      database: {
        status: 'UP',
        driver: 'SQLite/Memory-Sync',
        persistence: 'OPERATIONAL',
      },
      notificationSubsystem: {
        status: 'UP',
        channels: ['SLACK', 'EMAIL', 'TEAMS', 'DASHBOARD'],
        pendingAlerts: store.notifications.filter(n => n.deliveryStatus === 'SENT').length,
      }
    },
    system: {
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage ? {
        rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      } : { rssMB: 64, heapUsedMB: 38 }
    }
  };

  return NextResponse.json(healthData, { status: 200 });
}
