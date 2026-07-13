'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RACHeader } from '@/components/RACHeader';
import { Button } from '@/components/Button';
import { CheckCircle2, Shield, Award } from 'lucide-react';
import { useFlow } from '@/lib/flow';
import { LEVELS, postStepBreakdown, STEP_META } from '@/lib/levels';
import { identityCost, postDeCost, LEGACY_COST, fmt } from '@/lib/cost';

export default function SuccessPage() {
  const router = useRouter();
  const { state, hydrated, reset } = useFlow();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (state.level == null) { router.replace('/verify'); return; }
    setTimeout(() => setShow(true), 400);
  }, [hydrated, state.level, router]);

  if (!hydrated || state.level == null) {
    return (
      <div className="min-h-screen bg-white">
        <RACHeader />
        <main className="container mx-auto px-4 pt-24 text-center text-rac-text-secondary">Loading…</main>
      </div>
    );
  }

  const level = state.level;
  const meta = LEVELS[level];
  const breakdown = postStepBreakdown(level);
  const idMethod = state.identityMethod ?? 'device';
  const idCost = identityCost(idMethod);
  const postCost = postDeCost();
  const totalNew = idCost + postCost;
  const isEcomm = state.channel === 'ecomm';

  return (
    <div className="min-h-screen bg-white">
      <RACHeader />
      <main className="container mx-auto px-4 pt-16">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Level hero */}
          <div className="rounded-2xl bg-gradient-to-br from-rac-blue to-rac-blue-dark p-7 text-center text-white">
            <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/25 bg-white/10 text-3xl font-bold">
              L{level}
            </div>
            <div className="text-xl font-bold">Verification complete</div>
            <div className="text-sm opacity-90">{meta.name} — {meta.allows}</div>
          </div>

          {/* Approval level table */}
          <div className="rounded-rac border border-rac-gray bg-rac-gray-light p-5 space-y-3">
            <h2 className="flex items-center gap-2 font-semibold text-rac-blue">
              <Award className="h-5 w-5" /> Your approval
            </h2>
            <div className="space-y-1">
              {Object.values(LEVELS).map((l) => (
                <div
                  key={l.id}
                  className={`flex items-center gap-3 rounded-rac p-3 ${l.id === level ? 'bg-rac-red/10 ring-1 ring-rac-red/30' : 'bg-white'}`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${l.id === level ? 'bg-rac-red text-white' : 'bg-rac-gray-light text-rac-text-secondary'}`}>
                    L{l.id}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-rac-text-primary">{l.name}{l.id === level ? ' — you' : ''}</div>
                    <div className="text-xs text-rac-text-secondary">{l.allows}</div>
                  </div>
                  {l.id === level && <CheckCircle2 className="h-5 w-5 text-rac-red" />}
                </div>
              ))}
            </div>
            <p className="text-xs text-rac-text-secondary">L4 &amp; L5 share Level 3&apos;s document set.</p>
          </div>

          {/* Required vs skipped */}
          {show && (
            <div className="rounded-rac border border-rac-gray bg-rac-gray-light p-5 space-y-3 animate-fade-in">
              <h2 className="font-semibold text-rac-blue">Steps for your level</h2>
              <div className="space-y-1">
                <StepRow label="Identity" sub={idMethod === 'openkyc' ? 'OpenKYC document + face match' : 'Device Face ID / Wallet'} skipped={false} />
                <StepRow label="SSN & contact" sub="Entered manually (required in every path)" skipped={false} />
                {breakdown.map(({ step, required }) => (
                  <StepRow
                    key={step}
                    label={STEP_META[step].label}
                    sub={required ? (state.completed?.[step] ? 'Completed' : 'Required') : `Not required at Level ${level}`}
                    skipped={!required}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Split cost */}
          <div className="rounded-rac border border-rac-gray bg-rac-gray-light p-5 space-y-3">
            <h2 className="font-semibold text-rac-blue">Cost per applicant</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-rac bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-rac-text-secondary">Pre-DE identity</div>
                <div className="text-2xl font-bold text-rac-text-primary">{fmt(idCost)}</div>
                <div className="text-xs text-rac-text-secondary">{idMethod === 'openkyc' ? 'OpenKYC ($0.05)' : 'Device / Wallet ($0.00)'}</div>
              </div>
              <div className="rounded-rac bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-rac-text-secondary">Post-DE documents</div>
                <div className="text-2xl font-bold text-rac-text-primary">{fmt(postCost)}</div>
                <div className="text-xs text-rac-text-secondary">Plaid — replaces manual uploads</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-rac-text-secondary">New total</span>
              <span><strong className="text-rac-blue">{fmt(totalNew)}</strong> vs {fmt(LEGACY_COST)}+ traditional vendors</span>
            </div>
          </div>

          {/* Security checks — device signals scoped to eComm */}
          {show && (
            <div className="rounded-rac border border-green-200 bg-green-50 p-4 animate-fade-in">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <div className="space-y-1 text-sm">
                  <h3 className="font-semibold text-green-900">Security Checks Passed</h3>
                  <ul className="space-y-1 text-green-700">
                    <li>✓ Document authenticity: Verified</li>
                    <li>✓ Biometric confidence: {state.faceMatchScore ? `${Math.round(state.faceMatchScore * 100)}%` : 'High'}</li>
                    <li>✓ Fraud risk: Low</li>
                    {isEcomm ? (
                      <li>✓ Device trust score: 98/100 <span className="text-green-600">(online applications only)</span></li>
                    ) : (
                      <li className="text-green-600">• Device signals: N/A for in-store (RACPad) applications</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Button variant="primary" fullWidth onClick={() => (window.location.href = '/application')} className="h-14 text-base">
              Continue to Application
            </Button>
            <Button variant="secondary" fullWidth onClick={() => { reset(); router.push('/'); }}>
              Start a new application
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepRow({ label, sub, skipped }: { label: string; sub: string; skipped: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-rac bg-white p-3">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${skipped ? 'bg-rac-gray-light text-rac-text-secondary' : 'bg-green-100 text-green-700'}`}>
        {skipped ? '—' : '✓'}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-rac-text-primary">{label}</div>
        <div className="text-xs text-rac-text-secondary">{sub}</div>
      </div>
      <span className={`text-xs font-semibold ${skipped ? 'text-rac-text-secondary' : 'text-green-600'}`}>
        {skipped ? 'Skipped' : 'Done'}
      </span>
    </div>
  );
}
