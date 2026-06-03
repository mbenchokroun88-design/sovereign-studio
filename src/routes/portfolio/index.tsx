import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProjectCard } from "@/components/site/ProjectCard";
import { CATEGORY_LABELS, useProjects, type ProjectCategory } from "@/lib/store/projects";

export const Route = createFileRoute("/portfolio/")({
  head: () => ({
    meta: [
      { title: "Portfolio — Mohamed Benchokroun" },
      { name: "description", content: "Sélection de projets d'identité, rapports, événements, vidéo, 3D et plateformes numériques." },
      { property: "og:title", content: "Portfolio — Mohamed Benchokroun" },
      { property: "og:description", content: "Index des projets institutionnels." },
    ],
  }),
  component: Portfolio,
});

type Filter = "all" | ProjectCategory;

function Portfolio() {
  const { projects } = useProjects();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.category === filter)),
    [filter, projects],
  );

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Tout" },
    ...(Object.keys(CATEGORY_LABELS) as ProjectCategory[]).map((c) => ({
      id: c,
      label: CATEGORY_LABELS[c],
    })),
  ];

  return (
    <SiteLayout>
      <section className="container-x pt-16 md:pt-24 pb-12">
        <p className="eyebrow mb-4">Index</p>
        <h1 className="font-serif text-5xl md:text-7xl text-brand leading-tight text-balance max-w-3xl">
          Portfolio <span className="italic text-gold">complet</span>
        </h1>
        <p className="mt-6 text-lg text-ink-muted max-w-2xl">
          Une sélection de projets pour des institutions internationales, ministères marocains et entreprises privées.
        </p>
      </section>

      <section className="container-x sticky top-16 z-30 bg-canvas/95 backdrop-blur border-y border-border">
        <div className="py-4 flex gap-2 overflow-x-auto scrollbar-none">
          {filters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`shrink-0 text-xs uppercase tracking-widest px-4 py-2 border transition-colors ${
                  active
                    ? "bg-brand text-brand-foreground border-brand"
                    : "border-border text-ink-muted hover:border-gold hover:text-brand"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="container-x py-16 md:py-24">
        {filtered.length === 0 ? (
          <p className="text-center text-ink-muted py-24">Aucun projet dans cette catégorie pour le moment.</p>
        ) : (
          <div className="grid gap-8 md:gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
