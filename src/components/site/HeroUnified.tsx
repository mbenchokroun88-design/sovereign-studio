import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { HeroSlide } from "@/lib/store/hero";
import { isDriveUrl, toDriveImage } from "@/lib/store/projects";

function resolve(u: string, fallback: string) {
  if (!u) return fallback;
  return isDriveUrl(u) ? toDriveImage(u) : u;
}

/** Titre : *mot* → italique doré. Les "\n" créent des lignes. */
function renderTitle(s: string) {
  return s.split(/\\n|\n/).map((line, li) => (
    <span key={li} className="block">
      {line
        .split(/(\*[^*]+\*)/g)
        .filter(Boolean)
        .map((p, pi) =>
          p.startsWith("*") && p.endsWith("*") ? (
            <span key={pi} className="italic text-gold">{p.slice(1, -1)}</span>
          ) : (
            <span key={pi}>{p}</span>
          ),
        )}
    </span>
  ));
}

interface Props {
  slides: HeroSlide[];
  index: number;
  setIndex: (i: number) => void;
  fallbackImg: string;
}

/**
 * Hero unifié : un seul bloc plein cadre, identique sur mobile et ordinateur.
 * L'image occupe toute la section, le texte se pose dessus.
 */
export function HeroUnified({ slides, index, setIndex, fallbackImg }: Props) {
  const total = slides.length;
  const current = slides[index];
  const eyebrow = current?.eyebrow || "Studio de design institutionnel · Rabat";
  const title = current?.title || "Mohamed *Benchokroun*";
  const subtitle = current?.subtitle || "Directeur artistique & infographiste";
  const ctaLabel = current?.cta_label || "Voir le portfolio";
  const ctaHref = current?.cta_href || "/portfolio";

  const ctaClass =
    "group inline-flex items-center gap-3 bg-gold text-brand text-[11px] md:text-sm uppercase tracking-widest font-semibold px-6 py-3.5 md:px-8 md:py-4 hover:bg-canvas transition-colors";

  return (
    <section className="relative isolate overflow-hidden bg-brand text-canvas min-h-[88svh] md:min-h-[92vh] flex items-end">
      {/* Visuels superposés — fondu enchaîné */}
      <div className="absolute inset-0">
        {(total ? slides : [null]).map((s, i) => (
          <img
            key={s?.id ?? "fallback"}
            src={resolve(s?.image_url ?? "", fallbackImg)}
            alt=""
            fetchPriority={i === 0 ? "high" : "low"}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms] ease-out ${
              i === index ? "opacity-100 animate-kenburns" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-brand/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/70 to-brand/20" />
      </div>

      {/* Contenu */}
      <div className="relative container-x w-full pb-14 pt-28 md:pb-20 md:pt-40">
        <div key={index} className="max-w-4xl">
          <p className="eyebrow text-gold mb-5 animate-fade-up">{eyebrow}</p>
          <h1
            className="font-serif text-[13vw] sm:text-6xl md:text-8xl leading-[0.92] tracking-[-0.03em] text-balance animate-fade-up"
            style={{ animationDelay: "0.06s" }}
          >
            {renderTitle(title)}
          </h1>
          {subtitle && (
            <p
              className="mt-5 md:mt-7 text-base md:text-2xl text-canvas/85 font-light max-w-2xl animate-fade-up"
              style={{ animationDelay: "0.12s" }}
            >
              {subtitle}
            </p>
          )}
          <div
            className="mt-8 md:mt-11 flex flex-wrap items-center gap-3 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            {ctaHref.startsWith("/") ? (
              <Link to={ctaHref as never} className={ctaClass}>
                {ctaLabel}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <a href={ctaHref} className={ctaClass}>
                {ctaLabel}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
            )}
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-canvas/40 text-canvas text-[11px] md:text-sm uppercase tracking-widest px-6 py-3.5 md:px-7 md:py-4 hover:border-gold hover:text-gold transition-colors"
            >
              Me contacter
            </Link>
          </div>

          {total > 1 && (
            <div className="mt-10 md:mt-14 flex items-center gap-3">
              {slides.map((s, i) => (
                <button key={s.id} onClick={() => setIndex(i)} aria-label={`Visuel ${i + 1}`} className="group py-3">
                  <span
                    className={`block h-[2px] transition-all duration-500 ${
                      i === index ? "w-14 bg-gold" : "w-7 bg-canvas/30 group-hover:bg-canvas/70"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 font-mono text-[10px] tracking-[0.3em] text-canvas/50">
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
