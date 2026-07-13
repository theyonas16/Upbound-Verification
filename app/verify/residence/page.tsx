'use client';

import { useRouter } from 'next/navigation';
import { PostStepLayout } from '@/components/PostStepLayout';
import { PlaidConnect } from '@/components/PlaidConnect';
import { useFlow } from '@/lib/flow';
import { nextPostStep, pathForStep } from '@/lib/levels';

export default function ResidencePage() {
  const router = useRouter();
  const { state, update, markComplete } = useFlow();

  // Level 2+ pulls income from the SAME Plaid connection.
  const want = (state.level ?? 0) >= 2 ? ['residence', 'income'] : ['residence'];

  function done(data: { income?: { monthlyNet: number } }) {
    markComplete('residence');
    if (data.income) {
      markComplete('income');
      update({ plaidIncomeMonthly: data.income.monthlyNet });
    }
    setTimeout(() => {
      let next = nextPostStep(state.level!, 'residence');
      if (next === 'income' && data.income) next = nextPostStep(state.level!, 'income');
      router.push(next ? pathForStep(next) : '/verify/success');
    }, 800);
  }

  return (
    <PostStepLayout step="residence">
      <div>
        <h1 className="text-heading font-bold text-rac-blue">Confirm your address</h1>
        <p className="text-subheading text-rac-text-secondary">
          Connect your bank to verify your residence{(state.level ?? 0) >= 2 ? ' and income in one step' : ''}.
        </p>
      </div>
      <PlaidConnect want={want} onDone={done} cta="Connect bank to verify address" />
    </PostStepLayout>
  );
}
