// src/app/(site)/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
      <p className="opacity-80 mb-6">
        {(error?.message || "Unexpected server error") +
          (error?.digest ? ` (digest ${error.digest})` : "")}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-lg border hover:bg-accent/20"
      >
        Try again
      </button>
    </div>
  );
}
