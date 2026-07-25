import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-12 w-full rounded-xl border border-border bg-bg-card px-4 text-sm text-white placeholder:text-text-muted transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-brand-purpleLight/40 focus:border-brand-purple/60',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };
