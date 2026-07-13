// Decision Engine approval-level model.
// Source of truth: underwriting alignment (Katherine Fang, Elliott Green).
//
// Hard dependencies collected BEFORE the DE runs: first name, last name,
// address, SSN (EIN fallback), phone. Email optional.
// The DE returns a Level (0-5). The level determines which documents are
// collected AFTERWARD ("post-approval verification").
//
//   L0-L1 = ID + Residence only
//   L2    = adds Income
//   L3-L5 = adds References

export type PostStep = 'residence' | 'income' | 'references';
export type FlowStep = 'identity' | 'details' | 'decision' | PostStep;

export interface LevelMeta {
  id: number;
  name: string;
  allows: string;
  blurb: string;
  steps: PostStep[];
}

export const LEVELS: Record<number, LevelMeta> = {
  0: {
    id: 0,
    name: 'Level 0',
    allows: 'Any single item — phone included',
    blurb: 'Entry approval. Covers any one item in the store, phones included.',
    steps: ['residence'],
  },
  1: {
    id: 1,
    name: 'Level 1',
    allows: 'Any single item (no phone)',
    blurb: 'Any one item except phones.',
    steps: ['residence'],
  },
  2: {
    id: 2,
    name: 'Level 2',
    allows: 'Higher-value items — income verified',
    blurb: 'Unlocks higher-value agreements. Requires income verification.',
    steps: ['residence', 'income'],
  },
  3: {
    id: 3,
    name: 'Level 3',
    allows: 'Premium / multi-item — references required',
    blurb: 'Top approval tier. Requires income and personal references.',
    steps: ['residence', 'income', 'references'],
  },
  // L4 / L5 exist in the real DE (same doc set as L3). Demo caps at L3.
};

export const PRE_DE_STEPS = ['identity', 'details'] as const;
export const ALL_POST_STEPS: PostStep[] = ['residence', 'income', 'references'];

export const STEP_META: Record<FlowStep, { label: string; short: string }> = {
  identity: { label: 'Identity', short: 'ID' },
  details: { label: 'SSN & contact', short: 'Details' },
  decision: { label: 'Decision', short: 'DE' },
  residence: { label: 'Residence', short: 'Residence' },
  income: { label: 'Income', short: 'Income' },
  references: { label: 'References', short: 'References' },
};

export function postStepsForLevel(level: number): PostStep[] {
  return LEVELS[level]?.steps ?? ['residence'];
}

export function postStepBreakdown(level: number): { step: PostStep; required: boolean }[] {
  const required = new Set(postStepsForLevel(level));
  return ALL_POST_STEPS.map((step) => ({ step, required: required.has(step) }));
}

export function nextPostStep(level: number, current: PostStep | null): PostStep | null {
  const steps = postStepsForLevel(level);
  if (current == null) return steps[0] ?? null;
  const idx = steps.indexOf(current);
  if (idx === -1) return steps[0] ?? null;
  return steps[idx + 1] ?? null;
}

export function pathForStep(step: PostStep): string {
  return `/verify/${step}`;
}

// Weighted random level for the DEMO Decision Engine.
// 20% L0, 30% L1, 30% L2, 20% L3.
export function pickLevelWeighted(): number {
  const r = Math.random();
  if (r < 0.2) return 0;
  if (r < 0.5) return 1;
  if (r < 0.8) return 2;
  return 3;
}
