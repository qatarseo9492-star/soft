export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import './styles/globals.css'
import db from './web-api/_lib/db';
import { Toaster } from 'sonner';

// build “other” safely (no undefined values)
function otherMeta(map: Record<string, string | undefined>) {
  const other: Record<string, string> = {};
  if (map['site.verification.bing']) {
    other['msvalidate.01'] = map['site.verification.bing']!;
  }
  if (map['site.verification.cloudflare']) {
    other['cf-site-verification'] = map['site.verification.cloudflare']!;
  }
  if (map['site.verification.other']) {
    other['site-verification-extra'] = map['site.verification.other']!;
  }
  return other;
}

export async function generateMetadata() {
  const keys = [
    'site.verification.google',
    'site.verification.bing',
    'site.verification.yandex',
    'site.verification.cloudflare',
    'site.verification.other'
  ];
  const rows = await db.setting.findMany({ where: { key: { in: keys } } });
  const map = Object.fromEntries(rows.map(r => [r.key, r.value ?? ''])) as Record<string, string>;

  return {
    verification: {
      google: map['site.verification.google'] || undefined,
      yandex: map['site.verification.yandex'] || undefined,
      yahoo: undefined,
      other: undefined,
      me: undefined
    },
    other: otherMeta({
      'site.verification.bing': map['site.verification.bing'],
      'site.verification.cloudflare': map['site.verification.cloudflare'],
      'site.verification.other': map['site.verification.other']
    })
  } as const;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* global toaster at top-center */}
        <Toaster position="top-center" richColors theme="dark" />
        {children}
      </body>
    </html>
  );
}
