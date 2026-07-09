import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/", label: "Accueil" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/about", label: "Studio" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-canvas/85 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between">
        <Link to="/" className="flex items-baseline gap-2 group">
          <span className="font-serif italic font-bold text-xl tracking-tight text-brand">
            MB.
          </span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.22em] text-ink-muted group-hover:text-gold transition-colors">
            Benchokroun · Studio
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="text-sm text-ink-muted hover:text-brand transition-colors"
              activeProps={{ className: "text-brand font-medium" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 -mr-2 text-brand"
            onClick={() => setOpen((s) => !s)}
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-canvas">
          <div className="container-x py-4 flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 px-2 text-base text-ink hover:text-gold border-b border-border last:border-0"
                activeProps={{ className: "text-gold" }}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}