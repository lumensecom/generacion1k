import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[110px] w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-sm text-white placeholder:text-text-muted transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-brand-purpleLight/40 focus:border-brand-purple/60',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export { Textarea };
