import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LayoutBlock } from "@/lib/store/projects";

export type PageKey = "home" | "portfolio" | "project" | "studio" | "contact";
/** Clé de page : une page native ou une page créée dans l'admin (`custom-<slug>`). */
export type AnyPageKey = PageKey | string;

export const CUSTOM_PREFIX = "custom-";
export const isCustomPage = (k: AnyPageKey) => k.startsWith(CUSTOM_PREFIX);

export const PAGE_LABELS: Record<PageKey, string> = {
  home: "Accueil",
  portfolio: "Portfolio",
  project: "Page projet",
  studio: "Studio",
  contact: "Contact",
};

/** Sections « natives » de chaque page, réordonnables / masquables dans l'admin. */
export const PAGE_MODULES: Record<PageKey, { key: string; label: string }[]> = {
  home: [
    { key: "hero", label: "Hero / Slider" },
    { key: "clients", label: "Bandeau clients" },
    { key: "works", label: "Portfolio récent" },
    { key: "cta", label: "Appel à l'action" },
  ],
  portfolio: [
    { key: "header", label: "Titre de page" },
    { key: "index", label: "Index des projets" },
  ],
  project: [
    { key: "header", label: "En-tête du projet" },
    { key: "summary", label: "Descriptif court" },
    { key: "views", label: "Sélecteur d'affichage" },
    { key: "body", label: "Contenu du projet (images)" },
    { key: "flipbook", label: "Document / Flipbook" },
    { key: "cta", label: "Appel à l'action" },
    { key: "related", label: "Autres projets" },
  ],
  studio: [
    { key: "header", label: "Titre de page" },
    { key: "profile", label: "Portrait & chiffres" },
    { key: "disciplines", label: "Disciplines" },
    { key: "clients", label: "Clients sélectionnés" },
  ],
  contact: [
    { key: "header", label: "Titre de page" },
    { key: "form", label: "Coordonnées & formulaire" },
  ],
};

export const PAGE_DEFAULT_ORDER: Record<PageKey, string[]> = {
  home: ["hero", "clients", "works", "cta"],
  portfolio: ["header", "index"],
  project: ["header", "summary", "views", "body", "flipbook", "cta", "related"],
  studio: ["header", "profile", "disciplines", "clients"],
  contact: ["header", "form"],
};

export interface PageLayout {
  page: AnyPageKey;
  blocks: LayoutBlock[];
  enabled: boolean;
}

const TABLE = "page_layouts" as never;
const KEY = ["page_layouts"] as const;

export function usePageLayouts() {
  const qc = useQueryClient();
  const { data: layouts = [], isLoading } = useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<PageLayout[]> => {
      const { data, error } = await supabase.from(TABLE).select("*");
      if (error) throw error;
      return ((data as unknown as PageLayout[]) || []).map((r) => ({
        page: r.page,
        enabled: !!r.enabled,
        blocks: Array.isArray(r.blocks) ? r.blocks : [],
      }));
    },
    staleTime: 30_000,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: KEY });

  const save = async (page: AnyPageKey, patch: Partial<Omit<PageLayout, "page">>) => {
    const current = layouts.find((l) => l.page === page);
    const row = {
      page,
      blocks: patch.blocks ?? current?.blocks ?? [],
      enabled: patch.enabled ?? current?.enabled ?? true,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from(TABLE).upsert(row as never, { onConflict: "page" } as never);
    if (error) throw error;
    await refresh();
  };

  const reset = async (page: AnyPageKey) => {
    const { error } = await supabase.from(TABLE).delete().eq("page", page);
    if (error) throw error;
    await refresh();
  };

  return { layouts, isLoading, save, reset, get: (p: AnyPageKey) => layouts.find((l) => l.page === p) };
}

export function usePageLayout(page: AnyPageKey) {
  const { layouts, isLoading } = usePageLayouts();
  return { layout: layouts.find((l) => l.page === page), isLoading };
}
