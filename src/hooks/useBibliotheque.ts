import { supabase } from '@/lib/supabase/client';
import type { Fiche, ResourceCategory } from '@/types';
import { useQuery } from '@tanstack/react-query';

type FicheRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ResourceCategory;
  author: string;
  author_avatar_url: string | null;
  created_at: string;
};

function toFiche(row: FicheRow): Fiche {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    author: row.author,
    authorAvatarUrl: row.author_avatar_url ?? undefined,
  };
}

export function useFiches() {
  return useQuery({
    queryKey: ['fiches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiches')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as FicheRow[]).map(toFiche);
    },
    staleTime: 1000 * 60 * 5,
  });
}
