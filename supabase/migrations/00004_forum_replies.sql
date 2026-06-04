create table forum_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  author_name text not null,
  author_role text not null check (author_role in ('parent', 'prof', 'expert')),
  content text not null,
  created_at timestamptz default now() not null
);

alter table forum_replies enable row level security;

create policy "Authenticated users can read replies"
  on forum_replies for select
  to authenticated
  using (true);

create policy "Users can insert their own replies"
  on forum_replies for insert
  to authenticated
  with check (auth.uid() = user_id);
