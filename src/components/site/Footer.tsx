import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container-x py-16 grid gap-12 md:grid-cols-3">
        <div>
          <h3 className="font-serif text-3xl italic text-brand mb-4">
            Discutons.
          </h3>
          <p className="text-sm text-ink-muted mb-6 max-w-xs">
            Disponible pour les missions institutionnelles et privées en EMEA
            et Amérique du Nord.
          </p>
          <a
            href="mailto:m.benchokroun@studio.ma"
            className="text-sm font-medium gold-underline text-brand"
          >
            m.benchokroun@studio.ma
          </a>
        </div>

        <div>
          <p className="eyebrow mb-4">Studio</p>
          <p className="text-sm text-ink-muted leading-relaxed">
            Avenue Mehdi Ben Barka<br />
            Hay Riad, Rabat<br />
            Maroc · 10100
          </p>
        </div>

        <div>
          <p className="eyebrow mb-4">Navigation</p>
          <ul className="space-y-2 text-sm text-ink-muted">
            <li><Link to="/portfolio" className="hover:text-brand">Portfolio</Link></li>
            <li><Link to="/services" className="hover:text-brand">Expertise</Link></li>
            <li><Link to="/about" className="hover:text-brand">À propos</Link></li>
            <li><Link to="/contact" className="hover:text-brand">Contact</Link></li>
            <li><Link to="/admin" className="hover:text-brand opacity-60">Espace admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-x py-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] uppercase tracking-widest text-ink-muted">
          <span>© {new Date().getFullYear()} Mohamed Benchokroun</span>
          <span>Sovereign Studio · Rabat</span>
        </div>
      </div>
    </footer>
  );
}