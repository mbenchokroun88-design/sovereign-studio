import { useEffect, useMemo, useRef, useState, forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
const HTMLFlipBookAny = HTMLFlipBook as any;
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { isDriveUrl, toDrivePreview } from "@/lib/store/projects";

// pdf.js dynamic loader (browser only)
async function loadPdfJs() {
  const pdfjsLib = await import("pdfjs-dist");
  const workerMod: any = await import(
    /* @vite-ignore */ "pdfjs-dist/build/pdf.worker.min.mjs?url"
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerMod.default;
  return pdfjsLib;
}

export type FlipSizeOpt = "sm" | "md" | "lg" | "xl";
export type FlipAnimationOpt = "soft" | "normal" | "snappy";

interface FlipbookProps {
  url: string;
  caption?: string;
  /** Taille du livre à l'écran */
  size?: FlipSizeOpt;
  /** Caractère de l'animation de page */
  animation?: FlipAnimationOpt;
  /** Couleur de fond de la scène */
  bg?: string;
}

const SIZE_FACTOR: Record<FlipSizeOpt, { h: number; w: number }> = {
  sm: { h: 0.62, w: 0.7 },
  md: { h: 0.76, w: 0.84 },
  lg: { h: 0.9, w: 0.96 },
  xl: { h: 0.98, w: 1 },
};

const ANIM: Record<FlipAnimationOpt, { time: number; shadow: number }> = {
  soft: { time: 1300, shadow: 0.4 },
  normal: { time: 900, shadow: 0.55 },
  snappy: { time: 550, shadow: 0.65 },
};

/** A single leaf of the book. Blank leaves keep the spread even so the book closes centred. */
const Page = forwardRef<HTMLDivElement, { src?: string | null }>(({ src }, ref) => (
  <div ref={ref} className="bg-white relative overflow-hidden">
    {src ? (
      <img
        src={src}
        alt=""
        className="w-full h-full object-contain select-none pointer-events-none"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
      />
    ) : (
      <div className="w-full h-full bg-white" />
    )}
    {/* subtle inner spine shading */}
    <span className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/10 to-transparent" />
  </div>
));
Page.displayName = "Page";

export function Flipbook({ url, caption, size = "lg", animation = "normal", bg }: FlipbookProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<any>(null);
  const drag = useRef<{ x: number; y: number; t: number } | null>(null);
  const [pages, setPages] = useState<(string | null)[]>([]);
  const [aspect, setAspect] = useState(0.707);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [vp, setVp] = useState({ w: 1280, h: 860 });

  const isDrive = useMemo(() => isDriveUrl(url), [url]);

  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  useEffect(() => {
    if (isDrive || !url) return;
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await loadPdfJs();
        const pdf = await pdfjs.getDocument({ url, withCredentials: false }).promise;
        if (cancelled) return;
        const total = pdf.numPages;
        setProgress({ done: 0, total });
        const first = await pdf.getPage(1);
        const v = first.getViewport({ scale: 1 });
        if (!cancelled) setAspect(v.width / v.height);

        const rendered: (string | null)[] = new Array(total);
        const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
        const wide = typeof window !== "undefined" && window.innerWidth >= 900;
        const SCALE = Math.min((wide ? 2.1 : 1.5) * dpr, 3.4);
        for (let i = 1; i <= total; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: SCALE });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
          rendered[i - 1] = canvas.toDataURL("image/jpeg", 0.92);
          if (!cancelled) {
            setPages([...rendered]);
            setProgress({ done: i, total });
          }
        }
      } catch (e: any) {
        console.error("[flipbook] failed", e);
        if (!cancelled) setError(e?.message || "Impossible de charger le document");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url, isDrive]);

  // Drive fallback: inline preview, no download chrome
  if (isDrive) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 px-2 md:px-8">
        <div className="relative w-full max-w-6xl aspect-[16/10] shadow-2xl">
          <iframe src={toDrivePreview(url)} className="w-full h-full bg-white" title={caption || "Document"} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full grid place-items-center text-canvas/70 px-6 text-center">
        <div>
          <p className="font-serif text-2xl text-gold mb-2">Lecture impossible</p>
          <p className="text-sm opacity-70">{error}</p>
        </div>
      </div>
    );
  }

  // Keep the leaf count even so the closing back cover sits centred like the front cover.
  const leaves: (string | null)[] = pages.length % 2 === 0 ? pages : [...pages, null];

  // Sizing: the book owns the page. Portrait (single, centred) on phones, spread on desktop.
  const isMobile = vp.w < 900;
  const factor = SIZE_FACTOR[size] ?? SIZE_FACTOR.lg;
  const maxH = Math.min(vp.h * (isMobile ? Math.min(factor.h, 0.8) : factor.h), 1400);
  const maxW = vp.w * (isMobile ? 0.94 : factor.w);
  const spreadFactor = isMobile ? 1 : 2;
  const byHeight = maxH * aspect * spreadFactor;
  const spreadW = Math.min(byHeight, maxW);
  const pageWidth = Math.round(spreadW / spreadFactor);
  const pageHeight = Math.round(pageWidth / aspect);

  const loadingPct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  const flip = (dir: 1 | -1) => {
    const pf = bookRef.current?.pageFlip?.();
    if (!pf) return;
    if (dir === 1) pf.flipNext("top");
    else pf.flipPrev("top");
  };

  return (
    <div
      ref={wrapRef}
      className="w-full h-full flex flex-col items-center justify-center gap-5 select-none"
      style={{ background: bg || "var(--brand, #0B1F3A)" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="relative flex-1 w-full flex items-center justify-center touch-pan-y"
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY, t: Date.now() };
        }}
        onPointerUp={(e) => {
          const start = drag.current;
          drag.current = null;
          if (!start) return;
          const dx = e.clientX - start.x;
          const dy = e.clientY - start.y;
          // Glissement horizontal depuis n'importe quel endroit de la page
          if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
            flip(dx < 0 ? 1 : -1);
            return;
          }
          // Simple tap / clic : moitié droite = page suivante
          if (Math.abs(dx) < 12 && Math.abs(dy) < 12 && Date.now() - start.t < 600) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            flip(e.clientX - rect.left > rect.width / 2 ? 1 : -1);
          }
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className="w-3/4 h-3/4 rounded-full bg-gold/10 blur-[140px]" />
        </div>

        {leaves.length === 0 ? (
          <div className="flex flex-col items-center gap-4 text-canvas/70">
            <Loader2 className="animate-spin text-gold" size={36} />
            <div className="w-48 h-px bg-canvas/15 overflow-hidden">
              <div className="h-full bg-gold transition-all" style={{ width: `${loadingPct}%` }} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em]">Ouverture du livre — {loadingPct}%</span>
          </div>
        ) : (
          <div className="book-shadow" style={{ perspective: "3000px" }}>
            <HTMLFlipBookAny
              ref={bookRef}
              width={pageWidth}
              height={pageHeight}
              size="fixed"
              maxShadowOpacity={ANIM[animation].shadow}
              showCover
              usePortrait={isMobile}
              mobileScrollSupport={false}
              drawShadow
              flippingTime={ANIM[animation].time}
              startZIndex={10}
              autoSize={false}
              useMouseEvents={false}
              clickEventForward={false}
              showPageCorners={false}
              startPage={0}
              onInit={() => {
                // La couverture est « dure » par défaut : on la rend souple
                // pour qu'elle s'ouvre comme les pages intérieures.
                try {
                  const pf = bookRef.current?.pageFlip?.();
                  if (!pf) return;
                  const n = pf.getPageCount();
                  for (let i = 0; i < n; i++) pf.getPage(i)?.setDensity("soft");
                  pf.update();
                } catch {
                  /* ignore */
                }
              }}
            >
              {leaves.map((src, i) => (
                <Page key={i} src={src} />
              ))}
            </HTMLFlipBookAny>
          </div>
        )}
      </div>

      {leaves.length > 0 && (
        <div className="flex items-center gap-4 pb-1">
          <button
            onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
            className="size-11 grid place-items-center border border-canvas/25 text-canvas hover:bg-gold hover:text-brand hover:border-gold transition-colors"
            aria-label="Page précédente"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[10px] uppercase tracking-[0.3em] text-canvas/45">Feuilleter</span>
          <button
            onClick={() => bookRef.current?.pageFlip()?.flipNext()}
            className="size-11 grid place-items-center border border-canvas/25 text-canvas hover:bg-gold hover:text-brand hover:border-gold transition-colors"
            aria-label="Page suivante"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
