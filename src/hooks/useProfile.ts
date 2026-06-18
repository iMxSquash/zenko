import { env } from '@/lib/env';
import {
  type ProfileUpdate,
  deleteAccount,
  getProfile,
  getPublicProfile,
  updateProfile,
  updateRole,
} from '@/lib/profile/profile';
import { updateEmail, updatePassword } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/use-auth';
import type { ForumUserRole } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user?.id ?? ''),
    enabled: !!user,
  });
}

export function usePublicProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', 'public', userId],
    queryFn: () => getPublicProfile(userId),
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileUpdate) => {
      if (!user) throw new Error('Utilisateur non authentifié');
      return updateProfile(user.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
}

export function useUpdateEmail() {
  return useMutation({
    mutationFn: (email: string) => updateEmail(email),
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (password: string) => updatePassword(password),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccount,
  });
}

export function useExportData() {
  return useMutation({
    mutationFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Non authentifié');

      const res = await fetch(`${env.supabaseUrl}/functions/v1/export-user-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors de l'export");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zenko-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

export function useUpdateRole() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { role: ForumUserRole; doctolibUrl?: string | null }) => {
      if (!user) throw new Error('Utilisateur non authentifié');
      return updateRole(user.id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
}
