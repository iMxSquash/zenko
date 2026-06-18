# Roadmap - Chatbot RAG (assistant vocal neurodivergence)

L'assistant permet à un utilisateur connecté de poser une question sur l'accompagnement des enfants neurodivergents. Au lieu de chercher manuellement dans les fiches et le forum, il pose la question et le chatbot va chercher les informations pertinentes à sa place, rédige une réponse en citant les sources utilisées.

---

## Comment ça marche

```
Utilisateur (voix ou texte)
  │  Web Speech API (STT)
  ▼
Question envoyée à l'Edge Function /chat
  │
  ├── 1. Embedder la question (gte-small, 384 dims)
  ├── 2. Recherche vectorielle → top-k fiches + discussions forum proches
  ├── 3. Construire le prompt : system + contexte (fiches + discussions)
  └── 4. streamText (Gemini Flash) → réponse en français
              │
              ├── Partie rédigée (toujours présente → affichage UI)
              └── Sources citées (fiches et discussions utilisées)
  ▼
UI ChatAssistant
  ├── Affichage texte streamé
  ├── Liste des sources (fiches + threads forum)
  └── Web Speech API (TTS) - lecture vocale de la réponse
```

Le bot n'a pas accès à internet. On lui pré-mâche le travail : l'embedding de la question permet de retrouver les documents les plus proches sémantiquement dans la base. Gemini reçoit uniquement ces documents comme contexte et rédige une synthèse. Il ne peut pas inventer d'informations hors corpus.

---

## Décisions d'architecture

| Sujet | Choix | Justification |
|---|---|---|
| RAG | pgvector natif Supabase + recherche cosine | Tout reste dans la DB existante, RLS inclus |
| Embeddings | `gte-small` via Supabase Edge Function (keyless, 384 dims) | Pas de clé API supplémentaire |
| LLM | Vercel AI SDK + `@ai-sdk/google` (Gemini 2.0 Flash), streaming | Aligné avec le reste de la stack |
| API | Supabase Edge Function `/chat` | SPA Vite - pas de route handler disponible |
| Voix | Web Speech API (STT + TTS) avec couche abstraite | Keyless, privacy-first, Magnific/ElevenLabs branchables |
| Mode | Hybride voix + texte | Robuste si le micro échoue |
| Sources | Toujours retournées avec la réponse | Transparence + citabilité |

---

## Architecture DB

```
documents
  id            uuid pk
  source_type   text  -- 'fiche' | 'forum_thread' | 'forum_reply'
  source_id     text  -- slug de la fiche ou id du thread/reply
  content       text  -- texte chunké (~500 tokens)
  metadata      jsonb -- { title, slug, category, thread_title, ... }
  embedding     vector(384)
  created_at    timestamptz

→ Index HNSW sur embedding (vector_cosine_ops)
→ RLS : SELECT pour authenticated
→ Fonction SQL match_documents(query_embedding, match_count, filter)
```

---

## Fichiers cibles

```
supabase/
  migrations/
    001_enable_pgvector.sql
    002_documents_embeddings.sql
    003_forum_autoembed.sql
  functions/
    embed/index.ts       # Edge Function - génère un embedding gte-small
    chat/index.ts        # Edge Function - pipeline RAG complet
  seed/
    index-documents.ts   # Backfill fiches + forum → documents

src/
  lib/
    ai/
      retrieve.ts        # Appel Edge Function /chat (fetch + stream)
    voice/
      types.ts           # Interfaces SpeechToText, TextToSpeech
      webspeech.ts       # Implémentation Web Speech API (fr-FR)
      useVoice.ts        # Hook React (start/stop, transcript, speak, mute)
  hooks/
    useAssistant.ts      # useChat (@ai-sdk/react) + useVoice
  components/
    assistant/
      ChatAssistant.tsx  # Composant principal ('use client')
      MicButton.tsx      # Bouton micro (Mic/MicOff)
      VoiceStatus.tsx    # Indicateur d'écoute / génération
      SourceList.tsx     # Liste des fiches et discussions citées
  routes/
    _protected/assistant/
      index.tsx          # /assistant
      history.tsx        # /assistant/history
      $sessionId.tsx     # /assistant/:sessionId
```

---

## Phase 0 - Setup : pgvector + variables d'env

**Livrables :** migration `001_enable_pgvector.sql`, `GEMINI_API_KEY` dans les secrets Supabase Edge Functions (pas dans `.env.local`).

**Prompt :**

```
Sur une branche feat/assistant-setup depuis develop.

Crée supabase/migrations/001_enable_pgvector.sql qui active l'extension
vector (create extension if not exists vector with schema extensions).

Documente dans .env.example que GEMINI_API_KEY est une variable
Supabase Edge Function secret uniquement - ne jamais la mettre en VITE_.

Lance npm run lint, type-check et build. PR vers develop.
```

---

## Phase 1 - Schéma DB : table documents + fonction de recherche

