# Audit de conformité RGPD — Zenko · 2026-06-18

## Résumé exécutif

**3 points critiques, 3 majeurs, 2 mineurs, 6 conformes.**
Zenko traite des données potentiellement sensibles au sens de l'article 9 RGPD (contenu des conversations avec l'assistant IA pouvant révéler un diagnostic ou une situation médicale d'enfant). Le problème le plus urgent est l'absence totale de base légale documentée à l'inscription (pas de consentement, pas de pages légales) et le transfert non encadré de ces données vers Google (Gemini). Les droits individuels sont partiellement couverts (effacement ✅, rectification ✅) mais l'export de données et la gestion des mineurs sont absents.

---

## 2.1 Cartographie des données personnelles

| Table | Données personnelles | Sensibilité |
|---|---|---|
| `profiles` | id, email, first_name, last_name, avatar_url, role, linkedin_url, instagram_url, twitter_url, doctolib_url | Modérée — le champ `role` (parent/prof/expert) peut inférer qu'on est parent d'un enfant neurodivergent |
| `chat_sessions` | user_id, title | Faible |
| `chat_messages` | content (messages utilisateur + réponses assistant), sources jsonb | **Haute — peut contenir des diagnostics, situations médicales, noms d'enfants** |
| `forum_threads` / `forum_replies` | author_name, author_role, content (public) | Modérée — contenu public mais potentiellement sensible |
| `reading_progress` | user_id, resource_slug, started_at, completed_at | Modérée — révèle les catégories lues (TSA/TDAH/DYS/TDI) |
| `saved_resources` | user_id, resource_slug | Modérée — révèle les centres d'intérêt |
| `documents` (pgvector) | embeddings de contenu de forum/fiches | Faible (vectorisé, non réidentifiable directement) |

---

## Points critiques / majeurs

| Sévérité | Constat | Fichier(s) | Recommandation | Statut |
|---|---|---|---|---|
| ✅ 🔴 **Critique** | Aucun consentement documenté à l'inscription. Le formulaire `signup.tsx` ne présente ni case CGU, ni lien vers une politique de confidentialité, ni mention du traitement des données. | `src/routes/signup.tsx` | **Corrigé** — 3 cases obligatoires ajoutées (CGU, données sensibles art. 9.2.a, déclaration d'âge). `consent_given_at` + `age_confirmed` stockés via `raw_user_meta_data` → trigger `handle_new_user`. |
| ✅ 🔴 **Critique** | Les pages légales mentionnées dans le footer sont du **texte statique non cliquable** — aucune route `/legal/*` n'existe. | `src/components/landing/LandingFooter.tsx:46` | **Corrigé** — routes `/legal/confidentialite`, `/legal/cgu`, `/legal/mentions-legales` créées. Footer mis à jour avec liens `<Link>`. |
| ✅ 🔴 **Critique** | `chat_messages.content` peut contenir des données sensibles sans notice d'information. | `src/routes/_app/_protected/assistant/index.tsx` | **Corrigé** — composant `ChatNotice` affiché au premier lancement (localStorage), information sur la durée de conservation et Google Gemini. |
| 🟠 **Majeur** | Les messages sont envoyés à **Google Gemini** sans DPA documenté. | `supabase/functions/chat/index.ts:186` | **Partiellement corrigé** — sous-traitant documenté dans `/legal/confidentialite`. **Action manuelle** : activer le DPA Google Cloud dans la console GCP. |
| ✅ 🟠 **Majeur** | Aucun mécanisme d'**export des données** (droit à la portabilité, art. 20 RGPD). | Aucune route ni composant | **Corrigé** — Edge Function `export-user-data` + bouton "Télécharger mes données" dans `ProfileAccountSection`. |
| ✅ 🟠 **Majeur** | Aucune vérification d'âge (art. 8 RGPD). | `src/routes/signup.tsx` | **Corrigé** — case "Je certifie avoir 15 ans ou plus, ou disposer du consentement parental" obligatoire à l'inscription. |

---

## Points mineurs

| Sévérité | Constat | Fichier(s) | Recommandation | Statut |
|---|---|---|---|---|
| 🟡 **Mineur** | Pas de **registre des traitements** (art. 30 RGPD). | Aucun fichier | Document interne listant finalités, bases légales, sous-traitants, durées. | ⬜ (action manuelle) |
| 🟡 **Mineur** | Région Supabase non documentée. Si `us-east-1`, données hors UE. | `src/lib/supabase/client.ts` | Vérifier dans le Dashboard et documenter. | ⬜ (action manuelle) |

---

## Points conformes

| Sévérité | Constat |
|---|---|
| 🟢 | **Effacement** : bouton "Supprimer mon compte" → Edge Function `delete-account` → cascade SQL complète. |
| 🟢 | **Rectification** : `/profile/edit` permet de modifier toutes les données du profil. |
| 🟢 | **Aucun SDK analytics ou traceur tiers** dans `package.json`. Cookies Supabase Auth = essentiels, pas de bandeau requis. |
| 🟢 | **Secrets serveur** : `GEMINI_API_KEY` uniquement dans les secrets Edge Functions, jamais dans `src/`. |
| 🟢 | **Rétention** : pg_cron purge les `chat_sessions` (+ messages en cascade) après 12 mois (migration `20260618100002`). |
| 🟢 | **RLS** activé sur toutes les tables personnelles. |

---

## Plan d'action priorisé

| # | Action | Type | Priorité | Statut |
|---|---|---|---|---|
| 1 | Pages légales (`/legal/*`) + footer cliquable | Code | 🔴 Bloquant prod | ✅ Corrigé |
| 2 | Consentement à l'inscription (cases + `consent_given_at`) | Code + migration | 🔴 Bloquant prod | ✅ Corrigé |
| 3 | Déclaration d'âge à l'inscription | Code | 🔴 Bloquant prod | ✅ Corrigé |
| 4 | Notice assistant IA (premier lancement) | Code | 🔴 Bloquant prod | ✅ Corrigé |
| 5 | Export des données personnelles | Code | 🟠 Avant prod | ✅ Corrigé |
| 6 | DPA Google Gemini activé dans GCP + région Vertex EU | Manuel | 🟠 Avant prod | ⬜ Action manuelle |
| 7 | Registre des traitements art. 30 | Manuel | 🟡 Post-lancement | ⬜ Action manuelle |
| 8 | Vérifier région Supabase (EU) dans le Dashboard | Manuel | 🟡 Post-lancement | ⬜ Action manuelle |

### Actions manuelles restantes

- **DPA Google Cloud** : activer dans [console.cloud.google.com](https://console.cloud.google.com) → IAM → Data Processing Addendum.
- **Région Supabase** : vérifier dans Supabase Dashboard → Settings → General que la région est bien `eu-west-*`.
- **Registre des traitements** : document interne listant finalités, bases légales, sous-traitants (Supabase EU, Google Gemini, Vercel), durées de conservation.
- **Migrations à appliquer** : `20260618200000_profiles_consent.sql` et `20260618200001_handle_new_user_consent.sql` dans Supabase SQL editor.
- **Déployer `export-user-data`** : `supabase functions deploy export-user-data` + ajouter `ALLOWED_ORIGIN` dans les secrets.
