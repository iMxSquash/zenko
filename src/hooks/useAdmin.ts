import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/use-auth';
import type { ForumUserRole, ResourceCategory } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ─── Types ────────────────────────────────────────────────────────────────────

type FicheRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ResourceCategory;
  author: string;
  author_avatar_url: string | null;
  created_at: string;
  content: string | null;
  reading_time_minutes: number | null;
};

type ProfileRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: ForumUserRole | null;
  created_at: string;
};

type AdminReplyRow = {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
};

type AdminThreadRow = {
  id: string;
  title: string;
  category: ResourceCategory;
  author_name: string;
  created_at: string;
  forum_replies: AdminReplyRow[];
};

export interface AdminFiche {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ResourceCategory;
  author: string;
  authorAvatarUrl: string | null;
  content: string | null;
  readingTimeMinutes: number | null;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: ForumUserRole | null;
  createdAt: string;
  isAdmin: boolean;
}

export interface AdminThread {
  id: string;
  title: string;
  category: ResourceCategory;
  authorName: string;
  createdAt: string;
  replyCount: number;
  replies: { id: string; content: string; authorName: string; createdAt: string }[];
}

export interface FicheInput {
  slug: string;
  title: string;
  description: string;
  category: ResourceCategory;
  author: string;
  authorAvatarUrl?: string | null;
  content?: string | null;
  readingTimeMinutes?: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toAdminFiche(row: FicheRow): AdminFiche {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    author: row.author,
    authorAvatarUrl: row.author_avatar_url,
    content: row.content,
    readingTimeMinutes: row.reading_time_minutes,
    createdAt: row.created_at,
  };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin', 'is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminFiches() {
  return useQuery({
    queryKey: ['admin', 'fiches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiches')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as FicheRow[]).map(toAdminFiche);
    },
  });
}

export function useCreateFiche() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: FicheInput) => {
      const { data, error } = await supabase
        .from('fiches')
        .insert({
          slug: input.slug,
          title: input.title,
          description: input.description,
          category: input.category,
          author: input.author,
          author_avatar_url: input.authorAvatarUrl ?? null,
          content: input.content ?? null,
          reading_time_minutes: input.readingTimeMinutes ?? null,
        })
        .select('slug')
        .single();
      if (error) throw error;
      return data as { slug: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiches'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'fiches'] });
    },
  });
}

export function useUpdateFiche() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, input }: { slug: string; input: Partial<FicheInput> }) => {
      const payload: Record<string, unknown> = {};
      if (input.title !== undefined) payload.title = input.title;
      if (input.description !== undefined) payload.description = input.description;
      if (input.category !== undefined) payload.category = input.category;
      if (input.author !== undefined) payload.author = input.author;
      if (input.authorAvatarUrl !== undefined) payload.author_avatar_url = input.authorAvatarUrl;
      if (input.content !== undefined) payload.content = input.content;
      if (input.readingTimeMinutes !== undefined)
        payload.reading_time_minutes = input.readingTimeMinutes;

      const { error } = await supabase.from('fiches').update(payload).eq('slug', slug);
      if (error) throw error;
    },
    onSuccess: (_data, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ['fiches'] });
      queryClient.invalidateQueries({ queryKey: ['fiches', slug] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'fiches'] });
    },
  });
}

export function useDeleteFiche() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      const { error } = await supabase.from('fiches').delete().eq('slug', slug);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiches'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'fiches'] });
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const [profilesResult, adminsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, email, first_name, last_name, avatar_url, role, created_at')
          .order('created_at', { ascending: false }),
        supabase.from('admins').select('user_id'),
      ]);
      if (profilesResult.error) throw profilesResult.error;
      if (adminsResult.error) throw adminsResult.error;

      const adminIds = new Set((adminsResult.data ?? []).map((a) => a.user_id));

      return (profilesResult.data as ProfileRow[]).map(
        (p): AdminUser => ({
          id: p.id,
          email: p.email,
          firstName: p.first_name,
          lastName: p.last_name,
          avatarUrl: p.avatar_url,
          role: p.role,
          createdAt: p.created_at,
          isAdmin: adminIds.has(p.id),
        })
      );
    },
  });
}

export function useAdminForumThreads() {
  return useQuery({
    queryKey: ['admin', 'forum', 'threads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_threads')
        .select(
          'id, title, category, author_name, created_at, forum_replies(id, content, author_name, created_at)'
        )
        .order('created_at', { ascending: false });
      if (error) throw error;

      return (data as AdminThreadRow[]).map(
        (t): AdminThread => ({
          id: t.id,
          title: t.title,
          category: t.category,
          authorName: t.author_name,
          createdAt: t.created_at,
          replyCount: t.forum_replies.length,
          replies: t.forum_replies.map((r) => ({
            id: r.id,
            content: r.content,
            authorName: r.author_name,
            createdAt: r.created_at,
          })),
        })
      );
    },
  });
}

export function useDeleteForumThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (threadId: string) => {
      const { error } = await supabase.from('forum_threads').delete().eq('id', threadId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'threads'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'forum', 'threads'] });
    },
  });
}

export function useDeleteForumReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ replyId, threadId }: { replyId: string; threadId: string }) => {
      const { error } = await supabase.from('forum_replies').delete().eq('id', replyId);
      if (error) throw error;
      return { threadId };
    },
    onSuccess: (_data, { threadId }) => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'threads', threadId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'forum', 'threads'] });
    },
  });
}

export function useAdminAvatars() {
  return useQuery({
    queryKey: ['admin', 'avatars'],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from('avatars').list();
      if (error) throw error;
      return (data ?? [])
        .filter((file) => file.id !== null)
        .map((file) => ({
          name: file.name,
          url: supabase.storage.from('avatars').getPublicUrl(file.name).data.publicUrl,
        }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(fileName, file);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avatars'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'avatars'] });
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fileName: string) => {
      const { error } = await supabase.storage.from('avatars').remove([fileName]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avatars'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'avatars'] });
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const [fichesResult, threadsResult, usersResult] = await Promise.all([
        supabase.from('fiches').select('id', { count: 'exact', head: true }),
        supabase.from('forum_threads').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);
      if (fichesResult.error) throw fichesResult.error;
      if (threadsResult.error) throw threadsResult.error;
      if (usersResult.error) throw usersResult.error;

      return {
        fichesCount: fichesResult.count ?? 0,
        threadsCount: threadsResult.count ?? 0,
        usersCount: usersResult.count ?? 0,
      };
    },
  });
}
