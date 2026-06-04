import { useCallback, useEffect, useRef, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  BookOpen,
  Play,
  Image as ImgIcon,
  ExternalLink,
  Loader2,
} from "lucide-react";
import type { MediaItem } from "@/lib/store/projects";
import { toDrivePreview, toVideoEmbed } from "@/lib/store/projects";

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
                {m.caption || labelForKind(m.kind)}
              </span>
              <Maximize2 size={14} />
            </div>
            <div className="absolute top-2 left-2 text-[9px] uppercase tracking-widest bg-canvas/90 backdrop-blur px-2 py-0.5 text-brand font-semibold flex items-center gap-1">
              <KindIcon kind={m.kind} />
              {labelForKind(m.kind)}
            </div>
          </button>
        ))}
      </div>

      {active !== null && (
        <div className="fixed inset-0 z-[60] bg-brand/95 backdrop-blur-sm flex flex-col">
          <div className="flex justify-between items-center p-4 text-canvas">
            <span className="text-xs uppercase tracking-widest opacity-70">
              {active + 1} / {media.length} · {labelForKind(media[active].kind)}
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

function labelForKind(k: MediaItem["kind"]) {
  return k === "image" ? "Image" : k === "video" ? "Vidéo" : "PDF Flipbook";
}

function KindIcon({ kind }: { kind: MediaItem["kind"] }) {
  if (kind === "image") return <ImgIcon size={10} />;
  if (kind === "video") return <Play size={10} />;
  return <BookOpen size={10} />;
}

function MediaThumb({ item }: { item: MediaItem }) {
  if (item.kind === "image") {
    return (
      <img
        src={item.url}
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
    return (
      <img
        src={item.url}
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
  return <Flipbook url={item.url} caption={item.caption} />;
}

function Flipbook({ url, caption }: { url: string; caption?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const toggleFullscreen = useCallback(async () => {
    const el = wrapRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setFullscreen(true);
      } else {
        await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="w-full h-full flex flex-col items-center justify-center gap-6 px-2 md:px-8"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 text-canvas/80 text-xs uppercase tracking-widest">
        <BookOpen size={14} className="text-gold" />
        <span>{caption || "Document"}</span>
        <span className="opacity-40">·</span>
        <span className="opacity-60 hidden sm:inline">Tournez les pages avec les flèches du document</span>
      </div>

      {/* Book stage with perspective */}
      <div
        className="relative w-full max-w-6xl flex-1 flex items-center justify-center"
        style={{ perspective: "2400px" }}
      >
        {/* Ambient gold glow */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-3/4 rounded-full bg-gold/15 blur-[120px]" />
        </div>

        <div
          className="relative w-full max-w-5xl aspect-[16/10] book-shadow bg-white animate-fade-up"
          style={{ transform: "rotateX(2deg)" }}
        >
          {/* Book spine center crease */}
          <div className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 z-20 pointer-events-none hidden md:block">
            <div className="w-full h-full bg-gradient-to-r from-black/30 via-black/10 to-black/30" />
          </div>
          {/* Gold corner accents */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-gold z-30 pointer-events-none" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-gold z-30 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-gold z-30 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-gold z-30 pointer-events-none" />

          {/* Loading state */}
          {!loaded && (
            <div className="absolute inset-0 grid place-items-center bg-white z-10">
              <div className="flex flex-col items-center gap-3 text-brand/70">
                <Loader2 className="animate-spin text-gold" size={28} />
                <span className="text-[10px] uppercase tracking-[0.3em]">Ouverture du document</span>
              </div>
            </div>
          )}

          <iframe
            src={toDrivePreview(url)}
            onLoad={() => setLoaded(true)}
            className="w-full h-full relative z-0"
            title={caption || "Flipbook"}
            allow="autoplay; fullscreen"
          />

          {/* Page edge highlight (right side) */}
          <div className="absolute right-0 top-2 bottom-2 w-1 bg-gradient-to-b from-transparent via-black/10 to-transparent pointer-events-none hidden md:block" />
        </div>

        {/* Floor reflection */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/40 blur-2xl rounded-full -z-10" />
      </div>

      {/* Bottom controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleFullscreen}
          className="inline-flex items-center gap-2 border border-canvas/30 text-canvas px-4 py-2 text-xs uppercase tracking-widest hover:bg-gold hover:text-brand hover:border-gold transition-colors"
        >
          <Maximize2 size={14} />
          {fullscreen ? "Quitter le plein écran" : "Plein écran"}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-canvas/60 hover:text-gold px-4 py-2 text-xs uppercase tracking-widest transition-colors"
        >
          <ExternalLink size={14} />
          Ouvrir l'original
        </a>
      </div>
    </div>
  );
}