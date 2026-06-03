import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Mohamed Benchokroun" },
      { name: "description", content: "Discutons de votre prochaine mission. Studio basé à Rabat, disponible pour des missions internationales." },
      { property: "og:title", content: "Contact — Mohamed Benchokroun" },
      { property: "og:description", content: "Démarrer un projet institutionnel." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <SiteLayout>
      <section className="container-x pt-16 md:pt-24 pb-16">
        <p className="eyebrow mb-4">Contact</p>
        <h1 className="font-serif text-5xl md:text-7xl text-brand leading-[0.95] tracking-tight text-balance max-w-4xl">
          Discutons de votre <span className="italic text-gold">prochaine mission.</span>
        </h1>
      </section>

      <section className="container-x pb-24 grid md:grid-cols-5 gap-12">
        <aside className="md:col-span-2 space-y-8">
          <div>
            <p className="eyebrow mb-3">Studio</p>
            <div className="flex items-start gap-3 text-ink">
              <MapPin size={18} className="text-gold mt-1" />
              <p className="text-sm leading-relaxed">
                Avenue Mehdi Ben Barka<br />
                Hay Riad, Rabat<br />
                Maroc · 10100
              </p>
            </div>
          </div>
          <div>
            <p className="eyebrow mb-3">Direct</p>
            <div className="space-y-3">
              <a href="mailto:m.benchokroun@studio.ma" className="flex items-center gap-3 text-sm text-brand hover:text-gold">
                <Mail size={16} /> m.benchokroun@studio.ma
              </a>
              <a href="tel:+212600000000" className="flex items-center gap-3 text-sm text-brand hover:text-gold">
                <Phone size={16} /> +212 6 00 00 00 00
              </a>
            </div>
          </div>
          <div>
            <p className="eyebrow mb-3">Heures</p>
            <p className="text-sm text-ink-muted">Lundi — Vendredi · 9h–19h GMT+1</p>
          </div>
        </aside>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            toast.success("Message envoyé. Réponse sous 24h.");
            (e.target as HTMLFormElement).reset();
          }}
          className="md:col-span-3 bg-white border border-border p-8 md:p-12 space-y-6"
        >
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Nom complet" name="name" required />
            <Field label="Organisation" name="org" />
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Email" name="email" type="email" required />
            <Field label="Téléphone" name="phone" />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-ink-muted mb-2">
              Type de projet
            </label>
            <select
              name="type"
              className="w-full bg-transparent border-b border-brand/20 py-3 text-sm focus:outline-none focus:border-gold"
            >
              <option>Identité visuelle</option>
              <option>Rapport / Édition</option>
              <option>Couverture événement</option>
              <option>Vidéo / Motion</option>
              <option>3D / Visite virtuelle</option>
              <option>Web / Application</option>
              <option>Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-ink-muted mb-2">
              Décrivez votre projet
            </label>
            <textarea
              name="message"
              required
              rows={5}
              className="w-full bg-transparent border-b border-brand/20 py-3 text-sm focus:outline-none focus:border-gold resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={sent}
            className="inline-flex items-center gap-3 bg-brand text-brand-foreground px-6 py-3 font-medium hover:bg-gold hover:text-brand transition-colors disabled:opacity-50"
          >
            {sent ? "Envoyé" : "Envoyer le message"} <Send size={16} />
          </button>
        </form>
      </section>
    </SiteLayout>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-ink-muted mb-2">
        {label} {required && <span className="text-gold">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full bg-transparent border-b border-brand/20 py-3 text-sm focus:outline-none focus:border-gold"
      />
    </div>
  );
}
