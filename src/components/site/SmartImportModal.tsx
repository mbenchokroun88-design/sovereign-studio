import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus, Sparkles, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { smartImportProject } from "@/lib/api/smart-import.functions";
import type { Project } from "@/lib/store/projects";

type DraftMedia = { url: string; filename?: string; hint?: string; uploading?: boolean };

export function SmartImportModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (draft: Omit<Project, "id">) => Promise<void>;
}) {
  const [brief, setBrief] = useState("");
  const [medias, setMedias] = useState<DraftMedia[]>([{ url: "" }]);
  const [bulkUrls, setBulkUrls] = useState("");
  const [running, setRunning] = useState(false);
  const smartImport = useServerFn(smartImportProject);

  function addRow() {
    setMedias((m) => [...m, { url: "" }]);
  }
  function updateRow(i: number, p: Partial<DraftMedia>) {
    setMedias((m) => m.map((x, j) => (j === i ? { ...x, ...p } : x)));
  }
  function removeRow(i: number) {
    setMedias((m) => m.filter((_, j) => j !== i));
  }

  async function handleFiles(i: number, files: FileList | null) {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    updateRow(i, { uploading: true });
    const uploaded: DraftMedia[] = [];
    for (const file of arr) {
      const path = `imports/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from("project-media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) {
        toast.error(`Upload ${file.name} : ${error.message}`);
        continue;
      }
      const { data } = supabase.storage.from("project-media").getPublicUrl(path);
      uploaded.push({ url: data.publicUrl, filename: file.name });
    }
    setMedias((m) => {
      const next = [...m];
      // remplace la ligne courante par le 1er upload, ajoute les autres
      if (uploaded[0]) next[i] = { ...uploaded[0], uploading: false };
      else next[i] = { ...next[i], uploading: false };
      return [...next, ...uploaded.slice(1)];
    });
  }

  function ingestBulkUrls() {
    const lines = bulkUrls
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    setMedias((m) => [
      ...m.filter((x) => x.url.trim()),
      ...lines.map((url) => ({ url })),
    ]);
    setBulkUrls("");
    toast.success(`${lines.length} URL ajoutées`);
  }

  async function run() {
    const cleaned = medias.filter((m) => m.url.trim());
    if (!brief.trim()) return toast.error("Ajoute un brief");
    if (cleaned.length === 0) return toast.error("Ajoute au moins un média");
    setRunning(true);
    try {
      const result = await smartImport({ data: { brief, medias: cleaned } });
      await onCreated({
        slug: result.slug,
        title: result.title,
        client: result.client,
        year: result.year,
        category: result.category,
        summary: result.summary,
        description: result.description,
        cover: result.cover,
        featured: false,
        tags: result.tags ?? [],
        media: result.media as Project["media"],
      });
      toast.success("Projet créé par IA 🪄");
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      toast.error(msg);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-brand/70 backdrop-blur-sm flex items-stretch md:items-center justify-center p-0 md:p-6">
      <div className="bg-canvas w-full max-w-3xl max-h-screen md:max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-canvas border-b border-border flex justify-between items-center px-6 py-4 z-10">
          <div className="flex items-center gap-3">
            <div className="size-9 grid place-items-center bg-gold/15 text-gold">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-brand">Import IA</h2>
              <p className="text-xs text-ink-muted">L'IA analyse, classe et publie</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-ink-muted hover:text-brand">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-xs uppercase tracking-widest text-ink-muted">Brief du projet</label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={6}
              className="form-input mt-2"
              placeholder={`Ex : Couverture de la conférence régionale OCDE-Maroc 2024, Rabat.
Client : Ministère de l'Économie. Identité visuelle complète, save the date, programme, roll-ups d'accueil, badges intervenants, photocall, captation vidéo et rapport final 80 pages.`}
            />
            <p className="text-[11px] text-ink-muted mt-1">
              Plus tu en dis (client, contexte, livrables, ton), meilleure sera la fiche.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs uppercase tracking-widest text-ink-muted">
                Médias ({medias.filter((m) => m.url.trim()).length})
              </label>
              <button
                type="button"
                onClick={addRow}
                className="text-xs inline-flex items-center gap-1 text-brand hover:text-gold"
              >
                <Plus size={12} /> Ajouter une ligne
              </button>
            </div>
            <div className="space-y-2">
              {medias.map((m, i) => (
                <div key={i} className="border border-border p-3 bg-canvas">
                  <div className="flex gap-2">
                    <input
                      value={m.url}
                      onChange={(e) => updateRow(i, { url: e.target.value })}
                      className="form-input flex-1"
                      placeholder="URL Drive, image, PDF, vidéo…"
                    />
                    <label className="inline-flex items-center justify-center px-3 border border-border text-ink-muted hover:text-brand hover:border-brand cursor-pointer">
                      {m.uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFiles(i, e.target.files)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="p-2 text-ink-muted hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      value={m.filename ?? ""}
                      onChange={(e) => updateRow(i, { filename: e.target.value })}
                      className="form-input flex-1 text-xs"
                      placeholder="Nom de fichier (aide l'IA — optionnel)"
                    />
                    <input
                      value={m.hint ?? ""}
                      onChange={(e) => updateRow(i, { hint: e.target.value })}
                      className="form-input flex-1 text-xs"
                      placeholder="Indice (rollup, badge, photo…)"
                    />
                  </div>
                </div>
              ))}
            </div>

            <details className="mt-3 text-xs">
              <summary className="cursor-pointer text-ink-muted hover:text-brand">
                Coller plusieurs URLs d'un coup
              </summary>
              <div className="mt-2 flex gap-2">
                <textarea
                  value={bulkUrls}
                  onChange={(e) => setBulkUrls(e.target.value)}
                  rows={3}
                  className="form-input flex-1"
                  placeholder="Une URL par ligne (ou séparées par virgules)"
                />
                <button
                  type="button"
                  onClick={ingestBulkUrls}
                  className="px-3 bg-brand text-brand-foreground text-xs uppercase tracking-widest hover:bg-gold hover:text-brand"
                >
                  Ajouter
                </button>
              </div>
            </details>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-[11px] text-ink-muted">
              L'IA classe les médias, choisit les mockups 3D et publie directement.
            </p>
            <button
              type="button"
              onClick={run}
              disabled={running}
              className="inline-flex items-center gap-2 bg-gold text-brand px-5 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-brand hover:text-brand-foreground disabled:opacity-50"
            >
              {running ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {running ? "Analyse IA…" : "Générer & publier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}