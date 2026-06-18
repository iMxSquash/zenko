# Espace admin - plan de feature

## Objectif

Donner à certains utilisateurs (équipe Zenko) un accès à un espace `/admin` pour :

- gérer les **fiches** de la bibliothèque (créer, éditer, supprimer, publier du contenu),
- modérer le **forum** (supprimer threads/réponses signalés),
- consulter la liste des **utilisateurs** et gérer qui est admin,
- gérer les **avatars** proposés aux utilisateurs (ajouter, supprimer du bucket `avatars`).

Le rôle admin est indépendant du `role` existant sur `profiles` (`parent` / `prof` / `expert`), qui sert à l'identité publique sur le forum. Un admin est avant tout un membre de l'équipe.

## 1. Modèle de données

### Table `admins`

Référencer `profiles.id` comme demandé : une ligne = un admin. Pas de colonne "is_admin" sur `profiles` pour éviter qu'elle soit exposée via `public_profiles` ou modifiable par l'utilisateur lui-même.

```sql
-- supabase/migrations/00024_admins.sql

create table public.admins (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz default now() not null
);

alter table public.admins enable row level security;

-- Un admin peut voir la liste des admins (utile pour la page "Utilisateurs")
create policy "admins_select_self_admins"
  on public.admins for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- Pas de policy insert/update/delete : la promotion/rétrogradation se fait
-- uniquement via service_role (SQL direct ou Edge Function), jamais depuis le client.
```

### Fonction utilitaire `is_admin`

Utilisée dans les policies RLS des autres tables. `security definer` pour pouvoir lire `admins` sans dépendre des policies de cette table (sinon récursion).

```sql
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = uid);
$$;

grant execute on function public.is_admin(uuid) to authenticated;
```

### Policies à ajouter sur les tables existantes

**`fiches`** - actuellement lecture seule pour tous les authentifiés, pas d'écriture possible. Ajouter :

```sql
create policy "fiches_admin_all"
  on public.fiches for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
```

Idem pour `fiches_content` (table de contenu détaillé créée en 00017) si les admins doivent éditer le contenu des fiches.

**`forum_threads` / `forum_replies`** - modération : un admin peut supprimer n'importe quel thread/réponse (pas seulement les siens).

```sql
create policy "forum_threads_admin_delete"
  on public.forum_threads for delete
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "forum_replies_admin_delete"
  on public.forum_replies for delete
  to authenticated
  using (public.is_admin(auth.uid()));
```

**`profiles`** - un admin doit pouvoir lister tous les profils (page "Utilisateurs"). La policy `select` actuelle limite à `auth.uid() = id`. Ajouter :

```sql
create policy "profiles_admin_select_all"
  on public.profiles for select
  to authenticated
  using (public.is_admin(auth.uid()));
```

> Pas de policy `update`/`delete` sur `profiles` pour les admins dans un premier temps - pas de besoin produit identifié (pas d'édition de profil d'autrui).

**Bucket Storage `avatars`** - créé en 00022 avec lecture publique et écriture réservée à `service_role` (upload manuel). Ajouter des policies pour permettre aux admins d'ajouter/supprimer des avatars depuis `/admin/avatars` :

```sql
create policy "avatars_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and public.is_admin(auth.uid()));

create policy "avatars_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and public.is_admin(auth.uid()));
```

> Pas de policy `update` : pour remplacer un avatar, on supprime puis on réinsère (évite les soucis de cache CDN sur les URLs publiques inchangées).

### Promotion / rétrogradation d'un admin

Pas d'UI d'auto-promotion. Deux options, à trancher selon le besoin :

1. **Manuel via SQL** (Supabase Studio / migration de seed pour le premier admin) :
   ```sql
   insert into public.admins (user_id)
   values ('<uuid-du-compte>');
   ```
2. **Edge Function `admin-manage-users`** (si on veut une UI "promouvoir/rétrograder" dans `/admin/utilisateurs`) - appelée avec le `service_role` côté serveur, vérifie d'abord que l'appelant est admin via `is_admin`, puis insère/supprime dans `admins`. Nécessaire car le client n'a aucune policy insert/delete sur `admins`.

Recommandation : démarrer avec l'option 1 (un seul admin pour bootstrap), ajouter l'Edge Function seulement si l'équipe grandit.

## 2. Routing

