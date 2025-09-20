// src/app/admin/login/page.tsx
"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/web-api/admin/auth/login", { method: "POST", body: form });
    if (res.ok) {
      const next = new URLSearchParams(location.search).get("next") || "/admin";
      location.href = next;
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j?.error || "Login failed");
    }
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="text-2xl font-semibold mb-6">Admin Login</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border p-4">
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input name="username" className="w-full rounded-md border px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" name="password" className="w-full rounded-md border px-3 py-2" required />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button className="btn btn-primary rounded-xl">Sign in</button>
      </form>
    </div>
  );
}
