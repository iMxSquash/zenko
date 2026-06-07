-- Table des fiches de la bibliothèque (contenu partagé en lecture seule)
create table if not exists public.fiches (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  description text not null,
  category text not null check (category in ('TSA', 'TDAH', 'DYS', 'TDI')),
  author text not null,
  author_avatar_url text,
  created_at timestamptz default now() not null
);

-- RLS
alter table public.fiches enable row level security;

create policy "fiches_select_authenticated"
  on public.fiches for select
  to authenticated
  using (true);
