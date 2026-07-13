'use client';

import { RACHeader } from '@/components/RACHeader';
import { Button } from '@/components/Button';
import { CheckCircle2 } from 'lucide-react';

export default function ApplicationPage() {
  return (
    <div className="min-h-screen bg-white">
      <RACHeader />
      
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-rac-blue" />
          </div>

          <div>
            <h1 className="text-heading font-bold text-rac-blue mb-4">
              Ready to Complete Your Application
            </h1>
            <p className="text-subheading text-rac-text-secondary">
              Your identity has been verified and your information is ready to use
            </p>
          </div>

          <div className="bg-rac-gray-light rounded-lg p-6 text-left">
            <h2 className="font-semibold text-rac-blue mb-4">What happens next:</h2>
            <ul className="space-y-3 text-sm text-rac-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-rac-blue">1.</span>
                <span>Your verified information will pre-fill the application form</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rac-blue">2.</span>
                <span>Decision Engine will process your application with fraud checks (TruValidate + SentiLink)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rac-blue">3.</span>
                <span>You'll receive an instant decision or next steps</span>
              </li>
            </ul>
          </div>

          <div className="bg-rac-blue/5 border border-rac-blue/20 rounded-lg p-4">
            <p className="text-xs text-rac-text-secondary">
              <span className="font-semibold text-rac-blue">[PoC Demo Endpoint]</span> This is where the actual RAC/Acima application flow would begin. The verified claims from the identity verification step would be passed to the Decision Engine for underwriting.
            </p>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={() => window.location.href = '/'}
            className="h-14 text-base"
          >
            Back to Login (Restart Demo)
          </Button>
        </div>
      </main>
    </div>
  );
}
