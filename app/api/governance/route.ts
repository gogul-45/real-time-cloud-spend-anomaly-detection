import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_RETENTION_POLICIES, maskPII, simulateRetentionPurge } from '@/lib/governance/retention';
import { useStore } from '@/store/useStore';

export async function GET() {
  const store = useStore.getState();
  return NextResponse.json({
    policies: DEFAULT_RETENTION_POLICIES,
    dataSummary: {
      rawBillingEvents: store.billingEvents.length,
      anomaliesRecorded: store.anomalies.length,
      auditLogsStored: store.auditTrail.length,
      notificationsLogged: store.notifications.length,
    },
    privacyControls: {
      piiMaskingEnabled: true,
      immutableWormStorageForAudit: true,
      sox404Compliant: true,
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'PURGE_SIMULATION';

    if (action === 'PURGE_SIMULATION') {
      const store = useStore.getState();
      const purgeResult = simulateRetentionPurge({
        rawEvents: store.billingEvents.length,
        aggregates: 120,
        auditLogs: store.auditTrail.length
      });
      return NextResponse.json({ success: true, result: purgeResult });
    }

    if (action === 'MASK_PREVIEW') {
      const text = body.text || 'Account: 123456789012, Contact: devops.lead@megacorp.com, Host: 192.168.1.45';
      const masked = maskPII(text);
      return NextResponse.json({ success: true, original: text, masked });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
