import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_label: string;
  cta_href: string;
  position: number;
  visible: boolean;
}

const KEY = ["hero_slides"] as const;
const TABLE = "hero_slides" as any;

export function useHeroSlides() {
  const qc = useQueryClient();
  const { data: slides = [], isLoading } = useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<HeroSlide[]> => {
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return (data as HeroSlide[]) || [];
    },
    staleTime: 30_000,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: KEY });

  return {
    slides,
    isLoading,
    add: async (p: Partial<HeroSlide>) => {
      const { error } = await supabase.from(TABLE).insert(p as any);
      if (error) throw error;
      await refresh();
    },
    update: async (id: string, p: Partial<HeroSlide>) => {
      const { error } = await supabase.from(TABLE).update(p as any).eq("id", id);
      if (error) throw error;
      await refresh();
    },
    remove: async (id: string) => {
      const { error } = await supabase.from(TABLE).delete().eq("id", id);
      if (error) throw error;
      await refresh();
    },
    duplicate: async (s: HeroSlide) => {
      const { id: _id, created_at: _c, updated_at: _u, ...rest } = s as any;
      const { error } = await supabase.from(TABLE).insert({ ...rest, position: (s.position || 0) + 1 } as any);
      if (error) throw error;
      await refresh();
    },
  };
}