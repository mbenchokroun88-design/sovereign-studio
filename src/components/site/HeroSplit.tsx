import { Link } from "@tanstack/react-router";
import { ArrowRight, Linkedin, Mail, Phone } from "lucide-react";
import type { HeroSlide } from "@/lib/store/hero";
import { isDriveUrl, toDriveImage } from "@/lib/store/projects";

function src(u: string, fallback: string) {
  if (!u) return fallback;
  return isDriveUrl(u) ? toDriveImage(u) : u;
}
function clean(s: string) {
  return s.replace(/\*/g, "").replace(/\\n/g, " ");
}

interface Props {
  slides: HeroSlide[];
  index: number;
  setIndex: (i: number) => void;
  fallbackImg: string;
}

/**
 * Hero « split » : colonne éditoriale à gauche, visuel plein cadre à droite.
 * Le contenu vient du slider géré dans l'admin.
 */
export function HeroSplit({ slides, index, setIndex, fallbackImg }: Props) {
  const total = slides.length;
  const current = slides[index];
  const eyebrow = current?.eyebrow || "Studio de design institutionnel · Rabat";
  const title = clean(current?.title || "Mohamed Benchokroun");
  const subtitle = clean(current?.subtitle || "Directeur artistique & infographiste");
  const ctaLabel = current?.cta_label || "Voir le portfolio";
  const ctaHref = current?.cta_href || "/portfolio";

  const Cta = ctaHref.startsWith("/") ? (
    <Link
      to={ctaHref}
      className="group inline-flex items-center gap-3 bg-brand text-brand-foreground text-xs md:text-sm uppercase tracking-widest font-semibold px-7 py-4 hover:bg-gold hover:text-brand transition-colors"
    >
      {ctaLabel}
      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
    </Link>
  ) : (
    <a
      href={ctaHref}
      className="group inline-flex items-center gap-3 bg-brand text-brand-foreground text-xs md:text-sm uppercase tracking-widest font-semibold px-7 py-4 hover:bg-gold hover:text-brand transition-colors"
    >
      {ctaLabel}
      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
    </a>
  );

  return (
    <section className="relative bg-canvas overflow-hidden">
      <div className="grid lg:grid-cols-[1.05fr_1fr] min-h-[84svh] lg:min-h-[88vh]">
        {/* TEXTE */}
        <div className="order-2 lg:order-1 relative z-10 flex flex-col justify-center container-x py-12 md:py-20 lg:py-0">
          <div key={index} className="max-w-xl">
            <p className="eyebrow text-gold mb-5 animate-fade-up">{eyebrow}</p>
            <h1
              className="font-serif text-[11vw] sm:text-6xl lg:text-[4.6rem] leading-[0.95] tracking-[-0.03em] text-brand text-balance animate-fade-up"
              style={{ animationDelay: "0.06s" }}
            >
              {title}
            </h1>
            <p
              className="mt-5 font-serif italic text-2xl md:text-3xl text-gold animate-fade-up"
              style={{ animationDelay: "0.12s" }}
            >
              {subtitle}
            </p>
            <p
              className="mt-6 text-ink-muted leading-relaxed max-w-md animate-fade-up"
              style={{ animationDelay: "0.18s" }}
            >
              Identités, rapports d'impact, événements, 3D et plateformes numériques pour institutions
              européennes, américaines et marocaines.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: "0.24s" }}>
              {Cta}
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border border-brand/25 text-brand text-xs md:text-sm uppercase tracking-widest px-6 py-4 hover:border-gold hover:text-gold transition-colors"
              >
                Me contacter
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-3">
              {[
                { icon: Mail, href: "mailto:mohamed.benchokroun@gmail.com", label: "Email" },
                { icon: Phone, href: "tel:+212697953261", label: "Téléphone" },
                { icon: Linkedin, href: "https://www.linkedin.com/", label: "LinkedIn" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="size-10 grid place-items-center rounded-full bg-brand text-brand-foreground hover:bg-gold hover:text-brand transition-colors"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>

            {/* Sélecteur de slide */}
            {total > 1 && (
              <div className="mt-10 flex items-center gap-3">
                {slides.map((s, i) => (
                  <button key={s.id} onClick={() => setIndex(i)} aria-label={`Slide ${i + 1}`} className="group py-3">
                    <span
                      className={`block h-[2px] transition-all duration-500 ${
                        i === index ? "w-14 bg-gold" : "w-6 bg-brand/20 group-hover:bg-brand/50"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* VISUEL */}
        <div className="order-1 lg:order-2 relative min-h-[46svh] lg:min-h-0">
          <div className="absolute inset-0 bg-gradient-to-b from-muted to-canvas" />
          {(total ? slides : [null]).map((s, i) => (
            <img
              key={s?.id ?? "fallback"}
              src={src(s?.image_url ?? "", fallbackImg)}
              alt=""
              fetchPriority={i === 0 ? "high" : "low"}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1100ms] ease-out ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/10 to-transparent lg:from-canvas lg:via-transparent" />
          <span className="hidden lg:block absolute bottom-10 right-10 font-mono text-[10px] uppercase tracking-[0.3em] text-brand/50">
            {String(index + 1).padStart(2, "0")} / {String(Math.max(total, 1)).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
