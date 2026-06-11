import { listAvatars } from '@/lib/profile/avatars';
import { useQuery } from '@tanstack/react-query';

export function useAvatars() {
  return useQuery({
    queryKey: ['avatars'],
    queryFn: listAvatars,
    staleTime: 1000 * 60 * 60,
  });
}
