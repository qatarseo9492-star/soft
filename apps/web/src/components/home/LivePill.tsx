"use client";
import { useEffect, useState } from "react";

export default function LivePill() {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const src = new EventSource(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/events-proxy`);
    src.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.type === "download") {
          setPulse(true);
          setTimeout(() => setPulse(false), 1200);
        }
      } catch {}
    };
    src.onerror = () => { /* ignore */ };
    return () => src.close();
  }, []);

  return (
    <span className={`text-xs px-3 py-1 rounded-full border ${pulse ? "bg-green-100 border-green-300" : "bg-gray-50 border-gray-300"}`}>
      Live downloads
    </span>
  );
}
