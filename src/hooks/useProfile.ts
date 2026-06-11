import { type ProfileUpdate, getProfile, updateProfile, updateRole } from '@/lib/profile/profile';
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
