'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from '@/components/Button';
import { Building2, Link2, CheckCircle2 } from 'lucide-react';

// Plaid bank connection. Uses the real usePlaidLink hook when the server
// returns a real link token (PLAID_CLIENT_ID/SECRET set); otherwise runs a
// simulated Link handoff so the demo works without credentials.

interface PlaidResult {
  verified: boolean;
  mode: string;
  institution: string;
  residence?: { matches: boolean };
  income?: { monthlyNet: number };
}

export function PlaidConnect({
  want,
  onDone,
  cta = 'Connect your bank',
}: {
  want: string[];
  onDone: (r: PlaidResult) => void;
  cta?: string;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [mode, setMode] = useState<'simulated' | 'plaid'>('simulated');
  const [phase, setPhase] = useState<'idle' | 'connecting' | 'done'>('idle');
  const [result, setResult] = useState<PlaidResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/plaid/link-token', { method: 'POST' })
      .then((r) => r.json())
      .then((d) => {
        setToken(d.link_token || null);
        setMode(d.mode === 'plaid' ? 'plaid' : 'simulated');
      })
      .catch(() => setMode('simulated'));
  }, []);

  const exchange = useCallback(async () => {
    const res = await fetch('/api/plaid/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ want }),
    });
    const data: PlaidResult = await res.json();
    setResult(data);
    setPhase('done');
    onDone(data);
  }, [want, onDone]);

  // Real Plaid Link (only used when a real token is present).
  const { open, ready } = usePlaidLink({
    token: mode === 'plaid' ? token || '' : '',
    onSuccess: () => { exchange(); },
    onExit: () => setPhase('idle'),
  });

  async function connect() {
    setError(null);
    setPhase('connecting');
    try {
      if (mode === 'plaid' && ready) {
        open();
        return;
      }
      // Simulated hosted-Link handoff latency.
      await new Promise((r) => setTimeout(r, 1400));
      await exchange();
    } catch {
      setError('Bank connection failed. Please try again.');
      setPhase('idle');
    }
  }

  if (phase === 'done' && result) {
    return (
      <div className="animate-fade-in space-y-3 rounded-rac border border-green-200 bg-green-50 p-5">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-green-600" />
          <div className="flex-1">
            <div className="font-semibold text-green-900">Connected · {result.institution}</div>
            <div className="text-xs text-green-700">
              {result.mode === 'simulated' ? 'Sandbox connection' : 'Verified via Plaid'}
            </div>
          </div>
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        </div>
        {result.residence && (
          <div className="flex items-center justify-between text-sm text-green-800">
            <span>Address on file</span><span className="font-semibold">Matches ✓</span>
          </div>
        )}
        {result.income && (
          <div className="flex items-center justify-between text-sm text-green-800">
            <span>Verified income</span>
            <span className="font-semibold">${result.income.monthlyNet}/mo net ✓</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-rac border border-rac-gray bg-rac-gray-light p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rac-blue/10">
          <Link2 className="h-5 w-5 text-rac-blue" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-rac-blue">Secure bank connection</div>
          <div className="text-xs text-rac-text-secondary">Powered by Plaid · read-only · ~$0.10</div>
        </div>
      </div>
      <Button variant="primary" fullWidth onClick={connect} disabled={phase === 'connecting'}>
        {phase === 'connecting' ? 'Connecting to your bank…' : cta}
      </Button>
      {error && <p className="text-xs text-rac-red">{error}</p>}
      <p className="text-xs text-rac-text-secondary">
        One connection covers everything this approval level needs.
      </p>
    </div>
  );
}
