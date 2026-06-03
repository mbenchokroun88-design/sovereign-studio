import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useProjects, CATEGORY_LABELS } from "@/lib/store/projects";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProjectCard } from "@/components/site/ProjectCard";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mohamed Benchokroun — Visual Architect & Designer · Rabat" },
      {
        name: "description",
        content:
          "Studio de design institutionnel à Rabat. Identités, rapports, événements, 3D et plateformes numériques pour clients européens, américains et institutionnels marocains.",
      },
      { property: "og:title", content: "Mohamed Benchokroun — Visual Architect & Designer" },
      { property: "og:description", content: "Design institutionnel pour clients européens et américains." },
    ],
  }),
  component: Index,
});

const CLIENTS = [
  "World Bank / IFC",
  "BEI",
  "Cluster ENR",
  "Min. Finances",
  "Min. Artisanat",
  "Min. Industrie",
  "Min. Transition Énergétique",
];

const SERVICES = [
  { id: "01", title: "Identité Visuelle", desc: "Marques institutionnelles, chartes complètes et systèmes d'identité multilingues." },
  { id: "02", title: "Rapports & Édition", desc: "Rapports d'impact, publications, infographies et flipbooks digitaux." },
  { id: "03", title: "Événements", desc: "Couverture visuelle complète : signalétique, supports, captation et livrables." },
  { id: "04", title: "Vidéo & Motion", desc: "Documentaires, films institutionnels, motion design et étalonnage." },
  { id: "05", title: "3D & Visites Virtuelles", desc: "Maquettes architecturales, rendus photoréalistes et visites interactives." },
  { id: "06", title: "Web & Application", desc: "Design produit, prototypage et accompagnement développement (Lovable, Webflow)." },
];

