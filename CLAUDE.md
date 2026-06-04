# Zenko

PWA React + Vite — **V2 en cours**. Ce fichier documente les conventions du projet pour Claude Code.

## Contexte

Zenko est la V2 d'AlemAgency. Application web progressive (PWA) avec assistant vocal pour l'accompagnement des enfants neurodivergents. Contrairement à AlemAgency (Next.js, MVP rapide), Zenko est une SPA Vite — il n'y a **pas de route handlers ni de Server Components**.

La couche serveur est assurée par Supabase :
- **PostgREST** (via `@supabase/supabase-js`) pour toutes les données : forum, fiches, profil — protégées par RLS.
- **Edge Functions** uniquement quand une clé secrète est nécessaire côté serveur : `/chat` (ANTHROPIC_API_KEY) et `/embed` (indexation pgvector).

## Règles V2

Ce projet est une V2 : l'hypothèse produit est validée, on construit pour durer. Les règles MVP d'AlemAgency s'assouplissent sur l'architecture mais restent strictes sur la livraison.

### Ce qu'on fait

- **Séparer les responsabilités** : composant = affichage, hook = logique, `lib/` = accès données.
- **TanStack Query pour tout le server state** : forum, fiches, profil utilisateur — pas de `useState` + `useEffect` pour fetcher.
- **Zustand uniquement pour l'état client pur** : UI (sidebar, mute, mic) sans source serveur.
- **Couche voix abstraite** : toujours passer par `useVoice` — jamais appeler `SpeechRecognition` directement dans un composant.
- **Clés API serveur dans Supabase Edge Function secrets** : `ANTHROPIC_API_KEY` n'est jamais côté client.
- **Utiliser des librairies existantes** : ne pas réimplémenter ce qu'un package fiable fait déjà.

### Ce qu'on ne fait pas

- **Pas de route handler Vite** : il n'y en a pas. L'API = Supabase (PostgREST + Edge Functions).
- **Pas de `useEffect` pour fetcher des données** : utiliser `useQuery` de TanStack Query.
- **Pas d'appel Supabase direct dans les composants** : passer par les hooks de `src/hooks/`.
- **Pas de logique métier dans les routes** : les fichiers `src/routes/` assemblent et passent des props, c'est tout.
- **Pas de feature flags** : changer le code directement.
- **Pas de i18n** : tout en français.
- **Pas d'optimisation sans mesure** : TanStack Query gère le cache — ne pas en ajouter une couche par-dessus.
- **Pas de `console.log` oublié** : `console.error` pour les erreurs aux frontières, rien d'autre.

### Arbitrages fréquents

| Question | Réponse Zenko |
|---|---|
| Hook réutilisable ou dupliquer ? | Dupliquer si utilisé < 3 fois |
| Pagination ou tout charger ? | Tout charger jusqu'à ce que ça rame |
| State local ou Zustand ? | Local (`useState`) si l'état ne sort pas du composant |
| State local ou TanStack Query ? | TanStack Query dès que la donnée vient de Supabase |
| Composant client ou serveur ? | Tout est client (SPA) — pas de distinction à faire |
| Gestion des erreurs réseau ? | `error` de `useQuery`, message générique affiché, log en console |

## Stack

- **Framework** : React 19 + Vite 6
- **Language** : TypeScript strict
- **Routing** : TanStack Router (file-based, `src/routes/`)
- **Server state** : TanStack Query
- **Client state** : Zustand
- **Styles** : Tailwind CSS v4
- **Auth + DB** : Supabase (PostgreSQL, RLS)
- **IA** : Vercel AI SDK + `@ai-sdk/anthropic` (via Supabase Edge Function)
- **Voix** : Web Speech API (couche abstraite dans `src/lib/voice/`)
- **PWA** : vite-plugin-pwa + Workbox
- **Linting** : Biome
- **Tests** : Vitest + Testing Library

## Structure

```
src/
  routes/
    __root.tsx              # Layout racine
    index.tsx               # / — landing page (publique)
    login.tsx               # /login
    signup.tsx              # /signup
    signup.role.tsx         # /signup/role — choix du rôle après inscription
    _protected.tsx          # Layout auth-guard (redirige si non connecté)
    _protected/
      bibliotheque/
        index.tsx           # /bibliotheque
        $slug.tsx           # /bibliotheque/:slug — détail fiche + progression
      forum/
        index.tsx           # /forum
        $threadId.tsx       # /forum/:threadId — thread + messages temps réel
      assistant/
        index.tsx          # /assistant — chat principal
        history.tsx        # /assistant/history — historique des sessions
        $sessionId.tsx     # /assistant/:sessionId — replay d'une session
  components/
    layout/                 # Sidebar, Header, BottomNav (mobile)
    ui/                     # Composants génériques (Button, Card, Badge, etc.)
    bibliotheque/           # FicheCard, FicheDetail, ReadingProgress, etc.
    forum/                  # ThreadCard, MessageList, MessageForm, etc.
    assistant/              # ChatAssistant, MicButton, VoiceStatus
  hooks/
    useAuth.ts              # session, rôle utilisateur
    useBibliotheque.ts      # fiches, saved_resources, reading_progress
    useForum.ts             # threads, replies, Supabase Realtime
    useAssistant.ts         # useChat (AI SDK) + état vocal
  store/
    ui.ts                   # Zustand — sidebar, mic actif, mute
  lib/
    supabase/
      client.ts             # createClient() browser
    ai/                     # retrieve.ts (appel Edge Function /chat)
    voice/                  # types.ts, webspeech.ts, useVoice.ts
    query.ts                # QueryClient partagé
    env.ts                  # requireEnv()
    utils.ts                # cn()
  types/
  tests/
    setup.ts
```

