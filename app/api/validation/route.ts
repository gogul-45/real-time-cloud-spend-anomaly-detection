import { NextRequest, NextResponse } from 'next/server';
import { useStore } from '@/store/useStore';
import { loadDemoScenario } from '@/lib/demoData';

export async function GET() {
  const store = useStore.getState();
  if (store.stakeholderFeedback.length === 0) {
    loadDemoScenario();
  }

  const feedbackList = useStore.getState().stakeholderFeedback;
  const count = feedbackList.length;

  if (count === 0) {
    return NextResponse.json({
      count: 0,
      averageScores: {},
      feedbackList: [],
      commonThemes: []
    });
  }

  const avg = (fn: (item: any) => number) => 
    Number((feedbackList.reduce((sum, item) => sum + fn(item), 0) / count).toFixed(2));

  const averageScores = {
    q1_understandable: avg(f => f.q1_understandable),
    q2_evidence_sufficient: avg(f => f.q2_evidence_sufficient),
    q3_owner_clear: avg(f => f.q3_owner_clear),
    q4_notification_useful: avg(f => f.q4_notification_useful),
    q5_override_understandable: avg(f => f.q5_override_understandable),
    q6_audit_sufficient: avg(f => f.q6_audit_sufficient),
    q7_reduce_time: avg(f => f.q7_reduce_time),
    overallAverage: avg(f => 
      (f.q1_understandable + f.q2_evidence_sufficient + f.q3_owner_clear + f.q4_notification_useful + f.q5_override_understandable + f.q6_audit_sufficient + f.q7_reduce_time) / 7
    )
  };

  const commonThemes = [
    'Workload elasticity (cost per unit) provides instant clarity on legitimacy.',
    'Deployment correlation eliminates ambiguity between developer rollouts and FinOps alerts.',
    'Operator override and immutable audit logs satisfy internal compliance controls.'
  ];

  return NextResponse.json({
    count,
    averageScores,
    commonThemes,
    feedbackList
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      author,
      role,
      organization,
      q1_understandable,
      q2_evidence_sufficient,
      q3_owner_clear,
      q4_notification_useful,
      q5_override_understandable,
      q6_audit_sufficient,
      q7_reduce_time,
      comments
    } = body;

    if (!author || !role) {
      return NextResponse.json({ error: 'Author and role are required.' }, { status: 400 });
    }

    useStore.getState().addStakeholderFeedback({
      author,
      role,
      organization: organization || 'Prototype Review Group',
      q1_understandable: Number(q1_understandable) || 4,
      q2_evidence_sufficient: Number(q2_evidence_sufficient) || 4,
      q3_owner_clear: Number(q3_owner_clear) || 4,
      q4_notification_useful: Number(q4_notification_useful) || 4,
      q5_override_understandable: Number(q5_override_understandable) || 4,
      q6_audit_sufficient: Number(q6_audit_sufficient) || 4,
      q7_reduce_time: Number(q7_reduce_time) || 4,
      comments: comments || ''
    });

    return NextResponse.json({ success: true, message: 'Stakeholder validation feedback recorded.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
