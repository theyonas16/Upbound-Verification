'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostStepLayout } from '@/components/PostStepLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useFlow } from '@/lib/flow';

interface Ref { name: string; phone: string; relationship: string }
const EMPTY: Ref = { name: '', phone: '', relationship: '' };

export default function ReferencesPage() {
  const router = useRouter();
  const { markComplete } = useFlow();
  const [refs, setRefs] = useState<Ref[]>([{ ...EMPTY }, { ...EMPTY }]);

  function setRef(i: number, key: keyof Ref, val: string) {
    setRefs((r) => r.map((ref, idx) => (idx === i ? { ...ref, [key]: val } : ref)));
  }

  const valid = refs.every((r) => r.name.trim() && r.phone.replace(/\D/g, '').length === 10);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    markComplete('references');
    router.push('/verify/success');
  }

  return (
    <PostStepLayout step="references">
      <div>
        <h1 className="text-heading font-bold text-rac-blue">Add two references</h1>
        <p className="text-subheading text-rac-text-secondary">
          Level 3 requires two personal references who aren&apos;t living with you.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        {refs.map((r, i) => (
          <div key={i} className="rounded-rac border border-rac-gray bg-rac-gray-light p-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-rac-text-secondary">
              Reference {i + 1}
            </div>
            <Input label="Full name" required value={r.name} onChange={(e) => setRef(i, 'name', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Phone" required inputMode="tel" value={r.phone} onChange={(e) => setRef(i, 'phone', e.target.value)} />
              <Input label="Relationship" value={r.relationship} onChange={(e) => setRef(i, 'relationship', e.target.value)} />
            </div>
          </div>
        ))}
        <Button type="submit" variant="primary" fullWidth disabled={!valid} className="h-14 text-base">
          Finish verification
        </Button>
      </form>
    </PostStepLayout>
  );
}
