'use client';

import { toast } from 'sonner';

type Options = Parameters<typeof toast>[1];

export const notify = {
  success: (message: string, opts?: Options) => toast.success(message, opts),
  error:   (message: string, opts?: Options) => toast.error(message, opts),
  info:    (message: string, opts?: Options) => toast.message(message, opts),
  // handy for async actions:
  promise: <T>(p: Promise<T>, msg: { loading: string; success: string; error: string }) =>
    toast.promise(p, msg),
};

export { toast };
