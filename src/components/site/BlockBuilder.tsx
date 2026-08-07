import { useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  Image as ImageIcon,
  Rows3,
  Type,
  Video,
  FileText,
  MoveVertical,
  Upload,
  Loader2,
  Columns,
  LayoutTemplate,
  Grid2X2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MediaUploadButton } from "@/components/site/MediaUploadButton";
import {
  MOCKUP_LABELS,
  newBlockId,
  type LayoutBlock,
  type MockupTemplate,
} from "@/lib/store/projects";

type BlockType = LayoutBlock["type"];

const BLOCK_MENU: { type: BlockType; label: string; icon: any; make: () => LayoutBlock }[] = [
  {
    type: "image",
    label: "Image",
    icon: ImageIcon,
    make: () => ({ id: newBlockId(), type: "image", url: "", width: "full", caption: "", mockup: "none" }),
  },
  {
    type: "gallery",
    label: "Galerie",
    icon: Rows3,
    make: () => ({ id: newBlockId(), type: "gallery", urls: ["", ""], columns: 2, caption: "", variant: "grid" }),
  },
  {
    type: "text_image",
    label: "Texte + Image",
    icon: Columns,
    make: () => ({
      id: newBlockId(),
      type: "text_image",
      url: "",
      heading: "",
      body: "",
      position: "left",
      textSize: "sm",
      width: "wide",
    }),
  },
  {
    type: "text",
    label: "Texte",
    icon: Type,
    make: () => ({ id: newBlockId(), type: "text", eyebrow: "", heading: "", body: "", align: "left" }),
  },
  {
    type: "video",
    label: "Vidéo",
    icon: Video,
    make: () => ({ id: newBlockId(), type: "video", url: "", caption: "" }),
  },
  {
    type: "pdf",
    label: "PDF",
    icon: FileText,
    make: () => ({ id: newBlockId(), type: "pdf", url: "", caption: "" }),
  },
  {
    type: "spacer",
    label: "Espaceur",
    icon: MoveVertical,
    make: () => ({ id: newBlockId(), type: "spacer", size: "md" }),
  },
  {
    type: "columns",
    label: "Grille (colonnes)",
    icon: Grid2X2,
    make: () => ({ id: newBlockId(), type: "columns", cols: 2, gap: "md", title: "", children: [] }),
  },
];

export function makeBlock(type: BlockType): LayoutBlock {
  return BLOCK_MENU.find((b) => b.type === type)!.make();
}

