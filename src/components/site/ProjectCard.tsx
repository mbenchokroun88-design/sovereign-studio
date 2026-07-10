import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { CATEGORY_LABELS, isDriveUrl, toDriveImage, type Project } from "@/lib/store/projects";

export function ProjectCard({ project, variant = "default" }: { project: Project; variant?: "default" | "feature" }) {
  const cover = project.cover && isDriveUrl(project.cover) ? toDriveImage(project.cover) : project.cover;
  if (variant === "feature") {
    return (
      <Link
        to="/portfolio/$slug"
        params={{ slug: project.slug }}
        className="group block"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={cover}
            alt={project.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand/70 via-transparent to-transparent" />
          <div className="absolute top-4 left-4 text-[10px] font-semibold uppercase tracking-widest text-canvas bg-brand/60 backdrop-blur px-2 py-1">
            {CATEGORY_LABELS[project.category]}
          </div>
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl text-brand leading-tight group-hover:text-gold transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-ink-muted mt-1">{project.client} · {project.year}</p>
          </div>
          <div className="size-9 border border-brand/15 grid place-items-center text-brand group-hover:bg-brand group-hover:text-brand-foreground transition-colors">
            <ArrowUpRight size={16} />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/portfolio/$slug"
      params={{ slug: project.slug }}
      className="group flex flex-col bg-card border border-border hover:border-gold transition-colors"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={cover}
          alt={project.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <span className="eyebrow text-[9px]">{CATEGORY_LABELS[project.category]}</span>
        <h3 className="mt-2 font-serif text-lg text-brand leading-tight">
          {project.title}
        </h3>
        <p className="text-xs text-ink-muted mt-1">{project.client} · {project.year}</p>
        <div className="mt-4 flex items-center text-xs font-medium text-brand group-hover:text-gold">
          Voir le projet
          <ArrowUpRight size={14} className="ml-1" />
        </div>
      </div>
    </Link>
  );
}