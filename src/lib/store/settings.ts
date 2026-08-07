import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/lib/store/projects";

export interface MenuItem {
  label: string;
  href: string;
  visible?: boolean;
}

export interface HeaderSettings {
  logoText: string;
  logoTagline: string;
  /** Logo image (remplace le texte si renseigné) */
  logoImage: string;
  faviconUrl: string;
  menu: MenuItem[];
}

export interface CustomPage {
  slug: string;
  title: string;
}

export const DEFAULT_HEADER: HeaderSettings = {
  logoText: "MB.",
  logoTagline: "Benchokroun · Studio",
  logoImage: "",
  faviconUrl: "",
  menu: [
    { label: "Accueil", href: "/", visible: true },
    { label: "Portfolio", href: "/portfolio", visible: true },
    { label: "Studio", href: "/about", visible: true },
    { label: "Contact", href: "/contact", visible: true },
  ],
};

export interface GlobalSettings {
  /** Classer les projets / événements du plus récent au plus ancien */
  chronological?: boolean;
  /** Afficher le bandeau « Ils nous font confiance » sur l'accueil */
  showClients?: boolean;
  /** Identité du site : logo, favicon, menu */
  header?: Partial<HeaderSettings>;
  /** Pages créées depuis l'admin (mode Elementor) */
  customPages?: CustomPage[];
}

const TABLE = "site_settings" as never;
const KEY = ["site_settings"] as const;

export function useSiteSettings() {
  const qc = useQueryClient();
  const { data: settings = {} as GlobalSettings, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<GlobalSettings> => {
      const { data, error } = await supabase.from(TABLE).select("value").eq("key", "global").maybeSingle();
      if (error) throw error;
      return ((data as unknown as { value: GlobalSettings } | null)?.value || {}) as GlobalSettings;
    },
    staleTime: 30_000,
  });

  const save = async (patch: Partial<GlobalSettings>) => {
    const next = { ...settings, ...patch };
    const { error } = await supabase
      .from(TABLE)
      .upsert({ key: "global", value: next, updated_at: new Date().toISOString() } as never, {
        onConflict: "key",
      } as never);
    if (error) throw error;
    await qc.invalidateQueries({ queryKey: KEY });
  };

  return { settings, isLoading, save };
}

/** Réglages d'en-tête avec valeurs par défaut appliquées. */
export function useHeaderSettings() {
  const { settings, isLoading, save } = useSiteSettings();
  const header: HeaderSettings = {
    ...DEFAULT_HEADER,
    ...(settings.header || {}),
    menu:
      settings.header?.menu && settings.header.menu.length
        ? settings.header.menu
        : DEFAULT_HEADER.menu,
  };
  return { header, isLoading, saveHeader: (p: Partial<HeaderSettings>) => save({ header: { ...header, ...p } }) };
}

/** Tri chronologique descendant (année, puis ordre existant) quand l'option est active. */
export function sortProjects<T extends Pick<Project, "year">>(list: T[], chronological?: boolean): T[] {
  if (!chronological) return list;
  return [...list].sort((a, b) => (parseInt(b.year || "0", 10) || 0) - (parseInt(a.year || "0", 10) || 0));
}
