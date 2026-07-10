import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CATEGORY_LABELS, isDriveUrl, toDriveImage, useProjects } from "@/lib/store/projects";
import { ProjectBlocks } from "@/components/site/ProjectBlocks";

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

  if (!project && !isLoading) throw notFound();
  if (!project) {
    return (
      <SiteLayout>
        <div className="container-x py-32 text-center text-ink-muted text-sm">Chargement…</div>
      </SiteLayout>
    );
  }

  const hasBlocks = (project.blocks?.length ?? 0) > 0;
  const cover = project.cover && isDriveUrl(project.cover) ? toDriveImage(project.cover) : project.cover;
  const relatedAll = projects.filter((p) => p.id !== project.id);
  const sameCat = relatedAll.filter((p) => p.category === project.category);
  const others = relatedAll.filter((p) => p.category !== project.category);
  const related = [...sameCat, ...others].slice(0, 8);

  return (
    <SiteLayout>
      <article>
        {/* HERO — full-bleed visual */}
        <header className="relative bg-brand text-canvas overflow-hidden">
          {cover && (
            <div className="absolute inset-0">
              <img src={cover} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/60 to-brand/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand/70 via-transparent to-transparent" />
            </div>
          )}
          <div className="relative container-x pt-10 pb-20 md:pt-16 md:pb-32 min-h-[70vh] flex flex-col justify-between">
            <Link to="/portfolio" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold hover:text-gold-soft w-fit">
              <ArrowLeft size={14} /> Retour à l'index
            </Link>
            <div className="mt-16 md:mt-24 max-w-5xl">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="text-[10px] uppercase tracking-[0.25em] text-gold-soft bg-brand/40 backdrop-blur px-3 py-1.5 border border-gold/30">
                  {CATEGORY_LABELS[project.category]}
                </span>
                {project.year && (
                  <span className="text-[10px] uppercase tracking-[0.25em] text-canvas/70">{project.year}</span>
                )}
              </div>
              <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl leading-[0.9] tracking-tight text-balance">
                {project.title}
              </h1>
              {project.client && (
                <p className="mt-8 text-lg md:text-xl text-canvas/80 font-light">
                  Pour <span className="italic text-gold">{project.client}</span>
                </p>
              )}
            </div>
          </div>
        </header>

        {hasBlocks && <ProjectBlocks blocks={project.blocks!} />}

        {/* Clear end-of-project divider so users know related section starts */}
        <section className="bg-brand text-canvas">
          <div className="container-x py-16 md:py-24 text-center">
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-soft mb-4">Fin du projet</p>
            <div className="font-serif text-2xl md:text-3xl italic text-gold mb-8">— · —</div>
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
