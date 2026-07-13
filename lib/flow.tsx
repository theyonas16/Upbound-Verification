'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { IdentityMethod } from './cost';
import type { PostStep } from './levels';

// Client-side flow state, persisted to sessionStorage so a refresh mid-flow
// doesn't lose progress. Channel is 'ecomm' (online) or 'instore' (RACPad) —
// device signals are only meaningful for eComm.

export interface FlowState {
  channel: 'ecomm' | 'instore';
  identityMethod: IdentityMethod | null;
  identitySource: string | null; // 'apple_wallet' | 'google_wallet' | 'document' | 'device'
  identityVerified: boolean;
  identityTime: string | null;
  ocrName: string | null;
  faceMatchScore: number | null;
  faceMatchSimulated: boolean;
  firstName: string;
  lastName: string;
  address: string;
  ssn: string; // digits only; never rendered in full downstream
  usesEin: boolean;
  phone: string;
  email: string;
  level: number | null;
  deReference: string | null;
  completed: Partial<Record<PostStep, boolean>>;
  plaidIncomeMonthly: number | null;
}

const KEY = 'rac.flow.v2';

const EMPTY: FlowState = {
  channel: 'ecomm',
  identityMethod: null,
  identitySource: null,
  identityVerified: false,
  identityTime: null,
  ocrName: null,
  faceMatchScore: null,
  faceMatchSimulated: false,
  firstName: '',
  lastName: '',
  address: '',
  ssn: '',
  usesEin: false,
  phone: '',
  email: '',
  level: null,
  deReference: null,
  completed: {},
  plaidIncomeMonthly: null,
};

interface FlowContextValue {
  state: FlowState;
  hydrated: boolean;
  update: (patch: Partial<FlowState>) => void;
  markComplete: (step: PostStep) => void;
  reset: () => void;
}

const FlowContext = createContext<FlowContextValue | null>(null);

function load(): FlowState {
  if (typeof window === 'undefined') return { ...EMPTY };
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function FlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FlowState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore quota / private mode */
    }
  }, [state, hydrated]);

  const update = useCallback((patch: Partial<FlowState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const markComplete = useCallback((step: PostStep) => {
    setState((s) => ({ ...s, completed: { ...s.completed, [step]: true } }));
  }, []);

  const reset = useCallback(() => {
    setState({ ...EMPTY });
    try { sessionStorage.removeItem(KEY); } catch {}
  }, []);

  return (
    <FlowContext.Provider value={{ state, hydrated, update, markComplete, reset }}>
      {children}
    </FlowContext.Provider>
  );
}

export function useFlow(): FlowContextValue {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error('useFlow must be used within FlowProvider');
  return ctx;
}
