'use client';

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Textarea from "@/components/ui/textarea"; // ✅ default import
import Input from "@/components/ui/input";       // ✅ default import
import { Crown } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";

type Comment = {
  id: string;
  name: string;
  email?: string | null;
  message: string;
  createdAt: string;
  role?: "ADMIN" | "USER";
};

export default function Comments({
  softwareId,
  endpoint = `${process.env.NEXT_PUBLIC_SITE_URL}/web-api/comments`,
}: {
  softwareId: string;
  endpoint?: string;
}) {
  const [items, setItems] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const res = await fetch(
        `${endpoint}?softwareId=${encodeURIComponent(softwareId)}`,
        { cache: "no-store" }
      );
      const json = await res.json().catch(() => ({}));
      setItems(Array.isArray(json.items) ? json.items : []);
    } catch {
      // non-blocking; just leave empty list
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [softwareId]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData(e.currentTarget);
      const body = {
        softwareId,
        name: String(fd.get("name") || "User").trim(),
        email: String(fd.get("email") || "").trim(),
        message: String(fd.get("message") || "").trim(),
      };

      if (!body.message) {
        toastError("Please write a comment before posting.");
        return;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok || j?.ok === false) {
        throw new Error(j?.error || "Failed to post comment");
      }

      (e.currentTarget as HTMLFormElement).reset();
      await load();
      toastSuccess("Comment posted!");
    } catch (err: any) {
      toastError(err?.message || "Failed to post comment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold">Comments</h3>

      <form onSubmit={submit} className="grid gap-3 lg:grid-cols-2">
        <Input name="name" placeholder="Name *" required />
        <Input type="email" name="email" placeholder="Email (never shared)" />
        <Textarea
          name="message"
          placeholder="Write your comment here…"
          className="lg:col-span-2"
          required
        />
        <div>
          <Button disabled={loading}>{loading ? "Posting…" : "Post Comment"}</Button>
        </div>
      </form>

      <div className="space-y-4">
        {items.map((c) => (
          <div
            key={c.id}
            className="flex gap-3 rounded-xl border bg-card p-3 shadow-sm"
          >
            <Avatar className="size-10">
              <AvatarImage
                src={
                  c.role === "ADMIN"
                    ? "https://api.dicebear.com/9.x/identicon/svg?seed=king"
                    : `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(
                        c.name
                      )}`
                }
                alt={c.name}
              />
              <AvatarFallback>{c.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="font-medium">{c.name}</div>
                {c.role === "ADMIN" && (
                  <span className="inline-flex items-center gap-1 text-xs rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5">
                    <Crown className="size-3" /> Admin
                  </span>
                )}
                <div className="ml-auto text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-1 text-sm">{c.message}</div>
            </div>
          </div>
        ))}
        {!items.length && (
          <div className="text-sm text-muted-foreground">No comments yet.</div>
        )}
      </div>
    </section>
  );
}
