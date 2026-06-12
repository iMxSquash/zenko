-- Supprime les réponses dont thread_id n'est pas un UUID valide (données de test)
delete from public.forum_replies
where thread_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Convertit thread_id en uuid
alter table public.forum_replies
  alter column thread_id type uuid using thread_id::uuid;

-- Ajoute la FK vers forum_threads avec cascade
alter table public.forum_replies
  add constraint forum_replies_thread_id_fkey
  foreign key (thread_id) references public.forum_threads(id) on delete cascade;

-- Ajoute is_pinned sur forum_threads
alter table public.forum_threads
  add column if not exists is_pinned boolean not null default false;
