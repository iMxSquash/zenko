-- Vue publique des profils (sans email) pour la consultation entre utilisateurs depuis le forum
-- security_invoker = false (par défaut) : la vue s'exécute avec les droits du propriétaire,
-- ce qui contourne la RLS restrictive de profiles (auth.uid() = id) sans jamais exposer l'email.
create or replace view public.public_profiles as
select
  id,
  first_name,
  last_name,
  avatar_url,
  role,
  linkedin_url,
  instagram_url,
  twitter_url,
  doctolib_url
from public.profiles;

grant select on public.public_profiles to authenticated;
