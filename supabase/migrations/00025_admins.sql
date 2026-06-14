-- Table admins + fonction is_admin + policies pour l'espace admin

create table if not exists public.admins (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz default now() not null
);

alter table public.admins enable row level security;

-- Fonction utilitaire is_admin — security definer pour éviter la récursion RLS
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = uid);
$$;

grant execute on function public.is_admin(uuid) to authenticated;

-- Un admin peut voir la liste des admins (utile pour la page Utilisateurs)
create policy "admins_select_self_admins"
  on public.admins for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- Promotion/rétrogradation via service_role uniquement — pas de policy insert/delete client

-- Fiches : un admin peut créer, modifier, supprimer
create policy "fiches_admin_all"
  on public.fiches for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Forum : un admin peut supprimer n'importe quel thread
create policy "forum_threads_admin_delete"
  on public.forum_threads for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- Forum : un admin peut supprimer n'importe quelle réponse
create policy "forum_replies_admin_delete"
  on public.forum_replies for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- Profiles : un admin peut lister tous les profils
create policy "profiles_admin_select_all"
  on public.profiles for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- Storage bucket avatars : un admin peut uploader des avatars
create policy "avatars_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and public.is_admin(auth.uid()));

-- Storage bucket avatars : un admin peut supprimer des avatars
create policy "avatars_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and public.is_admin(auth.uid()));
