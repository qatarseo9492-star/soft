// apps/web/src/lib/toast.ts
import { toast } from 'sonner';

export const toastSuccess = (msg: string) => toast.success(msg);
export const toastError   = (msg: string) => toast.error(msg);
export const toastInfo    = (msg: string) => toast.message(msg);

/**
 * Wrap a promise with loading/success/error toasts.
 * sonner's toast.promise takes (promise, messages) – no 3rd arg.
 * Position & global options are set on <Toaster /> in layout.
 */
export const withToast = <T,>(
  p: Promise<T>,
  messages: { loading: string; success: string; error: string }
) => toast.promise(p, messages);
