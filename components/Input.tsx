import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, required, type, showPasswordToggle = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-body text-rac-text-primary">
            {label} {required && <span className="text-rac-red">*</span>}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={cn(
              "w-full h-rac-input px-4 rounded-rac border border-rac-gray",
              "text-body text-rac-text-primary placeholder:text-rac-gray-dark",
              "focus:outline-none focus:border-rac-blue focus:ring-2 focus:ring-rac-blue/20",
              "disabled:bg-rac-gray-light disabled:cursor-not-allowed",
              error && "border-rac-red focus:border-rac-red focus:ring-rac-red/20",
              showPasswordToggle && "pr-12",
              className
            )}
            {...props}
          />
          
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-rac-blue hover:text-rac-blue-dark"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        
        {error && (
          <p className="text-xs text-rac-red flex items-center gap-1">
            <span className="text-rac-red">⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
