import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, BookOpen } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  CATEGORY_LABELS,
  isDriveUrl,
  newBlockId,
  toDriveImage,
  useProjects,
  DEFAULT_PROJECT_SETTINGS,
  type LayoutBlock,
} from "@/lib/store/projects";
import { ProjectBlocks } from "@/components/site/ProjectBlocks";
import { Flipbook } from "@/components/site/Flipbook";
import {
  ProjectImageLayouts,
  VIEW_LABELS,
  type ViewMode,
} from "@/components/site/ProjectImageLayouts";

export const Route = createFileRoute("/portfolio/$slug")({
  component: ProjectDetail,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-x py-32 text-center">
        <p className="eyebrow mb-4">404</p>
        <h1 className="font-serif text-4xl text-brand">Projet introuvable</h1>
        <Link to="/portfolio" className="mt-6 inline-block text-sm text-gold gold-underline">
          ← Retour au portfolio
        </Link>
      </div>
    </SiteLayout>
  ),
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { projects, getBySlug, isLoading } = useProjects();
  const project = getBySlug(slug);
  const isMobile = useIsMobile();
  const s = { ...DEFAULT_PROJECT_SETTINGS, ...(project?.settings ?? {}) };
  const defaultView = ((isMobile ? s.viewMobile : s.view) || "custom") as ViewMode;
  const [chosen, setChosen] = useState<ViewMode | null>(null);
  const view = chosen ?? defaultView;
  const setView = (v: ViewMode) => setChosen(v);

  // Related: all categories, shuffled — so a report visitor also discovers events, 3D, video…
  const related = useMemo(() => {
    const pool = projects.filter((p) => p.id !== project?.id);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length, project?.id]);

  if (!project && !isLoading) throw notFound();
  if (!project) {
    return (
      <SiteLayout>
        <div className="container-x py-32 text-center text-ink-muted text-sm">Chargement…</div>
      </SiteLayout>
    );
  }

  const cover = project.cover && isDriveUrl(project.cover) ? toDriveImage(project.cover) : project.cover;

  // Split PDF blocks out of the flow: they get a dedicated flipbook section at the end.
  const rawBlocks = project.blocks ?? [];
  const pdfBlocks = rawBlocks.filter((b) => b.type === "pdf" && b.url) as Extract<LayoutBlock, { type: "pdf" }>[];
  const flowBlocks = rawBlocks.filter((b) => b.type !== "pdf");

  // The cover is also the opening image of the gallery, not just a header background.
  const coverAlreadyInFlow = flowBlocks.some(
    (b) =>
      (b.type === "image" && b.url === project.cover) ||
      (b.type === "gallery" && b.urls?.includes(project.cover)) ||
      (b.type === "text_image" && b.url === project.cover),
  );
  const blocks: LayoutBlock[] = project.cover && !coverAlreadyInFlow
    ? [{ id: newBlockId(), type: "image", url: project.cover, width: "wide" }, ...flowBlocks]
    : flowBlocks;

  // Flat list of every image in the project — used by the alternative views.
  const allImages: string[] = [];
  const push = (u: string) => {
    if (u) allImages.push(isDriveUrl(u) ? toDriveImage(u) : u);
  };
  for (const raw of blocks) {
    const b = raw as any;
    if (b.type === "image" && (!b.mockup || b.mockup === "none")) push(b.url);
    else if (b.type === "gallery") for (const u of b.urls ?? []) push(u);
    else if (b.type === "text_image") push(b.url);
  }
  const uniqueImages = Array.from(new Set(allImages));
  const viewModes: ViewMode[] = ["custom", "auto", "collage", "mosaic", "random", "gallery"];

  return (
    <SiteLayout>
      <article>
        {/* HERO — full-bleed visual */}
        <header className="relative bg-brand text-canvas overflow-hidden">
          {cover && (
            <div className="absolute inset-0">
              <img src={cover} alt="" className="w-full h-full object-cover opacity-25" />
              <div className="absolute inset-0 bg-brand/70" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/70 to-brand/50" />
            </div>
          )}
          <div className="relative container-x pt-8 pb-14 md:pt-16 md:pb-28 min-h-[52svh] md:min-h-[62vh] flex flex-col justify-between">
            <Link to="/portfolio" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold hover:text-gold-soft w-fit">
              <ArrowLeft size={14} /> Retour à l'index
            </Link>
            <div className="mt-12 md:mt-24 max-w-5xl">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="text-[10px] uppercase tracking-[0.25em] text-gold-soft bg-brand/40 backdrop-blur px-3 py-1.5 border border-gold/30">
                  {CATEGORY_LABELS[project.category]}
                </span>
                {project.year && (
                  <span className="text-[10px] uppercase tracking-[0.25em] text-canvas/70">{project.year}</span>
                )}
              </div>
              <h1 className="font-serif text-[10vw] sm:text-6xl md:text-8xl leading-[0.92] tracking-tight text-balance">
                {project.title}
              </h1>
              {project.client && (
                <p className="mt-6 md:mt-8 text-base md:text-xl text-canvas/80 font-light">
                  Pour <span className="italic text-gold">{project.client}</span>
                </p>
              )}
              {s.showSummary && project.summary && (
                <p className="mt-6 text-sm md:text-base text-canvas/70 max-w-2xl leading-relaxed">
                  {project.summary}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* VIEW SWITCHER */}
        {s.allowViewSwitch && uniqueImages.length > 1 && (
          <div className="bg-white border-b border-brand/10 sticky top-0 z-30">
            <div className="max-w-6xl mx-auto px-3 md:px-8 py-3 flex gap-2 overflow-x-auto scrollbar-none">
              {viewModes.map((m) => (
                <button
                  key={m}
                  onClick={() => setView(m)}
                  className={`shrink-0 text-[10px] md:text-[11px] uppercase tracking-[0.2em] px-3 py-2 border transition-colors ${
                    view === m
                      ? "bg-brand text-canvas border-brand"
                      : "border-brand/20 text-ink-muted hover:border-brand/60 hover:text-brand"
                  }`}
                >
                  {VIEW_LABELS[m]}
                </button>
              ))}
            </div>
          </div>
        )}

        {view === "custom" || uniqueImages.length <= 1 ? (
          blocks.length > 0 && <ProjectBlocks blocks={blocks} />
        ) : (
          <ProjectImageLayouts images={uniqueImages} mode={view} />
        )}

        {/* VOIR LE PROJET EN ENTIER — flipbook for documents / reports */}
        {pdfBlocks.map((b, i) => (
          <section key={b.id} className="bg-brand text-canvas border-t border-canvas/10">
            <div className="container-x pt-14 md:pt-20 pb-8 text-center">
              <p className="eyebrow text-gold-soft mb-4 inline-flex items-center gap-2 justify-center">
                <BookOpen size={13} />
                {pdfBlocks.length > 1 ? `Document ${i + 1}` : "Document complet"}
              </p>
              <h2 className="font-serif text-3xl md:text-5xl leading-tight">
                Voir le projet <span className="italic text-gold">en entier</span>
              </h2>
              <p className="mt-4 text-sm text-canvas/60 max-w-md mx-auto">
                {b.caption || "Feuilletez le document page par page — glissez, cliquez sur les coins ou utilisez les flèches."}
              </p>
            </div>
            <div className="h-[82svh] min-h-[440px] md:h-[100vh] w-full pb-6">
              <Flipbook url={b.url} caption={b.caption} size={s.flipSize} animation={s.flipAnimation} />
            </div>
          </section>
        ))}

        <section className="bg-brand text-canvas border-t border-canvas/10">
          <div className="container-x py-14 md:py-20 text-center">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-gold text-brand px-6 py-3 font-medium hover:bg-gold-soft">
              Démarrer un projet similaire <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>

        {related.length > 0 && (
          <section className="container-x py-16 md:py-24 bg-canvas">
            <div className="mb-10 md:mb-14">
              <p className="eyebrow mb-3">Continuer l'exploration</p>
              <h2 className="font-serif text-3xl md:text-4xl text-brand">Autres projets</h2>
              <p className="mt-3 text-sm text-ink-muted max-w-lg">
                Toutes disciplines confondues — identités, rapports, événements, 3D et vidéo.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {related.map((p) => (
                <Link key={p.id} to="/portfolio/$slug" params={{ slug: p.slug }} className="group">
                  <div className="aspect-[4/5] overflow-hidden bg-muted">
                    <img
                      src={isDriveUrl(p.cover) ? toDriveImage(p.cover) : p.cover}
                      alt={p.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-3 text-[10px] uppercase tracking-widest text-ink-muted">{CATEGORY_LABELS[p.category]}</p>
                  <h3 className="mt-1 font-serif text-base text-brand group-hover:text-gold leading-tight">{p.title}</h3>
                  <p className="text-xs text-ink-muted">{p.client}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </SiteLayout>
  );
}
