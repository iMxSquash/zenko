import { supabase } from '@/lib/supabase/client';
import type { ForumReply, ForumThread, ForumUserRole, ResourceCategory } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type DbReply = {
  id: string;
  content: string;
  author_name: string;
  author_role: ForumUserRole;
  created_at: string;
};

type DbThread = {
  id: string;
  title: string;
  content: string;
  category: ResourceCategory;
  author_name: string;
  author_role: ForumUserRole;
  is_pinned: boolean;
  created_at: string;
  forum_replies: DbReply[];
};

function mapReply(r: DbReply): ForumReply {
  return {
    id: r.id,
    content: r.content,
    author: { name: r.author_name, role: r.author_role },
    createdAt: r.created_at,
  };
}

function mapThread(t: DbThread): ForumThread {
  return {
    id: t.id,
    title: t.title,
    content: t.content,
    category: t.category,
    author: { name: t.author_name, role: t.author_role },
    isPinned: t.is_pinned,
    createdAt: t.created_at,
    replies: (t.forum_replies ?? []).map(mapReply),
  };
}

export function useForumThreads() {
  return useQuery({
    queryKey: ['forum', 'threads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_threads')
        .select('*, forum_replies(*)')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as DbThread[]).map(mapThread);
    },
  });
}

export function useForumThread(threadId: string) {
  return useQuery({
    queryKey: ['forum', 'threads', threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_threads')
        .select('*, forum_replies(*)')
        .eq('id', threadId)
        .single();
      if (error) throw error;
      return mapThread(data as DbThread);
    },
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      content: string;
      category: ResourceCategory;
      authorName: string;
      authorRole: ForumUserRole;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('forum_threads')
        .insert({
          user_id: user.id,
          title: input.title,
          content: input.content,
          category: input.category,
          author_name: input.authorName,
          author_role: input.authorRole,
        })
        .select('id')
        .single();
      if (error) throw error;
      return data as { id: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'threads'] });
    },
  });
}

export function useAddReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      threadId: string;
      content: string;
      authorName: string;
      authorRole: ForumUserRole;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { error } = await supabase.from('forum_replies').insert({
        thread_id: input.threadId,
        user_id: user.id,
        content: input.content,
        author_name: input.authorName,
        author_role: input.authorRole,
      });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'threads', variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ['forum', 'threads'], exact: true });
    },
  });
}
