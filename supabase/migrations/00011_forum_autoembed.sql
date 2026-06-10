-- Trigger d'indexation automatique des nouveaux posts du forum dans documents.
-- Nécessite pg_net et la variable app.settings.supabase_url en DB.
--
-- Configuration requise (une seule fois, en tant que superuser) :
--   ALTER ROLE authenticator SET app.settings.supabase_url = 'https://YOUR_REF.supabase.co';
--   ALTER ROLE authenticator SET app.settings.service_key = 'YOUR_SERVICE_ROLE_KEY';

create extension if not exists pg_net with schema extensions;

-- Fonction pour indexer un forum_thread
create or replace function public.trigger_autoembed_thread()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_url text := current_setting('app.settings.supabase_url', true);
  svc_key  text := current_setting('app.settings.service_key', true);
begin
  if base_url is null or svc_key is null then
    return new;
  end if;

  perform extensions.net.http_post(
    url     := base_url || '/functions/v1/autoembed',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || svc_key,
      'apikey',        svc_key
    ),
    body    := jsonb_build_object(
      'source_type', 'forum_thread',
      'source_id',   new.id::text,
      'content',     new.title || E'\n\n' || new.content,
      'metadata',    jsonb_build_object(
        'title',    new.title,
        'category', new.category
      )
    )
  );

  return new;
end;
$$;

create trigger autoembed_thread_insert
  after insert on public.forum_threads
  for each row execute procedure public.trigger_autoembed_thread();

-- Fonction pour indexer un forum_reply
create or replace function public.trigger_autoembed_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_url    text := current_setting('app.settings.supabase_url', true);
  svc_key     text := current_setting('app.settings.service_key', true);
  thread_title text;
begin
  if base_url is null or svc_key is null then
    return new;
  end if;

  select title into thread_title
  from public.forum_threads
  where id = new.thread_id;

  perform extensions.net.http_post(
    url     := base_url || '/functions/v1/autoembed',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || svc_key,
      'apikey',        svc_key
    ),
    body    := jsonb_build_object(
      'source_type', 'forum_reply',
      'source_id',   new.id::text,
      'content',     new.content,
      'metadata',    jsonb_build_object(
        'thread_title', thread_title,
        'thread_id',    new.thread_id::text
      )
    )
  );

  return new;
end;
$$;

create trigger autoembed_reply_insert
  after insert on public.forum_replies
  for each row execute procedure public.trigger_autoembed_reply();
