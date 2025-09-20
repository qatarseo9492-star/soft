"use client";
export default function StarDisplay({ value, size=16 }: { value: number; size?: number }) {
  const full = Math.floor(value);
  const frac = value - full;
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`Rating ${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill =
          i < full ? 100 : i === full ? Math.round(frac * 100) : 0;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <linearGradient id={`g${i}`} x1="0" x2="1">
                <stop offset={`${fill}%`} stopColor="currentColor" />
                <stop offset={`${fill}%`} stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M12 17.3l-6.16 3.64 1.64-6.99-5.33-4.62 7.05-.6L12 2l2.8 6.73 7.05.6-5.33 4.62 1.64 6.99z"
              fill={`url(#g${i})`}
              stroke="currentColor"
              strokeWidth="1"
              className="text-yellow-500"
            />
          </svg>
        );
      })}
    </div>
  );
}
