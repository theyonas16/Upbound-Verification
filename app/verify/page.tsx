'use client';

import { useEffect, useState } from 'react';
import { RACHeader } from '@/components/RACHeader';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeviceCapabilities {
  hasAppleWallet: boolean;
  hasGoogleWallet: boolean;
  platform: 'ios' | 'android' | 'web';
  canUseDeviceAttestation: boolean;
}

export default function VerifyPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);

  useEffect(() => {
    // Simulate device detection
    const detectDevice = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Realistic loading time

      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      
      // Check for iOS 15.1+ (Apple Wallet API availability)
      const iosVersion = isIOS 
        ? parseFloat(userAgent.match(/OS (\d+)_/)?.[1] || '0')
        : 0;
      
      const detected: DeviceCapabilities = {
        hasAppleWallet: isIOS && iosVersion >= 15,
        hasGoogleWallet: isAndroid,
        platform: isIOS ? 'ios' : isAndroid ? 'android' : 'web',
        canUseDeviceAttestation: (isIOS && iosVersion >= 15) || isAndroid
      };

      setCapabilities(detected);
      setChecking(false);

      // Route based on capabilities
      await new Promise(resolve => setTimeout(resolve, 800)); // Show result briefly

      if (detected.hasAppleWallet) {
        router.push('/verify/apple-wallet');
      } else if (detected.hasGoogleWallet) {
        router.push('/verify/google-wallet');
      } else {
        router.push('/verify/document');
      }
    };

    detectDevice();
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      <RACHeader />
      
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-md mx-auto">
          <div className="text-center space-y-8">
            {/* Title */}
            <div>
              <h1 className="text-heading font-bold text-rac-blue mb-2">
                Verify Your Identity
              </h1>
              <p className="text-subheading text-rac-text-secondary">
                {checking 
                  ? "Checking your device capabilities..."
                  : capabilities?.canUseDeviceAttestation
                    ? "Device credential detected!"
                    : "Preparing document verification..."
                }
              </p>
            </div>

            {/* Loading Spinner */}
            <div className="flex flex-col items-center gap-4 py-12">
              <Loader2 className="w-16 h-16 text-rac-blue animate-spin" />
              
              {!checking && capabilities && (
                <div className="space-y-2 text-sm text-rac-text-secondary">
                  {capabilities.canUseDeviceAttestation ? (
                    <>
                      <p className="text-rac-blue font-semibold">
                        ✓ {capabilities.platform === 'ios' ? 'Apple' : 'Google'} Wallet detected
                      </p>
                      <p>Redirecting to secure verification...</p>
                    </>
                  ) : (
                    <>
                      <p>No device credential found</p>
                      <p>Preparing alternative verification...</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-rac-gray-light rounded-rac p-6 text-left space-y-3">
              <h3 className="font-semibold text-rac-blue">What we're checking:</h3>
              <ul className="space-y-2 text-sm text-rac-text-secondary">
                <li className="flex items-start gap-2">
                  <span className={capabilities?.hasAppleWallet ? "text-green-600" : "text-rac-gray"}>
                    {capabilities?.hasAppleWallet ? "✓" : "○"}
                  </span>
                  <span>Apple Wallet (iOS 15.1+)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={capabilities?.hasGoogleWallet ? "text-green-600" : "text-rac-gray"}>
                    {capabilities?.hasGoogleWallet ? "✓" : "○"}
                  </span>
                  <span>Google Wallet (Android 11+)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={!capabilities?.canUseDeviceAttestation && !checking ? "text-green-600" : "text-rac-gray"}>
                    {!capabilities?.canUseDeviceAttestation && !checking ? "✓" : "○"}
                  </span>
                  <span>Alternative verification methods</span>
                </li>
              </ul>
            </div>

            {/* Privacy Note */}
            <p className="text-xs text-rac-text-secondary">
              Your information is encrypted and secure. We only verify what's necessary for your application.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
