import { isDriveUrl, toDriveImage, toVideoEmbed, type LayoutBlock } from "@/lib/store/projects";
import { Flipbook } from "@/components/site/Flipbook";
import { Mockup3D } from "@/components/site/Mockup3D";

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
            <img src={src} alt={block.caption || ""} className="w-full h-auto block" />
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
        return <section className="py-6 md:py-10">{inner}</section>;
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
      const cols = block.columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
      return (
        <section className="py-8 md:py-14">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className={`grid grid-cols-1 ${cols} gap-4 md:gap-6`}>
              {block.urls.filter(Boolean).map((u, i) => (
                <div key={i} className="bg-muted overflow-hidden">
                  <img src={resolve(u)} alt="" className="w-full h-auto block" />
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
      return (
        <section className="py-8 md:py-14">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="aspect-video bg-black">
              <iframe
                src={toVideoEmbed(block.url)}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
                title={block.caption || "video"}
              />
            </div>
            {block.caption && (
              <p className="mt-3 text-xs text-ink-muted uppercase tracking-widest text-center">
                {block.caption}
              </p>
            )}
          </div>
        </section>
      );

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