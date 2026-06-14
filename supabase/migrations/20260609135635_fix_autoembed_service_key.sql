-- Corrige la fuite de service_role key via GUC (app.settings.service_key).
-- current_setting() est lisible par tout rôle ayant accès à la DB.
-- On remplace net.http_post + clé manuelle par supabase_functions.http_request(),
-- qui gère l'Authorization en interne sans exposer la clé dans la session SQL.
-- Seul app.settings.supabase_url reste en GUC — c'est une URL publique, pas un secret.

create or replace function public.trigger_autoembed_thread()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_url text := current_setting('app.settings.supabase_url', true);
begin
  if base_url is null then
    return new;
  end if;

  perform supabase_functions.http_request(
    base_url || '/functions/v1/autoembed',
    'POST',
    '{"Content-Type": "application/json"}',
    jsonb_build_object(
      'source_type', 'forum_thread',
      'source_id',   new.id::text,
      'content',     new.title || E'\n\n' || new.content,
      'metadata',    jsonb_build_object(
        'title',    new.title,
        'category', new.category
      )
    ),
    5000
  );

  return new;
end;
$$;

create or replace function public.trigger_autoembed_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_url     text := current_setting('app.settings.supabase_url', true);
  thread_title text;
begin
  if base_url is null then
    return new;
  end if;

  select title into thread_title
  from public.forum_threads
  where id = new.thread_id;

  perform supabase_functions.http_request(
    base_url || '/functions/v1/autoembed',
    'POST',
    '{"Content-Type": "application/json"}',
    jsonb_build_object(
      'source_type', 'forum_reply',
      'source_id',   new.id::text,
      'content',     new.content,
      'metadata',    jsonb_build_object(
        'thread_title', thread_title,
        'thread_id',    new.thread_id::text
      )
    ),
    5000
  );

  return new;
end;
$$;
