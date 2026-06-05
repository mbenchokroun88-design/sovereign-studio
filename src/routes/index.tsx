import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Globe2, Award, Sparkles } from "lucide-react";
import { useProjects, CATEGORY_LABELS } from "@/lib/store/projects";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProjectCard } from "@/components/site/ProjectCard";
import heroImg from "@/assets/hero.jpg";
import { useEffect, useState } from "react";
import { useHeroSlides } from "@/lib/store/hero";
import { useClients } from "@/lib/store/clients";

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
  const { slides } = useHeroSlides();
  const { clients } = useClients();
  const featured = projects.filter((p) => p.featured).slice(0, 3);
  const recent = projects.slice(0, 6);
  const activeSlides = slides.filter((s) => s.visible);
  const [slideIndex, setSlideIndex] = useState(0);
  useEffect(() => {
    if (activeSlides.length < 2) return;
    const id = setInterval(() => setSlideIndex((i) => (i + 1) % activeSlides.length), 6500);
    return () => clearInterval(id);
  }, [activeSlides.length]);
  const currentSlide = activeSlides[slideIndex];

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-brand text-canvas isolate">
        {/* Background image */}
        <div className="absolute inset-0 -z-10">
          {activeSlides.length > 0 ? (
            activeSlides.map((s, i) => (
              <img
                key={s.id}
                src={s.image_url || heroImg}
                alt=""
                width={1920}
                height={1080}
                fetchPriority={i === 0 ? "high" : "low"}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms] ease-in-out ${
                  i === slideIndex ? "opacity-60 animate-kenburns" : "opacity-0"
                }`}
              />
            ))
          ) : (
            <img
              src={heroImg}
              alt=""
              width={1920}
              height={1080}
              fetchPriority="high"
              className="w-full h-full object-cover opacity-60 animate-kenburns"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand/90 to-brand/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand via-transparent to-transparent" />
          {/* Decorative grid */}
          <div className="absolute inset-0 hero-grid opacity-50" />
          {/* Gold glow */}
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gold/10 blur-3xl" />
        </div>

        <div className="container-x relative pt-28 pb-24 md:pt-36 md:pb-32 lg:pt-44 lg:pb-40 min-h-[92vh] flex flex-col justify-center">
          {/* Top meta line */}
          <div key={`eb-${currentSlide?.id ?? "default"}`} className="flex items-center gap-4 mb-10 animate-fade-up">
            <span className="h-px w-12 bg-gold" />
            <p className="eyebrow text-gold-soft m-0">{currentSlide?.eyebrow || "Rabat · Paris · Washington · 2026 Portfolio"}</p>
          </div>

          {/* Headline */}
          {currentSlide ? (
            <h1
              key={`t-${currentSlide.id}`}
              className="font-serif text-[12vw] md:text-[7vw] lg:text-[6.5rem] xl:text-[7.5rem] leading-[0.92] tracking-tight text-balance animate-fade-up max-w-5xl"
              style={{ animationDelay: "0.1s" }}
            >
              {renderHeadline(currentSlide.title)}
            </h1>
          ) : (
            <h1
              className="font-serif text-[14vw] md:text-[9vw] lg:text-[8rem] xl:text-[9rem] leading-[0.88] tracking-tight text-balance animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="block">Design</span>
              <span className="block"><span className="italic text-shimmer">institutionnel</span></span>
              <span className="block text-canvas/85">de classe mondiale.</span>
            </h1>
          )}

          {/* Sub-row */}
          <div
            key={`sr-${currentSlide?.id ?? "default"}`}
            className="mt-12 grid md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 items-end animate-fade-up"
            style={{ animationDelay: "0.25s" }}
          >
            <p className="text-lg md:text-xl text-canvas/80 font-light leading-relaxed max-w-xl text-pretty">
              {currentSlide?.subtitle || (
                <>
                  <span className="text-gold">Mohamed Benchokroun</span> — concepteur d'identités, rapports et expériences visuelles pour les institutions financières, ministères et organisations internationales.
                </>
              )}
            </p>

            <div className="flex flex-wrap gap-3">
              {currentSlide?.cta_label ? (
                <a
                  href={currentSlide.cta_href || "/portfolio"}
                  className="group inline-flex items-center gap-3 bg-gold text-brand font-medium px-7 py-4 hover:bg-gold-soft transition-all hover:gap-4"
                >
                  {currentSlide.cta_label}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </a>
              ) : (
                <Link
                  to="/portfolio"
                  className="group inline-flex items-center gap-3 bg-gold text-brand font-medium px-7 py-4 hover:bg-gold-soft transition-all hover:gap-4"
                >
                  Voir le portfolio
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              )}
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border border-canvas/30 text-canvas px-7 py-4 hover:bg-canvas hover:text-brand transition-colors backdrop-blur-sm"
              >
                Démarrer un projet
              </Link>
            </div>
          </div>

          {/* Stats / trust */}
          <div
            className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 border-t border-canvas/15 pt-10 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            {[
              { icon: Award, k: "120+", v: "Projets livrés" },
              { icon: Globe2, k: "14", v: "Pays couverts" },
              { icon: Sparkles, k: "12 ans", v: "D'expertise" },
              { icon: ArrowUpRight, k: "EU · US · MA", v: "Clients institutionnels" },
            ].map(({ icon: Icon, k, v }) => (
              <div key={v} className="flex items-start gap-3">
                <Icon size={18} className="text-gold mt-1 shrink-0" />
                <div>
                  <div className="font-serif text-2xl md:text-3xl text-canvas">{k}</div>
                  <div className="text-[11px] uppercase tracking-widest text-canvas/55 mt-1">{v}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll cue */}
          <div className="hidden md:flex flex-col items-center gap-2 absolute bottom-8 left-1/2 -translate-x-1/2 text-canvas/60">
            <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
            <div className="w-px h-10 bg-canvas/20 relative overflow-hidden">
              <span className="absolute top-0 left-0 w-px h-3 bg-gold animate-scroll-dot" />
            </div>
          </div>

          {/* Slide dots */}
          {activeSlides.length > 1 && (
            <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-20">
              {activeSlides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setSlideIndex(i)}
                  className={`block transition-all ${i === slideIndex ? "h-8 w-px bg-gold" : "h-3 w-px bg-canvas/40 hover:bg-canvas/70"}`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Marquee strip */}
        <div className="relative border-t border-canvas/15 bg-brand/60 backdrop-blur-sm overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap py-4 will-change-transform">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex items-center gap-12 px-6 shrink-0">
                {clients.filter((c) => c.visible).map((c) => (
                  <span key={c.id} className="flex items-center gap-12">
                    {c.logo_url ? (
                      <img
                        src={c.logo_url}
                        alt={c.name}
                        className="h-10 md:h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity"
                        loading="lazy"
                      />
                    ) : (
                      <span className="font-serif text-xl md:text-2xl text-canvas/40 hover:text-canvas/80 transition-colors">{c.name}</span>
                    )}
                    <span className="text-gold">✦</span>
                  </span>
                ))}
              </div>
            ))}
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
