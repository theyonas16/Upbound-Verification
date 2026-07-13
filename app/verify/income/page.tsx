'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PostStepLayout } from '@/components/PostStepLayout';
import { PlaidConnect } from '@/components/PlaidConnect';
import { useFlow } from '@/lib/flow';
import { nextPostStep, pathForStep } from '@/lib/levels';

export default function IncomePage() {
  const router = useRouter();
  const { state, hydrated, update, markComplete } = useFlow();

  // If income already came from the residence Plaid connection, skip ahead.
  useEffect(() => {
    if (!hydrated) return;
    if (state.completed?.income || state.plaidIncomeMonthly != null) {
      const next = nextPostStep(state.level!, 'income');
      router.replace(next ? pathForStep(next) : '/verify/success');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  function done(data: { income?: { monthlyNet: number } }) {
    markComplete('income');
    if (data.income) update({ plaidIncomeMonthly: data.income.monthlyNet });
    setTimeout(() => {
      const next = nextPostStep(state.level!, 'income');
      router.push(next ? pathForStep(next) : '/verify/success');
    }, 800);
  }

  return (
    <PostStepLayout step="income">
      <div>
        <h1 className="text-heading font-bold text-rac-blue">Verify your income</h1>
        <p className="text-subheading text-rac-text-secondary">
          Level {state.level} needs income verification for higher-value agreements.
        </p>
      </div>
      <PlaidConnect want={['income']} onDone={done} cta="Verify income with Plaid" />
    </PostStepLayout>
  );
}
