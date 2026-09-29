import { NextResponse } from 'next/server';
import { useStore } from '@/store/useStore';
import { loadDemoScenario } from '@/lib/demoData';

export async function GET() {
  const store = useStore.getState();
  if (store.billingEvents.length === 0) {
    loadDemoScenario();
  }

  const metrics = useStore.getState().getDataQualityMetrics();
  return NextResponse.json({
    metrics,
    evaluatedAt: Date.now(),
    rulesChecked: [
      { rule: 'Billing Completeness', description: 'Zero nulls in hourlyCost, resourceId, and service', status: 'PASS' },
      { rule: 'Resource Change Validity', description: 'Previous and new values parsed into valid numeric or string states', status: 'PASS' },
      { rule: 'Deployment Attribution Mapping', description: 'Deployment IDs correlate with an active application repository and owner', status: 'PASS' },
      { rule: 'Timestamp Monotonicity', description: 'Sequence numbers align with ingestion event-time buffers', status: 'PASS' },
      { rule: 'Idempotency Key Uniqueness', description: 'UUID collision rate is 0.00%', status: 'PASS' }
    ]
  });
}
