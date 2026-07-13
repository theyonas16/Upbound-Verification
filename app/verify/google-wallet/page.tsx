'use client';

import { useState, useEffect } from 'react';
import { RACHeader } from '@/components/RACHeader';
import { Button } from '@/components/Button';
import { Smartphone, Shield, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFlow } from '@/lib/flow';
import { verifyWithDeviceFaceId, platformAuthAvailable } from '@/lib/webauthn';

type Step = 'prompt' | 'authenticating' | 'complete';

export default function GoogleWalletVerifyPage() {
  const router = useRouter();
  const { update } = useFlow();
  const [step, setStep] = useState<Step>('prompt');
  const [startTime] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (step === 'complete') {
      const t = ((Date.now() - startTime) / 1000).toFixed(1);
      update({
        identityMethod: 'device',
        identitySource: 'google_wallet',
        identityVerified: true,
        identityTime: t,
      });
      setTimeout(() => router.push('/verify/details'), 1200);
    }
  }, [step, router, startTime, update]);

  const handleVerify = async () => {
    setError(null);
    setStep('authenticating');
    try {
      await verifyWithDeviceFaceId();
      setStep('complete');
    } catch (e) {
      if (!platformAuthAvailable()) {
        await new Promise((r) => setTimeout(r, 1200));
        setStep('complete');
      } else {
        setError((e as Error).message || 'Biometric failed. Try a different method.');
        setStep('prompt');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <RACHeader />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-md mx-auto">
          {step === 'prompt' && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-heading font-bold text-rac-blue mb-2">Verify with Google Wallet</h1>
                <p className="text-subheading text-rac-text-secondary">
                  Use your ID in Google Wallet, then add your SSN — it isn’t stored in your wallet.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-900 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="text-xs opacity-70 mb-1">State ID</div>
                    <div className="text-sm font-semibold">Texas</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                    <Smartphone className="w-8 h-8" />
                  </div>
                </div>
                <div className="text-xs opacity-70">Ready to verify</div>
                <div className="font-semibold">Tap to continue</div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-rac-blue/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-rac-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rac-blue">Verify in seconds</h3>
                    <p className="text-sm text-rac-text-secondary">
                      Biometrics confirm your identity — no document upload. You&apos;ll still enter your SSN next.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-rac-blue/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-rac-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rac-blue">Secure &amp; Private</h3>
                    <p className="text-sm text-rac-text-secondary">
                      Your ID stays in your Wallet. We only receive verified information.
                    </p>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-rac-red text-center">{error}</p>}

              <div className="space-y-3">
                <Button variant="primary" fullWidth onClick={handleVerify} className="h-14 text-base">
                  Continue with Google Wallet
                </Button>
                <Button variant="ghost" fullWidth onClick={() => router.push('/verify/document')} className="text-sm">
                  Use a different method
                </Button>
              </div>
            </div>
          )}

          {step === 'authenticating' && (
            <div className="space-y-8 text-center py-12">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-4 border-rac-blue animate-ping opacity-20" />
                  </div>
                  <div className="relative w-20 h-20 bg-rac-blue rounded-full flex items-center justify-center">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-rac-blue">Authenticating…</h2>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-8 text-center py-12">
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-rac-blue">Identity confirmed</h2>
                  <p className="text-sm text-rac-text-secondary">Next: enter your SSN for underwriting…</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
