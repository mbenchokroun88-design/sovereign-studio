import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/lib/store/hero";
import { isDriveUrl, toDriveImage } from "@/lib/store/projects";

function src(u: string, fallback: string) {
  if (!u) return fallback;
  return isDriveUrl(u) ? toDriveImage(u) : u;
}

// Headline: *text* renders italic gold-shimmer. "\n" splits lines.
function renderHeadline(s: string) {
  return s.split(/\n/).map((line, li) => (
    <span key={li} className="block">
      {line
        .split(/(\*[^*]+\*)/g)
        .filter(Boolean)
        .map((p, pi) =>
          p.startsWith("*") && p.endsWith("*") ? (
            <span key={pi} className="italic text-shimmer">{p.slice(1, -1)}</span>
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

export function HeroShowcase({ slides, index, setIndex, fallbackImg }: Props) {
  const total = slides.length;
  const current = slides[index];
  const [dir, setDir] = useState<1 | -1>(1);

  const go = useCallback(
    (delta: number) => {
      if (total < 1) return;
      setDir(delta > 0 ? 1 : -1);
      setIndex((index + delta + total) % total);
    },
    [index, total, setIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // Touch swipe
  const [touchX, setTouchX] = useState<number | null>(null);

  const headline = current?.title || "Design pour\n*les institutions*\nqui pèsent.";
  const eyebrow = current?.eyebrow || "Rabat · Paris · Washington";
  const subtitle =
    current?.subtitle ||
    "Identités, rapports et expériences visuelles pour banques de développement, ministères et organisations internationales.";
  const ctaLabel = current?.cta_label || "Voir le portfolio";
  const ctaHref = current?.cta_href || "/portfolio";

  const nextSlide = total > 1 ? slides[(index + 1) % total] : undefined;

  return (
    <section className="relative bg-brand text-canvas overflow-hidden">
      {/* Ambient background from the active visual — heavily blurred */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          key={`bg-${current?.id ?? "d"}`}
          src={src(current?.image_url ?? "", fallbackImg)}
          alt=""
          className="w-full h-full object-cover scale-125 blur-3xl opacity-30 transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-brand/75" />
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-gold/10 blur-[140px]" />
      </div>

      <div
        className="container-x relative grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-16 items-center pt-24 pb-16 md:pt-28 md:pb-20 lg:min-h-[92vh]"
        onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX === null) return;
          const d = e.changedTouches[0].clientX - touchX;
          if (Math.abs(d) > 50) go(d < 0 ? 1 : -1);
          setTouchX(null);
        }}
      >
        {/* ── Left: editorial text column ── */}
        <div className="order-2 lg:order-1">
          <div key={`eb-${current?.id ?? "d"}`} className="flex items-center gap-4 mb-6 animate-fade-up">
            <span className="font-mono text-xs text-gold tracking-widest">
              {total > 1 ? String(index + 1).padStart(2, "0") : "01"}
              <span className="text-canvas/30"> / {String(Math.max(total, 1)).padStart(2, "0")}</span>
            </span>
            <span className="h-px w-10 bg-gold/60" />
            <p className="eyebrow text-gold-soft m-0">{eyebrow}</p>
          </div>

          <h1
            key={`t-${current?.id ?? "d"}`}
            className="font-serif text-[12vw] sm:text-[9vw] lg:text-[4.6rem] xl:text-[5.6rem] leading-[0.92] tracking-[-0.03em] text-balance animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            {renderHeadline(headline)}
          </h1>

          <p
            key={`s-${current?.id ?? "d"}`}
            className="mt-7 text-sm md:text-base text-canvas/75 leading-relaxed max-w-md text-pretty animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            {subtitle}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            {ctaHref.startsWith("/") ? (
              <Link
                to={ctaHref}
                className="group inline-flex items-center gap-3 bg-gold text-brand font-semibold text-xs md:text-sm uppercase tracking-widest px-6 py-4 hover:bg-gold-soft transition-all hover:gap-4"
              >
                {ctaLabel}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <a
                href={ctaHref}
                className="group inline-flex items-center gap-3 bg-gold text-brand font-semibold text-xs md:text-sm uppercase tracking-widest px-6 py-4 hover:bg-gold-soft transition-all hover:gap-4"
              >
                {ctaLabel}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
            )}
            <Link
              to="/contact"
              className="inline-flex items-center border border-canvas/25 text-canvas text-xs md:text-sm uppercase tracking-widest px-6 py-4 hover:bg-canvas hover:text-brand transition-colors"
            >
              Démarrer un projet
            </Link>
          </div>

          {/* Controls */}
          {total > 1 && (
            <div className="mt-10 flex items-center gap-5">
              <div className="flex gap-2">
                <button
                  onClick={() => go(-1)}
                  aria-label="Slide précédent"
                  className="size-11 grid place-items-center border border-canvas/25 text-canvas hover:bg-gold hover:text-brand hover:border-gold transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => go(1)}
                  aria-label="Slide suivant"
                  className="size-11 grid place-items-center border border-canvas/25 text-canvas hover:bg-gold hover:text-brand hover:border-gold transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="flex-1 flex gap-1.5 max-w-[220px]">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setIndex(i)}
                    aria-label={`Slide ${i + 1}`}
                    className="group flex-1 h-8 flex items-center"
                  >
                    <span
                      className={`block w-full transition-all duration-500 ${
                        i === index ? "h-[3px] bg-gold" : "h-px bg-canvas/25 group-hover:bg-canvas/60"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: stacked visual deck ── */}
        <div className="order-1 lg:order-2 relative">
          <div className="relative aspect-[4/5] sm:aspect-[3/2] lg:aspect-[4/5] w-full">
            {/* Peeking next card */}
            {nextSlide && (
              <div className="absolute inset-0 translate-x-4 translate-y-4 sm:translate-x-6 sm:translate-y-6 border border-canvas/10 overflow-hidden hidden sm:block">
                <img
                  src={src(nextSlide.image_url, fallbackImg)}
                  alt=""
                  className="w-full h-full object-cover opacity-25 blur-[1px]"
                  loading="lazy"
                />
              </div>
            )}
            {/* Active card */}
            <div className="absolute inset-0 overflow-hidden shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] ring-1 ring-canvas/10">
              {slides.length > 0 ? (
                slides.map((s, i) => (
                  <img
                    key={s.id}
                    src={src(s.image_url, fallbackImg)}
                    alt={s.title?.replace(/\*/g, "") || ""}
                    fetchPriority={i === 0 ? "high" : "low"}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      i === index
                        ? "opacity-100 scale-100 animate-kenburns"
                        : `opacity-0 ${dir === 1 ? "scale-105" : "scale-95"}`
                    }`}
                  />
                ))
              ) : (
                <img src={fallbackImg} alt="" className="w-full h-full object-cover animate-kenburns" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brand/70 via-transparent to-transparent" />
              {/* Gold frame accents */}
              <span className="absolute top-4 left-4 w-8 h-8 border-t border-l border-gold/70" />
              <span className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-gold/70" />
            </div>
          </div>

          {/* Thumbnail rail */}
          {total > 1 && (
            <div className="mt-5 flex gap-2 overflow-x-auto scrollbar-none">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setIndex(i)}
                  aria-label={`Voir slide ${i + 1}`}
                  className={`relative shrink-0 w-20 h-14 md:w-24 md:h-16 overflow-hidden transition-all duration-500 ${
                    i === index ? "ring-2 ring-gold opacity-100" : "opacity-40 hover:opacity-80"
                  }`}
                >
                  <img src={src(s.image_url, fallbackImg)} alt="" loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}