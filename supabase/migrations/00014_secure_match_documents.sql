-- match_documents est SECURITY DEFINER : elle tourne avec les droits du owner et
-- bypasse la RLS sur documents. Par défaut PUBLIC peut l'exécuter via PostgREST RPC,
-- ce qui exposerait tout le corpus vectorisé sans authentification.
-- On restreint l'exécution au service_role uniquement (utilisé par l'Edge Function /chat).

revoke execute
  on function public.match_documents(extensions.vector(384), int, jsonb)
  from public, anon, authenticated;

grant execute
  on function public.match_documents(extensions.vector(384), int, jsonb)
  to service_role;
