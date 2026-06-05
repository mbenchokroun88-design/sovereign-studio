import { useCallback, useEffect, useMemo, useRef, useState, forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
const HTMLFlipBookAny = HTMLFlipBook as any;
import { Loader2, Maximize2, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
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

interface FlipbookProps {
  url: string;
  caption?: string;
}

const Page = forwardRef<HTMLDivElement, { src?: string; idx: number; total: number }>(
  ({ src, idx, total }, ref) => (
    <div ref={ref} className="bg-white relative overflow-hidden">
      {src ? (
        <img
          src={src}
          alt={`Page ${idx + 1}`}
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full grid place-items-center text-brand/40">
          <Loader2 className="animate-spin" />
        </div>
      )}
      <span className="absolute bottom-2 right-3 text-[10px] text-brand/40 font-mono">
        {idx + 1} / {total}
      </span>
    </div>
  ),
);
Page.displayName = "Page";

export function Flipbook({ url, caption }: FlipbookProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<any>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [aspect, setAspect] = useState(0.707); // A4 portrait default w/h
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  const isDrive = useMemo(() => isDriveUrl(url), [url]);

  // Render PDF pages via pdf.js (non-Drive URLs)
  useEffect(() => {
    if (isDrive || !url) return;
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await loadPdfJs();
        const loadingTask = pdfjs.getDocument({ url, withCredentials: false });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        const total = pdf.numPages;
        setProgress({ done: 0, total });
        // First page detects aspect
        const first = await pdf.getPage(1);
        const v = first.getViewport({ scale: 1 });
        if (!cancelled) setAspect(v.width / v.height);

        const rendered: string[] = new Array(total);
        const SCALE = 1.5;
        for (let i = 1; i <= total; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: SCALE });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
          rendered[i - 1] = canvas.toDataURL("image/jpeg", 0.82);
          if (!cancelled) {
            setPages([...rendered]);
            setProgress({ done: i, total });
          }
        }
      } catch (e: any) {
        console.error("[flipbook] failed", e);
        if (!cancelled) setError(e?.message || "Impossible de charger le PDF");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url, isDrive]);

  const toggleFullscreen = useCallback(async () => {
    const el = wrapRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
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

  // Drive fallback: classic iframe preview
  if (isDrive) {
    return (
      <div ref={wrapRef} className="w-full h-full flex flex-col items-center justify-center gap-4 px-2 md:px-8">
        <div className="flex items-center gap-2 text-canvas/70 text-[10px] uppercase tracking-[0.3em]">
          <span>{caption || "Document"}</span>
          <span className="opacity-40">·</span>
          <span>Aperçu Drive</span>
        </div>
        <div className="relative w-full max-w-5xl aspect-[16/10] shadow-2xl">
          <iframe src={toDrivePreview(url)} className="w-full h-full bg-white" title={caption || "Document"} allow="autoplay" />
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="text-[10px] uppercase tracking-[0.3em] text-canvas/60 hover:text-gold inline-flex items-center gap-2">
          <ExternalLink size={12} /> Ouvrir
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full grid place-items-center text-canvas/70 px-6 text-center">
        <div>
          <p className="font-serif text-2xl text-gold mb-2">Lecture impossible</p>
          <p className="text-sm opacity-70 mb-4">{error}</p>
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-canvas/30 px-4 py-2 text-xs uppercase tracking-widest hover:bg-gold hover:text-brand hover:border-gold">
            <ExternalLink size={12} /> Ouvrir l'original
          </a>
        </div>
      </div>
    );
  }

  // Responsive sizing — large by default, fills viewport in fullscreen
  const [vp, setVp] = useState({ w: 1200, h: 800 });
  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  // Target ~88vh; on mobile single page, on desktop spread (×2 width)
  const isMobile = vp.w < 900;
  const maxH = Math.min(vp.h * (fullscreen ? 0.92 : 0.86), 1100);
  const maxW = Math.min(vp.w * (fullscreen ? 0.94 : 0.9), 1600);
  // For spread (2 pages), total width = 2 × pageW. Constrain by width.
  const wantedSpreadW = maxH * aspect * (isMobile ? 1 : 2);
  const finalSpreadW = Math.min(wantedSpreadW, maxW);
  const pageHeight = Math.round(finalSpreadW / (isMobile ? 1 : 2) / aspect);
  const pageWidth = Math.round(pageHeight * aspect);

  const loadingPct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div ref={wrapRef} className="w-full h-full flex flex-col items-center justify-center gap-4 px-2 md:px-6 bg-brand">
      <div className="flex items-center gap-3 text-canvas/80 text-[10px] uppercase tracking-[0.3em]">
        <span>{caption || "Document"}</span>
        <span className="opacity-40">·</span>
        <span>{progress.done > 0 ? `${progress.done}/${progress.total} pages` : "Préparation…"}</span>
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center">
        {/* Ambient gold glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className="w-3/4 h-3/4 rounded-full bg-gold/10 blur-[120px]" />
        </div>

        {pages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 text-canvas/70">
            <Loader2 className="animate-spin text-gold" size={36} />
            <div className="w-48 h-px bg-canvas/15 overflow-hidden">
              <div className="h-full bg-gold transition-all" style={{ width: `${loadingPct}%` }} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em]">Ouverture du livre — {loadingPct}%</span>
          </div>
        ) : (
          <div className="book-shadow" style={{ perspective: "2400px" }}>
            <HTMLFlipBookAny
              ref={bookRef}
              width={pageWidth}
              height={pageHeight}
              size="stretch"
              minWidth={280}
              maxWidth={1100}
              minHeight={420}
              maxHeight={1400}
              maxShadowOpacity={0.7}
              showCover={true}
              mobileScrollSupport={true}
              drawShadow={true}
              flippingTime={900}
              usePortrait={isMobile}
              startZIndex={0}
              autoSize={true}
              clickEventForward={true}
              useMouseEvents={true}
              swipeDistance={20}
              showPageCorners={true}
              disableFlipByClick={false}
              className=""
              style={{}}
              startPage={0}
              onFlip={(e: any) => setPageIndex(e.data)}
            >
              {pages.map((src, i) => (
                <Page key={i} src={src} idx={i} total={pages.length} />
              ))}
            </HTMLFlipBookAny>
          </div>
        )}
      </div>

      {pages.length > 0 && (
        <div className="flex items-center gap-3">
          <button onClick={() => bookRef.current?.pageFlip()?.flipPrev()} className="size-9 grid place-items-center border border-canvas/30 text-canvas hover:bg-gold hover:text-brand hover:border-gold" aria-label="Page précédente">
            <ChevronLeft size={16} />
          </button>
          <span className="text-[10px] uppercase tracking-[0.3em] text-canvas/60 min-w-[80px] text-center">
            {pageIndex + 1} / {pages.length}
          </span>
          <button onClick={() => bookRef.current?.pageFlip()?.flipNext()} className="size-9 grid place-items-center border border-canvas/30 text-canvas hover:bg-gold hover:text-brand hover:border-gold" aria-label="Page suivante">
            <ChevronRight size={16} />
          </button>
          <span className="mx-2 opacity-30 text-canvas">|</span>
          <button onClick={toggleFullscreen} className="inline-flex items-center gap-2 border border-canvas/30 text-canvas px-3 py-2 text-[10px] uppercase tracking-[0.3em] hover:bg-gold hover:text-brand hover:border-gold">
            <Maximize2 size={12} /> {fullscreen ? "Quitter" : "Plein écran"}
          </button>
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-canvas/60 hover:text-gold">
            <ExternalLink size={12} /> Original
          </a>
        </div>
      )}
    </div>
  );
}