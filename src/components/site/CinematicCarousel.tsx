import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Play, BookOpen } from "lucide-react";
import type { MediaItem } from "@/lib/store/projects";
import { isDriveUrl, toDriveImage } from "@/lib/store/projects";

interface Props {
  media: MediaItem[];
  onOpen: (index: number) => void;
}

function thumbFor(m: MediaItem): string | null {
  if (m.kind === "image") return isDriveUrl(m.url) ? toDriveImage(m.url) : m.url;
  return null;
}

export function CinematicCarousel({ media, onOpen }: Props) {
  const [active, setActive] = useState(0);
  const n = media.length;
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % n);
      if (e.key === "ArrowLeft") setActive((i) => (i - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n]);

  // Build a list of {item, offset} where offset is the signed distance from active
  const slots = media.map((item, i) => {
    let offset = i - active;
    // Wrap to nearest signed offset
    if (offset > n / 2) offset -= n;
    if (offset < -n / 2) offset += n;
    return { item, offset, originalIndex: i };
  });

  return (
    <div
      className="relative w-full h-[340px] sm:h-[440px] md:h-[560px] select-none overflow-hidden bg-gradient-to-b from-brand/[0.02] to-brand/[0.06] rounded-sm"
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) {
          setActive((i) => (dx < 0 ? (i + 1) % n : (i - 1 + n) % n));
        }
        touchX.current = null;
      }}
    >
      {/* Stage */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "1800px" }}>
        {slots.map(({ item, offset, originalIndex }) => {
          const abs = Math.abs(offset);
          if (abs > 4) return null; // hide far items
          // Cinematic transform
          const translateX = offset * (typeof window !== "undefined" && window.innerWidth < 640 ? 140 : 220);
          const translateZ = -abs * 220;
          const rotateY = offset * -18;
          const scale = abs === 0 ? 1 : abs === 1 ? 0.78 : abs === 2 ? 0.6 : 0.45;
          const blur = abs === 0 ? 0 : abs === 1 ? 2 : abs === 2 ? 6 : 10;
          const opacity = abs === 0 ? 1 : abs === 1 ? 0.85 : abs === 2 ? 0.5 : 0.25;
          const zIndex = 100 - abs;
          const src = thumbFor(item);
          const isCenter = abs === 0;
          return (
            <button
              key={originalIndex}
              type="button"
              onClick={() => (isCenter ? onOpen(originalIndex) : setActive(originalIndex))}
              className="absolute group transition-all duration-[750ms] ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none"
              style={{
                transform: `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex,
                filter: `blur(${blur}px)`,
                transformStyle: "preserve-3d",
              }}
              aria-label={item.label || item.caption || `Élément ${originalIndex + 1}`}
            >
              <div
                className="relative w-[200px] sm:w-[300px] md:w-[420px] aspect-[4/5] bg-brand overflow-hidden shadow-2xl"
                style={{
                  boxShadow: isCenter
                    ? "0 30px 80px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,175,55,0.25)"
                    : "0 20px 50px -20px rgba(0,0,0,0.4)",
                }}
              >
                {src ? (
                  <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
                ) : (
                  <div className="w-full h-full grid place-items-center bg-gradient-to-br from-brand to-brand/70 text-gold">
                    {item.kind === "video" ? <Play size={56} fill="currentColor" /> : <BookOpen size={56} />}
                  </div>
                )}
                {isCenter && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-brand/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-canvas">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold-soft mb-1">
                        <span>{originalIndex + 1} / {n}</span>
                        <span className="opacity-40">·</span>
                        <span>Cliquer pour ouvrir</span>
                      </div>
                      <p className="font-serif text-lg leading-tight">
                        {item.label || item.caption || ""}
                      </p>
                    </div>
                    <div className="absolute top-3 right-3 size-9 bg-gold/95 text-brand grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 size={14} />
                    </div>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <button
        onClick={() => setActive((i) => (i - 1 + n) % n)}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-[200] size-11 grid place-items-center bg-canvas/90 backdrop-blur text-brand hover:bg-gold hover:text-brand shadow-lg"
        aria-label="Précédent"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => setActive((i) => (i + 1) % n)}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-[200] size-11 grid place-items-center bg-canvas/90 backdrop-blur text-brand hover:bg-gold hover:text-brand shadow-lg"
        aria-label="Suivant"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[200] flex gap-1.5">
        {media.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-1 transition-all ${
              i === active ? "w-8 bg-gold" : "w-1.5 bg-brand/30 hover:bg-brand/60"
            }`}
            aria-label={`Aller à ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}