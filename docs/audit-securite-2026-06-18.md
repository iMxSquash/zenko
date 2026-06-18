# Audit de conformité — Zenko · Sécurité · 2026-06-18

## Résumé exécutif

**1 point critique, 3 majeurs, 3 mineurs, 7 conformes.**
Le périmètre server-side (RLS, secrets, Edge Functions) est globalement solide. Les risques prioritaires sont : un défaut d'identité dans le forum qui permet à n'importe quel utilisateur de se déclarer "expert", l'absence totale de headers de sécurité HTTP, le CORS wildcard sur toutes les Edge Functions, et l'absence de limite sur les entrées de `/chat` (abus de quota LLM).

**Statut corrections (2026-06-18) : tous les points 1–5 et 7 sont corrigés. Point 6 (npm audit / ai@6) planifié — breaking change.**

---

## Points critiques / majeurs

| Sévérité | Constat | Fichier(s) | Recommandation |
|---|---|---|---|
| ✅ 🔴 **Critique** | `author_name` et `author_role` dans `forum_threads`/`forum_replies` sont librement choisis par l'utilisateur. La RLS vérifie seulement `auth.uid() = user_id`, pas la cohérence avec le profil réel. N'importe quel compte peut poster en se déclarant `expert` (psychologue, thérapeute), ce qui est particulièrement dangereux sur une app de santé pour enfants. | `20260529122431_forum_replies.sql`, `20260529123917_forum_threads.sql` | **Corrigé** — migration `20260618100000_fix_forum_rls_author_role.sql` : `with check` ajoute `author_role = (SELECT role FROM public.profiles WHERE id = auth.uid())`. |
| ✅ 🟠 **Majeur** | CORS `Access-Control-Allow-Origin: *` sur les 5 Edge Functions. Un site tiers peut déclencher des requêtes cross-origin avec le JWT de l'utilisateur (CSRF-like sur `/delete-account`, abus de `/chat`). | `supabase/functions/*/index.ts` | **Corrigé** — toutes les Edge Functions (chat, admin-delete-user, delete-account, embed, autoembed, prerender) lisent `Deno.env.get('ALLOWED_ORIGIN') ?? '*'`. En production : définir `ALLOWED_ORIGIN=https://zenko.fr` dans les secrets Supabase. |
| ✅ 🟠 **Majeur** | Aucun header de sécurité HTTP configuré dans `vercel.json` (pas de `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`). La SPA est donc exposée au clickjacking et au MIME-sniffing. | `vercel.json` | **Corrigé** — bloc `"headers"` ajouté dans `vercel.json` avec X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, Content-Security-Policy. |
| ✅ 🟠 **Majeur** | `/chat` n'impose aucune limite sur la taille du tableau `messages` ni sur la longueur individuelle de chaque message. Un utilisateur authentifié peut envoyer des milliers de messages très longs, épuisant le quota Gemini et causant des temps de réponse excessifs. | `supabase/functions/chat/index.ts:80` | **Corrigé** — validation ajoutée : `messages.length > 50 → 400` et `lastContent.length > 4000 → 400`. |

---

## Points mineurs

| Sévérité | Constat | Fichier(s) | Recommandation |
|---|---|---|---|
| ✅ 🟡 **Mineur** | `handle_new_user()` est `SECURITY DEFINER` sans `SET search_path = public`. En cas de manipulation de schéma, une attaque par search-path injection devient théoriquement possible. Risque très faible dans un environnement Supabase managé, mais c'est une bonne pratique. | `supabase/migrations/20260529102142_init.sql:23` | **Corrigé** — migration `20260618100001_fix_handle_new_user_search_path.sql` : `SET search_path = public, auth` ajouté. |
| 🟡 **Mineur** | `npm audit` remonte 6 vulnérabilités dans les dépendances AI SDK : `jsondiffpatch < 0.7.2` (XSS, moderate) et `@ai-sdk/provider-utils ≤ 3.0.97` (Uncontrolled Resource Consumption, low). La correction nécessite `ai@6` (breaking change). | `package.json` | **Planifié** — migration vers `ai@6` / `@ai-sdk` v5+ à planifier. `jsondiffpatch` non utilisé côté rendu HTML : risque XSS limité. |
| ✅ 🟡 **Mineur** | Aucune politique de rétention sur `chat_messages`. Les conversations de l'assistant (potentiellement sensibles — santé d'un enfant, situation familiale) sont conservées indéfiniment. L'utilisateur peut supprimer une session, mais rien n'est automatique. | `supabase/migrations/20260609121741_chat_sessions.sql` | **Corrigé** — migration `20260618100002_chat_messages_retention.sql` : job `pg_cron` qui purge les `chat_sessions` > 12 mois chaque nuit à 2h. Requiert Supabase Pro (pg_cron). |

---

## Points conformes

| Sévérité | Constat |
|---|---|
| 🟢 | `.env.local` présent dans `.gitignore` et confirmé non tracké par git. |
| 🟢 | Aucune clé API (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) dans `src/`. Uniquement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (publiques par conception). |
| 🟢 | RLS activé sur toutes les tables (`profiles`, `saved_resources`, `reading_progress`, `fiches`, `chat_sessions`, `chat_messages`, `admins`, `forum_threads`, `forum_replies`). |
| 🟢 | `match_documents` (SECURITY DEFINER) révoqué pour `public`/`anon`/`authenticated`, réservé à `service_role` uniquement. Le corpus vectoriel n'est pas accessible via PostgREST. |
| 🟢 | `/embed` protégé par comparaison stricte de la `service_role_key` : impossible à appeler depuis le client. |
| 🟢 | ServiceWorker (Workbox) configuré `NetworkOnly` pour auth et Edge Functions — les tokens JWT ne sont jamais mis en cache. |
| 🟢 | `public_profiles` view exclut `email` — les données d'identification sensibles ne sont pas exposées à anon. |

---

## Plan d'action priorisé

1. ✅ **🔴 [Forum RLS]** Corrigé — migration `20260618100000_fix_forum_rls_author_role.sql`.
2. ✅ **🟠 [Headers Vercel]** Corrigé — bloc `"headers"` ajouté dans `vercel.json`.
3. ✅ **🟠 [CORS]** Corrigé — `ALLOWED_ORIGIN` env var dans les 6 Edge Functions. **Action manuelle** : définir `ALLOWED_ORIGIN=https://zenko.fr` dans Supabase Dashboard → Edge Functions → Secrets.
4. ✅ **🟠 [Limite /chat]** Corrigé — validation `messages.length > 50` et `lastContent.length > 4000` dans `chat/index.ts`.
5. ✅ **🟡 [search_path]** Corrigé — migration `20260618100001_fix_handle_new_user_search_path.sql`.
6. **🟡 [npm audit]** Planifier la mise à jour vers `ai@6` après évaluation des breaking changes.
7. ✅ **🟡 [Rétention]** Corrigé — migration `20260618100002_chat_messages_retention.sql` (pg_cron). **Prérequis** : Supabase Pro.

### Actions manuelles restantes

- **Supabase SQL editor** : exécuter les 3 migrations `20260618100000`, `20260618100001`, `20260618100002`.
- **Supabase Dashboard → Edge Functions → Secrets** : ajouter `ALLOWED_ORIGIN=https://zenko.fr` (ou l'URL de production réelle) pour chaque fonction déployée.
