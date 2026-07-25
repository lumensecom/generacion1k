import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-widest',
  {
    variants: {
      variant: {
        purple: 'bg-brand-purple/12 text-brand-purpleLight border border-brand-purple/30',
        yellow: 'bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/35',
        green: 'bg-brand-success/12 text-brand-success border border-brand-success/30',
        red: 'bg-brand-danger/12 text-brand-danger border border-brand-danger/30',
        gray: 'bg-white/5 text-text-muted border border-border',
      },
    },
    defaultVariants: { variant: 'purple' },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