## Conventions

- Imports : toujours avec `@/` (alias `src/`)
- Composants : PascalCase, un fichier = un composant
- Hooks : camelCase avec préfixe `use`
- Tout est Client Component (SPA) — pas de `"use client"` à ajouter
- `cn()` de `@/lib/utils` pour les classes conditionnelles
- Pas de commentaires évidents ; un commentaire = une contrainte non-obvie

## State management

- **TanStack Query** : toute donnée qui vient de Supabase (forum, fiches, profil). Configurer `staleTime` selon la fraîcheur nécessaire.
- **Zustand** (`src/store/ui.ts`) : état UI pur sans source serveur — sidebar, mic actif, mute.
- **`useState`** : état local qui ne sort pas du composant (valeur d'un input, toggle local).
- **`useChat`** (@ai-sdk/react) : état du chat streaming — ne pas dupliquer dans Zustand.

## Routing (TanStack Router)

- Routes dans `src/routes/` — le plugin Vite génère `routeTree.gen.ts` automatiquement (ne pas éditer).
- Préfixe `_` pour les layouts sans segment d'URL : `_protected.tsx` → layout auth, pas de `/protected` dans l'URL.
- Paramètres dynamiques : `$slug.tsx`, `$threadId.tsx` — typés automatiquement.
- Redirection auth dans `_protected.tsx` via `beforeLoad`.

## Cycle de développement

Toujours suivre ce cycle, sans exception :

1. **Nouvelle branche** depuis `develop` avec le bon préfixe : `feat/`, `fix/`, `chore/`, `refactor/`.
2. **Développer** sur cette branche.
3. **Vérifier** que les quatre checks passent avant de créer la PR :
   ```bash
   npm run lint        # Biome
   npm run type-check  # tsc --noEmit
   npm run test        # Vitest
   npm run build       # build prod + PWA
   ```
4. **PR vers `develop`** une fois tous les checks au vert.
5. **PR de `develop` vers `main`** quand `develop` est stable et validé.

## Commits

- **Langue** : toujours en anglais.
- **Convention** : Conventional Commits — `type(scope): description` en minuscules.
  - Types : `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`, `perf`, `ci`.
  - Exemple : `feat(forum): add real-time message subscription`
- **Pas de mention Co-Authored-By** : ne jamais ajouter `Co-Authored-By: Claude` dans les messages de commit.
- **Avant tout commit**, les quatre checks suivants doivent passer sans erreur :
  ```bash
  npm run lint        # Biome
  npm run type-check  # tsc --noEmit
  npm run format      # Biome format
  npm run test        # Vitest
  ```

## Commandes

```bash
npm run dev          # Dev Vite (port 5173)
npm run build        # Build production + service worker PWA
npm run preview      # Prévisualiser le build prod localement
npm run lint         # Biome check
npm run lint:fix     # Biome check + autofix
npm run type-check   # tsc --noEmit
npm run test         # Vitest (run once)
npm run test:watch   # Vitest (watch)
```

## Skills

Skills dans `.claude/skills/`. Invoquer avec `/nom-du-skill [argument]`.

### Auto-invoke obligatoire

Ces skills doivent être invoqués **automatiquement** sans que l'utilisateur le demande :

| Skill | Déclencher quand… |
|---|---|
| `/react-vite-best-practices` | Tout fichier créé ou modifié dans `src/` (route, composant, hook, store, lib) |
| `/new-route` | Demande de créer une page, une route ou un écran |
| `/new-feature` | Demande de créer une feature complète (plusieurs fichiers liés) |
| `/new-migration` | Demande de créer une table, modifier le schéma, écrire du SQL dans `supabase/migrations/` |
| `/new-edge-function` | Création ou modification d'un fichier dans `supabase/functions/` |
| `/supabase-rls` | Toute nouvelle table créée — vérifier et générer le RLS systématiquement |
| `/supabase-postgres-best-practices` | Toute écriture ou révision de SQL (migrations, seeds, requêtes dans les Edge Functions) |

### Invocation manuelle

```bash
/new-route       <nom> <publique|protégée>
/new-feature     <nom>
/new-migration   <description>
/new-edge-function <nom>
/supabase-rls    <table>
```

## Variables d'environnement

Voir `.env.example`. Ne jamais committer `.env.local`.

| Variable | Usage | Côté |
|---|---|---|
| `VITE_SUPABASE_URL` | URL projet Supabase | Client |
| `VITE_SUPABASE_ANON_KEY` | Clé publique Supabase | Client |
| `ANTHROPIC_API_KEY` | LLM Anthropic | Supabase Edge Function secrets **uniquement** |

## PWA

- Le service worker est généré par Workbox au `npm run build` — ne pas en créer un manuellement.
- En dev (`npm run dev`), le SW n'est pas actif. Tester le comportement offline avec `npm run build && npm run preview`.
- Si la page semble servir du cache d'une autre app : DevTools → Application → Service Workers → Unregister.
