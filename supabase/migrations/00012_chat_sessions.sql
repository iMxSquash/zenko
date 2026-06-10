-- Historique des sessions de chat de l'assistant vocal
create table if not exists public.chat_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null default 'Nouvelle conversation',
  created_at timestamptz default now() not null
);

alter table public.chat_sessions enable row level security;

create policy "chat_sessions_select_own"
  on public.chat_sessions for select
  using (auth.uid() = user_id);

create policy "chat_sessions_insert_own"
  on public.chat_sessions for insert
  with check (auth.uid() = user_id);

create policy "chat_sessions_delete_own"
  on public.chat_sessions for delete
  using (auth.uid() = user_id);

-- Messages persistés par session
create table if not exists public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  sources    jsonb default null,
  created_at timestamptz default now() not null
);

alter table public.chat_messages enable row level security;

-- Accès via la session (user_id transitif)
create policy "chat_messages_select_own"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "chat_messages_insert_own"
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.chat_sessions s
      where s.id = session_id
        and s.user_id = auth.uid()
    )
  );
