import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Pencil, Plus, Trash2, X, RotateCcw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  CATEGORY_LABELS,
  useProjects,
  type MediaItem,
  type Project,
  type ProjectCategory,
} from "@/lib/store/projects";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Espace Admin — Mohamed Benchokroun" },
      { name: "description", content: "Gestion des projets du portfolio." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Admin,
});

type Draft = Omit<Project, "id">;

function emptyDraft(): Draft {
  return {
    slug: "",
    title: "",
    client: "",
    year: String(new Date().getFullYear()),
    category: "identity",
    summary: "",
    description: "",
    cover: "",
    featured: false,
    tags: [],
    media: [],
  };
}

function Admin() {
  const { projects, add, update, remove, duplicate, reset } = useProjects();
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <SiteLayout>
      <section className="container-x pt-12 pb-8 border-b border-border">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="eyebrow mb-2">Console</p>
            <h1 className="font-serif text-4xl md:text-5xl text-brand">
              Gestion des projets
            </h1>
            <p className="mt-3 text-sm text-ink-muted max-w-xl">
              Ajoutez, dupliquez, modifiez ou supprimez vos projets. Les médias sont liés via URL (Google Drive, YouTube, Vimeo) — le site reste léger et rapide.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (confirm("Réinitialiser tous les projets aux exemples fictifs ?")) {
                  reset();
                  toast.success("Projets réinitialisés");
                }
              }}
              className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs uppercase tracking-widest text-ink-muted hover:text-brand"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 bg-brand text-brand-foreground px-4 py-2 text-xs uppercase tracking-widest hover:bg-gold hover:text-brand"
            >
              <Plus size={14} /> Nouveau projet
            </button>
          </div>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="rounded-sm border border-border bg-white divide-y divide-border">
          {projects.length === 0 && (
            <p className="p-8 text-center text-ink-muted text-sm">Aucun projet. Cliquez sur « Nouveau projet ».</p>
          )}
          {projects.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4">
              <div className="size-14 bg-muted flex-shrink-0 overflow-hidden">
                {p.cover && <img src={p.cover} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-brand truncate">{p.title}</p>
                  {p.featured && (
                    <span className="text-[9px] bg-gold/20 text-brand px-1.5 py-0.5 uppercase tracking-widest">
                      À la une
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-muted truncate">
                  {p.client} · {p.year} · {CATEGORY_LABELS[p.category]} · {p.media.length} média{p.media.length > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex gap-1">
                <Link
                  to="/portfolio/$slug"
                  params={{ slug: p.slug }}
                  className="size-8 grid place-items-center border border-border hover:border-gold text-ink-muted hover:text-brand"
                  title="Voir"
                >
                  <ExternalLink size={14} />
                </Link>
                <button
                  onClick={() => {
                    duplicate(p.id);
                    toast.success("Projet dupliqué");
                  }}
                  className="size-8 grid place-items-center border border-border hover:border-gold text-ink-muted hover:text-brand"
                  title="Dupliquer"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={() => setEditing(p)}
                  className="size-8 grid place-items-center border border-border hover:border-gold text-ink-muted hover:text-brand"
                  title="Éditer"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Supprimer "${p.title}" ?`)) {
                      remove(p.id);
                      toast.success("Projet supprimé");
                    }
                  }}
                  className="size-8 grid place-items-center border border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {(editing || creating) && (
        <ProjectEditor
          initial={editing ?? emptyDraft()}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={(draft) => {
            if (editing) {
              update(editing.id, draft);
              toast.success("Projet mis à jour");
            } else {
              add(draft);
              toast.success("Projet créé");
            }
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </SiteLayout>
  );
}

function ProjectEditor({
  initial,
  onClose,
  onSave,
}: {
  initial: Project | Draft;
  onClose: () => void;
  onSave: (draft: Draft) => void;
}) {
  const [draft, setDraft] = useState<Draft>({ ...(initial as Draft) });

  function patch<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function addMedia(kind: MediaItem["kind"]) {
    patch("media", [...draft.media, { kind, url: "", caption: "" } as MediaItem]);
  }
  function updateMedia(i: number, patchObj: Partial<MediaItem>) {
    const next = [...draft.media];
    next[i] = { ...next[i], ...patchObj } as MediaItem;
    patch("media", next);
  }
  function removeMedia(i: number) {
    patch("media", draft.media.filter((_, j) => j !== i));
  }

  return (
    <div className="fixed inset-0 z-50 bg-brand/70 backdrop-blur-sm flex items-stretch md:items-center justify-center p-0 md:p-6">
      <div className="bg-canvas w-full max-w-3xl max-h-screen md:max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-canvas border-b border-border flex justify-between items-center px-6 py-4 z-10">
          <h2 className="font-serif text-2xl text-brand">
            {("id" in initial ? "Éditer" : "Nouveau") + " projet"}
          </h2>
          <button onClick={onClose} className="p-2 text-ink-muted hover:text-brand">
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.title.trim()) return toast.error("Titre requis");
            onSave(draft);
          }}
          className="p-6 space-y-6"
        >
          <Row>
            <FormField label="Titre" required>
              <input
                value={draft.title}
                onChange={(e) => patch("title", e.target.value)}
                className="form-input"
                required
              />
            </FormField>
            <FormField label="Slug (URL)" help="Laisser vide pour générer automatiquement">
              <input
                value={draft.slug}
                onChange={(e) => patch("slug", e.target.value)}
                className="form-input"
                placeholder="auto"
              />
            </FormField>
          </Row>

          <Row>
            <FormField label="Client">
              <input
                value={draft.client}
                onChange={(e) => patch("client", e.target.value)}
                className="form-input"
              />
            </FormField>
            <FormField label="Année">
              <input
                value={draft.year}
                onChange={(e) => patch("year", e.target.value)}
                className="form-input"
              />
            </FormField>
          </Row>

          <Row>
            <FormField label="Catégorie">
              <select
                value={draft.category}
                onChange={(e) => patch("category", e.target.value as ProjectCategory)}
                className="form-input"
              >
                {(Object.keys(CATEGORY_LABELS) as ProjectCategory[]).map((k) => (
                  <option key={k} value={k}>
                    {CATEGORY_LABELS[k]}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Mettre à la une">
              <label className="inline-flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  checked={!!draft.featured}
                  onChange={(e) => patch("featured", e.target.checked)}
                />
                <span className="text-sm text-ink">Afficher en page d'accueil</span>
              </label>
            </FormField>
          </Row>

          <FormField label="Image de couverture (URL)" help="URL d'image directe ou lien Drive (utiliser l'aperçu)">
            <input
              value={draft.cover}
              onChange={(e) => patch("cover", e.target.value)}
              className="form-input"
              placeholder="https://..."
            />
            {draft.cover && (
              <div className="mt-3 aspect-[16/9] bg-muted overflow-hidden">
                <img src={draft.cover} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </FormField>

          <FormField label="Résumé (1 phrase)">
            <textarea
              value={draft.summary}
              onChange={(e) => patch("summary", e.target.value)}
              rows={2}
              className="form-input resize-none"
            />
          </FormField>

          <FormField label="Description complète">
            <textarea
              value={draft.description}
              onChange={(e) => patch("description", e.target.value)}
              rows={4}
              className="form-input resize-none"
            />
          </FormField>

          <FormField label="Tags (séparés par des virgules)">
            <input
              value={draft.tags?.join(", ") || ""}
              onChange={(e) => patch("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              className="form-input"
              placeholder="Édition, Infographie, Print"
            />
          </FormField>

          {/* MEDIA */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="eyebrow">Médias ({draft.media.length})</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => addMedia("image")} className="text-xs uppercase tracking-widest border border-border px-2 py-1 hover:border-gold">+ Image</button>
                <button type="button" onClick={() => addMedia("video")} className="text-xs uppercase tracking-widest border border-border px-2 py-1 hover:border-gold">+ Vidéo</button>
                <button type="button" onClick={() => addMedia("pdf")} className="text-xs uppercase tracking-widest border border-border px-2 py-1 hover:border-gold">+ PDF</button>
              </div>
            </div>

            <div className="space-y-3">
              {draft.media.length === 0 && (
                <p className="text-xs text-ink-muted py-4 text-center bg-muted">
                  Aucun média. Ajoutez des URL : Google Drive (PDF), YouTube/Vimeo (vidéo) ou image directe.
                </p>
              )}
              {draft.media.map((m, i) => (
                <div key={i} className="border border-border p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-gold font-semibold">
                      {m.kind === "image" ? "Image" : m.kind === "video" ? "Vidéo (YouTube/Vimeo/Drive)" : "PDF Flipbook (Drive)"}
                    </span>
                    <button type="button" onClick={() => removeMedia(i)} className="text-destructive hover:underline text-xs">
                      Retirer
                    </button>
                  </div>
                  <input
                    value={m.url}
                    onChange={(e) => updateMedia(i, { url: e.target.value })}
                    placeholder="URL"
                    className="form-input mb-2"
                  />
                  <input
                    value={m.caption || ""}
                    onChange={(e) => updateMedia(i, { caption: e.target.value })}
                    placeholder="Légende (optionnelle)"
                    className="form-input"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 sticky bottom-0 bg-canvas py-4 -mx-6 px-6 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border hover:border-gold">
              Annuler
            </button>
            <button type="submit" className="px-6 py-2 bg-brand text-brand-foreground text-sm hover:bg-gold hover:text-brand">
              Enregistrer
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          background: white;
          border: 1px solid var(--rule);
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: var(--ink);
          outline: none;
          transition: border-color 0.15s;
        }
        .form-input:focus { border-color: var(--gold); }
      `}</style>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

function FormField({
  label,
  required,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-ink-muted mb-1.5">
        {label} {required && <span className="text-gold">*</span>}
      </label>
      {children}
      {help && <p className="text-[10px] text-ink-muted mt-1">{help}</p>}
    </div>
  );
}
