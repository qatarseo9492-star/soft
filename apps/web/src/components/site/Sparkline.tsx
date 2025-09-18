"use client";

type Props = {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
  fill?: boolean;
};

export default function Sparkline({
  data,
  width = 180,
  height = 44,
  strokeWidth = 2,
  className = "",
  fill = true,
}: Props) {
  if (!data?.length) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const padY = 2;
  const padX = 2;
  const w = width - padX * 2;
  const h = height - padY * 2;
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = padX + (i * w) / (data.length - 1 || 1);
    const y = padY + h - ((v - min) / range) * h;
    return [x, y];
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");

  const fillPath = `${path} L ${padX + w} ${padY + h} L ${padX} ${padY + h} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={className}>
      {fill && (
        <path
          d={fillPath}
          fill={`hsl(var(--primary) / 0.18)`}
          stroke="none"
        />
      )}
      <path d={path} fill="none" stroke={`hsl(var(--primary))`} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}
