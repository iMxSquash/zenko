-- Permet aux admins de promouvoir ou rétrograder d'autres admins depuis l'UI.
-- is_admin() est security definer : pas de récursion lors de l'évaluation de la policy.

create policy "admins_insert_by_admin"
  on public.admins for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

create policy "admins_delete_by_admin"
  on public.admins for delete
  to authenticated
  using (public.is_admin(auth.uid()));
