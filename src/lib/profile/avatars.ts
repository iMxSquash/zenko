import { supabase } from '@/lib/supabase/client';

export async function listAvatars(): Promise<string[]> {
  const { data, error } = await supabase.storage.from('avatars').list();
  if (error) throw error;

  return (data ?? [])
    .filter((file) => file.id !== null)
    .map((file) => supabase.storage.from('avatars').getPublicUrl(file.name).data.publicUrl);
}
