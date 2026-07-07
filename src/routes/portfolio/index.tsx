import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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

type Filter = "all" | ProjectCategory;
type GroupBy = "none" | "client" | "year" | "category";

function Portfolio() {
  const { projects } = useProjects();
  const [filter, setFilter] = useState<Filter>("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");

  const filtered = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.category === filter)),
    [filter, projects],
  );

  const grouped = useMemo(() => {
    if (groupBy === "none") return null;
    const map = new Map<string, Project[]>();
    for (const p of filtered) {
      const key =
        groupBy === "client" ? (p.client || "Sans client") :
        groupBy === "year" ? (p.year || "Sans année") :
        CATEGORY_LABELS[p.category];
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    const entries = Array.from(map.entries());
    if (groupBy === "year") entries.sort((a, b) => (a[0] < b[0] ? 1 : -1));
    else entries.sort((a, b) => a[0].localeCompare(b[0]));
    return entries;
  }, [filtered, groupBy]);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Tout" },
    ...(Object.keys(CATEGORY_LABELS) as ProjectCategory[]).map((c) => ({
      id: c,
      label: CATEGORY_LABELS[c],
    })),
  ];

  const groups: { id: GroupBy; label: string }[] = [
    { id: "none", label: "Grille" },
    { id: "client", label: "Par client" },
    { id: "year", label: "Par année" },
    { id: "category", label: "Par type" },
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

      <section className="sticky top-16 z-30 bg-canvas/95 backdrop-blur border-y border-border">
        <div className="container-x py-3 flex flex-col gap-2">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-4 px-4">
            {groups.map((g) => {
              const active = groupBy === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setGroupBy(g.id)}
                  className={`shrink-0 text-[11px] uppercase tracking-widest px-3 py-1.5 transition-colors ${
                    active ? "bg-gold text-brand font-medium" : "text-ink-muted hover:text-brand"
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4">
            {filters.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`shrink-0 text-[10px] md:text-xs uppercase tracking-widest px-3 md:px-4 py-2 border transition-colors ${
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
        </div>
      </section>

      <section className="container-x py-12 md:py-20">
        {filtered.length === 0 ? (
          <p className="text-center text-ink-muted py-24">Aucun projet dans cette catégorie pour le moment.</p>
        ) : grouped ? (
          <div className="space-y-16 md:space-y-24">
            {grouped.map(([key, list]) => (
              <div key={key}>
                <div className="flex items-baseline justify-between mb-6 md:mb-8 border-b border-border pb-3">
                  <h2 className="font-serif text-2xl md:text-3xl text-brand">{key}</h2>
                  <span className="text-xs uppercase tracking-widest text-ink-muted">{list.length} projet{list.length > 1 ? "s" : ""}</span>
                </div>
                <div className="grid gap-6 md:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((p) => <ProjectCard key={p.id} project={p} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
