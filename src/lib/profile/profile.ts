import { signOut } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';
import type { ForumUserRole, Profile, PublicProfile } from '@/types';

export function getDisplayName(profile: Pick<Profile, 'firstName' | 'lastName' | 'email'>): string {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
  return fullName || profile.email.split('@')[0];
}

type ProfileRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: ForumUserRole | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  doctolib_url: string | null;
};

type PublicProfileRow = Omit<ProfileRow, 'email'>;

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    linkedinUrl: row.linkedin_url,
    instagramUrl: row.instagram_url,
    twitterUrl: row.twitter_url,
    doctolibUrl: row.doctolib_url,
  };
}

function toPublicProfile(row: PublicProfileRow): PublicProfile {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    linkedinUrl: row.linkedin_url,
    instagramUrl: row.instagram_url,
    twitterUrl: row.twitter_url,
    doctolibUrl: row.doctolib_url,
  };
}

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return toProfile(data as ProfileRow);
}

export async function getPublicProfile(userId: string): Promise<PublicProfile> {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return toPublicProfile(data as PublicProfileRow);
}

export type ProfileUpdate = Partial<{
  firstName: string;
  lastName: string;
  avatarUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  doctolibUrl: string;
}>;

export async function updateProfile(userId: string, data: ProfileUpdate): Promise<void> {
  const payload: Record<string, string> = {};
  if (data.firstName !== undefined) payload.first_name = data.firstName;
  if (data.lastName !== undefined) payload.last_name = data.lastName;
  if (data.avatarUrl !== undefined) payload.avatar_url = data.avatarUrl;
  if (data.linkedinUrl !== undefined) payload.linkedin_url = data.linkedinUrl;
  if (data.instagramUrl !== undefined) payload.instagram_url = data.instagramUrl;
  if (data.twitterUrl !== undefined) payload.twitter_url = data.twitterUrl;
  if (data.doctolibUrl !== undefined) payload.doctolib_url = data.doctolibUrl;

  const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
  if (error) throw error;
}

export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
  if (error) throw error;

  await signOut();
  window.location.href = '/';
}

export async function updateRole(
  userId: string,
  input: { role: ForumUserRole; doctolibUrl?: string | null }
): Promise<void> {
  if (input.role === 'expert' && !input.doctolibUrl) {
    throw new Error('Le lien Doctolib est requis pour le rôle expert.');
  }

  const payload: { role: ForumUserRole; doctolib_url?: string | null } = { role: input.role };
  if (input.doctolibUrl !== undefined) payload.doctolib_url = input.doctolibUrl;

  const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
  if (error) throw error;
}
