# Feature : Page profil utilisateur (vue + édition)

Plan étape par étape pour implémenter la page profil (lecture) et la page de
modification du profil. Chaque étape contient un prompt prêt à copier-coller
dans Claude Code. Travailler sur la branche `feat/profil` (déjà active),
une étape = un commit (voire une PR si tu préfères découper).

Avant de lancer chaque étape, relis le résultat et lance les checks
(`npm run lint`, `npm run type-check`, `npm run test`, `npm run build`)
avant de passer à la suivante.

---

## Étape 0 — Cadrage des champs profil

**Objectif** : figer le modèle de données avant de toucher au code, pour
éviter une migration à refaire.

**Prompt** :
```
Avant toute implémentation, propose-moi le schéma final de la table
`profiles` pour la feature "profil utilisateur" :
- séparation prénom/nom (first_name/last_name) ou full_name unique ?
- colonnes pour les réseaux : linkedin_url, instagram_url, twitter_url, doctolib_url
- colonne role (enum 'parent' | 'prof' | 'expert')
- avatar_url (déjà présent) qui référencera une image préenregistrée dans
  un bucket Supabase Storage "avatars"
- contrainte : si role = 'expert' alors doctolib_url obligatoire (NOT NULL)

Regarde la table profiles actuelle dans
supabase/migrations/00001_init.sql et le flow d'onboarding dans
src/routes/_protected/onboarding/index.tsx (rôles 'teacher'/'parent'/'specialist'
mappés vers 'prof'/'parent'/'expert') pour rester cohérent. Donne-moi le
schéma final avant d'écrire la migration.
```

> Valide le schéma proposé avant de continuer.

---

## Étape 1 — Migration : étendre la table `profiles`

**Objectif** : ajouter les colonnes nécessaires (identité, rôle, réseaux
sociaux) + contrainte CHECK expert/doctolib + RLS.

**Prompt** :
```
/new-migration extend profiles table for profile feature

Ajoute à la table public.profiles :
- first_name text
- last_name text
- role text avec CHECK role in ('parent','prof','expert'), nullable
  (l'utilisateur n'a pas forcément choisi de rôle juste après l'inscription)
- linkedin_url text
- instagram_url text
- twitter_url text
- doctolib_url text
- une contrainte CHECK : si role = 'expert' alors doctolib_url IS NOT NULL

Vérifie/adapte les RLS existantes (un utilisateur ne peut lire/modifier que
sa propre ligne) avec /supabase-rls. Mets aussi à jour
supabase/migrations/00001_init.sql en commentaire si besoin pour la doc,
sans modifier une migration déjà appliquée.
```

---

## Étape 2 — Storage bucket pour les avatars préenregistrés

