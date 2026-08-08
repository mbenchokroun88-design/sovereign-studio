import { useMemo, useRef, useState } from "react";
import { Lightbox } from "@/components/site/Lightbox";

export type ViewMode = "custom" | "auto" | "collage" | "mosaic" | "random" | "gallery";

export const VIEW_LABELS: Record<ViewMode, string> = {
  custom: "Personnalisé",
  auto: "Automatique",
  collage: "Collage",
  mosaic: "Mosaïque",
  random: "Aléatoire",
  gallery: "Galerie",
};

function shuffle<T>(arr: T[], seed = 1): T[] {
  const a = [...arr];
  let s = seed * 9301 + 49297;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Renders a project's images in the layout the visitor picked. */
export function ProjectImageLayouts({ images, mode }: { images: string[]; mode: ViewMode }) {
  const [idx, setIdx] = useState(-1);
  const [seed] = useState(() => Math.floor(Math.random() * 999) + 1);
  const list = useMemo(() => (mode === "random" ? shuffle(images, seed) : images), [images, mode, seed]);
  const railRef = useRef<HTMLDivElement>(null);

  if (list.length === 0) return null;

  const Img = ({ src, className, i }: { src: string; className?: string; i: number }) => (
    <img
      src={src}
      alt=""
      loading="lazy"
      draggable={false}
      onClick={() => setIdx(images.indexOf(src) >= 0 ? images.indexOf(src) : i)}
      className={`cursor-zoom-in transition-transform duration-500 hover:scale-[1.02] ${className || ""}`}
    />
  );

  let body: React.ReactNode = null;

  if (mode === "gallery") {
    // Mobile: swipeable full-width rail. Desktop: clean stacked column.
    body = (
      <>
        <div
          ref={railRef}
          className="md:hidden flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain touch-pan-x scrollbar-none gap-3 px-4"
        >
          {list.map((u, i) => (
            <div key={i} className="snap-center shrink-0 w-[86vw] bg-muted grid place-items-center">
              <Img src={u} i={i} className="w-full h-auto object-contain" />
            </div>
          ))}
        </div>
        <div className="hidden md:block max-w-5xl mx-auto px-8 space-y-4">
          {list.map((u, i) => (
            <Img key={i} src={u} i={i} className="w-full h-auto block object-contain bg-muted" />
          ))}
        </div>
      </>
    );
  } else if (mode === "mosaic") {
    body = (
      <div className="max-w-6xl mx-auto px-3 md:px-8 columns-2 md:columns-3 gap-2 md:gap-3 [&>*]:mb-2 md:[&>*]:mb-3">
        {list.map((u, i) => (
          <Img key={i} src={u} i={i} className="w-full h-auto block bg-muted" />
        ))}
      </div>
    );
  } else if (mode === "collage") {
    body = (
      <div className="max-w-6xl mx-auto px-3 md:px-8 grid grid-cols-2 md:grid-cols-4 auto-rows-[36vw] md:auto-rows-[15vw] gap-2 md:gap-3">
        {list.map((u, i) => {
          const big = i % 5 === 0;
          const tall = i % 7 === 3;
          return (
            <div
              key={i}
              className={`bg-muted overflow-hidden grid place-items-center ${big ? "col-span-2 row-span-2" : ""} ${tall ? "row-span-2" : ""}`}
            >
              <Img src={u} i={i} className="w-full h-full object-contain" />
            </div>
          );
        })}
      </div>
    );
  } else if (mode === "random") {
    body = (
      <div className="max-w-6xl mx-auto px-3 md:px-8 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
        {list.map((u, i) => (
          <div key={i} className={`bg-muted overflow-hidden ${i % 4 === 0 ? "md:mt-10" : i % 3 === 0 ? "md:-mt-4" : ""}`}>
            <Img src={u} i={i} className="w-full h-auto block object-contain" />
          </div>
        ))}
      </div>
    );
  } else {
    // auto — editorial rhythm: full width, then pairs
    body = (
      <div className="space-y-3 md:space-y-5">
        {list.map((u, i) =>
          i % 3 === 0 ? (
            <div key={i} className="max-w-6xl mx-auto px-3 md:px-8">
              <Img src={u} i={i} className="w-full h-auto block bg-muted object-contain" />
            </div>
          ) : i % 3 === 1 ? (
            <div key={i} className="max-w-6xl mx-auto px-3 md:px-8 grid grid-cols-2 gap-2 md:gap-4">
              <Img src={u} i={i} className="w-full h-auto block bg-muted object-contain" />
              {list[i + 1] && <Img src={list[i + 1]} i={i + 1} className="w-full h-auto block bg-muted object-contain" />}
            </div>
          ) : null,
        )}
      </div>
    );
  }

  return (
    <section className="py-5 md:py-10 bg-white">
      {body}
      {idx >= 0 && <Lightbox images={images} index={idx} onClose={() => setIdx(-1)} onIndex={setIdx} />}
    </section>
  );
}
