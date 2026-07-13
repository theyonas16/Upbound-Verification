import { RACHeader } from '@/components/RACHeader';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Pilot Design — RAC Verify' };

// Static stakeholder page explaining the shadow-mode pilot approach.
export default function PilotDesign() {
  return (
    <div className="min-h-screen bg-white">
      <RACHeader />
      <main className="container mx-auto px-4 pt-16">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <span className="rounded-full bg-rac-blue/10 px-3 py-1 text-xs font-semibold text-rac-blue">
              Stakeholder brief
            </span>
            <h1 className="mt-3 text-heading font-bold text-rac-blue">Shadow-mode pilot</h1>
            <p className="mt-2 text-subheading text-rac-text-secondary">
              OpenKYC runs in <strong>shadow mode</strong> alongside the current verification stack. Both systems
              verify every pilot applicant. Nothing customer-facing changes until OpenKYC matches or beats the
              current pass/fail baseline. The accuracy threshold is defined by the Decision Engine team.
            </p>
          </div>

          <div className="rounded-rac border border-rac-gray bg-rac-gray-light p-5">
            <h2 className="font-semibold text-rac-blue">How the pilot runs</h2>
            <div className="mt-4 space-y-2">
              <Node>Applicant submits verification</Node>
              <Arrow />
              <div className="grid grid-cols-2 gap-3">
                <Node>Current stack<br /><Sub>Live decision (customer-facing)</Sub></Node>
                <Node accent>OpenKYC<br /><Sub>Shadow — result logged, not shown</Sub></Node>
              </div>
              <Arrow />
              <Node>Comparison dashboard<br /><Sub>Agreement, false reject, false accept, confidence</Sub></Node>
              <Arrow />
              <Node gate>Threshold gate<br /><Sub>DE team defines the accuracy bar</Sub></Node>
              <Arrow />
              <Node>Cutover<br /><Sub>Only after OpenKYC meets or beats baseline</Sub></Node>
            </div>
          </div>

          <div className="rounded-rac border border-rac-gray bg-rac-gray-light p-5">
            <h2 className="font-semibold text-rac-blue">Pilot metrics</h2>
            <p className="mt-1 text-sm text-rac-text-secondary">
              Baselines are established live; every figure below is measured during the pilot.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-rac-text-secondary">
                    <th className="py-2 pr-2">Metric</th>
                    <th className="py-2 pr-2">Definition</th>
                    <th className="py-2 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="text-rac-text-primary">
                  {[
                    ['Agreement rate', 'OpenKYC vs current stack, same outcome'],
                    ['False reject rate', 'OpenKYC rejects a truly valid applicant'],
                    ['False accept rate', 'OpenKYC passes a truly invalid applicant'],
                    ['Avg confidence', 'Mean model confidence across applicants'],
                  ].map(([m, d]) => (
                    <tr key={m} className="border-t border-rac-gray">
                      <td className="py-2 pr-2 font-semibold">{m}</td>
                      <td className="py-2 pr-2 text-rac-text-secondary">{d}</td>
                      <td className="py-2 text-right text-rac-text-secondary">Measured during pilot</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-rac border border-green-200 bg-green-50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
            <p className="text-sm text-green-800">
              <strong>Zero customer risk during the pilot.</strong> OpenKYC never drives a live decision until it
              clears the DE team&apos;s threshold.
            </p>
          </div>

          <Link href="/" className="block text-center text-sm text-rac-blue hover:underline">← Back to start</Link>
        </div>
      </main>
    </div>
  );
}

function Node({ children, accent, gate }: { children: React.ReactNode; accent?: boolean; gate?: boolean }) {
  const cls = accent
    ? 'border-rac-red bg-rac-red/5'
    : gate
    ? 'border-rac-yellow bg-yellow-50'
    : 'border-rac-gray bg-white';
  return <div className={`rounded-rac border px-4 py-3 text-sm font-semibold text-rac-text-primary ${cls}`}>{children}</div>;
}
function Sub({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-normal text-rac-text-secondary">{children}</span>;
}
function Arrow() {
  return <div className="text-center text-lg leading-none text-rac-text-secondary">↓</div>;
}
