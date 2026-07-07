import { useMemo, useState } from "react";
import { Layout, Grid3x3, GalleryHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { isDriveUrl, toDriveImage, toVideoEmbed, type LayoutBlock } from "@/lib/store/projects";
import { ProjectBlocks } from "./ProjectBlocks";

type Mode = "composed" | "gallery" | "slideshow";

interface MediaEntry {
  kind: "image" | "video" | "pdf";
  url: string;
  caption?: string;
}

function extractMedia(blocks: LayoutBlock[]): MediaEntry[] {
  const out: MediaEntry[] = [];
  for (const b of blocks) {
    if (b.type === "image") {
      if (b.url) out.push({ kind: "image", url: b.url, caption: b.caption });
      (b.mockupViews || []).forEach((u) => u && out.push({ kind: "image", url: u }));
    } else if (b.type === "gallery") {
      b.urls.filter(Boolean).forEach((u) => out.push({ kind: "image", url: u, caption: b.caption }));
    } else if (b.type === "text_image") {
      if (b.url) out.push({ kind: "image", url: b.url, caption: b.heading });
    } else if (b.type === "video") {
      out.push({ kind: "video", url: b.url, caption: b.caption });
    } else if (b.type === "pdf") {
      out.push({ kind: "pdf", url: b.url, caption: b.caption });
    }
  }
  return out;
}

function resolveImg(u: string) {
  return isDriveUrl(u) ? toDriveImage(u) : u;
}

export function ProjectViews({ blocks }: { blocks: LayoutBlock[] }) {
  const [mode, setMode] = useState<Mode>("composed");
  const media = useMemo(() => extractMedia(blocks), [blocks]);

  const modes: { id: Mode; label: string; icon: typeof Layout }[] = [
    { id: "composed", label: "Composition", icon: Layout },
    { id: "gallery", label: "Galerie", icon: Grid3x3 },
    { id: "slideshow", label: "Défilement", icon: GalleryHorizontal },
  ];

  return (
    <div>
      <div className="sticky top-16 z-20 bg-canvas/95 backdrop-blur border-b border-border">
        <div className="container-x py-3 flex items-center justify-between gap-3">
          <span className="hidden md:inline text-[10px] uppercase tracking-widest text-ink-muted">Mode d'affichage</span>
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {modes.map((m) => {
              const active = mode === m.id;
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`shrink-0 inline-flex items-center gap-2 text-[11px] uppercase tracking-widest px-3 py-2 border transition-colors ${
                    active ? "bg-brand text-brand-foreground border-brand" : "border-border text-ink-muted hover:border-gold hover:text-brand"
                  }`}
                >
                  <Icon size={14} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {mode === "composed" && <ProjectBlocks blocks={blocks} />}
      {mode === "gallery" && <GalleryView media={media} />}
      {mode === "slideshow" && <SlideshowView media={media} />}
    </div>
  );
}

function GalleryView({ media }: { media: MediaEntry[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const images = media.filter((m) => m.kind === "image");
  if (images.length === 0) {
    return <p className="container-x py-24 text-center text-ink-muted">Aucun visuel dans ce projet.</p>;
  }
  return (
    <div className="container-x py-10 md:py-16">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
        {images.map((m, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            className="group relative aspect-[4/5] overflow-hidden bg-muted"
          >
            <img
              src={resolveImg(m.url)}
              alt={m.caption || ""}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-brand/0 group-hover:bg-brand/30 transition-colors" />
          </button>
        ))}
      </div>
      {lightbox !== null && (
        <Lightbox
          images={images}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onChange={setLightbox}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  index,
  onClose,
  onChange,
}: {
  images: MediaEntry[];
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  const n = images.length;
  const prev = () => onChange((index - 1 + n) % n);
  const next = () => onChange((index + 1) % n);
  return (
    <div className="fixed inset-0 z-[100] bg-brand/95 backdrop-blur flex items-center justify-center">
      <button onClick={onClose} className="absolute top-4 right-4 size-11 grid place-items-center text-canvas hover:text-gold" aria-label="Fermer">
        <X size={24} />
      </button>
      <button onClick={prev} className="absolute left-2 md:left-6 size-11 grid place-items-center text-canvas hover:text-gold" aria-label="Précédent">
        <ChevronLeft size={28} />
      </button>
      <button onClick={next} className="absolute right-2 md:right-6 size-11 grid place-items-center text-canvas hover:text-gold" aria-label="Suivant">
        <ChevronRight size={28} />
      </button>
      <div className="max-w-[92vw] max-h-[85vh] flex flex-col items-center gap-4">
        <img src={resolveImg(images[index].url)} alt="" className="max-w-full max-h-[80vh] object-contain" />
        {images[index].caption && (
          <p className="text-canvas/80 text-xs uppercase tracking-widest">{images[index].caption}</p>
        )}
        <p className="text-canvas/50 text-[10px] uppercase tracking-widest">{index + 1} / {n}</p>
      </div>
    </div>
  );
}

function SlideshowView({ media }: { media: MediaEntry[] }) {
  const [active, setActive] = useState(0);
  const n = media.length;
  if (n === 0) return <p className="container-x py-24 text-center text-ink-muted">Aucun visuel dans ce projet.</p>;
  const current = media[active];
  const prev = () => setActive((i) => (i - 1 + n) % n);
  const next = () => setActive((i) => (i + 1) % n);

  return (
    <div className="bg-brand">
      <div className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        {current.kind === "image" && (
          <img src={resolveImg(current.url)} alt="" className="max-w-full max-h-full object-contain" />
        )}
        {current.kind === "video" && (
          <iframe
            src={`${toVideoEmbed(current.url)}${toVideoEmbed(current.url).includes("?") ? "&" : "?"}autoplay=1&mute=1&muted=1&playsinline=1&loop=1`}
            className="w-full h-full max-w-6xl aspect-video"
            allow="autoplay; fullscreen"
            allowFullScreen
            title={current.caption || "video"}
          />
        )}
        {current.kind === "pdf" && (
          <iframe src={current.url} className="w-[90vw] h-[70vh] bg-white" title={current.caption || "pdf"} />
        )}

        <button onClick={prev} className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 size-11 grid place-items-center bg-canvas/90 text-brand hover:bg-gold" aria-label="Précédent">
          <ChevronLeft size={22} />
        </button>
        <button onClick={next} className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 size-11 grid place-items-center bg-canvas/90 text-brand hover:bg-gold" aria-label="Suivant">
          <ChevronRight size={22} />
        </button>
      </div>

      <div className="container-x py-6 flex items-center justify-between text-canvas gap-4">
        <p className="text-sm truncate">
          {current.caption && <span className="text-gold-soft">{current.caption}</span>}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-canvas/60">{active + 1} / {n}</p>
      </div>

      <div className="border-t border-canvas/10">
        <div className="container-x py-4 overflow-x-auto scrollbar-none">
          <div className="flex gap-2">
            {media.map((m, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`shrink-0 w-20 h-20 md:w-24 md:h-24 overflow-hidden border-2 transition-colors ${
                  i === active ? "border-gold" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                {m.kind === "image" ? (
                  <img src={resolveImg(m.url)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center bg-brand/60 text-gold text-[10px] uppercase tracking-widest">
                    {m.kind}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}