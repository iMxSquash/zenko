-- Bibliothèque, forum et profils sont désormais visibles sans connexion
-- (seules les actions comme publier, répondre, sauvegarder restent réservées aux comptes connectés)

create policy "fiches_select_anon"
  on public.fiches for select
  to anon
  using (true);

create policy "forum_threads_select_anon"
  on public.forum_threads for select
  to anon
  using (true);

create policy "forum_replies_select_anon"
  on public.forum_replies for select
  to anon
  using (true);

grant select on public.public_profiles to anon;
