'use client';

import { useState } from 'react';
import { RACHeader } from '@/components/RACHeader';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Lock } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Proceed to identity verification
    window.location.href = '/verify';
  };

  const isFormValid = email && password;

  return (
    <div className="min-h-screen bg-white">
      <RACHeader />
      
      <main className="container mx-auto px-4 pt-16">
        <div className="max-w-md mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-heading font-bold text-rac-blue mb-2">
              My Account
            </h1>
            <p className="text-subheading text-rac-text-secondary">
              Sign in or Create an Account
            </p>
          </div>

          {/* Required & Secure Form Indicators */}
          <div className="flex items-center justify-between mb-6 text-xs">
            <span className="text-rac-text-secondary">
              <span className="text-rac-red">*</span> Required
            </span>
            <span className="flex items-center gap-1 text-rac-text-secondary">
              <Lock className="w-3 h-3 text-rac-yellow" />
              Secure Form
            </span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              error={errors.email}
              placeholder=""
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              error={errors.password}
              showPasswordToggle
              placeholder=""
            />

            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={!isFormValid}
              >
                Sign In
              </Button>

              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => window.location.href = '/create-account'}
              >
                Create My Account
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/forgot-password"
                  className="text-body text-rac-blue hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
