<div align="center">
  <img src="./public/pwa-192x192.png" alt="Zenko" width="80" />
  <h1>Zenko</h1>
  <p><strong>Accompagner les enfants neurodivergents, ensemble.</strong></p>

  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
  [![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
  [![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
  [![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://zenkoo.vercel.app)
</div>

---

Zenko est une application web (PWA installable) qui réunit parents, enseignants et spécialistes dans un espace partagé pour accompagner les enfants neurodivergents. La plateforme combine une bibliothèque de fiches pratiques, un forum communautaire en temps réel, et un assistant vocal alimenté par un RAG sur le corpus de la plateforme.

V2 d'[AlemAgency](https://github.com/iMxSquash/AlemAgency) - même instance Supabase, architecture revisitée pour la maintenabilité long terme.

## Fonctionnalités

- **Bibliothèque** - fiches pratiques classées par profil (TSA, TDAH, DYS, TDI), consultables sans compte, avec suivi de progression et favoris.
- **Forum** - discussions en temps réel entre parents, enseignants et spécialistes, avec auto-indexation dans le corpus RAG.
- **Assistant vocal** - chatbot RAG (pgvector + Gemini Flash) avec interface voix native (Web Speech API). Répond uniquement depuis le corpus de la plateforme, cite ses sources.
- **Profils rôlés** - trois rôles : `parent`, `prof`, `expert`. Les experts peuvent lier un profil Doctolib.
- **PWA installable** - mode standalone, service worker Workbox, installable sur desktop et mobile.
- **Admin** - gestion des fiches et des profils réservée aux administrateurs.

## Stack

| Couche | Technologie |
|---|---|
| Frontend | React 19 + Vite 6 (SPA) |
| Routing | TanStack Router (file-based, type-safe) |
| Server state | TanStack Query |
| Client state | Zustand |
| Styles | Tailwind CSS v4 |
| Auth + DB | Supabase (PostgreSQL, RLS, Realtime, Storage) |
| IA | Vercel AI SDK + Gemini 2.0 Flash (via Supabase Edge Function) |
| Embeddings | `gte-small` via `Supabase.ai.Session` (sans clé externe) |
| Voix | Web Speech API - STT + TTS natif (`fr-FR`) |
| PWA | vite-plugin-pwa + Workbox |
| Linting | Biome |
| Tests | Vitest + Testing Library |

## Architecture

Zenko est une SPA sans route handlers. Toute la logique serveur est dans Supabase :

```
Client (PWA)
  ├── Auth          → Supabase Auth
  ├── Données       → Supabase PostgREST (RLS)
  ├── Temps réel    → Supabase Realtime (forum)
  ├── Chatbot RAG   → Edge Function /chat  (embed → pgvector → Gemini stream)
  └── Embeddings    → Edge Function /embed (gte-small, keyless)
```

La clé `GEMINI_API_KEY` est stockée dans les secrets Supabase Edge Functions - jamais exposée côté client.

Les pages publiques (`/`, `/bibliotheque`, `/forum`) sont indexables : `vercel.json` détecte les user-agents bots et les redirige vers une Edge Function `prerender` qui génère un HTML statique avec meta/OG/JSON-LD depuis Supabase.

## Démarrage rapide

**Prérequis :** Node.js 22+, un projet Supabase actif.

```bash
git clone https://github.com/iMxSquash/zenko.git
cd zenko
npm install
cp .env.example .env.local
# Renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env.local
npm run dev
```

L'application est disponible sur `http://localhost:5173`.

> [!NOTE]
> Le service worker n'est actif qu'en production. Pour tester le comportement PWA (install prompt, etc.) :
> ```bash
> npm run build && npm run preview
> ```

## Variables d'environnement

| Variable | Usage | Côté |
|---|---|---|
| `VITE_SUPABASE_URL` | URL du projet Supabase | Client |
| `VITE_SUPABASE_ANON_KEY` | Clé publique Supabase | Client |
| `GEMINI_API_KEY` | LLM Google Gemini | **Supabase Edge Function secrets uniquement** |

## Commandes

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (port 5173) |
| `npm run build` | Build production + service worker PWA |
| `npm run preview` | Prévisualiser le build localement |
| `npm run lint` | Vérification Biome |
| `npm run lint:fix` | Vérification Biome + corrections automatiques |
| `npm run type-check` | Vérification TypeScript (`tsc --noEmit`) |
| `npm run test` | Vitest (run once) |
| `npm run test:watch` | Vitest (watch mode) |

## Workflow de développement

1. Créer une branche depuis `develop` : `feat/`, `fix/`, `chore/` ou `refactor/`.
2. Développer.
3. Vérifier les quatre checks avant d'ouvrir une PR :
   ```bash
   npm run lint && npm run type-check && npm run test && npm run build
   ```
4. PR vers `develop`. Merge `develop` → `main` quand la branche est stable.

## Structure du projet

```
src/
  routes/          # TanStack Router - file-based
  components/
    layout/        # Sidebar, Header, BottomNav
    ui/            # Composants génériques
    bibliotheque/  # FicheCard, FicheDetail, ReadingProgress…
    forum/         # ThreadCard, MessageList, MessageForm…
    assistant/     # ChatAssistant, MicButton, VoiceStatus…
  hooks/           # useAuth, useBibliotheque, useForum, useAssistant…
  store/           # Zustand - état UI (sidebar, mic, mute)
  lib/
    supabase/      # createClient()
    ai/            # Appel Edge Function /chat
    voice/         # Couche abstraite Web Speech API
    scroll/        # Lenis + snapping sections
  types/           # Types partagés
supabase/
  migrations/      # Schéma PostgreSQL versionné
  functions/       # Edge Functions Deno (chat, embed, prerender…)
  seed/            # Scripts de backfill
```

## Schéma de base de données

### `profiles`

Extension de `auth.users`, créée automatiquement à l'inscription via trigger.

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users` |
| `email` | `text` | |
| `first_name` | `text` | |
| `last_name` | `text` | |
| `avatar_url` | `text` | URL Supabase Storage |
| `role` | `text` | `parent` \| `prof` \| `expert` |
| `linkedin_url` | `text` | |
| `instagram_url` | `text` | |
| `twitter_url` | `text` | |
| `doctolib_url` | `text` | Obligatoire si `role = 'expert'` |
| `consent_given_at` | `timestamptz` | Date du consentement RGPD à l'inscription |
| `age_confirmed` | `boolean` | Déclaration d'âge ≥ 15 ans |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | Auto-mis à jour par trigger |

Vue publique `public_profiles` : expose toutes les colonnes sauf `email`.

### `fiches`

Bibliothèque de fiches pratiques. Contenu géré par les admins, lecture publique (`anon`).

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `slug` | `text` | Unique |
| `title` | `text` | |
| `description` | `text` | |
| `content` | `text` | Corps long de la fiche (Markdown) |
| `category` | `text` | `TSA` \| `TDAH` \| `DYS` \| `TDI` |
| `author` | `text` | |
| `author_user_id` | `uuid` | FK → `auth.users` (nullable) |
| `author_avatar_url` | `text` | |
| `cover_image_url` | `text` | |
| `reading_time_minutes` | `int` | |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | Auto-mis à jour par trigger |

### `saved_resources`

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `auth.users` |
| `resource_slug` | `text` | Slug de la fiche |
| `saved_at` | `timestamptz` | |

Contrainte unique sur `(user_id, resource_slug)`.

### `reading_progress`

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `auth.users` |
| `resource_slug` | `text` | |
| `started_at` | `timestamptz` | |
| `completed_at` | `timestamptz` | `null` jusqu'à la fin |

Contrainte unique sur `(user_id, resource_slug)`.

### `forum_threads`

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `auth.users` |
| `title` | `text` | |
| `content` | `text` | |
| `category` | `text` | `TSA` \| `TDAH` \| `DYS` \| `TDI` |
| `author_name` | `text` | |
| `author_role` | `text` | Vérifié en base via RLS `WITH CHECK` contre `profiles.role` |
| `is_pinned` | `boolean` | `false` par défaut |
| `created_at` | `timestamptz` | |

### `forum_replies`

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `thread_id` | `uuid` | FK → `forum_threads` (cascade delete) |
| `user_id` | `uuid` | FK → `auth.users` |
| `author_name` | `text` | |
| `author_role` | `text` | Vérifié en base via RLS `WITH CHECK` contre `profiles.role` |
| `content` | `text` | |
| `created_at` | `timestamptz` | |

### `chat_sessions`

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `auth.users` |
| `title` | `text` | `'Nouvelle conversation'` par défaut |
| `created_at` | `timestamptz` | |

### `chat_messages`

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `session_id` | `uuid` | FK → `chat_sessions` (cascade delete) |
| `role` | `text` | `user` \| `assistant` |
| `content` | `text` | |
| `sources` | `jsonb` | Documents RAG cités (`null` si aucun) |
| `created_at` | `timestamptz` | |

Purgés automatiquement après 12 mois via `pg_cron` (sessions + messages en cascade).

### `documents`

Corpus vectorisé pour le RAG de l'assistant.

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `source_type` | `text` | `fiche` \| `forum_thread` \| `forum_reply` |
| `source_id` | `text` | ID ou slug de la source |
| `content` | `text` | Texte indexé (~500 tokens par chunk) |
| `metadata` | `jsonb` | Titre, catégorie, slug, etc. |
| `embedding` | `vector(384)` | Embedding `gte-small` |
| `created_at` | `timestamptz` | |

Index HNSW sur `embedding` (cosine). Alimentée automatiquement par trigger sur insert dans `forum_threads` et `forum_replies` → Edge Function `autoembed`.

### `admins`

| Colonne | Type | Notes |
|---|---|---|
| `user_id` | `uuid` | PK, FK → `profiles` |
| `created_at` | `timestamptz` | |

### Storage

| Bucket | Public | Usage |
|---|---|---|
| `avatars` | Oui | Avatars prédéfinis, uploadés par l'équipe. Lecture publique, écriture `service_role` uniquement. |

### Fonctions SQL

| Fonction | Accès | Usage |
|---|---|---|
| `match_documents(embedding, count, filter)` | `service_role` | Recherche sémantique cosine — appelée par l'Edge Function `/chat`. |
| `search_documents_by_keyword(query, count)` | `service_role` | Recherche full-text FTS French (OR) — fallback hybride dans `/chat`. |
| `is_admin(uid)` | `authenticated` | Vérifie si un utilisateur est admin. |
| `handle_new_user()` | trigger | Crée un profil à chaque inscription (`AFTER INSERT ON auth.users`). |
| `handle_updated_at()` | trigger | Met à jour `updated_at` automatiquement sur `profiles` et `fiches`. |
| `trigger_autoembed_thread/reply()` | trigger | Indexe les nouveaux posts dans `documents` via l'Edge Function `autoembed`. |

### Accès public (sans compte)

`fiches`, `forum_threads`, `forum_replies` et `public_profiles` autorisent `SELECT` pour le rôle `anon`. Toutes les actions d'écriture requièrent `authenticated`.

## Sécurité

La couche serveur est isolée du client : aucune clé secrète ne transite dans le bundle JavaScript.

- **RLS sur toutes les tables** - chaque requête PostgREST est filtrée par `auth.uid()`. Un utilisateur ne peut accéder qu'à ses propres données (`chat_messages`, `saved_resources`, `reading_progress`).
- **Secrets serveur** - `GEMINI_API_KEY` et `SUPABASE_SERVICE_ROLE_KEY` résident uniquement dans les secrets Supabase Edge Functions. Seuls `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (publiques par conception) sont dans le client.
- **Corpus RAG non exposé** - la fonction `match_documents` est `SECURITY DEFINER` et révoquée pour `anon`/`authenticated`. Le corpus vectoriel n'est accessible que depuis les Edge Functions via `service_role`.
- **Rôles vérifiés en base** - une RLS `WITH CHECK` sur `forum_threads` et `forum_replies` garantit que `author_role` correspond au profil réel de l'utilisateur. Il n'est pas possible de se déclarer `expert` sans l'être.
- **Headers HTTP** - `vercel.json` applique `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`, `Referrer-Policy` et `Permissions-Policy` sur toutes les routes.
- **CORS restreint** - toutes les Edge Functions lisent `ALLOWED_ORIGIN` depuis les secrets Supabase (aucun wildcard en production).
- **JWT jamais en cache** - le service worker Workbox est configuré `NetworkOnly` pour les routes auth et Edge Functions.
- **Limite de débit sur `/chat`** - la requête est rejetée (`400`) si le tableau dépasse 50 messages ou si le dernier message dépasse 4 000 caractères.

## Accessibilité

L'interface suit les pratiques WCAG 2.1 niveau AA pour garantir une expérience utilisable quelle que soit la modalité d'interaction.

- **Navigation clavier complète** - tous les éléments interactifs sont atteignables au clavier. Les états focus sont toujours visibles (`focus-visible:ring-2`).
- **Labels explicites** - les boutons icon-only portent un `aria-label` descriptif (ex. `"Commencer à parler"` / `"Arrêter l'écoute"` sur le bouton micro selon l'état).
- **Annonces de changements d'état** - les erreurs de formulaire utilisent `role="alert"` et `aria-live="assertive"` pour être lues immédiatement par les lecteurs d'écran.
- **États de formulaire** - `aria-invalid` et `aria-describedby` sont positionnés sur les champs en erreur ; les icônes décoratives portent `aria-hidden="true"`.
- **Contraste** - la couleur principale `#2f9dd4` respecte un ratio de contraste suffisant sur fond clair (`#fafaf9`).
- **Interface voix bidirectionnelle** - l'assistant accepte aussi bien la saisie texte que la voix, sans jamais forcer l'utilisation du micro.

## Respect du RGPD

Zenko traite des données de santé au sens de l'article 9 RGPD (conversations pouvant révéler un diagnostic ou une situation médicale d'enfant). La conformité est intégrée dans l'architecture, pas ajoutée après coup.

- **Consentement explicite à l'inscription** - trois cases obligatoires : acceptation des CGU, consentement au traitement de données sensibles (art. 9.2.a) et déclaration d'âge (≥ 15 ans ou consentement parental). `consent_given_at` et `age_confirmed` sont persistés via trigger en base.
- **Notice assistant IA** - un bandeau s'affiche au premier lancement de l'assistant, informant sur la durée de conservation et le recours à Google Gemini comme sous-traitant.
- **Droit à l'effacement** - le bouton "Supprimer mon compte" appelle une Edge Function dédiée qui déclenche une cascade SQL complète sur toutes les tables liées à l'utilisateur.
- **Droit à la portabilité** - un bouton "Télécharger mes données" dans le profil génère un export JSON complet via une Edge Function.
- **Droit à la rectification** - toutes les données du profil sont modifiables depuis `/profile/edit`.
- **Rétention limitée** - un job `pg_cron` purge automatiquement les sessions de chat (et leurs messages en cascade) après 12 mois.
- **Aucun traceur tiers** - pas d'analytics, pas de cookies publicitaires. Les cookies Supabase Auth sont essentiels ; aucun bandeau cookies n'est requis.
- **Pages légales** - CGU, politique de confidentialité et mentions légales disponibles sur `/legal/*`, liées depuis le pied de page.

## Pivots depuis le MVP (AlemAgency)

Les décisions ci-dessous ont toutes été motivées par des limites rencontrées sur [AlemAgency](https://github.com/iMxSquash/AlemAgency), pas par des préférences techniques.

| Sujet | AlemAgency (MVP) | Zenko (V2) | Pourquoi |
|---|---|---|---|
| **Framework** | Next.js 15 App Router | Vite 6 (SPA) | Le service worker Workbox et l'App Router entrent en conflit sur les assets et les routes. Avec Vite, le SW est généré proprement autour du build. Aucun besoin de SSR : toutes les pages applicatives sont protégées. |
| **Contenu des fiches** | JSON statique (`src/lib/data/resources.json`) | Table `fiches` en PostgreSQL | Le JSON statique ne permettait pas la gestion admin, le versioning, le SEO dynamique, ni l'indexation dans le corpus RAG. |
| **Forum** | JSON statique (`src/lib/data/forum.json`) | PostgreSQL + Supabase Realtime | Le forum statique ne permettait pas aux utilisateurs de poster. Realtime donne les nouvelles réponses sans polling. |
| **Fetching côté client** | Server Components / Server Actions | TanStack Query | Devenu une SPA, il n'y a plus de Server Components. TanStack Query remplace le fetching manuel avec `useState` + `useEffect` : cache, invalidation et états de chargement inclus. |
| **Mutations** | Server Actions Next.js | PostgREST direct (`@supabase/supabase-js`) | Sans serveur Node.js, les mutations passent directement par PostgREST sous contrôle RLS. Les Server Actions disparaissent avec Next.js. |
| **Routing** | Next.js App Router | TanStack Router | Type-safety totale sur les paramètres d'URL et les loaders. Dans AlemAgency, `useParams()` retourne `string \| undefined` sans garantie. |
| **Supabase client** | `@supabase/ssr` | `@supabase/supabase-js` | `@supabase/ssr` gère les cookies pour Server Components et Middleware - inutile dans une SPA sans serveur. |
| **Assistant IA** | Absent | Chatbot RAG (pgvector + Gemini) | Fonctionnalité centrale de la V2 : permettre à un parent ou un enseignant d'interroger directement le corpus sans chercher manuellement. |
| **Profils utilisateurs** | Aucun rôle | `parent` / `prof` / `expert` | Le MVP validait uniquement la bibliothèque. La V2 introduit la communauté multi-rôles : un expert ne doit pas pouvoir être usurpé sur une app de santé. |
| **PWA** | Application web standard | vite-plugin-pwa + Workbox | La cible principale est mobile : les enseignants et parents utilisent l'app depuis un téléphone. L'installabilité réduit la friction d'usage quotidien. |

## Choix techniques notables

**Vite plutôt que Next.js** - Le service worker Workbox et le routing Next.js App Router entrent en conflit sur les assets. Avec Vite, le SW est généré proprement autour du build, sans interférence. L'app étant entièrement connectée (pages applicatives protégées), il n'y a aucun besoin de SSR.

**TanStack Router** - Type-safety totale sur les routes, paramètres URL, search params et loaders. Aucun `useParams()` retournant `string | undefined`.

**Web Speech API** - STT + TTS natifs, sans clé API, privacy-first. La couche abstraite (`src/lib/voice/`) permet de brancher Magnific ou ElevenLabs sans modifier l'UI.

**pgvector natif Supabase** - Le RAG reste dans la base existante. RLS inclus, aucune infrastructure supplémentaire.
