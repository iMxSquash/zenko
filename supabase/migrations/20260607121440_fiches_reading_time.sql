-- Ajoute le temps de lecture estimé sur les fiches
alter table public.fiches
  add column if not exists reading_time_minutes integer;