function Index() {
  const { projects } = useProjects();
  const featured = projects.filter((p) => p.featured).slice(0, 3);
  const recent = projects.slice(0, 6);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt=""
            width={1920}
            height={1080}
            className="w-full h-full object-cover animate-kenburns"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand/85 via-brand/60 to-canvas" />
        </div>

        <div className="container-x pt-24 pb-32 md:pt-40 md:pb-48 text-canvas">
          <div className="max-w-3xl animate-fade-up">
            <p className="eyebrow text-gold-soft mb-6">Rabat / Global · Visual Architect & Designer</p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-balance">
              Mohamed <span className="italic text-gold">Benchokroun</span>
            </h1>
            <p className="mt-8 text-lg md:text-xl text-canvas/85 font-light leading-relaxed max-w-2xl text-pretty">
              Concepteur d'identités visuelles et d'expériences institutionnelles pour les leaders de la finance, de l'énergie et du secteur public — du Maroc à l'international.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 bg-gold text-brand font-medium px-6 py-3 hover:bg-gold-soft transition-colors"
              >
                Voir le portfolio <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border border-canvas/40 text-canvas px-6 py-3 hover:bg-canvas hover:text-brand transition-colors"
              >
                Démarrer un projet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CLIENTS */}
      <section className="border-y border-border bg-white">
        <div className="container-x py-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <p className="eyebrow shrink-0">Ils nous font confiance</p>
            <div className="flex-1 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-ink-muted">
              {CLIENTS.map((c) => (
                <span key={c} className="font-serif text-base text-brand/70">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SELECTED WORKS */}
      <section className="container-x py-24 md:py-32">
        <div className="flex items-end justify-between mb-12 border-b border-brand/15 pb-4">
          <div>
            <p className="eyebrow mb-3">Selected Works</p>
            <h2 className="font-serif text-4xl md:text-5xl text-brand">Travaux récents</h2>
          </div>
          <Link to="/portfolio" className="hidden md:flex items-center gap-2 text-sm font-medium text-brand gold-underline">
            Tout voir <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          {featured.map((p) => (
            <ProjectCard key={p.id} project={p} variant="feature" />
          ))}
        </div>
      </section>

      {/* FLIPBOOK SHOWCASE */}
      <section className="bg-brand text-canvas">
        <div className="container-x py-24 md:py-32 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="eyebrow text-gold-soft mb-4">Publication Design</p>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
              Des rapports qui se <span className="italic text-gold">lisent comme un livre.</span>
            </h2>
            <p className="text-canvas/80 leading-relaxed mb-8 max-w-md">
              Chaque PDF est intégré en flipbook interactif, optimisé pour une lecture rapide et institutionnelle. Tournez les pages, zoomez, partagez — sans rien télécharger.
            </p>
            <Link to="/services" className="inline-flex items-center gap-2 text-gold gold-underline">
              Explorer le service <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] bg-white shadow-2xl relative flex overflow-hidden">
              <div className="w-1/2 border-r border-slate-100 p-6 flex flex-col gap-3">
                <div className="h-2 w-1/3 bg-brand/80" />
                <div className="h-1 w-full bg-slate-200" />
                <div className="h-1 w-5/6 bg-slate-200" />
                <div className="h-1 w-4/6 bg-slate-200" />
                <div className="mt-auto h-24 bg-brand/10" />
              </div>
              <div className="w-1/2 p-6 flex flex-col gap-3">
                <div className="h-32 bg-gold/30" />
                <div className="h-1 w-full bg-slate-200" />
                <div className="h-1 w-3/4 bg-slate-200" />
                <div className="mt-auto h-2 w-1/4 bg-gold" />
              </div>
              <div className="absolute inset-y-0 left-1/2 w-px bg-slate-200 shadow-[0_0_20px_rgba(0,0,0,0.1)]" />
            </div>
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 size-12 bg-gold text-brand grid place-items-center font-bold rounded-full shadow-xl">
              →
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES INDEX */}
      <section className="container-x py-24 md:py-32">
        <div className="flex items-end justify-between mb-12 border-b border-brand/15 pb-4">
          <div>
            <p className="eyebrow mb-3">Core Expertise</p>
            <h2 className="font-serif text-4xl md:text-5xl text-brand">Six disciplines</h2>
          </div>
          <span className="text-xs font-mono text-ink-muted hidden md:block">(01—06)</span>
        </div>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-2">
          {SERVICES.map((s) => (
            <div key={s.id} className="group flex items-start gap-6 py-6 border-b border-border">
              <span className="text-gold font-mono text-xs mt-2">{s.id}</span>
              <div className="flex-1">
                <h3 className="font-serif text-2xl text-brand group-hover:text-gold transition-colors">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed max-w-md">{s.desc}</p>
              </div>
              <ArrowUpRight size={18} className="text-brand/30 mt-2 group-hover:text-gold transition-colors" />
            </div>
          ))}
        </div>
      </section>

      {/* ARCHIVE STRIP */}
      <section className="bg-brand text-canvas">
        <div className="container-x py-20">
          <div className="flex items-end justify-between mb-8 border-b border-canvas/15 pb-4">
            <h2 className="font-serif text-3xl md:text-4xl">Archive — Récent</h2>
            <Link to="/portfolio" className="text-xs uppercase tracking-widest text-gold hover:text-gold-soft">
              Index complet →
            </Link>
          </div>
          <div className="divide-y divide-canvas/10">
            {recent.map((p, i) => (
              <Link
                key={p.id}
                to="/portfolio/$slug"
                params={{ slug: p.slug }}
                className="group flex items-center justify-between py-5 hover:px-4 transition-all duration-300"
              >
                <div className="flex items-baseline gap-4 md:gap-8">
                  <span className="text-xs font-mono text-canvas/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl group-hover:text-gold transition-colors">{p.title}</h3>
                    <p className="text-xs text-canvas/50 mt-1">{p.client}</p>
                  </div>
                </div>
                <div className="hidden md:block text-xs uppercase tracking-widest text-canvas/50 group-hover:text-gold transition-colors">
                  {CATEGORY_LABELS[p.category]} · {p.year}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
