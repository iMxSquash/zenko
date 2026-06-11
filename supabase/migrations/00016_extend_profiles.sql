-- Étend profiles avec identité, rôle et réseaux sociaux pour la feature profil

alter table public.profiles
  drop column if exists full_name;

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists role text check (role in ('parent', 'prof', 'expert')),
  add column if not exists linkedin_url text,
  add column if not exists instagram_url text,
  add column if not exists twitter_url text,
  add column if not exists doctolib_url text;

alter table public.profiles
  add constraint profiles_expert_requires_doctolib
    check (role <> 'expert' or doctolib_url is not null);