Nouveau layout protégé, séparé de `_app` (pas de sidebar bibliothèque/forum dans l'admin) :

```
src/routes/
  _protected/
    _admin.tsx                # layout + guard is_admin
    _admin/
      index.tsx                # /admin - dashboard (stats rapides)
      utilisateurs/
        index.tsx               # /admin/utilisateurs - liste + rôle admin
      fiches/
        index.tsx               # /admin/fiches - liste + CRUD
        $slug.tsx               # /admin/fiches/:slug - édition contenu
        nouvelle.tsx             # /admin/fiches/nouvelle - création
      forum/
        index.tsx               # /admin/forum - modération threads/réponses
      avatars/
        index.tsx               # /admin/avatars - galerie + ajout/suppression d'avatars
```

### Guard `_admin.tsx`

```tsx
export const Route = createFileRoute('/_protected/_admin')({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: '/login' });

    const { data } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!data) throw redirect({ to: '/bibliotheque' });
  },
  component: AdminLayout,
});
```

`_protected.tsx` fait déjà le check "connecté". `_admin.tsx` ajoute le check "est admin" et redirige vers la bibliothèque sinon (pas de message d'erreur exposé - on évite de révéler que `/admin` existe).

## 3. Hooks (`src/hooks/useAdmin.ts`)

```ts
useIsAdmin()              // boolean, pour conditionner l'affichage du lien sidebar
useAdminUsers()            // liste profiles + flag admin (jointure admins)
useAdminFiches()            // liste fiches pour la table de gestion
useCreateFiche() / useUpdateFiche() / useDeleteFiche()
useAdminForumThreads()      // threads avec compteur de réponses, pour modération
useDeleteForumThread() / useDeleteForumReply()
useAdminAvatars()           // liste des fichiers du bucket `avatars` (réutilise listAvatars de lib/profile/avatars.ts)
useUploadAvatar() / useDeleteAvatar()
```

Toutes ces requêtes/mutations passent par TanStack Query, comme le reste du projet (cf. `useBibliotheque`, `useForum`). Invalider les query keys `['fiches']` et `['forum', ...]` après une mutation admin pour que la bibliothèque/le forum se mettent à jour côté utilisateur normal. Invalider la query key `['avatars']` (utilisée par `useAvatars`, cf. `AvatarPicker`) après upload/suppression pour que le sélecteur d'avatar du profil se mette à jour.

## 4. UI

### Sidebar

Dans `AppSidebar.tsx`, ajouter une section "Administration" affichée uniquement si `useIsAdmin()` est `true` :

```tsx
{isAdmin && (
  <div className="flex flex-col gap-1">
    <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted">
      Administration
    </p>
    <Link to="/admin" ...>Tableau de bord</Link>
    <Link to="/admin/fiches" ...>Fiches</Link>
    <Link to="/admin/forum" ...>Modération</Link>
    <Link to="/admin/utilisateurs" ...>Utilisateurs</Link>
    <Link to="/admin/avatars" ...>Avatars</Link>
  </div>
)}
```

### Pages

- **`/admin`** - quelques compteurs (nb fiches, nb threads, nb utilisateurs) via des requêtes `count` simples. Pas de vraie dashboard analytics pour le V2.
- **`/admin/fiches`** - table (titre, catégorie, auteur, date) avec actions éditer/supprimer + bouton "Nouvelle fiche". `ConfirmDialog` existant pour la suppression.
- **`/admin/fiches/$slug`** et **`/admin/fiches/nouvelle`** - formulaire (titre, description, catégorie, auteur, contenu) réutilisant `TextInput`, `RoleSelector`/`Capsule` pour la catégorie.
- **`/admin/forum`** - liste des threads avec nombre de réponses et bouton supprimer (le `ConfirmDialog` existe déjà pour ce pattern).
- **`/admin/utilisateurs`** - table des profils (nom, email, rôle, badge "Admin" si présent dans `admins`). Pas d'action de promotion dans une première itération (cf. section 1).
- **`/admin/avatars`** - galerie des avatars du bucket `avatars` (réutilise `listAvatars`/`AvatarPicker` pour l'affichage), bouton "Ajouter un avatar" (upload fichier image vers le bucket) et action supprimer par avatar avec `ConfirmDialog` (vérifier qu'un avatar utilisé par un profil reste affichable même après suppression - l'URL publique cassée doit être gérée côté `ProfileAvatarSection`/`AvatarPicker` avec un fallback).

## 5. Ordre de travail recommandé

1. Migration `00024_admins.sql` (table `admins`, fonction `is_admin`, policies sur `fiches`, `forum_threads`, `forum_replies`, `profiles`, `storage.objects` pour le bucket `avatars`) + `/supabase-rls` pour vérifier.
2. Insertion manuelle du premier admin (ton `user_id`) via Supabase Studio.
3. `useIsAdmin` + lien conditionnel dans `AppSidebar`.
4. Layout `_admin.tsx` + guard.
5. `/admin/fiches` (CRUD complet) - c'est la valeur la plus immédiate.
6. `/admin/forum` (modération).
7. `/admin/utilisateurs` (lecture seule au départ).
8. `/admin/avatars` (ajout/suppression d'avatars).
9. `/admin` (dashboard, en dernier - purement cosmétique).

## 6. Hors scope (V2)

- Promotion/rétrogradation d'admin depuis l'UI (Edge Function dédiée si besoin plus tard).
- Logs d'audit des actions admin.
- Gestion fine des permissions (rôles admin différenciés) - un seul niveau "admin" pour l'instant.
