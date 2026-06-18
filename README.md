# Zenko - V2

PWA + assistant vocal pour l'accompagnement des enfants neurodivergents.
V2 d'[AlemAgency](../AlemAgency) - même Supabase, architecture revisitée pour le mobile-first et l'offline.

---

## Choix techniques

### React 19 + Vite 6

Next.js (stack AlemAgency) n'est pas retenu pour la V2 pour une raison principale : **les PWA et Next.js App Router se frottent**.
Le service worker Workbox et le routing Next.js entrent en conflit sur les assets et les routes. Avec Vite, le service worker est généré proprement autour du build, sans interférence.

L'app est entièrement connectée (toutes les pages protégées) - il n'y a pas de besoin de SSR ni de SEO sur les pages applicatives. Une SPA suffit.

### TanStack Router

Préféré à React Router v7 pour deux raisons :

- **Type-safety totale** : routes, paramètres URL, search params et loaders sont tous typés. Aucun `useParams()` avec `string | undefined`.
- **Loaders intégrés** : pre-fetching des données Supabase au niveau de la route, sans boilerplate.

Le file-based routing (`src/routes/`) suit la même logique que Next.js App Router - la transition depuis AlemAgency est naturelle.

### vite-plugin-pwa + Workbox

Meilleur outil PWA de l'écosystème Vite. Il gère :

- Génération du service worker à partir du build Vite
- Stratégies de cache configurables par pattern d'URL :
  - `NetworkFirst` pour les API Supabase (données fraîches en priorité, cache en fallback)
  - `NetworkOnly` pour l'auth et les Edge Functions (streaming, tokens - jamais mis en cache)
  - `CacheFirst` pour les assets statiques (JS, CSS, fonts)
- Manifest PWA intégré dans `vite.config.ts`
- Install prompt natif (Android/Chrome, iOS Safari)

### Supabase (même instance qu'AlemAgency)

La DB n'est pas dupliquée. Zenko lit la même instance Supabase :

- Les tables `forum_threads`, `forum_replies`, `documents` (pgvector) sont partagées
- Les politiques RLS sont identiques - pas de double maintenance
- Les Edge Functions (`/embed`, `/chat`) sont déployées une seule fois, utilisées par les deux apps

### Vercel AI SDK + `@ai-sdk/google`

Le chatbot RAG tourne dans une **Supabase Edge Function** (Deno), pas dans un route handler Next.js. La SPA appelle directement l'Edge Function via `fetch` avec streaming.

- `ai` + `@ai-sdk/google` dans l'Edge Function pour `streamText` avec **Gemini 2.5 Flash Lite**
- `@ai-sdk/react` côté client pour `useChat` (gestion du stream, historique messages)
- La clé `GEMINI_API_KEY` reste dans les secrets Supabase - **jamais exposée au client**
- Les embeddings sont générés par **`gte-small`** via `Supabase.ai.Session` - sans clé API externe

### Web Speech API (couche abstraite)

Défaut voix : `SpeechRecognition` (STT) + `SpeechSynthesis` (TTS) natifs du navigateur.

- Aucune clé API, aucun coût, privacy-first
- `fr-FR` natif sur Chrome, Edge, Safari iOS
- Interfaces abstraites `SpeechToText` / `TextToSpeech` dans `src/lib/voice/` : Magnific ou ElevenLabs se branchent sans toucher à l'UI

### Lenis + Motion - scroll et animations

La landing page utilise deux librairies pour l'expérience de scroll :

- **Lenis** (`lenis`) : smooth scroll rapide (`lerp: 0.3, duration: 1`) avec snapping magnétique via `lenis/snap`. Chaque section de 100 vh snap automatiquement en vue - l'utilisateur ne peut jamais rester bloqué entre deux sections. La navbar et la section hero sont groupées dans un seul snap target pour éviter le recouvrement sticky.
- **Motion** (`motion`) : parallaxe verticale sur les éléments décoratifs SVG de la landing (`useScroll` + `useTransform`). Les formes en bordure de section flottent devant le contenu ; les accents intérieurs passent derrière. La navbar reste toujours au premier plan (z-50).

Encapsulés dans `src/lib/scroll/` :
- `SmoothScrollProvider.tsx` - wrapper `<ReactLenis>` à poser sur la page
- `useSectionSnap.ts` - enregistre les éléments `[data-snap-section]` auprès de `Snap`

### Tailwind CSS v4 + `@tailwindcss/vite`

Mêmes design tokens qu'AlemAgency (`#2f9dd4`, `#fafaf9`, `--radius-card`, polices Inter/Hanken) définis dans `src/app.css` via `@theme {}`. Zéro PostCSS config.