**Objectif** : créer un bucket Supabase Storage public en lecture pour
stocker un set d'avatars prédéfinis que l'utilisateur choisit (pas
d'upload libre).

**Prompt** :
```
/new-migration create avatars storage bucket

Crée un bucket Supabase Storage "avatars" :
- lecture publique (les images sont des assets génériques, pas de données
  perso)
- écriture/suppression réservées au rôle service_role (les fichiers seront
  uploadés manuellement par l'équipe, pas par les utilisateurs)

Donne-moi aussi la commande/étape pour uploader un premier set d'images
(ex: avatar-1.png à avatar-8.png) dans ce bucket via le dashboard Supabase
ou la CLI, et comment construire l'URL publique d'un avatar pour l'utiliser
côté front.
```

> Étape manuelle : uploader réellement les images preset dans le bucket
> (dashboard Supabase ou `supabase storage`) avant de continuer.

---

## Étape 3 — Couche données : hooks `useProfile` et `useAvatars`

**Objectif** : créer la couche `lib/`/`hooks/` pour lire/écrire le profil et
lister les avatars disponibles, réutilisable par la page profil ET par
l'onboarding (signup/role).

**Prompt** :
```
Crée la couche données pour le profil utilisateur, en respectant la
séparation lib/hooks de CLAUDE.md (TanStack Query pour le server state) :

1. src/lib/profile/profile.ts : fonctions d'accès Supabase
   - getProfile(userId) : SELECT * FROM profiles
   - updateProfile(userId, data) : UPDATE partiel (identité, réseaux sociaux)
   - updateRole(userId, { role, doctolib_url }) : valide côté client que
     role === 'expert' => doctolib_url requis (sinon throw avant l'appel
     réseau), puis UPDATE profiles

2. src/hooks/useProfile.ts :
   - useProfile() : useQuery sur getProfile, basé sur l'utilisateur courant
     (useAuth)
   - useUpdateProfile() : useMutation + invalidation du cache
   - useUpdateRole() : useMutation pour updateRole + invalidation

3. src/lib/profile/avatars.ts + src/hooks/useAvatars.ts :
   - liste les fichiers du bucket "avatars" via supabase.storage et retourne
     les URLs publiques (useQuery, staleTime long car ça change rarement)

Type tout avec TypeScript strict. Pas de useEffect pour fetcher.
```

---

## Étape 4 — Composants UI réutilisables

**Objectif** : construire les briques UI manquantes (AvatarPicker,
sélecteur de rôle, champs de formulaire, bouton de confirmation) en
respectant le style Tailwind v4 + CVA existant dans `src/components/ui/`.

**Prompt** :
```
/react-vite-best-practices

Crée les composants UI suivants dans src/components/ui/ (et exporte-les
depuis src/components/ui/index.ts), en respectant le style Tailwind v4 +
CVA + clsx déjà utilisé par Button/Capsule :

- TextInput : champ texte/email avec label, erreur optionnelle
- AvatarPicker : grille d'avatars sélectionnables (props: avatars[], value,
  onChange), basé sur useAvatars
- RoleSelector : sélection du rôle parmi 'parent' | 'prof' | 'expert'
  (regarde src/routes/_protected/onboarding/index.tsx pour le style des
  cartes de rôle déjà existant et réutilise/adapte ce pattern)
- ConfirmDialog : modale de confirmation générique (titre, description,
  bouton confirmer/annuler) — sera utilisée pour la suppression de compte

Pas de logique métier dans ces composants, uniquement de l'affichage et des
callbacks.
```

---

## Étape 5 — Edge Function suppression de compte (RGPD)

**Objectif** : la suppression d'un compte `auth.users` nécessite la clé
service_role, donc une Edge Function dédiée.

**Prompt** :
```
/new-edge-function delete-account

Crée une Edge Function "delete-account" :
- vérifie le JWT de l'utilisateur appelant (utilisateur authentifié requis)
- utilise le client Supabase admin (service_role, secret côté Edge Function
  uniquement) pour appeler supabase.auth.admin.deleteUser(user.id)
- la suppression de la ligne profiles doit suivre via le ON DELETE CASCADE
  déjà défini dans 00001_init.sql (vérifie que c'est bien le cas)
- retourne 200 en cas de succès, gère les erreurs proprement

Ajoute aussi côté front src/lib/profile/profile.ts une fonction
deleteAccount() qui appelle cette Edge Function, et déconnecte/redirige vers
"/" en cas de succès.
```

---

## Étape 6 — Réutiliser le endpoint de rôle dans l'onboarding

**Objectif** : factoriser pour que `/signup/role` (ou l'étape onboarding
équivalente) et la page profil utilisent le même hook `useUpdateRole`,
plutôt que deux implémentations différentes.

**Prompt** :
```
Regarde src/routes/_protected/onboarding/index.tsx : l'étape de sélection
du rôle ne persiste pas encore le rôle choisi. Branche-la sur
useUpdateRole() (créé à l'étape 3) :
- si l'utilisateur choisit "expert", affiche un champ doctolib_url
  obligatoire avant de pouvoir valider (réutilise RoleSelector et TextInput)
- à la validation, appelle useUpdateRole({ role, doctolib_url })
- gère l'erreur de validation (expert sans doctolib) avec un message clair

L'objectif est qu'il n'y ait qu'un seul chemin de code pour mettre à jour le
rôle, utilisé à la fois ici et dans la page profil de l'étape 7.
```

---

## Étape 7 — Route `/profile/edit` : formulaire d'édition complet

**Objectif** : la page de modification du profil avec tous les champs
demandés.

**Prompt** :
```
/new-route profile/edit protégée

Crée la page src/routes/_protected/profile/edit.tsx (compose des
sous-composants dans src/components/profile/, la route ne fait
qu'assembler) :

1. Photo de profil : AvatarPicker branché sur useUpdateProfile
   (avatar_url)
2. Identité : first_name, last_name, email
   - email : utilise supabase.auth.updateUser({ email }) (déclenche un mail
     de confirmation Supabase, affiche un message à l'utilisateur)
3. Mot de passe : section séparée avec champ "nouveau mot de passe" +
   confirmation, supabase.auth.updateUser({ password })
4. Réseaux sociaux : champs linkedin_url, instagram_url, twitter_url,
   doctolib_url (optionnels sauf si role === 'expert', voir point 5)
5. Rôle : RoleSelector + useUpdateRole (même logique que l'onboarding,
   étape 6) — si "expert" sélectionné, doctolib_url devient obligatoire
6. RGPD :
   - bouton "Supprimer mon compte" -> ConfirmDialog -> deleteAccount()
     (étape 5)
   - le bouton de déconnexion existe déjà dans la sidebar
     (AppSidebar.tsx), vérifie juste qu'il est bien visible/accessible
     depuis cette page (pas de duplication)

Découpe en sections claires (Identité / Sécurité / Réseaux sociaux / Rôle /
Compte). Chaque section sauvegarde indépendamment (pas un gros formulaire
unique avec un seul bouton "Enregistrer").
```

---

## Étape 8 — Route `/profile` : page profil (lecture seule)

**Objectif** : page d'affichage du profil avec photo, identité, réseaux et
participation au forum.

**Prompt** :
```
/new-route profile protégée

Crée src/routes/_protected/profile/index.tsx :
- avatar (avatar_url), nom complet, email
- liens vers les réseaux sociaux renseignés (icônes Lucide : LinkedIn,
  Instagram, Twitter/X, Doctolib si role === 'expert')
- lien/bouton vers /profile/edit
- section "Participations au forum" : liste des threads/réponses de
  l'utilisateur. Regarde src/hooks/useForum.ts et le schéma
  forum_threads/forum_replies pour identifier la colonne d'auteur
  (author_id) et écris un hook useUserForumActivity() (TanStack Query) qui
  récupère les threads créés et réponses postées par l'utilisateur courant,
  avec lien vers /forum/$threadId.

Affiche un état vide propre si l'utilisateur n'a encore aucune
participation.
```

---

## Étape 9 — Sidebar : lien vers le profil

**Objectif** : rendre la page profil accessible depuis la sidebar.

**Prompt** :
```
Dans src/components/layout/AppSidebar.tsx, remplace le lien "Mon profil"
qui pointe actuellement vers /onboarding par un lien vers /profile
(page de lecture créée à l'étape 8). Affiche l'avatar_url et le nom du
profil (via useProfile) dans le bloc utilisateur en bas de la sidebar, au
lieu des seules initiales/metadata auth actuelles. Vérifie que le bouton de
déconnexion reste bien présent et fonctionnel.
```

---

## Étape 10 — Vérifications finales

**Objectif** : valider l'ensemble avant la PR vers `develop`.

**Prompt** :
```
Lance les quatre checks du projet (npm run lint, npm run type-check,
npm run test, npm run build) et corrige toutes les erreurs. Ensuite utilise
le skill /verify (ou /run) pour démarrer l'app et vérifier manuellement le
parcours complet :
- /profile affiche bien les infos du profil connecté
- /profile/edit permet de changer avatar, identité, mot de passe, réseaux,
  et rôle (avec contrainte doctolib pour "expert")
- la suppression de compte (avec confirmation) déconnecte bien l'utilisateur
- la sidebar pointe vers /profile et la déconnexion fonctionne

Une fois tout vert, prépare la PR vers develop (titre + description en
anglais, Conventional Commits, sans Co-Authored-By).
```
