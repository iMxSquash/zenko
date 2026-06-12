-- Donne aux admins le droit de modifier et supprimer n'importe quel profil.
-- La suppression du profil ne suffit pas à supprimer le compte auth.users :
-- cela est géré via l'Edge Function admin-delete-user (service_role).

create policy "profiles_admin_update"
  on public.profiles for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "profiles_admin_delete"
  on public.profiles for delete
  to authenticated
  using (public.is_admin(auth.uid()));
