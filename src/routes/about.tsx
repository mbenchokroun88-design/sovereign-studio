import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import portrait from "@/assets/portrait.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "À propos — Mohamed Benchokroun" },
      { name: "description", content: "Designer institutionnel basé à Rabat. Plus de 8 ans au service des institutions internationales et marocaines." },
      { property: "og:title", content: "À propos — Mohamed Benchokroun" },
      { property: "og:description", content: "Studio de design institutionnel basé à Rabat." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="container-x pt-16 md:pt-24 pb-16">
        <div className="grid md:grid-cols-2 gap-12 items-end">
          <div>
            <p className="eyebrow mb-4">Portrait</p>
            <h1 className="font-serif text-5xl md:text-7xl text-brand leading-[0.95] tracking-tight text-balance">
              Designer institutionnel, basé à <span className="italic text-gold">Rabat</span>.
            </h1>
          </div>
          <div>
            <p className="text-lg text-ink-muted leading-relaxed text-pretty">
              Mohamed Benchokroun accompagne depuis plus de huit ans les institutions publiques, les organisations multilatérales et les entreprises privées dans la conception de leurs systèmes visuels et de leurs publications stratégiques.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-border">
        <div className="container-x py-16 grid md:grid-cols-5 gap-12 items-center">
          <div className="md:col-span-2">
            <div className="aspect-[4/5] overflow-hidden bg-muted">
              <img src={portrait} alt="Mohamed Benchokroun" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="md:col-span-3 space-y-8">
            <div>
              <p className="eyebrow mb-3">Approche</p>
              <p className="font-serif text-2xl text-brand leading-snug text-balance">
                Conjuguer rigueur institutionnelle, exigence éditoriale et écriture visuelle contemporaine.
              </p>
            </div>
            <p className="text-ink-muted leading-relaxed">
              De la Banque Mondiale à la BEI, des ministères marocains aux clusters industriels, chaque mission est traitée avec la même exigence : clarté du message, qualité d'exécution et cohérence du système. Je conçois des supports faits pour durer — imprimés, digitaux, expérientiels.
            </p>
            <p className="text-ink-muted leading-relaxed">
              Trilingue (Français · Anglais · Arabe), je collabore en direct avec mes clients à Rabat, Casablanca, Bruxelles, Washington et Paris.
            </p>
          </div>
        </div>
      </section>

      <section className="container-x py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            ["8+", "Années d'expérience"],
            ["60+", "Projets institutionnels livrés"],
            ["12", "Pays d'intervention"],
          ].map(([num, label]) => (
            <div key={label} className="border-t border-brand/15 pt-6">
              <div className="font-serif text-6xl text-brand">{num}</div>
              <p className="mt-2 text-sm text-ink-muted uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand text-canvas">
        <div className="container-x py-20">
          <p className="eyebrow text-gold-soft mb-6">Clients & Partenaires sélectionnés</p>
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
    </SiteLayout>
  );
}
