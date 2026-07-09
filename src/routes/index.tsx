import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  useProjects,
  CATEGORY_LABELS,
  isDriveUrl,
  toDriveImage,
  type Project,
} from "@/lib/store/projects";
import { SiteLayout } from "@/components/site/SiteLayout";
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

function coverSrc(p: Project) {
  const url = p.cover || "";
  return isDriveUrl(url) ? toDriveImage(url) : url;
}

// Render a headline string: text wrapped in *asterisks* is italic gold (shimmer).
// Lines are separated by literal "\n".
function renderHeadline(s: string) {
  const lines = s.split(/\n/);
  return lines.map((line, li) => {
    const parts = line.split(/(\*[^*]+\*)/g).filter(Boolean);
    return (
      <span key={li} className="block">
        {parts.map((p, pi) =>
          p.startsWith("*") && p.endsWith("*") ? (
            <span key={pi} className="italic text-shimmer">{p.slice(1, -1)}</span>
          ) : (
            <span key={pi}>{p}</span>
          ),
        )}
      </span>
    );
  });
}

function Index() {
  const { projects } = useProjects();
  const { slides } = useHeroSlides();
  const { clients } = useClients();
  const worksGrid = projects.slice(0, 12);
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
                  i === slideIndex ? "opacity-45 animate-kenburns" : "opacity-0"
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
              className="w-full h-full object-cover opacity-45 animate-kenburns"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand/95 to-brand/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/40 to-transparent" />
          <div className="absolute inset-0 hero-grid opacity-40" />
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gold/15 blur-3xl" />
        </div>

        <div className="container-x relative pt-24 pb-20 md:pt-32 md:pb-28 lg:pt-40 lg:pb-32 min-h-[92vh] flex flex-col justify-center">
          {/* Corner marks */}
          <div className="absolute top-6 left-5 md:left-12 xl:left-20 text-[10px] font-mono uppercase tracking-[0.28em] text-canvas/50">
            MB / STUDIO — EST. 2013
          </div>
          <div className="absolute top-6 right-5 md:right-12 xl:right-20 text-[10px] font-mono uppercase tracking-[0.28em] text-canvas/50 text-right">
            {new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
          </div>

          {/* Top meta line */}
          <div key={`eb-${currentSlide?.id ?? "default"}`} className="flex items-center gap-4 mb-8 md:mb-10 animate-fade-up">
            <span className="h-px w-16 bg-gold" />
            <p className="eyebrow text-gold-soft m-0">
              {currentSlide?.eyebrow || "Rabat · Paris · Washington — Portfolio 2026"}
            </p>
          </div>

          {/* Headline */}
          {currentSlide ? (
            <h1
              key={`t-${currentSlide.id}`}
              className="font-serif text-[13vw] md:text-[8vw] lg:text-[7rem] xl:text-[8rem] leading-[0.9] tracking-[-0.02em] text-balance animate-fade-up max-w-5xl"
              style={{ animationDelay: "0.1s" }}
            >
              {renderHeadline(currentSlide.title)}
            </h1>
          ) : (
            <h1
              className="font-serif text-[13vw] md:text-[8.5vw] lg:text-[7.5rem] xl:text-[8.5rem] leading-[0.88] tracking-[-0.02em] text-balance animate-fade-up max-w-5xl"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="block">Design pour</span>
              <span className="block"><span className="italic text-shimmer">les institutions</span></span>
              <span className="block text-canvas/85">qui pèsent.</span>
            </h1>
          )}

          {/* Sub-row */}
          <div
            key={`sr-${currentSlide?.id ?? "default"}`}
            className="mt-10 md:mt-14 grid md:grid-cols-[1.1fr_1fr] gap-8 md:gap-16 items-end animate-fade-up"
            style={{ animationDelay: "0.25s" }}
          >
            <p className="text-base md:text-lg text-canvas/80 leading-relaxed max-w-xl text-pretty">
              {currentSlide?.subtitle || (
                <>
                  <span className="text-gold">Mohamed Benchokroun</span> — concepteur d'identités, de rapports et d'expériences visuelles pour banques de développement, ministères et organisations internationales. Un standard de rigueur éditoriale, exécuté depuis Rabat pour l'Europe, l'Afrique et l'Amérique du Nord.
                </>
              )}
            </p>

            <div className="flex flex-wrap gap-3 md:justify-end">
              {currentSlide?.cta_label ? (
                <a
                  href={currentSlide.cta_href || "/portfolio"}
                  className="group inline-flex items-center gap-3 bg-gold text-brand font-semibold text-sm uppercase tracking-widest px-6 py-4 hover:bg-gold-soft transition-all hover:gap-4"
                >
                  {currentSlide.cta_label}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </a>
              ) : (
                <Link
                  to="/portfolio"
                  className="group inline-flex items-center gap-3 bg-gold text-brand font-semibold text-sm uppercase tracking-widest px-6 py-4 hover:bg-gold-soft transition-all hover:gap-4"
                >
                  Voir le portfolio
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              )}
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border border-canvas/30 text-canvas text-sm uppercase tracking-widest px-6 py-4 hover:bg-canvas hover:text-brand transition-colors"
              >
                Démarrer un projet
              </Link>
            </div>
          </div>

          {/* Stats — data-driven trust */}
          <div
            className="mt-14 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 border-t border-canvas/15 pt-8 md:pt-10 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            {[
              { k: "120+", v: "Projets livrés", n: "01" },
              { k: "14", v: "Pays couverts", n: "02" },
              { k: "12", v: "Années d'expertise", n: "03" },
              { k: "EU · US · MA", v: "Clients institutionnels", n: "04" },
            ].map((s) => (
              <div key={s.v} className="border-l border-canvas/15 pl-4">
                <div className="text-[10px] font-mono text-gold mb-2">{s.n} —</div>
                <div className="font-serif text-3xl md:text-4xl text-canvas leading-none tracking-tight">{s.k}</div>
                <div className="text-[11px] uppercase tracking-widest text-canvas/55 mt-2">{s.v}</div>
              </div>
            ))}
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
        <div className="relative border-y border-canvas/15 bg-brand/70 backdrop-blur-sm overflow-hidden">
          <div className="container-x flex items-center justify-between py-3 border-b border-canvas/10">
            <span className="eyebrow text-canvas/50 m-0">Ils nous font confiance</span>
            <span className="text-[10px] font-mono text-canvas/40">— Sélection</span>
          </div>
          <div className="flex animate-marquee whitespace-nowrap py-4 will-change-transform">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex items-center gap-12 px-6 shrink-0">
                {clients.filter((c) => c.visible).map((c) => (
                  <span key={c.id} className="flex items-center gap-12">
                    {c.logo_url ? (
                      <img
                        src={c.logo_url}
                        alt={c.name}
                        className="h-9 md:h-11 w-auto object-contain opacity-55 hover:opacity-100 transition-opacity"
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

      {/* SELECTED WORKS — editorial grid */}
      <section className="container-x py-20 md:py-28">
        <div className="flex items-end justify-between mb-10 md:mb-14 border-b border-brand/15 pb-4">
          <div>
            <p className="eyebrow mb-3">Selected Works · 2024 — 2026</p>
            <h2 className="font-serif text-4xl md:text-5xl text-brand tracking-tight">Portfolio récent</h2>
          </div>
          <Link to="/portfolio" className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-brand gold-underline">
            Index complet <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="grid gap-x-6 md:gap-x-8 gap-y-10 md:gap-y-14 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {worksGrid.map((p, i) => (
            <Link
              key={p.id}
              to="/portfolio/$slug"
              params={{ slug: p.slug }}
              className="group block"
            >
              <div className="relative aspect-[4/5] bg-muted overflow-hidden mb-4">
                {coverSrc(p) ? (
                  <img
                    src={coverSrc(p)}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand/10 to-brand/5" />
                )}
                <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-widest text-canvas bg-brand/70 backdrop-blur-sm px-2 py-1">
                  {String(i + 1).padStart(2, "0")} / {CATEGORY_LABELS[p.category]}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4 mb-1 text-[10px] font-mono uppercase tracking-widest text-ink-muted">
                <span>{p.client || "—"}</span>
                <span>{p.year}</span>
              </div>
              <h3 className="font-serif text-lg md:text-xl text-brand leading-tight group-hover:text-gold transition-colors">
                {p.title}
              </h3>
            </Link>
          ))}
        </div>
        <div className="mt-12 flex md:hidden justify-center">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-brand gold-underline">
            Index complet <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="container-x py-24 md:py-32 text-center border-t border-border">
        <p className="eyebrow mb-4">Disponibilité</p>
        <h2 className="font-serif text-4xl md:text-6xl text-brand leading-tight tracking-tight text-balance max-w-3xl mx-auto">
          Un rapport d'impact, une identité, un événement — <span className="italic text-shimmer">parlons-en.</span>
        </h2>
        <p className="mt-6 text-ink-muted max-w-xl mx-auto">
          Cabinet ouvert pour les projets institutionnels EMEA et Amérique du Nord — 2026.
        </p>
        <Link
          to="/contact"
          className="mt-10 inline-flex items-center gap-3 bg-brand text-brand-foreground font-semibold text-sm uppercase tracking-widest px-8 py-4 hover:bg-gold hover:text-brand transition-all"
        >
          Démarrer un projet <ArrowRight size={16} />
        </Link>
      </section>
    </SiteLayout>
  );
}