export function BlockBuilder({
  blocks,
  onChange,
  modules,
}: {
  blocks: LayoutBlock[];
  onChange: (next: LayoutBlock[]) => void;
  /** Sections natives disponibles (mode page) */
  modules?: { key: string; label: string }[];
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function add(type: BlockType) {
    const item = BLOCK_MENU.find((b) => b.type === type)!.make();
    onChange([...blocks, item]);
  }
  function addModule(key: string) {
    onChange([...blocks, { id: newBlockId(), type: "module", module: key }]);
  }
  function update(i: number, patch: Partial<LayoutBlock>) {
    const next = [...blocks];
    next[i] = { ...next[i], ...patch } as LayoutBlock;
    onChange(next);
  }
  function remove(i: number) {
    onChange(blocks.filter((_, j) => j !== i));
  }
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    onChange(arrayMove(blocks, oldIdx, newIdx));
  }

  return (
    <div>
      <div className="bg-brand text-brand-foreground p-4 mb-4">
        <p className="text-[10px] uppercase tracking-widest text-gold mb-2">
          ✦ Page Builder — Composez la fiche projet
        </p>
        <p className="text-xs text-canvas/80 mb-3">
          Empilez les blocs dans l'ordre où vous voulez les voir. Glissez-déposez pour réorganiser.
          Si vous n'ajoutez aucun bloc, l'ancien affichage par catégorie reste utilisé.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {BLOCK_MENU.map((b) => {
            const Icon = b.icon;
            return (
              <button
                key={b.type}
                type="button"
                onClick={() => add(b.type)}
                className="inline-flex items-center gap-1.5 bg-canvas/10 hover:bg-gold hover:text-brand text-canvas px-3 py-1.5 text-[11px] uppercase tracking-widest transition-colors"
              >
                <Icon size={12} /> + {b.label}
              </button>
            );
          })}
        </div>
        {modules && modules.length > 0 && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-gold mt-4 mb-2">
              Sections natives de la page
            </p>
            <div className="flex flex-wrap gap-1.5">
              {modules.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => addModule(m.key)}
                  className="inline-flex items-center gap-1.5 bg-gold/20 hover:bg-gold hover:text-brand text-canvas px-3 py-1.5 text-[11px] uppercase tracking-widest transition-colors"
                >
                  <LayoutTemplate size={12} /> + {m.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {blocks.length === 0 ? (
        <p className="text-xs text-ink-muted py-10 text-center bg-muted border border-dashed border-border">
          Aucun bloc — ajoutez-en ci-dessus pour commencer à composer la page.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {blocks.map((b, i) => (
                <SortableBlock
                  key={b.id}
                  block={b}
                  modules={modules}
                  onChange={(p) => update(i, p)}
                  onRemove={() => remove(i)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableBlock({
  block,
  onChange,
  onRemove,
  modules,
}: {
  block: LayoutBlock;
  onChange: (p: Partial<LayoutBlock>) => void;
  onRemove: () => void;
  modules?: { key: string; label: string }[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-border bg-white shadow-sm"
    >
      <div className="flex items-center justify-between px-3 py-2 bg-muted/60 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1 cursor-grab active:cursor-grabbing text-ink-muted hover:text-brand"
            aria-label="Déplacer"
          >
            <GripVertical size={16} />
          </button>
          <span className="text-[10px] uppercase tracking-widest text-brand font-semibold">
            {block.type === "module"
              ? `Section · ${modules?.find((m) => m.key === block.module)?.label ?? block.module}`
              : labelFor(block.type)}
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-destructive hover:underline text-xs inline-flex items-center gap-1"
        >
          <Trash2 size={12} /> Retirer
        </button>
      </div>
      <div className="p-3">
        {block.type === "module" ? (
          <p className="text-xs text-ink-muted">
            Section native — son contenu se gère ailleurs (projets, clients, formulaire…). Déplacez-la ou
            retirez-la pour changer la page.
          </p>
        ) : (
          <BlockEditor block={block} onChange={onChange} />
        )}
      </div>
    </div>
  );
}

function labelFor(t: BlockType) {
  return BLOCK_MENU.find((b) => b.type === t)?.label ?? t;
}

function BlockEditor({
  block,
  onChange,
}: {
  block: LayoutBlock;
  onChange: (p: Partial<LayoutBlock>) => void;
}) {
  switch (block.type) {
    case "image":
      return <ImageEditor block={block} onChange={onChange as any} />;
    case "gallery":
      return <GalleryEditor block={block} onChange={onChange as any} />;
    case "text_image":
      return <TextImageEditor block={block} onChange={onChange as any} />;
    case "text":
      return <TextEditor block={block} onChange={onChange as any} />;
    case "video":
      return <UrlEditor block={block} onChange={onChange as any} placeholder="URL YouTube / Vimeo / Drive" />;
    case "pdf":
      return <PdfEditor block={block} onChange={onChange as any} />;
    case "spacer":
      return (
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-ink-muted">Hauteur :</span>
          {(["sm", "md", "lg"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ size: s } as any)}
              className={`text-[11px] px-3 py-1 border ${
                (block as any).size === s
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border text-ink-muted hover:border-gold"
              }`}
            >
              {s === "sm" ? "Petit" : s === "md" ? "Moyen" : "Grand"}
            </button>
          ))}
        </div>
      );
    case "columns":
      return <ColumnsEditor block={block} onChange={onChange as any} />;
    default:
      return null;
  }
}

/** Grille : plusieurs blocs côte à côte pour composer une page librement. */
function ColumnsEditor({
  block,
  onChange,
}: {
  block: Extract<LayoutBlock, { type: "columns" }>;
  onChange: (p: Partial<Extract<LayoutBlock, { type: "columns" }>>) => void;
}) {
  const children = block.children || [];
  const setChild = (i: number, p: Partial<LayoutBlock>) => {
    const next = [...children];
    next[i] = { ...next[i], ...p } as LayoutBlock;
    onChange({ children: next });
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= children.length) return;
    const next = [...children];
    [next[i], next[j]] = [next[j], next[i]];
    onChange({ children: next });
  };

  return (
    <div className="space-y-3">
      <input
        value={block.title || ""}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Titre de la grille (optionnel)"
        className="form-input"
      />
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-widest text-ink-muted">Colonnes :</span>
        {([2, 3] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange({ cols: c })}
            className={`text-[11px] px-3 py-1 border ${
              block.cols === c ? "bg-brand text-brand-foreground border-brand" : "border-border text-ink-muted hover:border-gold"
            }`}
          >
            {c}
          </button>
        ))}
        <span className="text-[10px] uppercase tracking-widest text-ink-muted ml-3">Espacement :</span>
        {(["sm", "md", "lg"] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onChange({ gap: g })}
            className={`text-[11px] px-3 py-1 border ${
              (block.gap || "md") === g ? "bg-brand text-brand-foreground border-brand" : "border-border text-ink-muted hover:border-gold"
            }`}
          >
            {g === "sm" ? "Serré" : g === "md" ? "Normal" : "Aéré"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
        <span className="text-[10px] uppercase tracking-widest text-ink-muted self-center mr-1">Ajouter dans la grille :</span>
        {BLOCK_MENU.filter((b) => b.type !== "columns").map((b) => (
          <button
            key={b.type}
            type="button"
            onClick={() => onChange({ children: [...children, makeBlock(b.type)] })}
            className="inline-flex items-center gap-1 border border-border px-2 py-1 text-[11px] text-ink-muted hover:border-gold hover:text-brand"
          >
            <Plus size={10} /> {b.label}
          </button>
        ))}
      </div>

      {children.length === 0 ? (
        <p className="text-xs text-ink-muted py-6 text-center bg-muted border border-dashed border-border">
          Grille vide — ajoutez des éléments, ils se placeront côte à côte.
        </p>
      ) : (
        <div className="space-y-2">
          {children.map((c, i) => (
            <div key={c.id} className="border border-border">
              <div className="flex items-center justify-between px-2 py-1.5 bg-muted/60 border-b border-border">
                <span className="text-[10px] uppercase tracking-widest text-brand font-semibold">
                  Colonne {i + 1} · {labelFor(c.type)}
                </span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => move(i, -1)} className="text-xs text-ink-muted hover:text-brand">↑</button>
                  <button type="button" onClick={() => move(i, 1)} className="text-xs text-ink-muted hover:text-brand">↓</button>
                  <button
                    type="button"
                    onClick={() => onChange({ children: children.filter((_, j) => j !== i) })}
                    className="text-destructive text-xs inline-flex items-center gap-1"
                  >
                    <Trash2 size={11} /> Retirer
                  </button>
                </div>
              </div>
              <div className="p-2">
                <BlockEditor block={c} onChange={(p) => setChild(i, p)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ImageEditor({
  block,
  onChange,
}: {
  block: Extract<LayoutBlock, { type: "image" }>;
  onChange: (p: Partial<Extract<LayoutBlock, { type: "image" }>>) => void;
}) {
  return (
    <div className="space-y-2">
      <input
        value={block.title || ""}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Titre de la section (optionnel) — ex. Roll-up & photocall"
        className="form-input"
      />
      <div className="flex gap-2">
        <input
          value={block.url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="URL de l'image (ou lien Drive)"
          className="form-input flex-1"
        />
        <MediaUploadButton onUploaded={(url) => onChange({ url })} folder="blocks" accept="image/*" />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-widest text-ink-muted">Largeur :</span>
        {(["full", "wide", "centered"] as const).map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => onChange({ width: w })}
            className={`text-[11px] px-3 py-1 border ${
              block.width === w
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border text-ink-muted hover:border-gold"
            }`}
          >
            {w === "full" ? "Pleine largeur" : w === "wide" ? "Large" : "Centrée"}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-widest text-ink-muted">Mockup 3D :</span>
        <select
          value={block.mockup || "none"}
          onChange={(e) =>
            onChange({ mockup: e.target.value === "none" ? "none" : (e.target.value as MockupTemplate) })
          }
          className="text-[11px] border border-border px-2 py-1 bg-canvas"
        >
          <option value="none">Aucun (image plate)</option>
          {(Object.keys(MOCKUP_LABELS) as MockupTemplate[]).map((k) => (
            <option key={k} value={k}>{MOCKUP_LABELS[k]}</option>
          ))}
        </select>
      </div>
      {block.mockup && block.mockup !== "none" && (
        <div className="space-y-1.5 pl-3 border-l-2 border-gold/40">
          <p className="text-[10px] text-ink-muted">Vues additionnelles pour l'animation (optionnel) :</p>
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              value={block.mockupViews?.[i] || ""}
              onChange={(e) => {
                const next = [...(block.mockupViews || [])];
                next[i] = e.target.value;
                onChange({ mockupViews: next });
              }}
              placeholder={`Vue ${i + 2} — URL`}
              className="form-input"
            />
          ))}
        </div>
      )}
      <input
        value={block.caption || ""}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="Légende (optionnel)"
        className="form-input"
      />
      <label className="flex items-center gap-2 text-xs text-ink-muted">
        <input type="checkbox" checked={!!block.crop} onChange={(e) => onChange({ crop: e.target.checked })} />
        Recadrer l'image (sinon elle est toujours affichée en entier)
      </label>
      {block.url && (
        <div className="mt-2 max-h-48 overflow-hidden bg-muted">
          <img src={block.url} alt="" className="w-full h-auto object-contain" />
        </div>
      )}
    </div>
  );
}

function GalleryEditor({
  block,
  onChange,
}: {
  block: Extract<LayoutBlock, { type: "gallery" }>;
  onChange: (p: Partial<Extract<LayoutBlock, { type: "gallery" }>>) => void;
}) {
  function setUrl(i: number, v: string) {
    const next = [...block.urls];
    next[i] = v;
    onChange({ urls: next });
  }
  return (
    <div className="space-y-2">
      <input
        value={block.title || ""}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Titre de la section (optionnel)"
        className="form-input"
      />
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-widest text-ink-muted">Rendu :</span>
        {(["grid", "cinematic"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange({ variant: v })}
            className={`text-[11px] px-3 py-1 border ${
              (block.variant || "grid") === v
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border text-ink-muted hover:border-gold"
            }`}
          >
            {v === "grid" ? "Grille" : "Cinématique (flou progressif)"}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-ink-muted">Colonnes :</span>
        {([2, 3] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange({ columns: c })}
            className={`text-[11px] px-3 py-1 border ${
              block.columns === c
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border text-ink-muted hover:border-gold"
            }`}
          >
            {c}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange({ urls: [...block.urls, ""] })}
          className="ml-auto text-[11px] px-3 py-1 border border-border hover:border-gold text-ink-muted"
        >
          + Image
        </button>
      </div>
      <div className="space-y-1.5">
        {block.urls.map((u, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={u}
              onChange={(e) => setUrl(i, e.target.value)}
              placeholder={`Image ${i + 1} — URL`}
              className="form-input flex-1"
            />
            <MediaUploadButton
              onUploaded={(url) => setUrl(i, url)}
              folder="galleries"
              accept="image/*"
              label=""
            />
            {block.urls.length > 1 && (
              <button
                type="button"
                onClick={() => onChange({ urls: block.urls.filter((_, j) => j !== i) })}
                className="text-destructive hover:underline text-xs"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <input
        value={block.caption || ""}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="Légende (optionnel)"
        className="form-input"
      />
      <label className="flex items-center gap-2 text-xs text-ink-muted">
        <input type="checkbox" checked={!!block.crop} onChange={(e) => onChange({ crop: e.target.checked })} />
        Recadrer les images en grille (sinon elles restent complètes)
      </label>
    </div>
  );
}

function TextEditor({
  block,
  onChange,
}: {
  block: Extract<LayoutBlock, { type: "text" }>;
  onChange: (p: Partial<Extract<LayoutBlock, { type: "text" }>>) => void;
}) {
  return (
    <div className="space-y-2">
      <input
        value={block.eyebrow || ""}
        onChange={(e) => onChange({ eyebrow: e.target.value })}
        placeholder="Sur-titre (optionnel)"
        className="form-input"
      />
      <input
        value={block.heading || ""}
        onChange={(e) => onChange({ heading: e.target.value })}
        placeholder="Titre"
        className="form-input"
      />
      <textarea
        value={block.body}
        onChange={(e) => onChange({ body: e.target.value })}
        rows={5}
        placeholder="Paragraphe(s) — sauts de ligne préservés"
        className="form-input resize-y"
      />
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-ink-muted">Alignement :</span>
        {(["left", "center"] as const).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => onChange({ align: a })}
            className={`text-[11px] px-3 py-1 border ${
              (block.align || "left") === a
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border text-ink-muted hover:border-gold"
            }`}
          >
            {a === "left" ? "Gauche" : "Centré"}
          </button>
        ))}
      </div>
    </div>
  );
}

function UrlEditor({
  block,
  onChange,
  placeholder,
}: {
  block: Extract<LayoutBlock, { type: "video" }>;
  onChange: (p: Partial<Extract<LayoutBlock, { type: "video" }>>) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <input
        value={block.url}
        onChange={(e) => onChange({ url: e.target.value })}
        placeholder={placeholder}
        className="form-input"
      />
      <input
        value={block.caption || ""}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="Légende (optionnel)"
        className="form-input"
      />
    </div>
  );
}

function PdfEditor({
  block,
  onChange,
}: {
  block: Extract<LayoutBlock, { type: "pdf" }>;
  onChange: (p: Partial<Extract<LayoutBlock, { type: "pdf" }>>) => void;
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
      const { error } = await supabase.storage
        .from("project-pdfs")
        .upload(path, file, { contentType: "application/pdf", cacheControl: "31536000" });
      if (error) throw error;
      const { data: signed, error: sErr } = await supabase.storage
        .from("project-pdfs")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (sErr || !signed) throw sErr || new Error("URL signée échouée");
      onChange({ url: signed.signedUrl });
      toast.success("PDF uploadé");
    } catch (e: any) {
      toast.error(e?.message || "Upload échoué");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        value={block.title || ""}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Titre de la section (ex. Voir le projet en entier)"
        className="form-input"
      />
      <div className="flex gap-2">
        <input
          value={block.url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="URL du PDF"
          className="form-input flex-1"
        />
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
      </div>
      <input
        value={block.caption || ""}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="Texte d'introduction sous le titre (optionnel)"
        className="form-input"
      />
      <label className="flex items-center gap-3 text-xs text-ink-muted">
        Couleur de fond de la section
        <input
          type="color"
          value={block.bg || "#0B1F3A"}
          onChange={(e) => onChange({ bg: e.target.value })}
          className="h-8 w-14 border border-border bg-white"
        />
        <button type="button" onClick={() => onChange({ bg: "" })} className="underline hover:text-brand">
          réinitialiser
        </button>
      </label>
    </div>
  );
}

function TextImageEditor({
  block,
  onChange,
}: {
  block: Extract<LayoutBlock, { type: "text_image" }>;
  onChange: (p: Partial<Extract<LayoutBlock, { type: "text_image" }>>) => void;
}) {
  const positions: { v: "left" | "right" | "top" | "bottom" | "overlay"; label: string }[] = [
    { v: "left", label: "Image ← Texte" },
    { v: "right", label: "Texte → Image" },
    { v: "top", label: "Image / Texte" },
    { v: "bottom", label: "Texte / Image" },
    { v: "overlay", label: "Texte sur image" },
  ];
  const overlayAligns: { v: NonNullable<Extract<LayoutBlock, { type: "text_image" }>["overlayAlign"]>; label: string }[] = [
    { v: "tl", label: "↖" }, { v: "tc", label: "↑" }, { v: "tr", label: "↗" },
    { v: "cl", label: "←" }, { v: "cc", label: "•" }, { v: "cr", label: "→" },
    { v: "bl", label: "↙" }, { v: "bc", label: "↓" }, { v: "br", label: "↘" },
  ];
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={block.url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="URL de l'image (ou lien Drive)"
          className="form-input flex-1"
        />
        <MediaUploadButton onUploaded={(url) => onChange({ url })} folder="blocks" accept="image/*" />
      </div>
      <input
        value={block.eyebrow || ""}
        onChange={(e) => onChange({ eyebrow: e.target.value })}
        placeholder="Sur-titre (optionnel)"
        className="form-input"
      />
      <input
        value={block.heading || ""}
        onChange={(e) => onChange({ heading: e.target.value })}
        placeholder="Titre"
        className="form-input"
      />
      <textarea
        value={block.body}
        onChange={(e) => onChange({ body: e.target.value })}
        rows={4}
        placeholder="Descriptif — sauts de ligne préservés"
        className="form-input resize-y"
      />
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-widest text-ink-muted">Disposition :</span>
        {positions.map((p) => (
          <button
            key={p.v}
            type="button"
            onClick={() => onChange({ position: p.v })}
            className={`text-[11px] px-3 py-1 border ${
              block.position === p.v
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border text-ink-muted hover:border-gold"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {block.position === "overlay" && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-ink-muted">Position du texte :</span>
          <div className="grid grid-cols-3 gap-1">
            {overlayAligns.map((a) => (
              <button
                key={a.v}
                type="button"
                onClick={() => onChange({ overlayAlign: a.v })}
                className={`text-[11px] w-8 h-8 border ${
                  (block.overlayAlign || "bl") === a.v
                    ? "bg-brand text-brand-foreground border-brand"
                    : "border-border text-ink-muted hover:border-gold"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-widest text-ink-muted">Taille du texte :</span>
        {(["sm", "md", "lg"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange({ textSize: s })}
            className={`text-[11px] px-3 py-1 border ${
              (block.textSize || "sm") === s
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border text-ink-muted hover:border-gold"
            }`}
          >
            {s === "sm" ? "Petit" : s === "md" ? "Moyen" : "Grand"}
          </button>
        ))}
        <span className="text-[10px] uppercase tracking-widest text-ink-muted ml-2">Largeur :</span>
        {(["wide", "full"] as const).map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => onChange({ width: w })}
            className={`text-[11px] px-3 py-1 border ${
              (block.width || "wide") === w
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border text-ink-muted hover:border-gold"
            }`}
          >
            {w === "wide" ? "Large" : "Pleine"}
          </button>
        ))}
      </div>
    </div>
  );
}