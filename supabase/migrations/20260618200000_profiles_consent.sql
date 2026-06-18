-- Stocke l'horodatage du consentement RGPD et la confirmation d'âge à l'inscription.
-- Art. 7 RGPD : le responsable de traitement doit pouvoir démontrer que le consentement a été donné.
alter table public.profiles
  add column if not exists consent_given_at timestamptz default null,
  add column if not exists age_confirmed boolean default false not null;