### Biome

Même config qu'AlemAgency. Lint + format en une commande, 10× plus rapide qu'ESLint + Prettier.

---

## Architecture des API

Zenko est une SPA - pas de route handlers côté Vite. Toute la logique serveur est dans Supabase :

```
Client (Zenko PWA)
  │
  ├── Auth          → Supabase Auth (magic link / OAuth)
  ├── Data          → Supabase PostgREST (@supabase/supabase-js)
  ├── Chatbot RAG   → Edge Function /chat (embed + match_documents + stream Anthropic)
  └── Embeddings    → Edge Function /embed (gte-small, keyless)
```

---

## SEO / GEO - pré-rendu pour les bots

`SEOHead` met à jour titre/description/canonical/OG/JSON-LD côté client (`useEffect`) - invisible
pour les crawlers sans JS. Pour les pages publiques indexables (`/`, `/bibliotheque`,
`/bibliotheque/:slug`, `/forum`, `/forum/:threadId`), `vercel.json` détecte les user-agents bots
(Googlebot, GPTBot, ClaudeBot, PerplexityBot, etc. via `has: user-agent`) et les redirige vers
l'Edge Function `supabase/functions/prerender`, qui renvoie un HTML statique avec meta/OG/JSON-LD
réels et le contenu de la fiche/thread, généré à la volée depuis Supabase. Les utilisateurs humains
continuent de recevoir la SPA normale.

---

## Structure

```
src/
  routes/                        # TanStack Router (file-based)
    __root.tsx                   # Layout racine
    index.tsx                    # / - landing page (publique)
    login.tsx                    # /login
    signup.tsx                   # /signup
    signup.role.tsx              # /signup/role - choix du rôle
    _protected.tsx               # Layout auth-guard (redirect si non connecté)
    _protected/
      bibliotheque/
        index.tsx                # /bibliotheque
        $slug.tsx                # /bibliotheque/:slug - détail + progression lecture
      forum/
        index.tsx                # /forum
        $threadId.tsx            # /forum/:threadId - messages temps réel
      assistant/
        index.tsx                # /assistant - chat vocal principal
        history.tsx              # /assistant/history - historique des sessions
        $sessionId.tsx           # /assistant/:sessionId - replay d'une session
  components/
    layout/                      # Sidebar, Header, BottomNav (mobile)
    ui/                          # Button, Card, Badge, etc.
    bibliotheque/                # FicheCard, FicheDetail, ReadingProgress, etc.
    forum/                       # ThreadCard, MessageList, MessageForm, etc.
    assistant/                   # ChatAssistant, MicButton, VoiceStatus, etc.
  hooks/
    useAuth.ts                   # Session, rôle utilisateur
    useBibliotheque.ts           # Fiches, saved_resources, reading_progress
    useForum.ts                  # Threads, replies, Supabase Realtime
    useAssistant.ts              # useChat (AI SDK) + état vocal
  store/
    ui.ts                        # Zustand - sidebar, mic actif, mute
  lib/
    supabase/
      client.ts                  # createClient() browser
    ai/
      retrieve.ts                # Appel Edge Function /chat
    voice/
      types.ts                   # Interfaces SpeechToText, TextToSpeech
      webspeech.ts               # Implémentation Web Speech API
      useVoice.ts                # Hook React couche voix
    query.ts                     # QueryClient partagé (TanStack Query)
    scroll/
      SmoothScrollProvider.tsx   # Wrapper Lenis (smooth scroll + snapping)
      useSectionSnap.ts          # Enregistre les sections [data-snap-section]
    env.ts                       # requireEnv()
    utils.ts                     # cn()
  types/                         # Types partagés
  tests/
    setup.ts
```

---

## Schéma de base de données

### Tables

#### `profiles`
Extension de `auth.users` - créée automatiquement à l'inscription via trigger.

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
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | Auto-mis à jour par trigger |

Vue publique `public_profiles` : expose toutes les colonnes sauf `email`.

---

#### `fiches`
Bibliothèque de fiches - contenu géré par les admins, lecture seule pour les utilisateurs.

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `slug` | `text` | Unique |
| `title` | `text` | |
| `description` | `text` | |
| `content` | `text` | Corps long de la fiche |
| `category` | `text` | `TSA` \| `TDAH` \| `DYS` \| `TDI` |
| `author` | `text` | |
| `author_avatar_url` | `text` | |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | Auto-mis à jour par trigger |

---

#### `saved_resources`
Fiches mises en favoris par un utilisateur.

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `auth.users` |
| `resource_slug` | `text` | Slug de la fiche |
| `saved_at` | `timestamptz` | |

