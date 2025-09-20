"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // This shows up in pm2 logs
    // eslint-disable-next-line no-console
    console.error("ADMIN ROUTE ERROR:", error);
  }, [error]);

  return (
    <main className="container-max py-16">
      <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-sm text-neutral-500 mb-6">
        {error?.message || "Unknown error"} {error?.digest ? `(digest ${error.digest})` : null}
      </p>
      <button className="btn btn-primary" onClick={() => reset()}>
        Try again
      </button>
    </main>
  );
}
