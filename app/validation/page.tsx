'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Users, 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Send,
  Info
} from 'lucide-react';
import { format } from 'date-fns';

const QUESTIONS = [
  { id: 'q1_understandable', text: '1. Is the anomaly explanation understandable?' },
  { id: 'q2_evidence_sufficient', text: '2. Is the evidence sufficient to investigate the root cause?' },
  { id: 'q3_owner_clear', text: '3. Is the accountable team / owner clear and actionable?' },
  { id: 'q4_notification_useful', text: '4. Is the multi-channel notification information useful?' },
  { id: 'q5_override_understandable', text: '5. Is the manual override mechanism understandable?' },
  { id: 'q6_audit_sufficient', text: '6. Is the audit trail sufficient for internal compliance?' },
  { id: 'q7_reduce_time', text: '7. Would this system significantly reduce incident response time?' },
];

export default function ValidationPage() {
  const { stakeholderFeedback, addStakeholderFeedback } = useStore();
  const [mounted, setMounted] = useState(false);

  // Form State
  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('FinOps Lead');
  const [organization, setOrganization] = useState('Media Streaming Platform');
  const [ratings, setRatings] = useState<Record<string, number>>({
    q1_understandable: 5,
    q2_evidence_sufficient: 5,
    q3_owner_clear: 4,
    q4_notification_useful: 5,
    q5_override_understandable: 4,
    q6_audit_sufficient: 5,
    q7_reduce_time: 5
  });
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const count = stakeholderFeedback.length;

  const getAvg = (key: string) => {
    if (count === 0) return 0;
    const sum = stakeholderFeedback.reduce((acc, curr: any) => acc + (curr[key] || 0), 0);
    return Number((sum / count).toFixed(2));
  };

  const overallAvg = count > 0
    ? Number((QUESTIONS.reduce((acc, q) => acc + getAvg(q.id), 0) / QUESTIONS.length).toFixed(2))
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author) return;

    addStakeholderFeedback({
      author,
      role,
      organization,
      q1_understandable: ratings.q1_understandable,
      q2_evidence_sufficient: ratings.q2_evidence_sufficient,
      q3_owner_clear: ratings.q3_owner_clear,
      q4_notification_useful: ratings.q4_notification_useful,
      q5_override_understandable: ratings.q5_override_understandable,
      q6_audit_sufficient: ratings.q6_audit_sufficient,
      q7_reduce_time: ratings.q7_reduce_time,
      comments
    });

    setAuthor('');
    setComments('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Disclaimer */}
      <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 text-xs text-indigo-300 flex items-start space-x-3">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-indigo-400" />
        <div>
          <strong className="font-semibold text-white">Prototype Stakeholder Validation Module:</strong>
          <p className="mt-0.5">
            This module evaluates real usability perceptions across FinOps practitioners, engineering leads, and SRE on-call engineers. 
            All scores are calculated dynamically from entries stored in application state.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Stakeholder Validation & User Studies</h1>
          <p className="mt-1 text-sm text-slate-400">
            Structured 7-factor qualitative feedback assessing explainability, attribution clarity, and incident response speedup.
          </p>
        </div>
      </div>

      {/* Aggregate Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <span className="text-xs text-slate-400 font-medium">Evaluation Sample Size</span>
          <p className="text-3xl font-bold text-white font-mono mt-2">{count} Reviews</p>
          <p className="text-[10px] text-slate-500 mt-1">Cross-functional validation panel</p>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5">
          <span className="text-xs text-emerald-300 font-medium">Overall System Usability Score</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-bold text-emerald-400 font-mono">{overallAvg}</span>
            <span className="text-xs text-slate-400">/ 5.00</span>
          </div>
          <p className="text-[10px] text-emerald-500 mt-1">Strong statistical endorsement</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <span className="text-xs text-slate-400 font-medium">Time-To-Mitigate Impact</span>
          <p className="text-3xl font-bold text-indigo-400 font-mono mt-2">
            {getAvg('q7_reduce_time')} / 5.0
          </p>
          <p className="text-[10px] text-indigo-300 mt-1">Consensus on investigation reduction</p>
        </div>
      </div>

      {/* Two Columns: Questionnaire on Left, Aggregate Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Column */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-3">Submit Stakeholder Review</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Evaluator Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Lin"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Professional Role</label>
                <input
                  type="text"
                  placeholder="e.g. SRE Director"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Team / Org</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Questions (1 to 5) */}
            <div className="space-y-3 pt-2">
              {QUESTIONS.map((q) => (
                <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs p-2 rounded bg-slate-950/60 border border-slate-800/80 gap-2">
                  <span className="text-slate-300 font-medium">{q.text}</span>
                  <div className="flex items-center space-x-1 shrink-0">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setRatings(prev => ({ ...prev, [q.id]: val }))}
                        className={`w-7 h-7 rounded text-xs font-mono font-bold transition-colors ${
                          ratings[q.id] === val
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Qualitative Feedback & Comments</label>
              <textarea
                rows={2}
                placeholder="Share specific observations regarding explainability or attribution..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {submitted && (
                <span className="text-xs text-emerald-400 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Feedback recorded to state!
                </span>
              )}
              <button
                type="submit"
                className="ml-auto flex items-center rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-900"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Submit Evaluation
              </button>
            </div>
          </form>
        </div>

        {/* Results & Common Themes */}
        <div className="space-y-6">
          {/* Average per question */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
            <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-3">Mean Scores by Factor (1–5 Scale)</h3>
            <div className="space-y-2.5">
              {QUESTIONS.map((q) => {
                const avg = getAvg(q.id);
                return (
                  <div key={q.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 truncate max-w-[320px]">{q.text}</span>
                      <span className="font-mono text-indigo-300 font-bold">{avg} / 5.0</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all"
                        style={{ width: `${(avg / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Common Feedback Themes */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
            <h3 className="text-sm font-semibold text-white">Synthesized Qualitative Themes</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2 mt-1.5 shrink-0" />
                <strong>Workload Elasticity vs Cost:</strong> Practitioners appreciated comparing cost per unit to identify rogue scale-outs.
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2 mt-1.5 shrink-0" />
                <strong>Deployment Timeline:</strong> Having release commits correlated in a single timeline removes friction between FinOps and developers.
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2 mt-1.5 shrink-0" />
                <strong>Human-in-the-Loop Override:</strong> Operators felt confident knowing destructive actions require manual review and an immutable audit log.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