Contrainte unique sur `(user_id, resource_slug)`.

---

#### `reading_progress`
Progression de lecture d'une fiche par un utilisateur.

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `auth.users` |
| `resource_slug` | `text` | |
| `started_at` | `timestamptz` | |
| `completed_at` | `timestamptz` | `null` jusqu'à la fin |

Contrainte unique sur `(user_id, resource_slug)`.

---

#### `forum_threads`

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `auth.users` |
| `title` | `text` | |
| `content` | `text` | |
| `category` | `text` | `TDAH` \| `TSA` \| `DYS` \| `TDI` |
| `author_name` | `text` | |
| `author_role` | `text` | `parent` \| `prof` \| `expert` |
| `is_pinned` | `boolean` | `false` par défaut |
| `created_at` | `timestamptz` | |

---

#### `forum_replies`

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `thread_id` | `uuid` | FK → `forum_threads` (cascade delete) |
| `user_id` | `uuid` | FK → `auth.users` |
| `author_name` | `text` | |
| `author_role` | `text` | `parent` \| `prof` \| `expert` |
| `content` | `text` | |
| `created_at` | `timestamptz` | |

---

#### `chat_sessions`
Sessions de l'assistant vocal, une par conversation.

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `auth.users` |
| `title` | `text` | `'Nouvelle conversation'` par défaut |
| `created_at` | `timestamptz` | |

---

#### `chat_messages`
Messages persistés par session.

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `session_id` | `uuid` | FK → `chat_sessions` (cascade delete) |
| `role` | `text` | `user` \| `assistant` |
| `content` | `text` | |
| `sources` | `jsonb` | Documents RAG utilisés (`null` si aucun) |
| `created_at` | `timestamptz` | |

---

#### `documents`
Corpus vectorisé pour le RAG de l'assistant (pgvector).

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `source_type` | `text` | `fiche` \| `forum_thread` \| `forum_reply` |
| `source_id` | `text` | ID de la source |
| `content` | `text` | Texte indexé |
| `metadata` | `jsonb` | Titre, catégorie, etc. |
| `embedding` | `vector(384)` | Embedding `gte-small` |
| `created_at` | `timestamptz` | |

Index HNSW sur `embedding` (cosine). Alimentée automatiquement via trigger → Edge Function `autoembed` sur insert dans `forum_threads` et `forum_replies`.

---

#### `admins`
Table de rôle admin, alimentée manuellement.

| Colonne | Type | Notes |
|---|---|---|
| `user_id` | `uuid` | PK, FK → `profiles` |
| `created_at` | `timestamptz` | |

---

### Storage

| Bucket | Public | Usage |
|---|---|---|
| `avatars` | Oui | Avatars préenregistrés, uploadés manuellement par l'équipe (lecture publique, écriture service_role) |

### Fonctions SQL

| Fonction | Accès | Usage |
|---|---|---|
| `match_documents(embedding, count, filter)` | `service_role` | Recherche sémantique cosine (appelée par l'Edge Function `/chat`) |
| `search_documents_by_keyword(query, count)` | `service_role` | Recherche full-text FTS French (OR) sur fiches + forum (appelée par l'Edge Function `/chat`) |
| `is_admin(uid)` | `authenticated` | Vérifie si un utilisateur est admin |
| `handle_new_user()` | trigger | Crée un profil à chaque inscription |
| `handle_updated_at()` | trigger | Met à jour `updated_at` automatiquement |
| `trigger_autoembed_thread/reply()` | trigger | Indexe les nouveaux posts dans `documents` via Edge Function `autoembed` |

### Accès public (anon)

Les pages publiques sont lisibles sans compte : `fiches`, `forum_threads`, `forum_replies` et `public_profiles` autorisent le `SELECT` pour le rôle `anon`. Les actions d'écriture (publier, répondre, sauvegarder) restent réservées au rôle `authenticated`.

---

## Démarrage

```bash
cp .env.example .env.local
# Renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

## Workflow de dev

Identique à AlemAgency :

1. Branche `feat/` depuis `develop`
2. Développer
3. Vérifier les 4 checks :
   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```
4. PR vers `develop` quand tout est vert
5. `develop` → `main` quand stable

## Variables d'environnement

| Variable | Usage | Côté |
|---|---|---|
| `VITE_SUPABASE_URL` | URL projet Supabase | Client |
| `VITE_SUPABASE_ANON_KEY` | Clé publique Supabase | Client |
| `GEMINI_API_KEY` | LLM Google Gemini | Supabase Edge Function secrets **uniquement** |
