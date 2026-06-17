-- Remove author name and avatar from fiches — both are now derived from the author's profile
alter table public.fiches drop column if exists author_avatar_url;
alter table public.fiches drop column if exists author;
