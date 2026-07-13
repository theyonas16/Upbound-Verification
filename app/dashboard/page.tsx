import { RACHeader } from '@/components/RACHeader';
import Link from 'next/link';
import { Signal } from 'lucide-react';
import { LEVEL_FUNNEL, requiredStepChain, completionByLevel } from '@/lib/analytics';
import { STEP_META } from '@/lib/levels';

export const metadata = { title: 'Analytics — RAC Verify' };

const LEVEL_COLOR: Record<number, string> = {
  0: '#B7791F',
  1: '#0057A0',
  2: '#E31837',
  3: '#128A4A',
};

export default function Dashboard() {
  const completion = completionByLevel();

  return (
    <div className="min-h-screen bg-white">
      <RACHeader />
      <main className="container mx-auto px-4 pt-16">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <span className="rounded-full bg-rac-red/10 px-3 py-1 text-xs font-semibold text-rac-red">
              Pilot analytics
            </span>
            <h1 className="mt-3 text-heading font-bold text-rac-blue">Funnel by approval level</h1>
            <p className="mt-2 text-subheading text-rac-text-secondary">
              Aggregate drop-off is misleading — each level requires a different set of steps. Everything below is
              segmented by level.
            </p>
          </div>

          {Object.keys(LEVEL_FUNNEL).map((k) => {
            const level = Number(k);
            const chain = requiredStepChain(level);
            const f = LEVEL_FUNNEL[level];
            const start = f.applicants;
            return (
              <div key={level} className="rounded-rac border border-rac-gray bg-rac-gray-light p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-rac-blue">Level {level}</h2>
                  <span className="text-xs font-semibold" style={{ color: LEVEL_COLOR[level] }}>
                    {f.applicants} applicants · {chain.length} steps
                  </span>
                </div>
                <div className="space-y-2">
                  {chain.map((step) => {
                    const n = f[step] ?? f.applicants;
                    const pct = Math.round((n / start) * 100);
                    return (
                      <div key={step}>
                        <div className="mb-0.5 flex justify-between text-xs text-rac-text-secondary">
                          <span>{STEP_META[step]?.label ?? step}</span>
                          <span>{n} · {pct}%</span>
                        </div>
                        <div className="h-5 overflow-hidden rounded-full bg-white">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: LEVEL_COLOR[level] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="rounded-rac border border-rac-gray bg-rac-gray-light p-5 space-y-3">
            <h2 className="font-semibold text-rac-blue">Steps required vs completed by level</h2>
            <p className="text-sm text-rac-text-secondary">
              Required = applicants who reached a decision. Completed = finished every step their level requires.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-rac-text-secondary">
                    <th className="py-2 pr-2">Level</th>
                    <th className="py-2 pr-2">Required steps</th>
                    <th className="py-2 text-right">Reached DE</th>
                    <th className="py-2 text-right">Completed</th>
                    <th className="py-2 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody className="text-rac-text-primary">
                  {completion.map((c) => (
                    <tr key={c.level} className="border-t border-rac-gray">
                      <td className="py-2 pr-2 font-semibold" style={{ color: LEVEL_COLOR[c.level] }}>L{c.level}</td>
                      <td className="py-2 pr-2 text-xs text-rac-text-secondary">
                        {requiredStepChain(c.level).map((s) => STEP_META[s]?.short ?? s).join(' → ')}
                      </td>
                      <td className="py-2 text-right tabular-nums">{c.required}</td>
                      <td className="py-2 text-right tabular-nums">{c.completed}</td>
                      <td className="py-2 text-right tabular-nums font-semibold">{Math.round(c.rate * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-2 pt-2">
              {completion.map((c) => (
                <div key={c.level}>
                  <div className="mb-0.5 flex justify-between text-xs text-rac-text-secondary">
                    <span>Level {c.level} completion</span>
                    <span>{Math.round(c.rate * 100)}%</span>
                  </div>
                  <div className="h-5 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full" style={{ width: `${Math.round(c.rate * 100)}%`, backgroundColor: LEVEL_COLOR[c.level] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device signals scoped to eComm */}
          <div className="flex items-start gap-3 rounded-rac border border-rac-gray bg-rac-gray-light p-4">
            <Signal className="mt-0.5 h-5 w-5 flex-shrink-0 text-rac-blue" />
            <p className="text-sm text-rac-text-primary">
              <strong>Device signals (online applications only).</strong> Device fingerprint / device-trust metrics
              apply to eComm. In-store applications are captured on the RACPad, where the signal isn&apos;t meaningful
              and is excluded from these figures.
            </p>
          </div>

          <Link href="/" className="block text-center text-sm text-rac-blue hover:underline">← Back to start</Link>
        </div>
      </main>
    </div>
  );
}
