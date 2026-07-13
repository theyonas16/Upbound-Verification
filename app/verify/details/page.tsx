'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RACHeader } from '@/components/RACHeader';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Stepper } from '@/components/Stepper';
import { Info } from 'lucide-react';
import { useFlow } from '@/lib/flow';

const PRE_STEPS = [
  { key: 'identity', label: 'Identity' },
  { key: 'details', label: 'SSN & contact' },
  { key: 'decision', label: 'Decision' },
];

function formatTaxId(raw: string, isEin: boolean): string {
  const d = raw.replace(/\D/g, '').slice(0, 9);
  if (isEin) return d.length <= 2 ? d : `${d.slice(0, 2)}-${d.slice(2)}`;
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export default function DetailsPage() {
  const router = useRouter();
  const { state, hydrated, update } = useFlow();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [ssn, setSsn] = useState('');
  const [usesEin, setUsesEin] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.identityVerified) {
      router.replace('/verify');
      return;
    }
    if (state.ocrName) {
      const parts = state.ocrName.split(' ');
      setFirstName((f) => f || parts[0] || '');
      setLastName((l) => l || parts.slice(1).join(' ') || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const ssnDigits = ssn.replace(/\D/g, '');
  const phoneValid = phone.replace(/\D/g, '').length === 10;
  const valid = !!(firstName.trim() && lastName.trim() && address.trim() && ssnDigits.length === 9 && phoneValid);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    update({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      address: address.trim(),
      ssn: ssnDigits,
      usesEin,
      phone: phone.replace(/\D/g, ''),
      email: email.trim(),
    });
    router.push('/verify/decision');
  }

  return (
    <div className="min-h-screen bg-white">
      <RACHeader />
      <main className="container mx-auto px-4 pt-16">
        <div className="max-w-md mx-auto space-y-6">
          <Stepper title="Verification" steps={PRE_STEPS} current="details" />

          <div>
            <h1 className="text-heading font-bold text-rac-blue">Your details</h1>
            <p className="text-subheading text-rac-text-secondary">
              The Decision Engine needs these to make a decision.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-rac border border-rac-yellow/40 bg-yellow-50 p-4">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-rac-red" />
            <p className="text-sm text-rac-text-primary">
              <strong>Your SSN is required for underwriting and cannot be read from your ID.</strong> It isn’t
              stored on your license or in your wallet, so we ask for it directly.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
              <Input label="Last name" required value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
            </div>

            <Input label="Home address" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, City, State ZIP" autoComplete="street-address" />

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-body text-rac-text-primary">
                  {usesEin ? 'EIN (business)' : 'Social Security Number'} <span className="text-rac-red">*</span>
                </label>
                <button
                  type="button"
                  className="text-xs text-rac-blue hover:underline"
                  onClick={() => { setUsesEin(!usesEin); setSsn(''); }}
                >
                  {usesEin ? 'Use SSN instead' : 'No SSN? Use EIN'}
                </button>
              </div>
              <Input
                inputMode="numeric"
                showPasswordToggle
                value={ssn}
                onChange={(e) => setSsn(formatTaxId(e.target.value, usesEin))}
                placeholder={usesEin ? 'XX-XXXXXXX' : 'XXX-XX-XXXX'}
                autoComplete="off"
                className="tracking-widest"
              />
              <p className="mt-1 text-xs text-rac-text-secondary">Masked and encrypted. Required in every path.</p>
            </div>

            <Input label="Mobile phone" required inputMode="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(555) 123-4567" autoComplete="tel" />

            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com (optional)" autoComplete="email" />

            {touched && !valid && (
              <p className="text-xs text-rac-red">
                Please complete name, address, a 9-digit {usesEin ? 'EIN' : 'SSN'}, and a valid phone.
              </p>
            )}

            <Button type="submit" variant="primary" fullWidth disabled={!valid} className="h-14 text-base">
              Continue to decision
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
