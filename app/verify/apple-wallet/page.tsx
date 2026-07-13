'use client';

import { useState, useEffect } from 'react';
import { RACHeader } from '@/components/RACHeader';
import { Button } from '@/components/Button';
import { Smartphone, Shield, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Step = 'prompt' | 'authenticating' | 'complete';

export default function AppleWalletVerifyPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('prompt');
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (step === 'complete') {
      const verificationTime = ((Date.now() - startTime) / 1000).toFixed(1);
      setTimeout(() => {
        router.push(`/verify/success?method=apple_wallet&time=${verificationTime}`);
      }, 1500);
    }
  }, [step, router, startTime]);

  const handleVerify = async () => {
    setStep('authenticating');
    
    // Simulate Face ID authentication
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStep('complete');
  };

  return (
    <div className="min-h-screen bg-white">
      <RACHeader />
      
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-md mx-auto">
          {step === 'prompt' && (
            <div className="space-y-8">
              {/* Title */}
              <div className="text-center">
                <h1 className="text-heading font-bold text-rac-blue mb-2">
                  Verify with Apple Wallet
                </h1>
                <p className="text-subheading text-rac-text-secondary">
                  Use your ID stored in Apple Wallet for instant verification
                </p>
              </div>

              {/* Apple Wallet Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="text-xs opacity-70 mb-1">Driver's License</div>
                    <div className="text-sm font-semibold">Texas</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <Smartphone className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-xs opacity-70">Ready to verify</div>
                      <div className="font-semibold">Tap to continue</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-rac-blue/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-rac-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rac-blue">Instant Verification</h3>
                    <p className="text-sm text-rac-text-secondary">
                      Complete verification in seconds, no document upload needed
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-rac-blue/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-rac-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-rac-blue">Secure & Private</h3>
                    <p className="text-sm text-rac-text-secondary">
                      Your ID stays in your Wallet. We only receive verified information
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleVerify}
                  className="h-14 text-base"
                >
                  Continue with Apple Wallet
                </Button>

                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => router.push('/verify/document')}
                  className="text-sm"
                >
                  Use a different method
                </Button>
              </div>

              {/* Info */}
              <p className="text-xs text-center text-rac-text-secondary">
                You'll be asked to authenticate with Face ID or Touch ID
              </p>
            </div>
          )}

          {step === 'authenticating' && (
            <div className="space-y-8 text-center">
              {/* Face ID Animation */}
              <div className="flex flex-col items-center gap-6 py-12">
                <div className="relative">
                  {/* Scanning animation rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-4 border-rac-blue animate-ping opacity-20"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-4 border-rac-blue animate-pulse opacity-40"></div>
                  </div>
                  
                  {/* Face icon */}
                  <div className="relative w-20 h-20 bg-rac-blue rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-rac-blue">
                    Authenticating with Face ID
                  </h2>
                  <p className="text-sm text-rac-text-secondary">
                    Look at your device to verify
                  </p>
                </div>
              </div>

              <div className="bg-rac-gray-light rounded-rac p-4">
                <p className="text-xs text-rac-text-secondary">
                  <span className="font-semibold text-rac-blue">[PoC Demo]</span> In production, this would trigger the actual Face ID/Touch ID system prompt
                </p>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-8 text-center">
              <div className="flex flex-col items-center gap-6 py-12">
                {/* Success checkmark */}
                <div className="relative">
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {/* Success ring animation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-4 border-green-500 animate-ping opacity-30"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-rac-blue">
                    Authentication Complete
                  </h2>
                  <p className="text-sm text-rac-text-secondary">
                    Retrieving verified information...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
