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
import { MOCKUP_LABELS, type MockupTemplate } from "@/lib/store/projects";
import { Mockup3D } from "@/components/site/Mockup3D";
import { useHeroSlides, type HeroSlide } from "@/lib/store/hero";
import { useClients, type ClientRow } from "@/lib/store/clients";

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
  const [tab, setTab] = useState<"projects" | "hero" | "clients">("projects");

  return (
    <SiteLayout>
      <section className="container-x pt-12 pb-8 border-b border-border">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="eyebrow mb-2">Console</p>
            <h1 className="font-serif text-4xl md:text-5xl text-brand">Console d'administration</h1>
            <p className="mt-3 text-sm text-ink-muted max-w-xl">
              Projets, slider d'accueil et clients — modifiables en direct. Les données sont persistées dans la base.
            </p>
          </div>
          {tab === "projects" && (
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 bg-brand text-brand-foreground px-4 py-2 text-xs uppercase tracking-widest hover:bg-gold hover:text-brand"
            >
              <Plus size={14} /> Nouveau projet
            </button>
          )}
        </div>
        <div className="mt-6 flex gap-1 border-b-0">
          {[
            { id: "projects" as const, label: "Projets" },
            { id: "hero" as const, label: "Slider d'accueil" },
            { id: "clients" as const, label: "Clients" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-xs uppercase tracking-widest border-b-2 transition-colors ${
                tab === t.id ? "border-gold text-brand" : "border-transparent text-ink-muted hover:text-brand"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {tab === "projects" && (
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
      )}

      {tab === "hero" && <HeroAdmin />}
      {tab === "clients" && <ClientsAdmin />}

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
        <MockupBlock item={item} onChange={onChange} />
    </div>
  );
}

function MockupBlock({ item, onChange }: { item: MediaItem; onChange: (p: Partial<MediaItem>) => void }) {
  const enabled = !!item.mockup;
  const tpl = (item.mockupTemplate || "magazine") as MockupTemplate;
  const views = item.mockupViews || [];
  function setView(i: number, v: string) {
    const next = [...views];
    next[i] = v;
    onChange({ mockupViews: next.filter((x, idx) => idx <= i || x) });
  }
  const isImage = item.kind === "image";
  const allViews = [item.url, ...views].filter(Boolean);
  return (
    <div className="mt-3 border-2 border-gold/50 bg-gold/5 p-3 rounded-sm">
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          disabled={!isImage}
          onChange={(e) => onChange({ mockup: e.target.checked, mockupTemplate: e.target.checked ? tpl : item.mockupTemplate })}
        />
        <span className="font-semibold uppercase tracking-widest text-[10px] text-brand">
          ✦ Afficher en mockup 3D animé
        </span>
        {!isImage && (
          <span className="text-[10px] text-ink-muted italic">(images uniquement)</span>
        )}
      </label>
      {enabled && isImage && (
        <div className="mt-3 grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest text-ink-muted">Template :</span>
              <select
                value={tpl}
                onChange={(e) => onChange({ mockupTemplate: e.target.value as MockupTemplate })}
                className="text-[11px] border border-border px-2 py-1 bg-canvas"
              >
                {(Object.keys(MOCKUP_LABELS) as MockupTemplate[]).map((k) => (
                  <option key={k} value={k}>{MOCKUP_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-ink-muted">
              Vues additionnelles (URLs d'images, ex. dos, double page, détail). Vide = répète l'image principale.
            </p>
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                value={views[i] || ""}
                onChange={(e) => setView(i, e.target.value)}
                placeholder={`Vue ${i + 2} — URL image (optionnel)`}
                className="form-input"
              />
            ))}
          </div>
          <div className="bg-white border border-border aspect-[4/3] overflow-hidden">
            {item.url ? (
              <Mockup3D template={tpl} views={allViews} auto size="thumb" />
            ) : (
              <div className="w-full h-full grid place-items-center text-[10px] text-ink-muted text-center px-4">
                Aperçu live — ajoutez l'URL de l'image ci-dessus
              </div>
            )}
          </div>
        </div>
      )}
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

// ============================================================
// HERO SLIDER ADMIN
// ============================================================
function HeroAdmin() {
  const { slides, add, update, remove, duplicate } = useHeroSlides();

  async function create() {
    await add({
      eyebrow: "Nouveau slide",
      title: "Titre du slide — *mot doré* ici.",
      subtitle: "Sous-titre descriptif.",
      image_url: "",
      cta_label: "Voir le portfolio",
      cta_href: "/portfolio",
      position: (slides[slides.length - 1]?.position ?? 0) + 1,
      visible: true,
    });
    toast.success("Slide créé");
  }

  return (
    <section className="container-x py-10">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-ink-muted max-w-2xl">
          Astuce : entourez un mot de <code className="bg-muted px-1">*astérisques*</code> dans le titre pour qu'il s'affiche en italique doré (effet shimmer).
        </p>
        <button onClick={create} className="inline-flex items-center gap-2 bg-brand text-brand-foreground px-4 py-2 text-xs uppercase tracking-widest hover:bg-gold hover:text-brand">
          <Plus size={14} /> Nouveau slide
        </button>
      </div>
      <div className="space-y-4">
        {slides.length === 0 && <p className="p-8 text-center text-ink-muted text-sm bg-white border border-border">Aucun slide.</p>}
        {slides.map((s) => (
          <HeroSlideEditor
            key={s.id}
            slide={s}
            onUpdate={(p) => update(s.id, p)}
            onDelete={async () => {
              if (confirm("Supprimer ce slide ?")) { await remove(s.id); toast.success("Slide supprimé"); }
            }}
            onDuplicate={async () => { await duplicate(s); toast.success("Slide dupliqué"); }}
          />
        ))}
      </div>
      <style>{`.form-input { width: 100%; background: white; border: 1px solid var(--rule); padding: 0.625rem 0.75rem; font-size: 0.875rem; color: var(--ink); outline: none; transition: border-color 0.15s; } .form-input:focus { border-color: var(--gold); }`}</style>
    </section>
  );
}

function HeroSlideEditor({ slide, onUpdate, onDelete, onDuplicate }: { slide: HeroSlide; onUpdate: (p: Partial<HeroSlide>) => Promise<void>; onDelete: () => void; onDuplicate: () => void }) {
  const [draft, setDraft] = useState(slide);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(slide);

  function set<K extends keyof HeroSlide>(k: K, v: HeroSlide[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }

  return (
    <div className="bg-white border border-border p-5">
      <div className="flex items-start gap-5">
        <div className="w-32 aspect-[4/3] bg-muted overflow-hidden flex-shrink-0">
          {draft.image_url && <img src={draft.image_url} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 grid md:grid-cols-2 gap-3">
          <Field label="Eyebrow (sur-titre)"><input value={draft.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} className="form-input" /></Field>
          <Field label="Image (URL)"><input value={draft.image_url} onChange={(e) => set("image_url", e.target.value)} className="form-input" placeholder="https://..." /></Field>
          <Field label="Titre (utilisez *mot* pour doré italique)"><textarea value={draft.title} onChange={(e) => set("title", e.target.value)} rows={2} className="form-input resize-none" /></Field>
          <Field label="Sous-titre"><textarea value={draft.subtitle} onChange={(e) => set("subtitle", e.target.value)} rows={2} className="form-input resize-none" /></Field>
          <Field label="CTA — Libellé"><input value={draft.cta_label} onChange={(e) => set("cta_label", e.target.value)} className="form-input" /></Field>
          <Field label="CTA — Lien"><input value={draft.cta_href} onChange={(e) => set("cta_href", e.target.value)} className="form-input" placeholder="/portfolio" /></Field>
          <Field label="Position"><input type="number" value={draft.position} onChange={(e) => set("position", Number(e.target.value))} className="form-input" /></Field>
          <Field label="Visible">
            <label className="inline-flex items-center gap-2 mt-3">
              <input type="checkbox" checked={draft.visible} onChange={(e) => set("visible", e.target.checked)} />
              <span className="text-sm">Afficher dans le slider</span>
            </label>
          </Field>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
        <button onClick={onDuplicate} className="text-xs px-3 py-1.5 border border-border hover:border-gold inline-flex items-center gap-1"><Copy size={12} /> Dupliquer</button>
        <button onClick={onDelete} className="text-xs px-3 py-1.5 border border-destructive/30 text-destructive hover:bg-destructive hover:text-white inline-flex items-center gap-1"><Trash2 size={12} /> Supprimer</button>
        <button
          disabled={!dirty || saving}
          onClick={async () => { setSaving(true); try { await onUpdate(draft); toast.success("Slide mis à jour"); } finally { setSaving(false); } }}
          className="text-xs px-4 py-1.5 bg-brand text-brand-foreground hover:bg-gold hover:text-brand inline-flex items-center gap-1 disabled:opacity-40"
        >
          {saving && <Loader2 size={12} className="animate-spin" />} Enregistrer
        </button>
      </div>
    </div>
  );
}

// ============================================================
// CLIENTS ADMIN
// ============================================================
function ClientsAdmin() {
  const { clients, add, update, remove } = useClients();
  const [mode, setMode] = useState<"names" | "logos">("names");

  async function create() {
    await add({
      name: "Nouveau client",
      logo_url: "",
      href: "",
      position: (clients[clients.length - 1]?.position ?? 0) + 1,
      visible: true,
    });
    toast.success("Client ajouté");
  }

  return (
    <section className="container-x py-10">
      <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
        <div className="flex gap-1 bg-white border border-border p-1">
          <button onClick={() => setMode("names")} className={`text-xs px-3 py-1.5 ${mode === "names" ? "bg-brand text-brand-foreground" : "text-ink-muted hover:text-brand"}`}>Noms uniquement</button>
          <button onClick={() => setMode("logos")} className={`text-xs px-3 py-1.5 ${mode === "logos" ? "bg-brand text-brand-foreground" : "text-ink-muted hover:text-brand"}`}>Avec logos</button>
        </div>
        <button onClick={create} className="inline-flex items-center gap-2 bg-brand text-brand-foreground px-4 py-2 text-xs uppercase tracking-widest hover:bg-gold hover:text-brand">
          <Plus size={14} /> Nouveau client
        </button>
      </div>
      <p className="text-xs text-ink-muted mb-4">Astuce : laissez le champ logo vide pour afficher uniquement le nom. Renseignez-le pour afficher le logo à la place.</p>
      <div className="bg-white border border-border divide-y divide-border">
        {clients.length === 0 && <p className="p-8 text-center text-ink-muted text-sm">Aucun client.</p>}
        {clients.map((c) => (
          <ClientRowEditor key={c.id} client={c} mode={mode} onUpdate={(p) => update(c.id, p)} onDelete={async () => { if (confirm("Supprimer ?")) { await remove(c.id); toast.success("Supprimé"); } }} />
        ))}
      </div>
      <style>{`.form-input { width: 100%; background: white; border: 1px solid var(--rule); padding: 0.5rem 0.75rem; font-size: 0.875rem; color: var(--ink); outline: none; } .form-input:focus { border-color: var(--gold); }`}</style>
    </section>
  );
}

function ClientRowEditor({ client, mode, onUpdate, onDelete }: { client: ClientRow; mode: "names" | "logos"; onUpdate: (p: Partial<ClientRow>) => Promise<void>; onDelete: () => void }) {
  const [draft, setDraft] = useState(client);
  const dirty = JSON.stringify(draft) !== JSON.stringify(client);

  return (
    <div className="flex items-center gap-3 p-3 flex-wrap">
      <div className="size-12 bg-muted overflow-hidden flex-shrink-0 grid place-items-center">
        {draft.logo_url ? <img src={draft.logo_url} alt="" className="w-full h-full object-contain" /> : <span className="text-[10px] text-ink-muted">—</span>}
      </div>
      <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Nom" className="form-input flex-1 min-w-[140px]" />
      {mode === "logos" && (
        <input value={draft.logo_url} onChange={(e) => setDraft({ ...draft, logo_url: e.target.value })} placeholder="URL du logo (png/svg)" className="form-input flex-1 min-w-[200px]" />
      )}
      <input value={draft.href} onChange={(e) => setDraft({ ...draft, href: e.target.value })} placeholder="Lien (optionnel)" className="form-input w-44" />
      <input type="number" value={draft.position} onChange={(e) => setDraft({ ...draft, position: Number(e.target.value) })} className="form-input w-16" />
      <label className="inline-flex items-center gap-1.5 text-xs">
        <input type="checkbox" checked={draft.visible} onChange={(e) => setDraft({ ...draft, visible: e.target.checked })} /> Visible
      </label>
      <button disabled={!dirty} onClick={async () => { await onUpdate(draft); toast.success("Enregistré"); }} className="text-xs px-3 py-1.5 bg-brand text-brand-foreground hover:bg-gold hover:text-brand disabled:opacity-40">Save</button>
      <button onClick={onDelete} className="text-xs px-2 py-1.5 text-destructive hover:underline"><Trash2 size={14} /></button>
    </div>
  );
}