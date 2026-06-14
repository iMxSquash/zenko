-- Table de documents vectorisés pour le RAG de l'assistant
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('fiche', 'forum_thread', 'forum_reply')),
  source_id   text not null,
  content     text not null,
  metadata    jsonb default '{}',
  embedding   extensions.vector(384),
  created_at  timestamptz default now() not null
);

-- Index HNSW pour la recherche cosine rapide (pgvector)
create index if not exists documents_embedding_hnsw_idx
  on public.documents
  using hnsw (embedding extensions.vector_cosine_ops);

-- RLS
alter table public.documents enable row level security;

create policy "documents_select_authenticated"
  on public.documents for select
  to authenticated
  using (true);

-- Recherche sémantique : retourne les top-k documents les plus proches
create or replace function public.match_documents(
  query_embedding extensions.vector(384),
  match_count     int     default 5,
  filter          jsonb   default '{}'
)
returns table (
  id          uuid,
  source_type text,
  source_id   text,
  content     text,
  metadata    jsonb,
  similarity  float
)
language sql stable security definer
set search_path = public, extensions
as $$
  select
    id,
    source_type,
    source_id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  from public.documents
  where metadata @> filter
  order by embedding <=> query_embedding
  limit match_count;
$$;
