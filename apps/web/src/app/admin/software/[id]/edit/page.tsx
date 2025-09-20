"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import SoftwareForm from "@/components/admin/forms/SoftwareForm";

export default function EditSoftwarePage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiGet<{ ok: boolean; item: any }>(`/admin/software/${params.id}`)
      .then((d) => setInitial(d.item))
      .catch((e) => setErr(e?.message || "Load failed"))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div>Loading…</div>;
  if (err) return <div className="text-red-400">{err}</div>;
  if (!initial) return <div>Not found</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Edit: {initial?.name}</h1>
      <SoftwareForm initial={initial} onSaved={() => alert("Saved")} />
    </div>
  );
}
