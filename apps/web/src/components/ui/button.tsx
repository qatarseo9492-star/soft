'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium transition-colors ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
    'disabled:cursor-not-allowed select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-600 hover:bg-brand-500 text-white shadow-brand focus-visible:ring-brand-500',
        outline:
          'border border-white/15 bg-transparent hover:bg-white/5 text-white focus-visible:ring-brand-400',
        ghost:
          'bg-transparent hover:bg-white/5 text-white/90 focus-visible:ring-brand-400',
        success:
          'bg-emerald-600 hover:bg-emerald-500 text-white focus-visible:ring-emerald-400',
        danger:
          'bg-red-600/90 hover:bg-red-600 text-white focus-visible:ring-red-400',

        // extra variants used across pages
        secondary:
          'bg-white/10 hover:bg-white/15 text-white focus-visible:ring-indigo-400',
        destructive:
          'bg-red-600 hover:bg-red-500 text-white focus-visible:ring-red-400',

        // alias for legacy usages
        default:
          'bg-brand-600 hover:bg-brand-500 text-white shadow-brand focus-visible:ring-brand-500'
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-5 text-base',
        icon: 'h-9 w-9 p-0'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? (Slot as any) : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export default Button;
