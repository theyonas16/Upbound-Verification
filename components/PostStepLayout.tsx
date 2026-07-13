'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RACHeader } from '@/components/RACHeader';
import { Stepper } from '@/components/Stepper';
import { useFlow } from '@/lib/flow';
import { postStepsForLevel, STEP_META, type PostStep } from '@/lib/levels';

// Guards that the applicant has a level, and renders a progress indicator with
// ONLY the steps this level requires.
export function PostStepLayout({ step, children }: { step: PostStep; children: ReactNode }) {
  const router = useRouter();
  const { state, hydrated } = useFlow();

  useEffect(() => {
    if (!hydrated) return;
    if (state.level == null) router.replace('/verify');
  }, [hydrated, state.level, router]);

  if (!hydrated || state.level == null) {
    return (
      <div className="min-h-screen bg-white">
        <RACHeader />
        <main className="container mx-auto px-4 pt-24 text-center text-rac-text-secondary">Loading…</main>
      </div>
    );
  }

  const steps = postStepsForLevel(state.level).map((k) => ({ key: k, label: STEP_META[k].short }));

  return (
    <div className="min-h-screen bg-white">
      <RACHeader />
      <main className="container mx-auto px-4 pt-16">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-rac-red/10 px-3 py-1 text-xs font-semibold text-rac-red">
              Level {state.level}
            </span>
            <span className="text-xs text-rac-text-secondary">Post-approval verification</span>
          </div>
          <Stepper title="Post-approval verification" steps={steps} current={step} completed={state.completed} />
          {children}
        </div>
      </main>
    </div>
  );
}
