import { useEffect, useRef, useState } from "react";
import { isDriveUrl, toDriveImage, toVideoEmbed, type LayoutBlock, type MediaItem } from "@/lib/store/projects";
import { Flipbook } from "@/components/site/Flipbook";
import { Mockup3D } from "@/components/site/Mockup3D";
import { CinematicCarousel } from "@/components/site/CinematicCarousel";

function resolve(u: string) {
  return isDriveUrl(u) ? toDriveImage(u) : u;
}

export function ProjectBlocks({ blocks }: { blocks: LayoutBlock[] }) {
  return (
    <div className="bg-white">
      {blocks.map((b) => (
        <BlockView key={b.id} block={b} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: LayoutBlock }) {
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
            <img src={src} alt={block.caption || ""} className="w-full h-auto block object-contain" />
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
        return <section className="py-6 md:py-10 px-4 md:px-0">{inner}</section>;
      }
      if (block.width === "wide") {
        return (
          <section className="py-8 md:py-14">
            <div className="max-w-6xl mx-auto px-4 md:px-8">{inner}</div>
          </section>
        );
      }
      return (
        <section className="py-10 md:py-16 bg-canvas">
          <div className="max-w-4xl mx-auto px-4 md:px-8">{inner}</div>
        </section>
      );
    }

    case "gallery": {
      const urls = block.urls.filter(Boolean);
      if (block.variant === "cinematic" && urls.length > 0) {
        const items: MediaItem[] = urls.map((u) => ({ slot: "other", kind: "image", url: u }));
        return (
          <section className="py-8 md:py-14">
            <div className="max-w-6xl mx-auto px-2 md:px-8">
              <CinematicCarousel media={items} onOpen={() => {}} />
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
        <section className="py-8 md:py-14">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className={`grid grid-cols-1 ${cols} gap-4 md:gap-6`}>
              {urls.map((u, i) => (
                <div key={i} className="bg-muted overflow-hidden flex items-center justify-center">
                  <img src={resolve(u)} alt="" className="w-full h-auto block object-contain" />
                </div>
              ))}
            </div>
            {block.caption && (
              <p className="mt-4 text-xs text-ink-muted uppercase tracking-widest text-center">
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
        <img src={src} alt={block.heading || ""} className="w-full h-auto block object-contain" />
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
          <section className="py-8 md:py-14">
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
        <section className="py-10 md:py-16">
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
        <section className="py-12 md:py-20">
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
      return <VideoBlock url={block.url} caption={block.caption} />;

    case "pdf":
      return (
        <section className="py-8 md:py-14">
          <div className="max-w-5xl mx-auto px-4 md:px-8 min-h-[70vh]">
            <Flipbook url={block.url} caption={block.caption} />
          </div>
        </section>
      );

    case "spacer": {
      const h = block.size === "lg" ? "h-24 md:h-40" : block.size === "md" ? "h-12 md:h-20" : "h-6 md:h-10";
      return <div className={h} aria-hidden />;
    }

    default:
      return null;
  }
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