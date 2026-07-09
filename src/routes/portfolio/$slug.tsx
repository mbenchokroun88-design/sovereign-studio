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

  if (!project && !isLoading) {
    throw notFound();
  }
  if (!project) {
    return (
      <SiteLayout>
        <div className="container-x py-32 text-center text-ink-muted text-sm">Chargement…</div>
      </SiteLayout>
    );
  }

  const related = projects.filter((p) => p.id !== project.id && p.category === project.category).slice(0, 3);

  const hasBlocks = (project.blocks?.length ?? 0) > 0;
  const cover = project.cover && isDriveUrl(project.cover) ? toDriveImage(project.cover) : project.cover;

  return (
    <SiteLayout>
      <article>
        {/* HERO */}
        <header className="relative bg-brand text-canvas overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            {cover && <img src={cover} alt="" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-brand to-transparent" />
          </div>
          <div className="relative container-x pt-12 pb-16 md:pt-20 md:pb-24">
            <Link to="/portfolio" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold hover:text-gold-soft mb-12">
              <ArrowLeft size={14} /> Retour à l'index
            </Link>
            <p className="eyebrow text-gold-soft mb-4">{CATEGORY_LABELS[project.category]}</p>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl leading-[0.95] tracking-tight text-balance max-w-4xl">
              {project.title}
            </h1>
          </div>
        </header>

        {/* META */}
        <section className="border-b border-border bg-white">
          <div className="container-x py-6 md:py-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Meta label="Client" value={project.client} />
            <Meta label="Année" value={project.year} />
            <Meta label="Catégorie" value={CATEGORY_LABELS[project.category]} />
            <Meta label="Tags" value={project.tags?.join(" · ") || "—"} />
          </div>
        </section>

        {/* COVER */}
        {cover && <section className="container-x py-12 md:py-16">
          <div className="bg-muted flex items-center justify-center">
            <img src={cover} alt={project.title} className="w-full h-auto max-h-[80vh] object-contain block" />
          </div>
        </section>}

        {/* PAGE BUILDER — long scroll composed in admin */}
        {hasBlocks && (
          <section className="border-y border-border">
            <ProjectBlocks blocks={project.blocks!} />
          </section>
        )}

        {/* RELATED */}
        {related.length > 0 && (
          <section className="container-x py-20">
            <h2 className="font-serif text-3xl text-brand mb-8">Projets similaires</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to="/portfolio/$slug"
                  params={{ slug: p.slug }}
                  className="group"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img src={isDriveUrl(p.cover) ? toDriveImage(p.cover) : p.cover} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <h3 className="mt-3 font-serif text-lg text-brand group-hover:text-gold">{p.title}</h3>
                  <p className="text-xs text-ink-muted">{p.client}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-brand text-canvas">
          <div className="container-x py-20 text-center">
            <h2 className="font-serif text-4xl md:text-5xl italic text-gold">Un projet similaire ?</h2>
            <p className="mt-4 text-canvas/80 max-w-xl mx-auto">Discutons de votre prochaine mission institutionnelle.</p>
            <Link to="/contact" className="mt-8 inline-flex items-center gap-2 bg-gold text-brand px-6 py-3 font-medium hover:bg-gold-soft">
              Démarrer un projet <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
      </article>
    </SiteLayout>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-ink-muted mb-2">{label}</p>
      <p className="text-sm text-brand font-medium">{value}</p>
    </div>
  );
}
