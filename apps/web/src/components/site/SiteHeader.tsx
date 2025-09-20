// src/components/site/Header.tsx
export default function Header() {
  return (
    <header className="w-full border-b py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <a href="/" className="font-semibold">Filespay</a>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <a href="/category/windows">Windows</a>
          <a href="/category/mac">macOS</a>
          <a href="/category/android">Android</a>
        </nav>
      </div>
    </header>
  );
}
