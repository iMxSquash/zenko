-- Met à jour handle_new_user pour extraire consent_given_at et age_confirmed
-- depuis raw_user_meta_data (passés en options.data lors du signUp).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, consent_given_at, age_confirmed)
  values (
    new.id,
    new.email,
    (new.raw_user_meta_data->>'consent_given_at')::timestamptz,
    coalesce((new.raw_user_meta_data->>'age_confirmed')::boolean, false)
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public, auth;
