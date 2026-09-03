import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Category = { id: string; name: string; slug: string | null; sort_order: number };

export function useCategories() {
  return useQuery({
    queryKey: ["property-categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("property_categories")
        .select("id, name, slug, sort_order")
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCategoryCounts() {
  return useQuery({
    queryKey: ["property-category-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("id, category_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      let none = 0;
      for (const row of data ?? []) {
        if (row.category_id) counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
        else none++;
      }
      return { counts, none, total: data?.length ?? 0 };
    },
  });
}
