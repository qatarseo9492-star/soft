export default function Footer() {
  return (
    <footer className="mt-16 border-t">
      <div className="container-max py-10 text-sm text-neutral-600 flex items-center justify-between">
        <p>© {new Date().getFullYear()} FilesPay. All rights reserved.</p>
        <nav className="flex gap-4">
          <a className="hover:text-neutral-900" href="/sitemap.xml">Sitemap</a>
          <a className="hover:text-neutral-900" href="/robots.txt">Robots</a>
          <a className="hover:text-neutral-900" href="/reviews">Reviews</a>
        </nav>
      </div>
    </footer>
  );
}
