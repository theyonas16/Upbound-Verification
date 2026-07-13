import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth = false, disabled, children, ...props }, ref) => {
    const baseStyles = "h-12 px-6 rounded-rac font-semibold text-body transition-colors duration-200";
    
    const variants = {
      primary: disabled
        ? "bg-rac-gray text-white cursor-not-allowed"
        : "bg-rac-blue text-rac-yellow hover:bg-rac-blue-dark active:bg-rac-blue-dark",
      secondary: disabled
        ? "bg-white text-rac-gray border border-rac-gray cursor-not-allowed"
        : "bg-white text-rac-blue border-2 border-rac-blue hover:bg-gray-50 active:bg-gray-100",
      ghost: "text-rac-blue hover:underline bg-transparent border-none p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variants[variant],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
