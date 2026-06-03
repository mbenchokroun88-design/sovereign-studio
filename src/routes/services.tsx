import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, Box, Clapperboard, Layers, MonitorSmartphone, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Expertise — Mohamed Benchokroun" },
      { name: "description", content: "Six disciplines : identité, rapports, événements, vidéo, 3D, web/app." },
      { property: "og:title", content: "Expertise — Mohamed Benchokroun" },
      { property: "og:description", content: "Services de design institutionnel." },
    ],
  }),
  component: Services,
});

const services = [
  {
    icon: Sparkles,
    id: "01",
    title: "Identité Visuelle",
    desc: "Marques institutionnelles, chartes complètes, papeterie, signalétique et systèmes d'identité multilingues (FR / EN / AR).",
    deliverables: ["Logo & déclinaisons", "Charte graphique", "Papeterie corporate", "Brand guidelines PDF"],
  },
  {
    icon: BookOpen,
    id: "02",
    title: "Rapports & Édition",
    desc: "Rapports d'impact, publications stratégiques, livres blancs, data-visualisation et flipbooks digitaux.",
    deliverables: ["Mise en page éditoriale", "Infographies", "Print & digital", "Flipbook interactif"],
  },
  {
    icon: Layers,
    id: "03",
    title: "Couverture d'Événements",
    desc: "Direction artistique, signalétique, supports de communication, captation photo / vidéo et livrables post-événement.",
    deliverables: ["Identité événementielle", "Signalétique", "Captation photo/vidéo", "Livrables sociaux"],
  },
  {
    icon: Clapperboard,
    id: "04",
    title: "Montage Vidéo",
    desc: "Documentaires, films institutionnels, motion design, étalonnage et sound design.",
    deliverables: ["Réalisation", "Montage & étalonnage", "Motion design", "Sound design"],
  },
  {
    icon: Box,
    id: "05",
    title: "Maquettes & Visites 3D",
    desc: "Modélisation architecturale, rendus photoréalistes, visites virtuelles interactives intégrées au web.",
    deliverables: ["Modélisation 3D", "Rendus photoréalistes", "Visite virtuelle", "Intégration web"],
  },
  {
    icon: MonitorSmartphone,
    id: "06",
    title: "Web & Application",
    desc: "Design produit, UX/UI, prototypage et accompagnement développement (Lovable, Webflow, Framer).",
    deliverables: ["UX research", "Design system", "Prototypes", "Accompagnement dev"],
  },
];

function Services() {
  return (
    <SiteLayout>
      <section className="bg-brand text-canvas">
        <div className="container-x py-20 md:py-28">
          <p className="eyebrow text-gold-soft mb-4">Expertise</p>
          <h1 className="font-serif text-5xl md:text-7xl leading-tight tracking-tight text-balance max-w-3xl">
            Six disciplines, <span className="italic text-gold">une vision</span> institutionnelle.
          </h1>
          <p className="mt-8 text-lg text-canvas/80 max-w-2xl">
            Un studio intégré pour accompagner les institutions publiques, multilatérales et privées sur l'ensemble de leurs supports visuels et numériques.
          </p>
        </div>
      </section>

      <section className="container-x py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
          {services.map((s) => (
            <article key={s.id} className="group">
              <div className="flex items-start gap-4 mb-4">
                <div className="size-12 grid place-items-center bg-brand/5 text-brand group-hover:bg-gold group-hover:text-brand transition-colors">
                  <s.icon size={22} />
                </div>
                <div className="pt-2">
                  <p className="text-xs font-mono text-gold">{s.id}</p>
                  <h2 className="font-serif text-3xl text-brand">{s.title}</h2>
                </div>
              </div>
              <p className="text-ink-muted leading-relaxed mb-6">{s.desc}</p>
              <ul className="space-y-2 border-t border-border pt-4">
                {s.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-3 text-sm text-brand">
                    <span className="text-gold mt-1">→</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white border-y border-border">
        <div className="container-x py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="eyebrow mb-4">Process</p>
            <h2 className="font-serif text-4xl text-brand">Une méthode rigoureuse, des résultats institutionnels.</h2>
          </div>
          <ol className="space-y-6">
            {[
              ["Brief & Discovery", "Compréhension des enjeux et des audiences cibles."],
              ["Direction Artistique", "Pistes créatives et validation."],
              ["Production", "Exécution rigoureuse, itérations cadrées."],
              ["Livraison & Suivi", "Fichiers maîtres, formation et maintenance."],
            ].map(([title, desc], i) => (
              <li key={title} className="flex gap-6 border-b border-border pb-6 last:border-0">
                <span className="font-serif italic text-gold text-2xl">0{i + 1}</span>
                <div>
                  <h3 className="font-serif text-xl text-brand">{title}</h3>
                  <p className="text-sm text-ink-muted mt-1">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-brand text-canvas">
        <div className="container-x py-20 text-center">
          <h2 className="font-serif text-4xl md:text-5xl italic text-gold">Démarrons.</h2>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 bg-gold text-brand px-6 py-3 font-medium hover:bg-gold-soft">
            Discuter d'un projet <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
