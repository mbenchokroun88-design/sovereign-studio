import { useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function Lightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const prev = useCallback(
    () => onIndex((index - 1 + images.length) % images.length),
    [index, images.length, onIndex],
  );
  const next = useCallback(
    () => onIndex((index + 1) % images.length),
    [index, images.length, onIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [prev, next, onClose]);

  const touch = useRef<{ x: number; y: number } | null>(null);

  if (index < 0 || !images[index]) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-brand/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
      onTouchStart={(e) => {
        touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }}
      onTouchEnd={(e) => {
        if (!touch.current) return;
        const dx = e.changedTouches[0].clientX - touch.current.x;
        const dy = e.changedTouches[0].clientY - touch.current.y;
        touch.current = null;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) next();
          else prev();
        } else if (dy > 90) {
          onClose();
        }
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 text-canvas/80 hover:text-gold p-2"
        aria-label="Fermer"
      >
        <X size={28} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-canvas/80 hover:text-gold p-3 bg-brand/40 hover:bg-brand/70 rounded-full hidden sm:block"
        aria-label="Précédent"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-canvas/80 hover:text-gold p-3 bg-brand/40 hover:bg-brand/70 rounded-full hidden sm:block"
        aria-label="Suivant"
      >
        <ChevronRight size={28} />
      </button>
      <img
        src={images[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-w-[94vw] max-h-[84svh] object-contain select-none"
        draggable={false}
      />
      <p className="absolute bottom-4 md:bottom-6 left-0 right-0 text-center text-[10px] md:text-xs uppercase tracking-widest text-canvas/60">
        {index + 1} / {images.length}
        <span className="hidden sm:inline"> · ← → pour naviguer · Esc pour fermer</span>
        <span className="sm:hidden"> · glissez pour naviguer</span>
      </p>
    </div>
  );
}