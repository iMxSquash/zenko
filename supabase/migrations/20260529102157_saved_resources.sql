-- Table des fiches sauvegardées par les utilisateurs
create table if not exists public.saved_resources (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  resource_slug text not null,
  saved_at timestamptz default now() not null,
  unique (user_id, resource_slug)
);

-- RLS
alter table public.saved_resources enable row level security;

create policy "Users can view their own saved_resources"
  on public.saved_resources for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved_resources"
  on public.saved_resources for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own saved_resources"
  on public.saved_resources for delete
  using (auth.uid() = user_id);
