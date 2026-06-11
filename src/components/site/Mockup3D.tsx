import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isDriveUrl, toDriveImage, type MockupTemplate } from "@/lib/store/projects";

interface Props {
  template: MockupTemplate;
  views: string[]; // au moins 1
  caption?: string;
  auto?: boolean;
  size?: "thumb" | "full";
}

function resolveUrl(u: string) {
  return isDriveUrl(u) ? toDriveImage(u) : u;
}

function useRotator(count: number, auto: boolean, interval = 4200) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!auto || paused || count < 2) return;
    const id = setInterval(() => setI((x) => (x + 1) % count), interval);
    return () => clearInterval(id);
  }, [auto, paused, count, interval]);
  return {
    index: Math.min(i, Math.max(count - 1, 0)),
    setIndex: setI,
    next: () => setI((x) => (x + 1) % count),
    prev: () => setI((x) => (x - 1 + count) % count),
    pause: () => setPaused(true),
    resume: () => setPaused(false),
  };
}

export function Mockup3D({ template, views, caption, auto = false, size = "thumb" }: Props) {
  const safeViews = views.filter(Boolean);
  const list = safeViews.length ? safeViews : [""];
  const r = useRotator(list.length, auto);
  const current = resolveUrl(list[r.index] || "");

  return (
    <div
      className="relative w-full h-full grid place-items-center overflow-hidden select-none"
      onMouseEnter={r.pause}
      onMouseLeave={r.resume}
    >
      {/* fond ambient */}
      <div className="absolute inset-0 bg-gradient-to-br from-canvas via-white to-muted" />
      <div className="absolute inset-0 opacity-40 mockup-wall" />

      <div className="relative z-10 w-full h-full grid place-items-center p-4">
        <Scene template={template} url={current} viewIndex={r.index} size={size} />
      </div>

      {list.length > 1 && size === "full" && (
        <>
          <button
            onClick={r.prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-canvas/90 backdrop-blur grid place-items-center text-brand hover:bg-gold hover:text-brand-foreground transition-colors z-20"
            aria-label="Vue précédente"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={r.next}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-canvas/90 backdrop-blur grid place-items-center text-brand hover:bg-gold hover:text-brand-foreground transition-colors z-20"
            aria-label="Vue suivante"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {list.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {list.map((_, k) => (
            <button
              key={k}
              onClick={() => r.setIndex(k)}
              aria-label={`Vue ${k + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                k === r.index ? "bg-brand w-6" : "bg-brand/30 w-1.5 hover:bg-brand/60"
              }`}
            />
          ))}
        </div>
      )}

      {caption && size === "full" && (
        <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs text-ink-muted uppercase tracking-widest z-20">
          {caption}
        </p>
      )}
    </div>
  );
}

// =================== SCENES ===================

function Scene({
  template,
  url,
  viewIndex,
  size,
}: {
  template: MockupTemplate;
  url: string;
  viewIndex: number;
  size: "thumb" | "full";
}) {
  switch (template) {
    case "magazine":
      return <MagazineScene url={url} viewIndex={viewIndex} size={size} />;
    case "rollup":
      return <RollupScene url={url} viewIndex={viewIndex} size={size} />;
    case "poster":
      return <PosterScene url={url} viewIndex={viewIndex} size={size} />;
    case "badge":
    case "card":
      return <SmallScene url={url} viewIndex={viewIndex} ratio={template === "badge" ? "3/4" : "16/10"} size={size} />;
    case "flyer":
      return <SmallScene url={url} viewIndex={viewIndex} ratio="3/4" size={size} />;
    case "banner":
      return <SmallScene url={url} viewIndex={viewIndex} ratio="21/9" size={size} />;
    default:
      return null;
  }
}

// ------------- MAGAZINE A4 OUVERT -------------
function MagazineScene({ url, viewIndex, size }: { url: string; viewIndex: number; size: "thumb" | "full" }) {
  // 4 angles : 0 face, 1 incliné gauche, 2 droit, 3 vue rasante
  const angles = [
    { ry: -18, rx: 12, tz: 0 },
    { ry: -32, rx: 8, tz: -20 },
    { ry: -8, rx: 22, tz: -10 },
    { ry: -24, rx: 28, tz: -30 },
  ];
  const a = angles[viewIndex % angles.length];
  const scale = size === "full" ? 1 : 0.85;

  return (
    <div className="mockup-stage w-full h-full grid place-items-center">
      <div
        className="mockup-ease mockup-float relative"
        style={
          {
            transform: `scale(${scale}) rotateX(${a.rx}deg) rotateY(${a.ry}deg) translateZ(${a.tz}px)`,
            transformStyle: "preserve-3d",
            ["--rx" as any]: `${a.rx}deg`,
            ["--ry" as any]: `${a.ry}deg`,
            width: size === "full" ? "min(720px, 80%)" : "92%",
            aspectRatio: "2 / 1.414",
          } as React.CSSProperties
        }
      >
        {/* page gauche */}
        <div className="absolute inset-y-0 left-0 w-1/2 mockup-paper-edge overflow-hidden bg-white"
             style={{ transformOrigin: "right center", transform: "rotateY(8deg)" }}>
          {url && <img src={url} alt="" className="w-[200%] h-full object-cover object-left" draggable={false} />}
        </div>
        {/* page droite */}
        <div className="absolute inset-y-0 right-0 w-1/2 mockup-paper-edge overflow-hidden bg-white"
             style={{ transformOrigin: "left center", transform: "rotateY(-8deg)" }}>
          {url && <img src={url} alt="" className="w-[200%] h-full object-cover object-right -ml-[100%]" draggable={false} />}
        </div>
        {/* pli central */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 mockup-spine pointer-events-none" />

        {/* ombre au sol */}
        <div
          className="absolute left-1/2 -translate-x-1/2 mockup-shadow-floor"
          style={{
            top: "100%",
            marginTop: 24,
            width: "85%",
            height: 36,
            transform: "rotateX(60deg)",
          }}
        />
      </div>
    </div>
  );
}

// ------------- ROLL-UP -------------
function RollupScene({ url, viewIndex, size }: { url: string; viewIndex: number; size: "thumb" | "full" }) {
  const angles = [
    { ry: -4, rx: 4 },
    { ry: -22, rx: 6 },
    { ry: 18, rx: 6 },
  ];
  const a = angles[viewIndex % angles.length];
  const scale = size === "full" ? 1 : 0.78;

  return (
    <div className="mockup-stage w-full h-full grid place-items-center">
      <div
        className="mockup-ease mockup-float relative flex flex-col items-center"
        style={
          {
            transform: `scale(${scale}) rotateX(${a.rx}deg) rotateY(${a.ry}deg)`,
            transformStyle: "preserve-3d",
            ["--rx" as any]: `${a.rx}deg`,
            ["--ry" as any]: `${a.ry}deg`,
            height: size === "full" ? "min(620px, 85%)" : "88%",
            aspectRatio: "85 / 200",
          } as React.CSSProperties
        }
      >
        {/* tube haut */}
        <div className="w-[110%] h-1.5 rounded-full bg-gradient-to-b from-gray-300 to-gray-500 shadow-md" />
        {/* bannière */}
        <div className="flex-1 w-full mockup-paper-edge overflow-hidden bg-white relative">
          {url && <img src={url} alt="" className="w-full h-full object-cover" draggable={false} />}
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/10 pointer-events-none" />
        </div>
        {/* pied */}
        <div className="relative w-[140%] h-2">
          <div className="absolute inset-x-0 top-0 h-2 rounded-b-lg bg-gradient-to-b from-gray-400 to-gray-600 shadow-lg" />
        </div>
        {/* ombre */}
        <div
          className="absolute left-1/2 -translate-x-1/2 mockup-shadow-floor"
          style={{ top: "100%", marginTop: 18, width: "180%", height: 28, transform: "rotateX(70deg)" }}
        />
      </div>
    </div>
  );
}

// ------------- AFFICHE MURALE -------------
function PosterScene({ url, viewIndex, size }: { url: string; viewIndex: number; size: "thumb" | "full" }) {
  const angles = [
    { ry: -2, rx: 0, s: 1 },
    { ry: -22, rx: 4, s: 0.95 },
    { ry: 4, rx: -2, s: 1.08 },
  ];
  const a = angles[viewIndex % angles.length];
  const scale = (size === "full" ? 1 : 0.85) * a.s;

  return (
    <div className="mockup-stage w-full h-full grid place-items-center">
      <div
        className="mockup-ease mockup-float relative"
        style={
          {
            transform: `scale(${scale}) rotateX(${a.rx}deg) rotateY(${a.ry}deg)`,
            transformStyle: "preserve-3d",
            ["--rx" as any]: `${a.rx}deg`,
            ["--ry" as any]: `${a.ry}deg`,
            height: size === "full" ? "min(560px, 80%)" : "85%",
            aspectRatio: "2 / 3",
          } as React.CSSProperties
        }
      >
        {/* cadre */}
        <div className="absolute inset-0 p-2 bg-gradient-to-br from-white to-gray-100 mockup-paper-edge">
          <div className="w-full h-full overflow-hidden bg-white">
            {url && <img src={url} alt="" className="w-full h-full object-cover" draggable={false} />}
          </div>
        </div>
        {/* reflet vitré */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.18) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.08) 100%)" }} />
      </div>
    </div>
  );
}

// ------------- BADGE / FLYER / BANNER / CARTE -------------
function SmallScene({
  url,
  viewIndex,
  ratio,
  size,
}: {
  url: string;
  viewIndex: number;
  ratio: string;
  size: "thumb" | "full";
}) {
  const angles = [
    { ry: -12, rx: 14 },
    { ry: 16, rx: 10 },
    { ry: -28, rx: 18 },
  ];
  const a = angles[viewIndex % angles.length];
  const scale = size === "full" ? 1 : 0.88;

  return (
    <div className="mockup-stage w-full h-full grid place-items-center">
      <div
        className="mockup-ease mockup-float relative mockup-paper-edge overflow-hidden bg-white"
        style={
          {
            transform: `scale(${scale}) rotateX(${a.rx}deg) rotateY(${a.ry}deg)`,
            transformStyle: "preserve-3d",
            ["--rx" as any]: `${a.rx}deg`,
            ["--ry" as any]: `${a.ry}deg`,
            width: size === "full" ? "min(520px, 75%)" : "82%",
            aspectRatio: ratio,
          } as React.CSSProperties
        }
      >
        {url && <img src={url} alt="" className="w-full h-full object-cover" draggable={false} />}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "linear-gradient(120deg, rgba(255,255,255,0.25) 0%, transparent 35%, transparent 70%, rgba(0,0,0,0.08) 100%)" }} />
        <div
          className="absolute left-1/2 -translate-x-1/2 mockup-shadow-floor"
          style={{ top: "100%", marginTop: 18, width: "85%", height: 22, transform: "rotateX(65deg)" }}
        />
      </div>
    </div>
  );
}