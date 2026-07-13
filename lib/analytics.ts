// Placeholder pilot analytics, segmented by approval level. Aggregate funnel
// numbers are misleading because each level requires a different step set — so
// everything here is broken out per level (L0-L3).

import { postStepsForLevel, PRE_DE_STEPS, type FlowStep } from '@/lib/levels';

export const LEVEL_FUNNEL: Record<number, Record<string, number>> = {
  0: { applicants: 220, identity: 220, details: 208, decision: 205, residence: 191 },
  1: { applicants: 330, identity: 330, details: 318, decision: 312, residence: 286 },
  2: { applicants: 300, identity: 300, details: 289, decision: 284, residence: 268, income: 241 },
  3: { applicants: 190, identity: 190, details: 181, decision: 176, residence: 168, income: 150, references: 121 },
};

export function requiredStepChain(level: number): FlowStep[] {
  return [...PRE_DE_STEPS, 'decision', ...postStepsForLevel(level)] as FlowStep[];
}

export function completionByLevel() {
  return Object.keys(LEVEL_FUNNEL).map((k) => {
    const level = Number(k);
    const chain = requiredStepChain(level);
    const f = LEVEL_FUNNEL[level];
    const lastStep = chain[chain.length - 1];
    const required = f.applicants;
    const completed = f[lastStep] ?? f.applicants;
    return { level, required, completed, rate: completed / required, lastStep };
  });
}
