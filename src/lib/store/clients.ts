import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ClientRow {
  id: string;
  name: string;
  logo_url: string;
  href: string;
  position: number;
  visible: boolean;
}

const KEY = ["clients"] as const;
const TABLE = "clients" as any;

export function useClients() {
  const qc = useQueryClient();
  const { data: clients = [], isLoading } = useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<ClientRow[]> => {
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return ((data as unknown) as ClientRow[]) || [];
    },
    staleTime: 30_000,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: KEY });

  return {
    clients,
    isLoading,
    add: async (p: Partial<ClientRow>) => {
      const { error } = await supabase.from(TABLE).insert(p as any);
      if (error) throw error;
      await refresh();
    },
    update: async (id: string, p: Partial<ClientRow>) => {
      const { error } = await supabase.from(TABLE).update(p as any).eq("id", id);
      if (error) throw error;
      await refresh();
    },
    remove: async (id: string) => {
      const { error } = await supabase.from(TABLE).delete().eq("id", id);
      if (error) throw error;
      await refresh();
    },
  };
}