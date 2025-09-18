'use client';

import { useEffect, useState } from 'react';
import { AdminToolbar, GradientHeader } from '@/components/admin/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input'; // ✅ default import
import { Badge } from '@/components/ui/badge';
import { toastSuccess, toastError } from '@/lib/toast';

type MeOk = {
  ok: true;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
    avatarUrl?: string | null;
  };
};
type MeErr = { ok: false; error: string };
type MeResp = MeOk | MeErr;

export default function ProfilePage() {
  const [me, setMe] = useState<MeResp | null>(null);
  const [msg, setMsg] = useState<string | null>(null); // optional inline notice
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_SITE_URL + '/web-api/auth/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe({ ok: false, error: 'Failed to load user' }));
  }, []);

  async function onSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get('name') || ''),
      avatarUrl: String(fd.get('avatarUrl') || ''),
    };
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + '/web-api/account/update', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'Update failed');

      // optimistic refresh of name/avatar in UI
      setMe((prev) =>
        prev && prev.ok
          ? { ok: true, user: { ...prev.user, name: payload.name, avatarUrl: payload.avatarUrl } }
          : prev
      );

      setMsg('Profile updated'); // inline (optional)
      toastSuccess('Profile updated'); // ✅ toast
    } catch (err: any) {
      const m = err?.message || 'Update failed';
      setMsg(m);
      toastError(m); // ✅ toast
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      currentPassword: String(fd.get('currentPassword') || ''),
      newPassword: String(fd.get('newPassword') || ''),
    };
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + '/web-api/account/password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'Password change failed');

      (e.currentTarget as HTMLFormElement).reset();
      setMsg('Password changed');
      toastSuccess('Password changed'); // ✅ toast
    } catch (err: any) {
      const m = err?.message || 'Password change failed';
      setMsg(m);
      toastError(m); // ✅ toast
    } finally {
      setSaving(false);
    }
  }

  const u = me && me.ok ? me.user : undefined;

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <AdminToolbar homeHref="/" moreHref="/admin" />
      <GradientHeader title="Your Profile" subtitle="Manage your name, avatar and password." />

      {/* Inline status (toast also fires) */}
      {msg && (
        <div aria-live="polite">
          <Badge variant="secondary">{msg}</Badge>
        </div>
      )}

      <Card className="soft-card">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl overflow-hidden ring-1 ring-white/10 bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={u?.avatarUrl || '/avatar-placeholder.png'}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-sm text-white/70">
              Signed in as <span className="font-mono text-white/90">{u?.email ?? '—'}</span>
              <div className="mt-0.5">Role: {u?.role ?? 'USER'}</div>
            </div>
          </div>

          <form onSubmit={onSaveProfile} className="grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm text-white/70">Name</span>
              <Input name="name" defaultValue={u?.name ?? ''} placeholder="Your display name" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-white/70">Avatar URL</span>
              <Input name="avatarUrl" defaultValue={u?.avatarUrl ?? ''} placeholder="https://…" />
            </label>

            <div>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="soft-card">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onChangePassword} className="grid md:grid-cols-2 gap-3">
            <Input name="currentPassword" type="password" placeholder="Current password" />
            <Input name="newPassword" type="password" placeholder="New password" />
            <div className="md:col-span-2">
              <Button type="submit" variant="outline" disabled={saving}>
                {saving ? 'Updating…' : 'Update Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
