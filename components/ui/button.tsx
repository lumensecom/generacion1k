import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-display font-bold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purpleLight/50',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-yellow text-black shadow-[0_10px_30px_rgba(245,158,11,0.18)] hover:bg-brand-yellowHover hover:-translate-y-0.5 hover:shadow-[0_0_34px_rgba(245,158,11,0.4)]',
        ghost:
          'border border-brand-purple/45 text-white hover:border-brand-purpleLight hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]',
        subtle: 'bg-white/5 text-white border border-border hover:border-brand-purple/50',
        danger: 'bg-brand-danger/15 text-brand-danger border border-brand-danger/40 hover:bg-brand-danger/25',
        link: 'text-brand-purpleLight underline-offset-4 hover:underline p-0 h-auto font-medium',
      },
      size: {
        default: 'h-12 px-6 text-sm',
        sm: 'h-10 px-4 text-xs',
        lg: 'h-14 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
