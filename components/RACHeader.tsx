'use client';

import { RACLogo } from './RACLogo';
import { Globe } from 'lucide-react';

export function RACHeader() {
  return (
    <header className="bg-rac-blue text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button className="text-sm hover:underline">
            Contact Us
          </button>
          
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-8">
            <RACLogo className="w-20 h-20" />
          </div>
          
          <button className="flex items-center gap-2 text-sm hover:underline">
            <Globe className="w-4 h-4" />
            Español
          </button>
        </div>
      </div>
    </header>
  );
}
