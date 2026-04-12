import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ModuleWeek {
  id: string;
  module_id: string;
  week_number: number;
  title: string;
  description: string | null;
  action: string | null;
  action_prompt: string | null;
  xp: number;
  support_content: string | null;
}

export function useModuleWeeks(moduleId: string | undefined) {
  return useQuery({
    queryKey: ['module-weeks', moduleId],
    queryFn: async () => {
      if (!moduleId) return [];
      const { data, error } = await supabase
        .from('module_weeks')
        .select('id, module_id, week_number, title, description, action, action_prompt, xp, support_content')
        .eq('module_id', moduleId)
        .order('week_number', { ascending: true });
      if (error) throw error;
      return (data ?? []) as ModuleWeek[];
    },
    enabled: !!moduleId,
  });
}
