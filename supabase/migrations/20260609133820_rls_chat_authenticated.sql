-- Restreint chat_sessions et chat_messages au rôle authenticated uniquement.
-- Sans `to authenticated`, une requête anon passe les politiques (auth.uid() = null → false)
-- et renvoie un tableau vide sans erreur. Avec ce rôle, les mutations renvoient 403.

drop policy if exists "chat_sessions_select_own" on public.chat_sessions;
drop policy if exists "chat_sessions_insert_own" on public.chat_sessions;
drop policy if exists "chat_sessions_delete_own" on public.chat_sessions;

create policy "chat_sessions_select_own"
  on public.chat_sessions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "chat_sessions_insert_own"
  on public.chat_sessions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "chat_sessions_delete_own"
  on public.chat_sessions for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "chat_messages_select_own" on public.chat_messages;
drop policy if exists "chat_messages_insert_own" on public.chat_messages;

create policy "chat_messages_select_own"
  on public.chat_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "chat_messages_insert_own"
  on public.chat_messages for insert
  to authenticated
  with check (
    exists (
      select 1 from public.chat_sessions s
      where s.id = session_id
        and s.user_id = auth.uid()
    )
  );
