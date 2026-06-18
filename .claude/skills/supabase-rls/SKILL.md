# Skill: supabase-rls

## Auto-invoke

Invoquer automatiquement quand :

- Une nouvelle table est créée dans une migration (vérifier que RLS est définie)
- L'utilisateur demande de sécuriser une table (`"sécurise la table …"`, `"ajoute le RLS …"`)
- Une migration ne contient pas de politiques RLS - les ajouter systématiquement
- L'utilisateur expose des données via PostgREST sans RLS visible

Génère les politiques RLS Supabase complètes pour une table du projet Zenko.

## Ce que tu reçois

L'utilisateur donne le nom d'une table (ex: `/supabase-rls chat_sessions`).

## Ce que tu dois faire

### 1. Identifier la structure de la table

Lire le fichier de migration correspondant dans `supabase/migrations/` pour comprendre :

- Les colonnes de la table
- La colonne qui référence l'utilisateur (typiquement `user_id` → `profiles.id`)
- Si la table est partagée entre utilisateurs (forum, resources)

### 2. Générer les politiques

#### Cas standard - table appartenant à un utilisateur (`user_id`)

```sql
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
```

#### Cas table partagée en lecture (forum, fiches)

```sql
alter table public.<table> enable row level security;

-- Lecture pour tous les utilisateurs connectés
create policy "<table>_select_authenticated"
  on public.<table> for select
  to authenticated
  using (true);

-- Écriture uniquement pour le propriétaire
create policy "<table>_insert_own"
  on public.<table> for insert
  with check (auth.uid() = user_id);

create policy "<table>_update_own"
  on public.<table> for update
  using (auth.uid() = user_id);

create policy "<table>_delete_own"
  on public.<table> for delete
  using (auth.uid() = user_id);
```

#### Cas table lecture seule pour utilisateurs connectés (resources, documents)

```sql
alter table public.<table> enable row level security;

create policy "<table>_select_authenticated"
  on public.<table> for select
  to authenticated
  using (true);
```

#### Cas accès par rôle (colonne `role` dans `profiles`)

```sql
create policy "<table>_select_by_role"
  on public.<table> for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'moderateur')
    )
  );
```

### 3. Où placer le SQL généré

- Si la table est nouvelle → dans la migration qui la crée
- Si la table existe et manque de politiques → créer une nouvelle migration :
  `supabase/migrations/<prochain_numero>_rls_<table>.sql`

## Vérifications

- `alter table ... enable row level security` est présent
- Chaque opération nécessaire (select/insert/update/delete) a sa politique
- Noms de politiques uniques et descriptifs (snake_case)
- `using()` pour SELECT/UPDATE/DELETE, `with check()` pour INSERT
- Les Edge Functions qui utilisent `SUPABASE_SERVICE_ROLE_KEY` bypassent RLS - pas besoin de politique spéciale pour elles
