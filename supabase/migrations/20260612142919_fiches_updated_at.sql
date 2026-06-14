-- Ajoute updated_at sur fiches (utilisé pour dateModified en JSON-LD/SEO)
alter table public.fiches
  add column if not exists updated_at timestamptz default now() not null;

create trigger fiches_updated_at
  before update on public.fiches
  for each row execute procedure public.handle_updated_at();
