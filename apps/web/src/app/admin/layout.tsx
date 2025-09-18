export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import '../globals.css'
import { Toaster } from 'react-hot-toast'
import type { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Toaster position="top-right" toastOptions={{ style: { background: '#12121b', color: '#fff' } }} />
      <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
    </div>
  )
}
