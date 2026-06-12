-- search_documents_by_keyword retournait l'id (uuid) des fiches comme source_id,
-- alors que match_documents et le frontend (SourceList, /bibliotheque/$slug)
-- attendent le slug. Corrige l'identifiant pour rester cohérent.
create or replace function public.search_documents_by_keyword(
  search_query text,
  match_count  int default 6
)
returns table (
  source_type text,
  source_id   text,
  content     text,
  metadata    jsonb,
  rank        float
)
language sql stable security definer
set search_path = public
as $$
  with query as (
    select websearch_to_tsquery('french', search_query) as tsq
  )
  select
    'fiche' as source_type,
    f.slug as source_id,
    f.title || E'\n\n' || coalesce(f.content, f.description) as content,
    jsonb_build_object('title', f.title, 'category', f.category) as metadata,
    ts_rank(
      to_tsvector('french', f.title || ' ' || f.description || ' ' || coalesce(f.content, '')),
      query.tsq
    ) as rank
  from public.fiches f
  cross join query
  where to_tsvector('french', f.title || ' ' || f.description || ' ' || coalesce(f.content, ''))
    @@ query.tsq

  union all

  select
    'forum_thread',
    t.id::text,
    t.title || E'\n\n' || t.content,
    jsonb_build_object('title', t.title, 'category', t.category),
    ts_rank(to_tsvector('french', t.title || ' ' || t.content), query.tsq)
  from public.forum_threads t
  cross join query
  where to_tsvector('french', t.title || ' ' || t.content) @@ query.tsq

  union all

  select
    'forum_reply',
    r.id::text,
    r.content,
    jsonb_build_object('thread_title', th.title, 'thread_id', r.thread_id::text),
    ts_rank(to_tsvector('french', r.content), query.tsq)
  from public.forum_replies r
  join public.forum_threads th on th.id = r.thread_id
  cross join query
  where to_tsvector('french', r.content) @@ query.tsq

  order by rank desc
  limit match_count;
$$;
