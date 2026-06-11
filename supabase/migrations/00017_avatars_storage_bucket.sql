-- Bucket Storage pour les avatars préenregistrés (lecture publique)

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Lecture publique des avatars (assets génériques, pas de données perso)
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Écriture/suppression réservées au service_role (uploadées manuellement par l'équipe)