**Livrables :** migration `002_documents_embeddings.sql` avec la table `documents`, index HNSW, RLS et la fonction `match_documents`.

**Prompt :**

```
Sur une branche feat/assistant-schema depuis develop.

Crée supabase/migrations/002_documents_embeddings.sql :

- Table public.documents :
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('fiche','forum_thread','forum_reply')),
  source_id text not null,
  content text not null,
  metadata jsonb default '{}',
  embedding vector(384),
  created_at timestamptz default now()

- Index HNSW : create index on documents using hnsw (embedding vector_cosine_ops)

- RLS activée, policy SELECT pour authenticated.

- Fonction match_documents(query_embedding vector(384), match_count int default 5,
  filter jsonb default '{}') returns table(id uuid, source_type text, source_id text,
  content text, metadata jsonb, similarity float) language sql stable security definer
  set search_path = public :
  SELECT id, source_type, source_id, content, metadata,
         1 - (embedding <=> query_embedding) as similarity
  FROM documents
  WHERE metadata @> filter
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;

Lance les checks. PR vers develop.
```

---

## Phase 2 - Edge Function /embed

**Livrables :** `supabase/functions/embed/index.ts` - prend `{ input: string }`, retourne l'embedding 384 dims via `gte-small`.

**Prompt :**

```
Sur une branche feat/assistant-embed depuis develop.

Crée supabase/functions/embed/index.ts (Deno) :
- Accepte POST { input: string }
- Génère un embedding avec new Supabase.ai.Session('gte-small')
- Retourne { embedding: number[] }
- Gère les erreurs (400 si input manquant, 500 si génération échoue)
- Headers CORS pour autoriser les appels depuis la SPA

Lance les checks. PR vers develop.
```

---

## Phase 3 - Backfill : indexation des fiches et du forum

**Livrables :** script `supabase/seed/index-documents.ts` qui chunk et indexe toutes les fiches et tous les messages du forum dans `documents`. Trigger auto pour les nouveaux posts.

**Prompt :**

```
Sur une branche feat/assistant-indexing depuis develop.

1) Crée supabase/seed/index-documents.ts :
   - Récupère toutes les fiches depuis la table resources (title + description + sections en texte aplati)
   - Récupère tous les forum_threads et forum_replies
   - Pour chaque entrée : chunke le texte (~500 tokens), appelle l'Edge Function /embed,
     upsert dans documents (source_type / source_id / content / metadata avec title et slug)

2) Crée supabase/migrations/003_forum_autoembed.sql :
   Trigger AFTER INSERT sur forum_threads et forum_replies qui appelle l'Edge Function
   /embed via pg_net pour indexer automatiquement les nouveaux posts.

Documente la commande de backfill ici dans docs/chatbot-rag-roadmap.md.
Lance les checks. PR vers develop.
```

> **Commande de backfill (à lancer une fois après déploiement) :**
> ```bash
> npx tsx supabase/seed/index-documents.ts
> ```

---

## Phase 4 - Edge Function /chat : pipeline RAG complet

**Livrables :** `supabase/functions/chat/index.ts` - pipeline complet : embed question → match_documents → prompt → stream Anthropic. Retourne la réponse streamée + les sources utilisées.

**Prompt :**

```
Sur une branche feat/assistant-chat depuis develop.

Crée supabase/functions/chat/index.ts (Deno) :

1. Auth : vérifie le JWT Supabase dans le header Authorization. Retourne 401 si absent.

2. Body : { messages: Message[], conversationId?: string }
   Prend le dernier message utilisateur comme question.

3. Embedding : appelle l'Edge Function /embed avec la question.

4. Recherche : appelle match_documents(embedding, 6) - retourne top-6 chunks
   (fiches + threads + replies mélangés).

5. Prompt système (en français) :
   - Répond UNIQUEMENT à partir du CONTEXTE fourni ci-dessous
   - Si la réponse n'est pas dans le contexte, le dire honnêtement
   - Cite les sources utilisées (titre de la fiche ou sujet du thread)
   - Ton bienveillant, adapté aux familles d'enfants neurodivergents
   - Ne jamais donner de conseil médical ou de diagnostic
   - Refuser poliment les questions hors sujet

6. streamText avec google('gemini-2.0-flash'), renvoie le stream.

7. Dans les metadata du stream, inclure les sources : liste des
   { source_type, source_id, title } des documents utilisés.

Headers CORS. Lance les checks. PR vers develop.
```

---

## Phase 5 - Couche voix (Web Speech API)

**Livrables :** `src/lib/voice/types.ts`, `webspeech.ts`, `useVoice.ts` - couche abstraite STT + TTS, défaut Web Speech API, Magnific/ElevenLabs branchables.

**Prompt :**

