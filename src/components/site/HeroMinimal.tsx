import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
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
 * Minimal full-bleed hero: one image, one line, one action.
 * Straight to the point — no decks, no frames, no stacked cards.
 */
export function HeroMinimal({ slides, index, setIndex, fallbackImg }: Props) {
  const total = slides.length;
  const current = slides[index];
  const touchX = useRef<number | null>(null);

  // progress bar restart on slide change
  const [tick, setTick] = useState(0);
  useEffect(() => setTick((t) => t + 1), [index]);

  const go = (d: number) => {
    if (total < 2) return;
    setIndex((index + d + total) % total);
  };

  const title = clean(current?.title || "Design institutionnel");
  const eyebrow = current?.eyebrow || "Mohamed Benchokroun · Rabat";
  const ctaLabel = current?.cta_label || "Voir le portfolio";
  const ctaHref = current?.cta_href || "/portfolio";

  return (
    <section
      className="relative bg-brand text-canvas h-[88svh] min-h-[520px] md:h-[92vh] overflow-hidden"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const d = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(d) > 45) go(d < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {/* Visual */}
      <div className="absolute inset-0">
        {(total ? slides : [null]).map((s, i) => (
          <img
            key={s?.id ?? "fallback"}
            src={src(s?.image_url ?? "", fallbackImg)}
            alt=""
            fetchPriority={i === 0 ? "high" : "low"}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-out ${
              i === index ? "opacity-100 animate-kenburns" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-brand/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/25 to-brand/45" />
      </div>

      {/* Content */}
      <div className="relative h-full container-x flex flex-col justify-end pb-14 md:pb-20">
        <div key={`c-${index}-${tick}`} className="max-w-4xl">
          <p className="eyebrow text-gold-soft mb-4 md:mb-6 animate-fade-up">{eyebrow}</p>
          <h1
            className="font-serif text-[13vw] sm:text-[8vw] lg:text-[5.6rem] leading-[0.94] tracking-[-0.03em] text-balance animate-fade-up"
            style={{ animationDelay: "0.08s" }}
          >
            {title}
          </h1>
          <div className="mt-8 md:mt-10 animate-fade-up" style={{ animationDelay: "0.18s" }}>
            {ctaHref.startsWith("/") ? (
              <Link
                to={ctaHref}
                className="group inline-flex items-center gap-3 bg-gold text-brand font-semibold text-xs md:text-sm uppercase tracking-widest px-7 py-4 hover:bg-gold-soft transition-all hover:gap-4"
              >
                {ctaLabel}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <a
                href={ctaHref}
                className="group inline-flex items-center gap-3 bg-gold text-brand font-semibold text-xs md:text-sm uppercase tracking-widest px-7 py-4 hover:bg-gold-soft transition-all hover:gap-4"
              >
                {ctaLabel}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
            )}
          </div>
        </div>

        {/* Slide indicators */}
        {total > 1 && (
          <div className="mt-10 md:mt-14 flex items-center gap-3">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className="group py-3"
              >
                <span
                  className={`block h-[2px] transition-all duration-500 ${
                    i === index ? "w-14 bg-gold" : "w-6 bg-canvas/30 group-hover:bg-canvas/70"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
