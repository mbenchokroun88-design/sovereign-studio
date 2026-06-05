import { useCallback, useEffect, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  BookOpen,
  Play,
  Image as ImgIcon,
} from "lucide-react";
import type { MediaItem } from "@/lib/store/projects";
import { toVideoEmbed, toDriveImage, isDriveUrl, SLOT_LABELS } from "@/lib/store/projects";
import { Flipbook } from "./Flipbook";

interface MediaGalleryProps {
  media: MediaItem[];
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const next = useCallback(
    () => setActive((i) => (i === null ? null : (i + 1) % media.length)),
    [media.length],
  );
  const prev = useCallback(
    () => setActive((i) => (i === null ? null : (i - 1 + media.length) % media.length)),
    [media.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, next, prev]);

  if (!media.length) {
    return (
      <div className="aspect-[4/3] grid place-items-center bg-muted text-ink-muted text-sm border border-border">
        Aucun média
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {media.map((m, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="group relative aspect-[4/5] bg-muted overflow-hidden border border-border hover:border-gold transition-colors text-left"
          >
            <MediaThumb item={m} />
            <div className="absolute inset-0 bg-gradient-to-t from-brand/80 via-brand/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between text-brand-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-medium truncate">
                {m.caption || labelForSlot(m)}
              </span>
              <Maximize2 size={14} />
            </div>
            <div className="absolute top-2 left-2 text-[9px] uppercase tracking-widest bg-canvas/90 backdrop-blur px-2 py-0.5 text-brand font-semibold flex items-center gap-1">
              <KindIcon kind={m.kind} />
              {labelForSlot(m)}
            </div>
          </button>
        ))}
      </div>

      {active !== null && (
        <div className="fixed inset-0 z-[60] bg-brand/95 backdrop-blur-sm flex flex-col">
          <div className="flex justify-between items-center p-4 text-canvas">
            <span className="text-xs uppercase tracking-widest opacity-70">
              {active + 1} / {media.length} · {labelForSlot(media[active])}
            </span>
            <button onClick={close} aria-label="Fermer" className="p-2 hover:text-gold">
              <X size={22} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <MediaFull item={media[active]} />
          </div>
          {media.length > 1 && (
            <div className="flex justify-between p-4">
              <button onClick={prev} className="p-3 text-canvas hover:text-gold" aria-label="Précédent">
                <ChevronLeft size={28} />
              </button>
              <button onClick={next} className="p-3 text-canvas hover:text-gold" aria-label="Suivant">
                <ChevronRight size={28} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function labelForSlot(m: MediaItem) {
  if (m.label && m.label.trim()) return m.label.trim();
  if (m.slot && SLOT_LABELS[m.slot]) return SLOT_LABELS[m.slot];
  return m.kind === "image" ? "Image" : m.kind === "video" ? "Vidéo" : "PDF";
}

function KindIcon({ kind }: { kind: MediaItem["kind"] }) {
  if (kind === "image") return <ImgIcon size={10} />;
  if (kind === "video") return <Play size={10} />;
  return <BookOpen size={10} />;
}

function MediaThumb({ item }: { item: MediaItem }) {
  if (item.kind === "image") {
    const src = isDriveUrl(item.url) ? toDriveImage(item.url) : item.url;
    return (
      <img
        src={src}
        alt={item.caption || ""}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
    );
  }
  if (item.kind === "video") {
    return (
      <div className="w-full h-full grid place-items-center bg-brand text-brand-foreground">
        <div className="size-12 rounded-full bg-gold/90 grid place-items-center text-brand">
          <Play size={20} fill="currentColor" />
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-full grid place-items-center bg-gradient-to-br from-brand to-brand/70 text-brand-foreground">
      <BookOpen size={36} className="text-gold" />
    </div>
  );
}

function MediaFull({ item }: { item: MediaItem }) {
  if (item.kind === "image") {
    const src = isDriveUrl(item.url) ? toDriveImage(item.url) : item.url;
    return (
      <img
        src={src}
        alt={item.caption || ""}
        className="max-h-full max-w-full object-contain shadow-2xl"
      />
    );
  }
  if (item.kind === "video") {
    return (
      <div className="w-full max-w-5xl aspect-video bg-black">
        <iframe
          src={toVideoEmbed(item.url)}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={item.caption || "Vidéo"}
        />
      </div>
    );
  }
  return (
    <div className="w-full h-full min-h-[80vh]">
      <Flipbook url={item.url} caption={item.caption} />
    </div>
  );
}