-- Fix mineur : handle_new_user() est SECURITY DEFINER sans SET search_path,
-- ce qui l'expose théoriquement à une attaque par search-path injection.
-- On re-crée la fonction avec SET search_path = public, auth.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public, auth;
