import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/lib/store/projects";

export interface GlobalSettings {
  /** Classer les projets / événements du plus récent au plus ancien */
  chronological?: boolean;
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

/** Tri chronologique descendant (année, puis ordre existant) quand l'option est active. */
export function sortProjects<T extends Pick<Project, "year">>(list: T[], chronological?: boolean): T[] {
  if (!chronological) return list;
  return [...list].sort((a, b) => (parseInt(b.year || "0", 10) || 0) - (parseInt(a.year || "0", 10) || 0));
}
