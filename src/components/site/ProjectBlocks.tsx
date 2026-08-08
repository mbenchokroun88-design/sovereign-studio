import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { isDriveUrl, toDriveImage, toVideoEmbed, type LayoutBlock, type MediaItem } from "@/lib/store/projects";
import { Flipbook } from "@/components/site/Flipbook";
import { Mockup3D } from "@/components/site/Mockup3D";
import { CinematicCarousel } from "@/components/site/CinematicCarousel";
import { Lightbox } from "@/components/site/Lightbox";

function resolve(u: string) {
  return isDriveUrl(u) ? toDriveImage(u) : u;
}

type LB = { images: string[]; open: (url: string) => void };
const LightboxCtx = createContext<LB>({ images: [], open: () => {} });

export function ProjectBlocks({ blocks }: { blocks: LayoutBlock[] }) {
  const images = useMemo(() => {
    const out: string[] = [];
    const walk = (list: LayoutBlock[]) => {
      for (const b of list) {
      if (b.type === "image" && b.url && (!b.mockup || b.mockup === "none")) out.push(resolve(b.url));
      else if (b.type === "gallery") {
        for (const u of b.urls) if (u) out.push(resolve(u));
      } else if (b.type === "text_image" && b.url && b.position !== "overlay") {
        out.push(resolve(b.url));
      } else if (b.type === "columns") walk(b.children || []);
      }
    };
    walk(blocks);
    return out;
  }, [blocks]);
  const [idx, setIdx] = useState(-1);
  const open = (url: string) => {
    const i = images.indexOf(url);
    if (i >= 0) setIdx(i);
  };
  return (
    <LightboxCtx.Provider value={{ images, open }}>
      <div className="bg-white">
        {blocks.map((b) => (
          <BlockView key={b.id} block={b} />
        ))}
      </div>
      {idx >= 0 && (
        <Lightbox images={images} index={idx} onClose={() => setIdx(-1)} onIndex={setIdx} />
      )}
    </LightboxCtx.Provider>
  );
}

