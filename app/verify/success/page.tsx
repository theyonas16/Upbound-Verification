'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { RACHeader } from '@/components/RACHeader';
import { Button } from '@/components/Button';
import { CheckCircle2, Clock, Shield, User, MapPin, Calendar } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const method = searchParams.get('method') || 'device_attestation';
  const verificationTime = searchParams.get('time') || '2.5';
  
  const [showClaims, setShowClaims] = useState(false);

  useEffect(() => {
    // Animate claims appearing
    setTimeout(() => setShowClaims(true), 500);
  }, []);

  // Mock verified claims (in production, these come from Apple/Google Wallet)
  const verifiedClaims = {
    given_name: 'John',
    family_name: 'Doe',
    birthdate: '1985-03-15',
    address: {
      street_address: '123 Main St',
      locality: 'Dallas',
      region: 'TX',
      postal_code: '75201'
    },
    document: {
      type: 'drivers_license',
      issuer: 'TX',
      number: 'DL12345678',
      expiry: '2028-03-15'
    }
  };

  const methodLabel = method === 'apple_wallet' ? 'Apple Wallet' :
                      method === 'google_wallet' ? 'Google Wallet' :
                      'Device Attestation';

  return (
    <div className="min-h-screen bg-white">
      <RACHeader />
      
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center space-y-6 mb-12">
            <div className="flex justify-center">
              <div className="relative">
                <CheckCircle2 className="w-24 h-24 text-green-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-4 border-green-500 animate-ping opacity-20"></div>
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-heading font-bold text-rac-blue mb-2">
                Identity Verified Successfully
              </h1>
              <p className="text-subheading text-rac-text-secondary">
                Your application is ready to proceed
              </p>
            </div>

            {/* Verification Stats */}
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2 text-rac-text-secondary">
                <Clock className="w-4 h-4 text-rac-blue" />
                <span>
                  Verified in <strong className="text-rac-blue">{verificationTime}s</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-rac-text-secondary">
                <Shield className="w-4 h-4 text-rac-blue" />
                <span>
                  Via <strong className="text-rac-blue">{methodLabel}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Verified Claims */}
          {showClaims && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-rac-gray-light rounded-lg p-6 space-y-4">
                <h2 className="font-semibold text-rac-blue flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Verified Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Info */}
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-rac-text-secondary mb-1">Full Name</div>
                      <div className="font-semibold text-rac-text-primary">
                        {verifiedClaims.given_name} {verifiedClaims.family_name}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-rac-text-secondary mb-1">Date of Birth</div>
                      <div className="font-semibold text-rac-text-primary flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-rac-blue" />
                        {new Date(verifiedClaims.birthdate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-rac-text-secondary mb-1">Address</div>
                      <div className="font-semibold text-rac-text-primary flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-rac-blue mt-0.5 flex-shrink-0" />
                        <div>
                          <div>{verifiedClaims.address.street_address}</div>
                          <div>
                            {verifiedClaims.address.locality}, {verifiedClaims.address.region} {verifiedClaims.address.postal_code}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Info */}
                <div className="pt-4 border-t border-rac-gray">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-rac-text-secondary mb-1">Document Type</div>
                      <div className="font-semibold text-rac-text-primary">Driver's License</div>
                    </div>
                    <div>
                      <div className="text-xs text-rac-text-secondary mb-1">Issued By</div>
                      <div className="font-semibold text-rac-text-primary">Texas DMV</div>
                    </div>
                    <div>
                      <div className="text-xs text-rac-text-secondary mb-1">Expires</div>
                      <div className="font-semibold text-rac-text-primary">
                        {new Date(verifiedClaims.document.expiry).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fraud Signals (Mock) */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-sm">
                    <h3 className="font-semibold text-green-900">Security Checks Passed</h3>
                    <ul className="space-y-1 text-green-700">
                      <li>✓ Device trust score: 98/100</li>
                      <li>✓ Document authenticity: Verified</li>
                      <li>✓ Biometric confidence: High</li>
                      <li>✓ Fraud risk: Low</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* PoC Note */}
              <div className="bg-rac-blue/5 border border-rac-blue/20 rounded-lg p-4">
                <p className="text-xs text-rac-text-secondary">
                  <span className="font-semibold text-rac-blue">[PoC Demo]</span> In production, these verified claims come from Apple/Google Wallet via cryptographically signed tokens (OIDC4IDA format). The fraud signals integrate with TruValidate + SentiLink for risk scoring.
                </p>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="mt-12 space-y-4">
            <Button
              variant="primary"
              fullWidth
              onClick={() => window.location.href = '/application'}
              className="h-14 text-base"
            >
              Continue to Application
            </Button>

            <div className="text-center">
              <p className="text-xs text-rac-text-secondary">
                Your verified information has been securely stored and will be used to pre-fill your application
              </p>
            </div>
          </div>

          {/* Cost Savings Indicator */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-semibold text-yellow-900">Verification Cost:</span>
                <span className="text-yellow-700 ml-2">
                  {method === 'apple_wallet' || method === 'google_wallet' ? '$0.00' : '$0.05'}
                </span>
              </div>
              <div className="text-xs text-yellow-700">
                vs. $1.00+ with traditional vendors
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
