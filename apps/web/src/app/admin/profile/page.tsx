// src/app/admin/profile/page.tsx
"use client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await fetch("/web-api/admin/profile");
      const j = await r.json();
      if (r.ok && j.ok) setUser(j.user);
      else setErr(j?.error || "Failed to load");
    })();
  }, []);

  async function updateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(null); setOk(false);
    const fd = new FormData(e.currentTarget);
    const payload = { name: fd.get("name"), email: fd.get("email"), avatarUrl: user?.avatarUrl || null };
    const r = await fetch("/web-api/admin/profile", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const j = await r.json();
    if (r.ok && j.ok) { setUser(j.user); setOk(true); }
    else setErr(j?.error || "Update failed");
  }

  async function changePass(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(null); setOk(false);
    const fd = new FormData(e.currentTarget);
    const payload = { current: fd.get("current"), next: fd.get("next") };
    const r = await fetch("/web-api/admin/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const j = await r.json();
    if (r.ok && j.ok) setOk(true); else setErr(j?.error || "Password change failed");
  }

  async function uploadAvatar(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "avatars");
    fd.append("webp", "1");
    const r = await fetch("/web-api/admin/upload", { method: "POST", body: fd });
    const j = await r.json();
    if (r.ok && j.ok) setUser((u: any) => ({ ...u, avatarUrl: j.url }));
  }

  if (!user && !err) return <div>Loading…</div>;
  if (err) return <div className="text-red-600">{err}</div>;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <form onSubmit={updateProfile} className="rounded-2xl border p-4">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="mb-4 flex items-center gap-4">
          <img src={user?.avatarUrl || "/avatar.svg"} alt="" className="h-16 w-16 rounded-full border" />
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
        </div>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input disabled defaultValue={user?.username} className="w-full rounded-md border px-3 py-2 bg-muted/40" />
          </div>
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input name="name" defaultValue={user?.name ?? ""} className="w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input name="email" defaultValue={user?.email ?? ""} className="w-full rounded-md border px-3 py-2" />
          </div>
        </div>
        <div className="mt-4">{ok && <div className="text-green-600 text-sm">Saved</div>}</div>
        <button className="btn btn-primary rounded-xl mt-3">Save</button>
      </form>

      <form onSubmit={changePass} className="rounded-2xl border p-4">
        <h2 className="text-lg font-semibold mb-4">Change password</h2>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm mb-1">Current password</label>
            <input type="password" name="current" className="w-full rounded-md border px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">New password</label>
            <input type="password" name="next" className="w-full rounded-md border px-3 py-2" required />
          </div>
        </div>
        <div className="mt-4">{ok && <div className="text-green-600 text-sm">Password updated</div>}</div>
        <button className="rounded-xl border px-4 py-2">Update</button>
      </form>
    </div>
  );
}
