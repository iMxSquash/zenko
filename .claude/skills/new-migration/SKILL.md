# Skill: new-migration

## Auto-invoke

Invoquer automatiquement quand l'utilisateur demande de :
- Créer une nouvelle table en base de données
- Modifier le schéma Supabase (`"ajoute une colonne …"`, `"crée une table …"`)
- Écrire une migration SQL
- Toute modification de `supabase/migrations/`

Crée un fichier de migration Supabase correctement numéroté pour le projet Zenko.

## Ce que tu reçois

L'utilisateur décrit la migration à créer (ex: `/new-migration ajouter table notifications`).

## Étapes

### 1. Trouver le prochain numéro

Lister les fichiers dans `supabase/migrations/` et prendre le numéro le plus élevé + 1.
Format : `00001`, `00002`, etc. (5 chiffres avec zéros).

### 2. Nommer le fichier

`supabase/migrations/<NNNNN>_<description_en_snake_case>.sql`

Ex : `00006_add_notifications_table.sql`

### 3. Contenu du fichier

Template à adapter selon la migration demandée :

```sql
-- <Description de ce que fait cette migration>
create table if not exists public.<table> (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  -- colonnes métier ici
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.<table> enable row level security;

create policy "<table>_select_own"
  on public.<table> for select
  using (auth.uid() = user_id);

create policy "<table>_insert_own"
  on public.<table> for insert
  with check (auth.uid() = user_id);

create policy "<table>_update_own"
  on public.<table> for update
  using (auth.uid() = user_id);

create policy "<table>_delete_own"
  on public.<table> for delete
  using (auth.uid() = user_id);

-- Trigger updated_at
create trigger <table>_updated_at
  before update on public.<table>
  for each row execute procedure public.handle_updated_at();
```

## Cas particuliers

### Table partagée en lecture (ex: `resources`, `categories`)

```sql
-- Lecture publique pour les utilisateurs connectés
create policy "<table>_select_authenticated"
  on public.<table> for select
  to authenticated
  using (true);
```

### Table avec accès par rôle (colonne `role` dans `profiles`)

```sql
create policy "<table>_select_role"
  on public.<table> for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

### Migration ALTER (modification de table existante)

Ne pas utiliser le template de création — juste l'instruction ALTER :

```sql
-- Ajoute la colonne <colonne> à <table>
alter table public.<table>
  add column if not exists <colonne> <type> default <valeur>;
```

## Règles

- Toujours activer RLS sur chaque nouvelle table
- Toujours ajouter `created_at` (et `updated_at` + trigger si la table est mutable)
- Utiliser `if not exists` pour l'idempotence
- La fonction `handle_updated_at()` existe depuis `00001_init.sql` — ne pas la recréer
- Noms de politiques en snake_case, descriptifs et uniques
