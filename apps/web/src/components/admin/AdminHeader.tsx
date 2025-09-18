// apps/web/src/components/admin/AdminHeader.tsx
'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function AdminHeader({
  title,
  subtitle,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('relative overflow-hidden rounded-2xl border p-6', className)}>
      {/* background glow wrapper (static div holds classes) */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 1.2 }}
          style={{
            width: '100%',
            height: '100%',
            background:
              'radial-gradient(600px circle at 20% 10%, rgba(92, 225, 230, .25), transparent 40%), radial-gradient(600px circle at 80% 20%, rgba(99, 102, 241, .25), transparent 40%)',
          }}
        />
      </div>

      <div className="flex items-start gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {right ? <div className="ml-auto">{right}</div> : null}
      </div>
    </div>
  );
}
