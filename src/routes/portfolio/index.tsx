import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProjectCard } from "@/components/site/ProjectCard";
import { CATEGORY_LABELS, useProjects, type ProjectCategory, type Project } from "@/lib/store/projects";

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

function Portfolio() {
  const { projects } = useProjects();
  const grouped = useMemo(() => {
    const order = Object.keys(CATEGORY_LABELS) as ProjectCategory[];
    const map = new Map<ProjectCategory, Project[]>();
    for (const p of projects) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    return order
      .filter((c) => map.has(c))
      .map((c) => [c, map.get(c)!] as const);
  }, [projects]);

  return (
    <SiteLayout>
      <section className="container-x pt-16 md:pt-24 pb-12">
        <p className="eyebrow mb-4">Index</p>
        <h1 className="font-serif text-5xl md:text-7xl text-brand leading-tight text-balance max-w-3xl">
          Portfolio <span className="italic text-gold">complet</span>
        </h1>
      </section>

      <section className="container-x py-12 md:py-20">
        {grouped.length === 0 ? (
          <p className="text-center text-ink-muted py-24">Aucun projet pour le moment.</p>
        ) : (
          <div className="space-y-16 md:space-y-24">
            {grouped.map(([cat, list]) => (
              <div key={cat}>
                <div className="flex items-baseline justify-between mb-6 md:mb-8 border-b border-border pb-3">
                  <h2 className="font-serif text-2xl md:text-3xl text-brand">{CATEGORY_LABELS[cat]}</h2>
                  <span className="text-xs uppercase tracking-widest text-ink-muted">{list.length} projet{list.length > 1 ? "s" : ""}</span>
                </div>
                <div className="grid gap-6 md:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((p) => <ProjectCard key={p.id} project={p} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
