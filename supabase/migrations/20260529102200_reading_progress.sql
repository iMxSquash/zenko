-- Table de progression de lecture des fiches
create table if not exists public.reading_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  resource_slug text not null,
  started_at timestamptz default now() not null,
  completed_at timestamptz default null,
  unique (user_id, resource_slug)
);

-- RLS
alter table public.reading_progress enable row level security;

create policy "Users can view their own reading_progress"
  on public.reading_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reading_progress"
  on public.reading_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reading_progress"
  on public.reading_progress for update
  using (auth.uid() = user_id);

create policy "Users can delete their own reading_progress"
  on public.reading_progress for delete
  using (auth.uid() = user_id);
