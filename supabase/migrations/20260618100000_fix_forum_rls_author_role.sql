-- Fix critique : author_role dans forum_threads et forum_replies était libre (n'importe
-- quel utilisateur pouvait se déclarer 'expert'). On re-crée les policies INSERT pour
-- contraindre author_role à correspondre au rôle réel du profil de l'appelant.

-- forum_threads
drop policy if exists "Users can insert their own threads" on public.forum_threads;

create policy "forum_threads_insert_own"
  on public.forum_threads for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and author_role = (
      select role from public.profiles where id = auth.uid()
    )
  );

-- forum_replies
drop policy if exists "Users can insert their own replies" on public.forum_replies;

create policy "forum_replies_insert_own"
  on public.forum_replies for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and author_role = (
      select role from public.profiles where id = auth.uid()
    )
  );
