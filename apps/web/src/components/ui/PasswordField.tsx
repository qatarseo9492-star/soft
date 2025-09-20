// apps/web/src/components/ui/PasswordField.tsx
"use client";
import { useState } from "react";

export default function PasswordField({
  password,
  label = "Password",
  compact = false,
}: { password: string | null; label?: string; compact?: boolean }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!password) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">{label}:</span>
        <span className="text-gray-400">—</span>
      </div>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  const pill = (
    <span className="px-2 py-1 rounded bg-gray-100 text-sm tracking-wider select-all">
      {show ? password : "••••••••"}
    </span>
  );

  return (
    <div className={compact ? "flex items-center gap-2" : "flex flex-wrap items-center gap-2"}>
      <span className="font-medium text-sm">{label}:</span>
      {pill}
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
      >
        {show ? "Hide" : "Show"}
      </button>
      <button
        type="button"
        onClick={copy}
        className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
        aria-label="Copy password"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
