'use client';

import { useRef, useState } from 'react';
import { RACHeader } from '@/components/RACHeader';
import { Button } from '@/components/Button';
import { Loader2, IdCard, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFlow } from '@/lib/flow';
import { readIdDocument } from '@/lib/ocr';
import { matchFaces } from '@/lib/faceMatch';

type Step = 'id' | 'selfie' | 'processing';

export default function DocumentVerifyPage() {
  const router = useRouter();
  const { update } = useFlow();
  const [step, setStep] = useState<Step>('id');
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const startTime = useRef(Date.now());

  const readFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  async function onIdSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdPhoto(await readFile(file));
    setStep('selfie');
  }

  async function onSelfieSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !idPhoto) return;
    setError(null);
    setStep('processing');
    try {
      const selfie = await readFile(file);
      setStatus('Reading your ID…');
      const ocr = await readIdDocument(idPhoto, (p) => setStatus(`Reading your ID… ${Math.round(p * 100)}%`));
      setStatus('Matching your face to your ID…');
      const match = await matchFaces(idPhoto, selfie);
      if (!match.matched && !match.simulated) {
        setError('Face did not match the ID. Please retake your selfie.');
        setStep('selfie');
        return;
      }
      const t = ((Date.now() - startTime.current) / 1000).toFixed(1);
      update({
        identityMethod: 'openkyc',
        identitySource: 'document',
        identityVerified: true,
        identityTime: t,
        ocrName: ocr.name,
        faceMatchScore: match.score,
        faceMatchSimulated: match.simulated,
      });
      router.push('/verify/details');
    } catch {
      setError('Could not process the document. Please try again.');
      setStep('id');
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <RACHeader />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-md mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-heading font-bold text-rac-blue mb-2">Scan your ID</h1>
            <p className="text-subheading text-rac-text-secondary">
              We&apos;ll read your ID and match it to a selfie. You&apos;ll add your SSN next.
            </p>
          </div>

          {step === 'id' && (
            <div className="space-y-4 rounded-rac border border-rac-gray bg-rac-gray-light p-6">
              <div className="flex items-center gap-3">
                <IdCard className="h-8 w-8 text-rac-blue" />
                <div>
                  <div className="font-semibold text-rac-blue">Photo of your ID</div>
                  <div className="text-xs text-rac-text-secondary">Front of your driver&apos;s license or state ID</div>
                </div>
              </div>
              <label className="block">
                <span className="sr-only">Take photo of ID</span>
                <input type="file" accept="image/*" capture="environment" onChange={onIdSelected} className="hidden" />
                <span className="flex h-12 w-full cursor-pointer items-center justify-center rounded-rac bg-rac-blue font-semibold text-rac-yellow">
                  Take photo of ID
                </span>
              </label>
            </div>
          )}

          {step === 'selfie' && (
            <div className="space-y-4 rounded-rac border border-rac-gray bg-rac-gray-light p-6">
              <div className="flex items-center gap-3">
                <UserRound className="h-8 w-8 text-rac-blue" />
                <div>
                  <div className="font-semibold text-rac-blue">Now a quick selfie</div>
                  <div className="text-xs text-rac-text-secondary">We&apos;ll match it to the photo on your ID</div>
                </div>
              </div>
              <label className="block">
                <span className="sr-only">Take selfie</span>
                <input type="file" accept="image/*" capture="user" onChange={onSelfieSelected} className="hidden" />
                <span className="flex h-12 w-full cursor-pointer items-center justify-center rounded-rac bg-rac-blue font-semibold text-rac-yellow">
                  Take selfie
                </span>
              </label>
              <Button variant="ghost" fullWidth onClick={() => setStep('id')} className="text-sm">
                Retake ID
              </Button>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <Loader2 className="h-16 w-16 animate-spin text-rac-blue" />
              <p className="text-subheading text-rac-text-secondary">{status || 'Processing…'}</p>
              <p className="text-xs text-rac-text-secondary">Running on-device OCR and face match.</p>
            </div>
          )}

          {error && <p className="text-center text-sm text-rac-red">{error}</p>}

          <div className="rounded-rac bg-rac-blue/5 border border-rac-blue/20 p-4">
            <p className="text-xs text-rac-text-secondary">
              <span className="font-semibold text-rac-blue">[Real OCR + face match]</span> Text is read with
              Tesseract.js and the selfie is matched with face-api.js, both on-device. Your SSN is never read from
              the ID.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
