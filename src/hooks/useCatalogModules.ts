import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CatalogModule {
  id: string;
  title: string;
  category: string;
  duration_minutes: number;
  total_duration_minutes: number | null;
  short_description: string;
  learning_outcomes: string[];
  core_lesson: string[];
  level: string | null;
  created_at: string;
}

export function useCatalogModules() {
  return useQuery({
    queryKey: ['catalog-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog_modules')
        .select('*')
        .order('id');
      if (error) throw error;
      return (data ?? []) as unknown as CatalogModule[];
    },
  });
}

export function useCatalogModule(id: string | undefined) {
  return useQuery({
    queryKey: ['catalog-module', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('catalog_modules')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as CatalogModule | null;
    },
    enabled: !!id,
  });
}
