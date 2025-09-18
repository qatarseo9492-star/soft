'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';

type Props = React.HTMLAttributes<HTMLButtonElement> & {
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (v: boolean) => void;
};

export default function Switch({ checked, disabled, onCheckedChange, className, ...props }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      aria-disabled={!!disabled}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors',
        checked ? 'bg-brand-600' : 'bg-white/10',
        disabled ? 'cursor-not-allowed ring-0' : 'hover:bg-white/15',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}
