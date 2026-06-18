import { supabase } from '@/lib/supabase/client';
import type { Fiche, ReadingProgress, ResourceCategory } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type FicheRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ResourceCategory;
  author_user_id: string | null;
  public_profiles: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  content: string | null;
  reading_time_minutes: number | null;
};

type ProgressRow = {
  resource_slug: string;
  started_at: string;
  completed_at: string | null;
};

function toFiche(row: FicheRow): Fiche {
  const p = row.public_profiles;
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    author: [p?.first_name, p?.last_name].filter(Boolean).join(' '),
    authorUserId: row.author_user_id,
    authorAvatarUrl: p?.avatar_url ?? undefined,
    coverImageUrl: row.cover_image_url,
    content: row.content ?? undefined,
    readingTimeMinutes: row.reading_time_minutes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toProgress(row: ProgressRow): ReadingProgress {
  return {
    resourceSlug: row.resource_slug,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

export function useFichesByAuthor(userId: string) {
  return useQuery({
    queryKey: ['fiches', 'by-author', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiches')
        .select('*, public_profiles(first_name, last_name, avatar_url)')
        .eq('author_user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as FicheRow[]).map(toFiche);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
}

export function useFiches() {
  return useQuery({
    queryKey: ['fiches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiches')
        .select('*, public_profiles(first_name, last_name, avatar_url)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as FicheRow[]).map(toFiche);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useFiche(slug: string) {
  return useQuery({
    queryKey: ['fiches', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiches')
        .select('*, public_profiles(first_name, last_name, avatar_url)')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return toFiche(data as FicheRow);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useReadingProgress(slug: string, enabled = true) {
  return useQuery({
    queryKey: ['reading-progress', slug],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('resource_slug, started_at, completed_at')
        .eq('resource_slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data ? toProgress(data as ProgressRow) : null;
    },
  });
}

export function useInProgressFiches(enabled = true) {
  return useQuery({
    queryKey: ['in-progress-fiches'],
    enabled,
    queryFn: async () => {
      const { data: progressRows, error } = await supabase
        .from('reading_progress')
        .select('resource_slug, started_at, completed_at')
        .is('completed_at', null)
        .order('started_at', { ascending: false });
      if (error) throw error;
      if (!progressRows || progressRows.length === 0) return [];

      const slugs = (progressRows as ProgressRow[]).map((r) => r.resource_slug);
      const { data: ficheRows, error: fichesError } = await supabase
        .from('fiches')
        .select('*, public_profiles(first_name, last_name, avatar_url)')
        .in('slug', slugs);
      if (fichesError) throw fichesError;

      return slugs
        .map((slug) => (ficheRows as FicheRow[]).find((f) => f.slug === slug))
        .filter((f): f is FicheRow => f !== undefined)
        .map(toFiche);
    },
  });
}

export function useStartReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('reading_progress')
        .insert({ user_id: user.id, resource_slug: slug });
      // 23505 = unique_violation: already started reading this fiche - not an error
      if (error && error.code !== '23505') throw error;
    },
    onSuccess: (_data, slug) => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress', slug] });
      queryClient.invalidateQueries({ queryKey: ['in-progress-fiches'] });
    },
  });
}

export function useIsSaved(slug: string, enabled = true) {
  return useQuery({
    queryKey: ['saved-resources', slug],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_resources')
        .select('id')
        .eq('resource_slug', slug)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
}

export function useSaveResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, save }: { slug: string; save: boolean }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (save) {
        const { error } = await supabase
          .from('saved_resources')
          .insert({ user_id: user.id, resource_slug: slug });
        if (error && error.code !== '23505') throw error;
      } else {
        const { error } = await supabase
          .from('saved_resources')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_slug', slug);
        if (error) throw error;
      }
    },
    onSuccess: (_data, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ['saved-resources', slug] });
      queryClient.invalidateQueries({ queryKey: ['saved-fiches'] });
    },
  });
}

export function useSavedFiches(enabled = true) {
  return useQuery({
    queryKey: ['saved-fiches'],
    enabled,
    queryFn: async () => {
      const { data: savedRows, error } = await supabase
        .from('saved_resources')
        .select('resource_slug, saved_at')
        .order('saved_at', { ascending: false });
      if (error) throw error;
      if (!savedRows || savedRows.length === 0) return [];

      const slugs = (savedRows as { resource_slug: string }[]).map((r) => r.resource_slug);
      const { data: ficheRows, error: fichesError } = await supabase
        .from('fiches')
        .select('*, public_profiles(first_name, last_name, avatar_url)')
        .in('slug', slugs);
      if (fichesError) throw fichesError;

      return slugs
        .map((s) => (ficheRows as FicheRow[]).find((f) => f.slug === s))
        .filter((f): f is FicheRow => f !== undefined)
        .map(toFiche);
    },
  });
}

export function useMarkFicheCompleted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('reading_progress').upsert(
        {
          user_id: user.id,
          resource_slug: slug,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,resource_slug' }
      );
      if (error) throw error;
    },
    onSuccess: (_data, slug) => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress', slug] });
      queryClient.invalidateQueries({ queryKey: ['in-progress-fiches'] });
    },
  });
}
