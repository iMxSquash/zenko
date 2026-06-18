-- Lie la fiche à l'utilisateur auteur pour permettre le lien vers son profil
alter table public.fiches
  add column if not exists author_user_id uuid references public.profiles(id) on delete set null;