```
Sur une branche feat/assistant-voice depuis develop.

Crée src/lib/voice/types.ts :
  interface SpeechToText { start(): void; stop(): void; onResult(cb: (t: string) => void): void }
  interface TextToSpeech { speak(text: string): void; cancel(): void; setMuted(m: boolean): void }

Crée src/lib/voice/webspeech.ts :
  WebSpeechSTT : SpeechRecognition en fr-FR, continuous false, interimResults false
  WebSpeechTTS : speechSynthesis, voix française en priorité

Crée src/lib/voice/useVoice.ts (hook React) :
  Expose : isListening, transcript, startListening, stopListening,
           speak(text), isSpeaking, muted, toggleMute
  Sélectionne WebSpeechSTT + WebSpeechTTS par défaut.
  Détecte si Web Speech API est disponible (SSR/navigateur non supporté).

Lance les checks. PR vers develop.
```

---

## Phase 6 - Composants UI assistant

**Livrables :** `ChatAssistant.tsx`, `MicButton.tsx`, `VoiceStatus.tsx`, `SourceList.tsx` et la route `/assistant`.

**Prompt :**

```
Sur une branche feat/assistant-ui depuis develop.

Crée src/components/assistant/MicButton.tsx :
  Bouton rond, icône Mic/MicOff (lucide-react), état isListening en prop.
  Style : couleur brand #2f9dd4 actif, neutre inactif.

Crée src/components/assistant/VoiceStatus.tsx :
  Affiche l'état courant : "En écoute…", "Génération…", "Lecture…" ou rien.

Crée src/components/assistant/SourceList.tsx :
  Liste les sources citées par le bot : fiches (lien vers /bibliotheque/:slug)
  et discussions forum (lien vers /forum/:threadId). Affichage compact.

Crée src/components/assistant/ChatAssistant.tsx :
  - useChat (@ai-sdk/react) → appelle l'Edge Function /chat de Supabase
  - useVoice pour STT (remplit l'input au transcript) et TTS (lit la réponse)
  - Historique des messages (user/assistant) avec bulle de style cohérent
  - Bouton micro (MicButton) + champ texte + bouton envoyer
  - Bouton mute (Volume2/VolumeX lucide)
  - SourceList sous chaque réponse de l'assistant
  - VoiceStatus pendant l'écoute et la génération
  - Respecte les tokens : --color-brand, --color-background, --radius-card

Met à jour src/routes/_protected/assistant/index.tsx pour rendre <ChatAssistant />.
Lance les checks. PR vers develop.
```

---

## Phase 7 - Historique des sessions

**Livrables :** table `chat_sessions` + `chat_messages` en DB, hooks `useAssistant.ts`, routes `/assistant/history` et `/assistant/:sessionId`.

**Prompt :**

```
Sur une branche feat/assistant-history depuis develop.

Crée une migration pour deux tables :
- chat_sessions (id, user_id, title, created_at) avec RLS user_id = auth.uid()
- chat_messages (id, session_id, role 'user'|'assistant', content, sources jsonb, created_at)

Implémente src/hooks/useAssistant.ts :
  - Crée une session au premier message si conversationId absent
  - Persiste chaque message (user + assistant) en DB via PostgREST
  - useQuery pour charger les sessions dans /assistant/history

Met à jour src/routes/_protected/assistant/history.tsx : liste des sessions,
lien vers /:sessionId.
Met à jour src/routes/_protected/assistant/$sessionId.tsx : replay read-only
des messages d'une session.
Lance les checks. PR vers develop.
```

---

## Phase 8 - Tests et finalisation

**Livrables :** tests Vitest sur le chemin critique, vérification end-to-end manuelle.

**Prompt :**

```
Sur une branche feat/assistant-tests depuis develop.

Ajoute des tests Vitest :
1. useVoice : détecte correctement l'absence de Web Speech API (mock window)
2. ChatAssistant : rendu du bouton micro + champ texte présents
3. SourceList : affiche correctement une liste de sources mockées

Vérification manuelle :
- Utilisateur non connecté → redirigé depuis /assistant
- Poser une question texte → réponse streamée avec sources citées
- Tester le micro (Chrome) → transcript remplit l'input → envoi automatique
- Vérifier lecture vocale + bouton mute
- Vérifier que /assistant/history liste les sessions

Lance les 4 checks. PR develop → main si tout est vert.
```

---

## Variables d'environnement

| Variable | Côté | Usage |
|---|---|---|
| `VITE_SUPABASE_URL` | Client | URL Supabase |
| `VITE_SUPABASE_ANON_KEY` | Client | Clé publique Supabase |
| `GEMINI_API_KEY` | **Supabase Edge Function secrets uniquement** | LLM Google Gemini 2.0 Flash |

## Vérification au fil des phases

1. `npm run lint && npm run type-check && npm run test && npm run build` à chaque phase.
2. Appliquer les migrations Supabase, lancer le backfill, vérifier `select count(*) from documents;`
3. Tester `select * from match_documents('<embedding test>', 5);` → retourne des résultats.
4. `npm run dev` → `/assistant` → poser une question → réponse streamée avec sources.
5. Tester micro sur Chrome, lecture vocale, bouton mute.
6. Vérifier qu'un utilisateur non connecté est redirigé par `_protected.tsx`.