function ClickableImg({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  const { open } = useContext(LightboxCtx);
  return (
    <img
      src={src}
      alt={alt || ""}
      loading="lazy"
      onClick={() => open(src)}
      className={`${className || ""} cursor-zoom-in transition-transform duration-500 hover:scale-[1.01]`}
    />
  );
}

function BlockView({ block }: { block: LayoutBlock }) {
  return <BlockBody block={block} />;
}

/** Cinematic carousel wired to the page lightbox so clicking the centre image opens it. */
function CinematicGallery({ items, urls }: { items: MediaItem[]; urls: string[] }) {
  const { open } = useContext(LightboxCtx);
  return <CinematicCarousel media={items} onOpen={(i) => open(resolve(urls[i]))} />;
}

function BlockBody({ block }: { block: LayoutBlock }) {
  switch (block.type) {
    case "image": {
      const src = resolve(block.url);
      const useMockup = block.mockup && block.mockup !== "none";
      const inner = useMockup ? (
        <div className="w-full aspect-[16/10] bg-canvas">
          <Mockup3D
            template={block.mockup as any}
            views={[block.url, ...(block.mockupViews || [])].filter(Boolean)}
            auto
            size="full"
            caption={block.caption}
          />
        </div>
      ) : (
        <>
          {src ? (
            block.crop ? (
              <div className="w-full aspect-[16/9] overflow-hidden bg-muted">
                <ClickableImg src={src} alt={block.caption} className="w-full h-full object-cover" />
              </div>
            ) : (
              <ClickableImg src={src} alt={block.caption} className="w-full h-auto block object-contain" />
            )
          ) : (
            <div className="w-full aspect-[16/9] bg-muted grid place-items-center text-ink-muted text-xs">
              (image manquante)
            </div>
          )}
          {block.caption && (
            <p className="mt-3 text-xs text-ink-muted uppercase tracking-widest text-center">
              {block.caption}
            </p>
          )}
        </>
      );
      if (block.width === "full") {
        return (
          <section className="py-2 md:py-4 px-2 md:px-0">
            <SectionTitle title={block.title} />
            {inner}
          </section>
        );
      }
      if (block.width === "wide") {
        return (
          <section className="py-3 md:py-6">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <SectionTitle title={block.title} />
              {inner}
            </div>
          </section>
        );
      }
      return (
        <section className="py-4 md:py-8 bg-canvas">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <SectionTitle title={block.title} />
            {inner}
          </div>
        </section>
      );
    }

    case "gallery": {
      const urls = block.urls.filter(Boolean);
      if (block.variant === "cinematic" && urls.length > 0) {
        const items: MediaItem[] = urls.map((u) => ({ slot: "other", kind: "image", url: u }));
        return (
          <section className="py-4 md:py-8">
            <div className="max-w-6xl mx-auto px-2 md:px-8">
              <SectionTitle title={block.title} />
              <CinematicGallery items={items} urls={urls} />
              {block.caption && (
                <p className="mt-4 text-xs text-ink-muted uppercase tracking-widest text-center">
                  {block.caption}
                </p>
              )}
            </div>
          </section>
        );
      }
      const cols = block.columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
      return (
        <section className="py-4 md:py-8">
          <div className="max-w-6xl mx-auto md:px-8">
            <div className="px-4 md:px-0">
              <SectionTitle title={block.title} />
            </div>
            {/* Mobile: swipeable snap rail */}
            <div className="md:hidden flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain touch-pan-x scrollbar-none gap-3 px-4">
              {urls.map((u, i) => (
                <div key={i} className="snap-center shrink-0 w-[86vw] bg-muted grid place-items-center">
                  <ClickableImg src={resolve(u)} className="w-full h-auto block object-contain" />
                </div>
              ))}
            </div>
            {urls.length > 1 && (
              <p className="md:hidden mt-2 px-4 text-[10px] uppercase tracking-[0.25em] text-ink-muted">
                Glissez → {urls.length} visuels
              </p>
            )}
            <div className={`hidden md:grid grid-cols-1 ${cols} gap-2 md:gap-3`}>
              {urls.map((u, i) => (
                <div
                  key={i}
                  className={`bg-muted overflow-hidden flex items-center justify-center ${block.crop ? "aspect-[4/3]" : ""}`}
                >
                  <ClickableImg
                    src={resolve(u)}
                    className={block.crop ? "w-full h-full object-cover" : "w-full h-auto block object-contain"}
                  />
                </div>
              ))}
            </div>
            {block.caption && (
              <p className="mt-4 px-4 text-xs text-ink-muted uppercase tracking-widest text-center">
                {block.caption}
              </p>
            )}
          </div>
        </section>
      );
    }

    case "text_image": {
      const src = resolve(block.url);
      const sizeCls =
        block.textSize === "lg" ? "text-lg md:text-xl" : block.textSize === "md" ? "text-base md:text-lg" : "text-sm md:text-base";
      const container = block.width === "full" ? "max-w-none px-4 md:px-8" : "max-w-6xl mx-auto px-4 md:px-8";
      const TextBlock = (
        <div className="flex-1 min-w-0">
          {block.eyebrow && <p className="eyebrow mb-3">{block.eyebrow}</p>}
          {block.heading && (
            <h3 className="font-serif text-2xl md:text-3xl text-brand mb-4 text-balance">{block.heading}</h3>
          )}
          {block.body && (
            <div className={`text-ink leading-relaxed whitespace-pre-line ${sizeCls}`}>{block.body}</div>
          )}
        </div>
      );
      const Img = src ? (
        block.position === "overlay" ? (
          <img src={src} alt={block.heading || ""} className="w-full h-auto block object-contain" />
        ) : (
          <ClickableImg src={src} alt={block.heading} className="w-full h-auto block object-contain" />
        )
      ) : (
        <div className="w-full aspect-[4/3] bg-muted" />
      );

      if (block.position === "overlay") {
        const pos = block.overlayAlign || "bl";
        const v = pos[0]; // t/c/b
        const h = pos[1]; // l/c/r
        const vCls = v === "t" ? "items-start" : v === "b" ? "items-end" : "items-center";
        const hCls = h === "l" ? "justify-start text-left" : h === "r" ? "justify-end text-right" : "justify-center text-center";
        return (
          <section className="py-4 md:py-8">
            <div className={container}>
              <div className={`relative w-full flex ${vCls} ${hCls}`}>
                {Img}
                <div className={`absolute inset-0 flex ${vCls} ${hCls} p-6 md:p-12 pointer-events-none`}>
                  <div className="bg-brand/70 backdrop-blur-sm text-canvas p-5 md:p-8 max-w-xl pointer-events-auto">
                    {block.eyebrow && <p className="eyebrow text-gold-soft mb-2">{block.eyebrow}</p>}
                    {block.heading && (
                      <h3 className="font-serif text-2xl md:text-3xl mb-3 text-balance">{block.heading}</h3>
                    )}
                    {block.body && <p className={`whitespace-pre-line ${sizeCls} text-canvas/90`}>{block.body}</p>}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }

      const stackVertical = block.position === "top" || block.position === "bottom";
      const flexDir =
        block.position === "left" ? "md:flex-row" :
        block.position === "right" ? "md:flex-row-reverse" :
        block.position === "top" ? "flex-col" :
        "flex-col-reverse";
      return (
        <section className="py-5 md:py-10">
          <div className={container}>
            <div className={`flex ${stackVertical ? "" : "flex-col"} ${flexDir} gap-6 md:gap-10 items-center`}>
              <div className="flex-1 min-w-0 w-full">{Img}</div>
              {TextBlock}
            </div>
          </div>
        </section>
      );
    }

    case "text": {
      const align = block.align === "center" ? "text-center mx-auto" : "";
      return (
        <section className="py-6 md:py-12">
          <div className={`max-w-3xl mx-auto px-4 md:px-8 ${align}`}>
            {block.eyebrow && <p className="eyebrow mb-4">{block.eyebrow}</p>}
            {block.heading && (
              <h2 className="font-serif text-3xl md:text-4xl text-brand text-balance mb-5">
                {block.heading}
              </h2>
            )}
            {block.body && (
              <div className="text-lg text-ink leading-relaxed whitespace-pre-line">
                {block.body}
              </div>
            )}
          </div>
        </section>
      );
    }

    case "video":
      return (
        <>
          {block.title && (
            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
              <SectionTitle title={block.title} />
            </div>
          )}
          <VideoBlock url={block.url} caption={block.caption} />
        </>
      );

    case "pdf":
      return (
        <section className="py-6 md:py-12" style={{ background: block.bg || "var(--brand, #0B1F3A)" }}>
          {block.title && (
            <div className="max-w-6xl mx-auto px-4 md:px-8 pb-6 text-center">
              <h2 className="font-serif text-2xl md:text-4xl text-canvas text-balance">{block.title}</h2>
            </div>
          )}
          <div className="w-full h-[82svh] md:h-[96vh]">
            <Flipbook url={block.url} caption={block.caption} bg={block.bg} />
          </div>
        </section>
      );

    case "columns": {
      const gap = block.gap === "lg" ? "gap-8 md:gap-12" : block.gap === "sm" ? "gap-2 md:gap-4" : "gap-4 md:gap-8";
      const cols = block.cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
      return (
        <section className="py-5 md:py-10">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <SectionTitle title={block.title} />
            <div className={`grid grid-cols-1 ${cols} ${gap} items-start`}>
              {(block.children || []).map((child) => (
                <div key={child.id} className="min-w-0 [&_section]:py-0 [&_section>div]:px-0 [&_section>div]:max-w-none">
                  <BlockView block={child} />
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "module":
      return null;

    case "spacer": {
      const h = block.size === "lg" ? "h-24 md:h-40" : block.size === "md" ? "h-12 md:h-20" : "h-6 md:h-10";
      return <div className={h} aria-hidden />;
    }

    default:
      return null;
  }
}

function SectionTitle({ title }: { title?: string }) {
  if (!title) return null;
  return (
    <div className="mb-4 md:mb-6">
      <h2 className="font-serif text-2xl md:text-4xl text-brand tracking-tight text-balance">{title}</h2>
      <span className="mt-3 block h-px w-16 bg-gold" />
    </div>
  );
}

function VideoBlock({ url, caption }: { url: string; caption?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => setPlay(e.isIntersecting && e.intersectionRatio > 0.4));
      },
      { threshold: [0, 0.4, 0.8] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const isNative = /\.(mp4|webm|mov|m4v)($|\?)/i.test(url) || /supabase\.co\/storage\//.test(url);
  if (isNative) {
    return <NativeVideoBlock url={url} caption={caption} />;
  }
  const base = toVideoEmbed(url);
  const sep = base.includes("?") ? "&" : "?";
  const src = `${base}${sep}autoplay=${play ? 1 : 0}&mute=1&muted=1&playsinline=1&loop=1`;
  return (
    <section className="py-8 md:py-14">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div ref={ref} className="aspect-video bg-black">
          <iframe
            src={src}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            title={caption || "video"}
          />
        </div>
        {caption && (
          <p className="mt-3 text-xs text-ink-muted uppercase tracking-widest text-center">
            {caption}
          </p>
        )}
      </div>
    </section>
  );
}

function NativeVideoBlock({ url, caption }: { url: string; caption?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.4) {
            el.play().catch(() => {});
          } else {
            el.pause();
          }
        });
      },
      { threshold: [0, 0.4, 0.8] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section className="py-8 md:py-14">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div
          className="relative bg-black overflow-hidden group"
          onMouseEnter={() => videoRef.current?.play().catch(() => {})}
          onMouseLeave={() => videoRef.current?.pause()}
        >
          <video
            ref={videoRef}
            src={url}
            className="w-full h-auto block"
            muted
            loop
            playsInline
            preload="auto"
            controls
          />
        </div>
        {caption && (
          <p className="mt-3 text-xs text-ink-muted uppercase tracking-widest text-center">
            {caption}
          </p>
        )}
      </div>
    </section>
  );
}