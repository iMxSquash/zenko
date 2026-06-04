create table forum_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text not null,
  category text not null check (category in ('TDAH', 'TSA', 'DYS', 'TDI')),
  author_name text not null,
  author_role text not null check (author_role in ('parent', 'prof', 'expert')),
  created_at timestamptz default now() not null
);

alter table forum_threads enable row level security;

create policy "Authenticated users can read threads"
  on forum_threads for select
  to authenticated
  using (true);

create policy "Users can insert their own threads"
  on forum_threads for insert
  to authenticated
  with check (auth.uid() = user_id);
