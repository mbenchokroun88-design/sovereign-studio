import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, Box, Clapperboard, Layers, MonitorSmartphone, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import portrait from "@/assets/portrait.jpg";
import { PageSections } from "@/components/site/PageSections";
import { PAGE_DEFAULT_ORDER } from "@/lib/store/pages";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Studio & Expertise — Mohamed Benchokroun" },
      { name: "description", content: "Studio de design institutionnel à Rabat. Six disciplines pour les institutions internationales." },
      { property: "og:title", content: "Studio & Expertise — Mohamed Benchokroun" },
      { property: "og:description", content: "Six disciplines, une signature institutionnelle." },
    ],
  }),
  component: About,
});

const DISCIPLINES = [
  { icon: Sparkles, id: "01", title: "Identité Visuelle" },
  { icon: BookOpen, id: "02", title: "Rapports & Édition" },
  { icon: Layers, id: "03", title: "Événements" },
  { icon: Clapperboard, id: "04", title: "Vidéo & Motion" },
  { icon: Box, id: "05", title: "Maquettes & 3D" },
  { icon: MonitorSmartphone, id: "06", title: "Web & Application" },
];

function About() {
  const modules: Record<string, React.ReactNode> = {
    header: (
      <section className="container-x pt-16 md:pt-24 pb-16">
        <div className="grid md:grid-cols-2 gap-12 items-end">
          <div>
            <p className="eyebrow mb-4">Studio</p>
            <h1 className="font-serif text-5xl md:text-7xl text-brand leading-[0.95] tracking-tight text-balance">
              Studio & <span className="italic text-gold">expertise</span>.
            </h1>
          </div>
          <div>
            <p className="text-lg text-ink-muted leading-relaxed text-pretty">
              Design institutionnel pour banques de développement, ministères et organisations internationales. Depuis Rabat, pour l'Europe, l'Afrique et l'Amérique du Nord.
            </p>
          </div>
        </div>
      </section>
    ),
    profile: (
      <section className="bg-white border-y border-border">
        <div className="container-x py-16 md:py-20 grid md:grid-cols-5 gap-12 items-center">
          <div className="md:col-span-2">
            <div className="aspect-[4/5] overflow-hidden bg-muted">
              <img src={portrait} alt="Mohamed Benchokroun" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="md:col-span-3 space-y-6">
            <p className="font-serif text-2xl text-brand leading-snug text-balance">
              Rigueur institutionnelle, exigence éditoriale, écriture visuelle contemporaine.
            </p>
            <p className="text-ink-muted leading-relaxed">
              Trilingue FR · EN · AR. Rabat · Paris · Washington.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-border">
              {[
                ["8+", "Années"],
                ["60+", "Projets"],
                ["12", "Pays"],
              ].map(([num, label]) => (
                <div key={label}>
                  <div className="font-serif text-4xl md:text-5xl text-brand">{num}</div>
                  <p className="mt-1 text-[10px] text-ink-muted uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    ),
    disciplines: (
      <section className="container-x py-20 md:py-28">
        <div className="flex items-end justify-between mb-10 border-b border-brand/15 pb-4">
          <div>
            <p className="eyebrow mb-3">Expertise</p>
            <h2 className="font-serif text-4xl md:text-5xl text-brand tracking-tight">Six disciplines</h2>
          </div>
          <span className="text-xs font-mono text-ink-muted hidden md:block">(01 — 06)</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
          {DISCIPLINES.map((s) => (
            <div key={s.id} className="group flex items-center gap-4 py-5 border-b border-border">
              <div className="size-11 grid place-items-center bg-brand/5 text-brand group-hover:bg-gold group-hover:text-brand transition-colors">
                <s.icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-mono text-gold">{s.id}</p>
                <h3 className="font-serif text-xl text-brand">{s.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
    clients: (
      <section className="bg-brand text-canvas">
        <div className="container-x py-20">
          <p className="eyebrow text-gold-soft mb-6">Clients sélectionnés</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 font-serif text-xl text-canvas/80">
            {[
              "World Bank / IFC",
              "Banque Européenne d'Investissement",
              "Cluster ENR Maroc",
              "Ministère des Finances",
              "Ministère de l'Artisanat",
              "Ministère de l'Industrie",
              "Min. Transition Énergétique",
              "Confédération CGEM",
              "GIZ Maroc",
            ].map((c) => (
              <div key={c} className="py-2 border-b border-canvas/10">{c}</div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-gold text-brand px-6 py-3 font-medium hover:bg-gold-soft">
              Travaillons ensemble <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    ),
  };

  return (
    <SiteLayout>
      <PageSections page="studio" modules={modules} defaultOrder={PAGE_DEFAULT_ORDER.studio} />
    </SiteLayout>
  );
}
