export default function PlatformBadge({ os }: { os?: string | null }) {
  if (!os) return null;
  const map: Record<string, string> = {
    WINDOWS: "Windows",
    MACOS: "Mac",
    LINUX: "Linux",
    ANDROID: "Android",
    IOS: "iOS",
  };
  const label = map[os] ?? os;
  return (
    <span className="inline-flex items-center rounded-full border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      {label}
    </span>
  );
}
