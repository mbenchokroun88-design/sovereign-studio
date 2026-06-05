import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Copy, Pencil, Plus, Trash2, X, ExternalLink, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORY_LABELS,
  DEFAULT_KIND_FOR_SLOT,
  SLOT_LABELS,
  SLOT_ORDER,
  useProjects,
  type MediaItem,
  type MediaKind,
  type MediaSlot,
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
  const { projects, isLoading, add, update, remove, duplicate } = useProjects();
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <SiteLayout>
      <section className="container-x pt-12 pb-8 border-b border-border">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="eyebrow mb-2">Console</p>
            <h1 className="font-serif text-4xl md:text-5xl text-brand">Gestion des projets</h1>
            <p className="mt-3 text-sm text-ink-muted max-w-xl">
              Ajoutez, dupliquez, modifiez ou supprimez vos projets. Données persistées dans la base.
              PDF en flipbook : upload direct (page-turn animé). Vidéos & images : URL Drive/YouTube/Vimeo.
            </p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 bg-brand text-brand-foreground px-4 py-2 text-xs uppercase tracking-widest hover:bg-gold hover:text-brand"
          >
            <Plus size={14} /> Nouveau projet
          </button>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="rounded-sm border border-border bg-white divide-y divide-border">
          {isLoading && (
            <p className="p-8 text-center text-ink-muted text-sm">Chargement…</p>
          )}
          {!isLoading && projects.length === 0 && (
            <p className="p-8 text-center text-ink-muted text-sm">
              Aucun projet. Cliquez sur « Nouveau projet ».
            </p>
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
                  {p.client} · {p.year} · {CATEGORY_LABELS[p.category]} · {p.media.length} média
                  {p.media.length > 1 ? "s" : ""}
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
                  onClick={async () => {
                    await duplicate(p.id);
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
                  onClick={async () => {
                    if (confirm(`Supprimer "${p.title}" ?`)) {
                      await remove(p.id);
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
          onSave={async (draft) => {
            try {
              if (editing) {
                await update(editing.id, draft);
                toast.success("Projet mis à jour");
              } else {
                await add(draft);
                toast.success("Projet créé");
              }
              setEditing(null);
              setCreating(false);
            } catch (e: any) {
              toast.error(e?.message || "Erreur");
            }
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
  onSave: (draft: Draft) => Promise<void> | void;
}) {
  const [draft, setDraft] = useState<Draft>({ ...(initial as Draft) });
  const [saving, setSaving] = useState(false);

  function patch<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function addMediaSlot(slot: MediaSlot) {
    const kind = DEFAULT_KIND_FOR_SLOT[slot];
    patch("media", [...draft.media, { slot, kind, url: "", caption: "" }]);
  }
  function updateMedia(i: number, patchObj: Partial<MediaItem>) {
    const next = [...draft.media];
    next[i] = { ...next[i], ...patchObj };
    patch("media", next);
  }
  function removeMedia(i: number) {
    patch("media", draft.media.filter((_, j) => j !== i));
  }
  function moveMedia(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= draft.media.length) return;
    const next = [...draft.media];
    [next[i], next[j]] = [next[j], next[i]];
    patch("media", next);
  }

  return (
    <div className="fixed inset-0 z-50 bg-brand/70 backdrop-blur-sm flex items-stretch md:items-center justify-center p-0 md:p-6">
      <div className="bg-canvas w-full max-w-3xl max-h-screen md:max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-canvas border-b border-border flex justify-between items-center px-6 py-4 z-10">
          <h2 className="font-serif text-2xl text-brand">
            {("id" in initial ? "Éditer" : "Nouveau") + " projet"}
          </h2>
          <button onClick={onClose} className="p-2 text-ink-muted hover:text-brand">
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!draft.title.trim()) return toast.error("Titre requis");
            setSaving(true);
            try {
              await onSave(draft);
            } finally {
              setSaving(false);
            }
          }}
          className="p-6 space-y-6"
        >
          <Row>
            <Field label="Titre" required>
              <input value={draft.title} onChange={(e) => patch("title", e.target.value)} className="form-input" required />
            </Field>
            <Field label="Slug (URL)" help="Vide = généré depuis le titre">
              <input value={draft.slug} onChange={(e) => patch("slug", e.target.value)} className="form-input" placeholder="auto" />
            </Field>
          </Row>

          <Row>
            <Field label="Client">
              <input value={draft.client} onChange={(e) => patch("client", e.target.value)} className="form-input" />
            </Field>
            <Field label="Année">
              <input value={draft.year} onChange={(e) => patch("year", e.target.value)} className="form-input" />
            </Field>
          </Row>

          <Row>
            <Field label="Catégorie">
              <select value={draft.category} onChange={(e) => patch("category", e.target.value as ProjectCategory)} className="form-input">
                {(Object.keys(CATEGORY_LABELS) as ProjectCategory[]).map((k) => (
                  <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>
                ))}
              </select>
            </Field>
            <Field label="À la une">
              <label className="inline-flex items-center gap-2 mt-3">
                <input type="checkbox" checked={!!draft.featured} onChange={(e) => patch("featured", e.target.checked)} />
                <span className="text-sm text-ink">Afficher en page d'accueil</span>
              </label>
            </Field>
          </Row>

          <Field label="Image de couverture (URL ou lien Drive)" help="Drive → conversion auto en image">
            <input value={draft.cover} onChange={(e) => patch("cover", e.target.value)} className="form-input" placeholder="https://..." />
            {draft.cover && (
              <div className="mt-3 aspect-[16/9] bg-muted overflow-hidden">
                <img src={draft.cover} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </Field>

          <Field label="Résumé (1 phrase)">
            <textarea value={draft.summary} onChange={(e) => patch("summary", e.target.value)} rows={2} className="form-input resize-none" />
          </Field>

          <Field label="Description complète">
            <textarea value={draft.description} onChange={(e) => patch("description", e.target.value)} rows={4} className="form-input resize-none" />
          </Field>

          <Field label="Tags (séparés par des virgules)">
            <input
              value={draft.tags?.join(", ") || ""}
              onChange={(e) => patch("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              className="form-input"
              placeholder="Édition, Infographie, Print"
            />
          </Field>

          {/* MEDIA SLOTS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="eyebrow">Médias — par catégorie ({draft.media.length})</p>
            </div>

            <div className="bg-white border border-border p-3 mb-4">
              <p className="text-[10px] uppercase tracking-widest text-ink-muted mb-2">Ajouter un élément</p>
              <div className="flex flex-wrap gap-1.5">
                {SLOT_ORDER.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => addMediaSlot(slot)}
                    className="text-[11px] border border-border px-2.5 py-1 hover:border-gold hover:text-brand text-ink-muted"
                  >
                    + {SLOT_LABELS[slot]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {draft.media.length === 0 && (
                <p className="text-xs text-ink-muted py-6 text-center bg-muted">
                  Aucun média. Choisissez ci-dessus la nature de l'élément à ajouter.
                </p>
              )}
              {draft.media.map((m, i) => (
                <MediaRow
                  key={i}
                  item={m}
                  onChange={(p) => updateMedia(i, p)}
                  onRemove={() => removeMedia(i)}
                  onMoveUp={() => moveMedia(i, -1)}
                  onMoveDown={() => moveMedia(i, 1)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 sticky bottom-0 bg-canvas py-4 -mx-6 px-6 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border hover:border-gold">
              Annuler
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-brand text-brand-foreground text-sm hover:bg-gold hover:text-brand inline-flex items-center gap-2 disabled:opacity-60">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .form-input { width: 100%; background: white; border: 1px solid var(--rule); padding: 0.625rem 0.75rem; font-size: 0.875rem; color: var(--ink); outline: none; transition: border-color 0.15s; }
        .form-input:focus { border-color: var(--gold); }
      `}</style>
    </div>
  );
}

function MediaRow({
  item,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  item: MediaItem;
  onChange: (p: Partial<MediaItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function uploadPdf(file: File) {
    if (file.size > 50 * 1024 * 1024) {
      toast.error("PDF > 50 Mo, trop lourd");
      return;
    }
    setUploading(true);
    try {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]+/g, "_")}`;
      const { error } = await supabase.storage.from("project-pdfs").upload(path, file, {
        contentType: "application/pdf",
        cacheControl: "31536000",
      });
      if (error) throw error;
      // 10-year signed URL
      const { data: signed, error: sErr } = await supabase.storage
        .from("project-pdfs")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (sErr || !signed) throw sErr || new Error("URL signée échouée");
      onChange({ url: signed.signedUrl, kind: "pdf" });
      toast.success("PDF uploadé");
    } catch (e: any) {
      toast.error(e?.message || "Upload échoué");
    } finally {
      setUploading(false);
    }
  }

  const isPdf = item.kind === "pdf";

  return (
    <div className="border border-border p-3 bg-white">
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <select
            value={item.slot}
            onChange={(e) => {
              const slot = e.target.value as MediaSlot;
              onChange({ slot, kind: DEFAULT_KIND_FOR_SLOT[slot] });
            }}
            className="text-[11px] border border-border px-2 py-1 bg-canvas text-brand font-semibold uppercase tracking-widest"
          >
            {SLOT_ORDER.map((s) => (
              <option key={s} value={s}>{SLOT_LABELS[s]}</option>
            ))}
          </select>
          <select
            value={item.kind}
            onChange={(e) => onChange({ kind: e.target.value as MediaKind })}
            className="text-[11px] border border-border px-2 py-1 bg-canvas"
          >
            <option value="image">Image</option>
            <option value="video">Vidéo</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onMoveUp} className="text-xs text-ink-muted hover:text-brand px-1">↑</button>
          <button type="button" onClick={onMoveDown} className="text-xs text-ink-muted hover:text-brand px-1">↓</button>
          <button type="button" onClick={onRemove} className="text-destructive hover:underline text-xs ml-2">Retirer</button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            value={item.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder={isPdf ? "URL du PDF (ou utiliser Upload →)" : item.kind === "video" ? "URL YouTube / Vimeo / Drive" : "URL image ou lien Drive"}
            className="form-input flex-1"
          />
          {isPdf && (
            <>
              <input
                ref={fileInput}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadPdf(f);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 border border-border px-3 text-xs uppercase tracking-widest hover:border-gold hover:text-brand text-ink-muted disabled:opacity-60"
              >
                {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                {uploading ? "Upload…" : "Upload PDF"}
              </button>
            </>
          )}
        </div>
        <input
          value={item.caption || ""}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="Légende (optionnelle)"
          className="form-input"
        />
      </div>
        <div className="grid md:grid-cols-2 gap-2 mt-2">
          <input
            value={item.label || ""}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Libellé personnalisé (optionnel — renomme la section)"
            className="form-input"
          />
          <input
            value={item.caption || ""}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Légende (optionnel)"
            className="form-input"
          />
        </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, required, help, children }: { label: string; required?: boolean; help?: string; children: React.ReactNode }) {
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