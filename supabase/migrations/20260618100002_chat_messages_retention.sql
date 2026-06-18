-- Politique de rétention : suppression automatique des sessions de chat
-- (et de leurs messages via ON DELETE CASCADE) inactives depuis plus de 12 mois.
--
-- Prérequis : extension pg_cron disponible sur Supabase Pro.
-- Sur un plan Free, planifier manuellement via le dashboard Supabase ou une
-- Edge Function déclenchée par un cron externe.

create extension if not exists pg_cron;

select cron.schedule(
  'delete-old-chat-sessions',
  '0 2 * * *',
  $$
    delete from public.chat_sessions
    where created_at < now() - interval '12 months';
  $$
);
