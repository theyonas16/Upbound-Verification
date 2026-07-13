'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RACHeader } from '@/components/RACHeader';
import { Button } from '@/components/Button';
import { Loader2, Home, DollarSign, Users } from 'lucide-react';
import { useFlow } from '@/lib/flow';
import { LEVELS, postStepsForLevel, pathForStep, STEP_META, type PostStep } from '@/lib/levels';

const CHECKING = ['Verifying identity signals', 'Checking SSN and contact', 'Scoring with the Decision Engine'];
const ICON: Record<PostStep, React.ReactNode> = {
  residence: <Home className="h-5 w-5 text-rac-blue" />,
  income: <DollarSign className="h-5 w-5 text-rac-blue" />,
  references: <Users className="h-5 w-5 text-rac-blue" />,
};
const POST_SUB: Record<PostStep, string> = {
  residence: 'Confirm your address with your bank (Plaid)',
  income: 'Verify income from the same bank connection',
  references: 'Add two personal references',
};

export default function DecisionPage() {
  const router = useRouter();
  const { state, hydrated, update } = useFlow();
  const [phase, setPhase] = useState<'checking' | 'result'>('checking');
  const [tick, setTick] = useState(0);
  const [level, setLevel] = useState<number | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.identityVerified || !state.ssn) {
      router.replace('/verify');
      return;
    }
    if (started.current) return;
    started.current = true;

    const stepper = setInterval(() => setTick((t) => (t + 1) % CHECKING.length), 650);

    (async () => {
      let assigned = 1;
      let reference: string | null = null;
      try {
        const res = await fetch('/api/decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: state.firstName,
            lastName: state.lastName,
            address: state.address,
            ssnPresent: !!state.ssn,
            phone: state.phone,
          }),
        });
        const data = await res.json();
        if (typeof data.level === 'number') assigned = data.level;
        reference = data.reference ?? null;
      } catch {
        /* keep default */
      }
      setTimeout(() => {
        clearInterval(stepper);
        setLevel(assigned);
        update({ level: assigned, deReference: reference });
        setPhase('result');
      }, 2000);
    })();

    return () => clearInterval(stepper);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  function proceed() {
    const first = postStepsForLevel(level!)[0];
    router.push(pathForStep(first));
  }

  if (phase === 'checking') {
    return (
      <div className="min-h-screen bg-white">
        <RACHeader />
        <main className="container mx-auto px-4 pt-24">
          <div className="max-w-md mx-auto text-center space-y-6">
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-rac-blue" />
            <h1 className="text-heading font-bold text-rac-blue">Checking your application</h1>
            <p className="text-subheading text-rac-text-secondary">{CHECKING[tick]}…</p>
            <p className="text-xs text-rac-text-secondary">This usually takes a few seconds.</p>
          </div>
        </main>
      </div>
    );
  }

  const meta = LEVELS[level!];
  const steps = postStepsForLevel(level!);

  return (
    <div className="min-h-screen bg-white">
      <RACHeader />
      <main className="container mx-auto px-4 pt-16">
        <div className="max-w-md mx-auto space-y-6 animate-fade-in">
          <div className="rounded-2xl bg-gradient-to-br from-rac-blue to-rac-blue-dark p-7 text-center text-white">
            <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/25 bg-white/10 text-3xl font-bold">
              L{level}
            </div>
            <div className="text-xl font-bold">You&apos;re approved</div>
            <div className="text-sm opacity-90">{meta.name} — {meta.allows}</div>
          </div>

          <div className="rounded-rac border border-rac-gray bg-rac-gray-light p-5 space-y-4">
            <div>
              <h2 className="font-semibold text-rac-blue">What this unlocks</h2>
              <p className="text-sm text-rac-text-secondary">{meta.blurb}</p>
            </div>
            <div className="text-xs font-semibold uppercase tracking-wide text-rac-text-secondary">
              A few quick checks remain
            </div>
            <div className="space-y-2">
              {steps.map((s) => (
                <div key={s} className="flex items-center gap-3 rounded-rac bg-white p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rac-blue/10">{ICON[s]}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-rac-text-primary text-sm">{STEP_META[s].label}</div>
                    <div className="text-xs text-rac-text-secondary">{POST_SUB[s]}</div>
                  </div>
                  <span className="rounded-full bg-rac-blue/10 px-2 py-1 text-xs font-semibold text-rac-blue">Required</span>
                </div>
              ))}
            </div>
          </div>

          <Button variant="primary" fullWidth onClick={proceed} className="h-14 text-base">
            Start post-approval verification
          </Button>
          <p className="text-center text-xs text-rac-text-secondary">
            Only the steps your approval level needs — nothing more.
          </p>
        </div>
      </main>
    </div>
  );
}
