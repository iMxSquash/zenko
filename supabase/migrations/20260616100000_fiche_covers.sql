-- Add cover image URL column to fiches table
alter table public.fiches
  add column if not exists cover_image_url text;

-- Public storage bucket for fiche cover images
insert into storage.buckets (id, name, public)
values ('fiche-covers', 'fiche-covers', true)
on conflict (id) do nothing;

-- Anyone can read cover images (public bucket)
create policy "fiche_covers_public_select"
  on storage.objects for select
  using (bucket_id = 'fiche-covers');

-- Only admins can upload cover images
create policy "fiche_covers_admin_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'fiche-covers' and public.is_admin(auth.uid()));

-- Only admins can delete cover images
create policy "fiche_covers_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'fiche-covers' and public.is_admin(auth.uid()));
