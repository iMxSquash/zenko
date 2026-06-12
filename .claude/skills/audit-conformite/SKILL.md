# Skill: audit-conformite

## Quand l'utiliser

Invocation manuelle :

```bash
/audit-conformite              # audit complet (accessibilité + RGPD + sécurité)
/audit-conformite accessibilite
/audit-conformite rgpd
/audit-conformite securite
```

Déclencher aussi quand l'utilisateur demande un "audit accessibilité", "audit RGPD",
"conformité", "audit légal", "est-ce qu'on est conforme", "check RGPD/a11y avant prod".

## Contexte Zenko

Zenko traite des données concernant des **enfants neurodivergents** (profils,
progression de lecture, sessions avec l'assistant IA, messages de forum). Ce sont
potentiellement des **données de santé / handicap au sens de l'article 9 RGPD**
(catégories particulières), et les utilisateurs peuvent être **mineurs** (consentement
parental requis sous 15 ans en France, art. 8 RGPD). Garder ce contexte en tête sur
chaque point de l'audit : le niveau d'exigence est plus élevé que pour une app grand public.

## Ce que tu dois produire

Un rapport markdown structuré, avec pour chaque point :
- **Constat** (ce qui existe / n'existe pas dans le code actuel — cite les fichiers)
- **Sévérité** : 🔴 Critique / 🟠 Majeur / 🟡 Mineur / 🟢 Conforme
- **Recommandation** actionnable

Ne corrige rien sans demande explicite — l'audit est un état des lieux. Si l'utilisateur
demande ensuite de corriger, traite les points un par un en respectant les skills
existants (`/supabase-rls`, `/react-vite-best-practices`, etc.).

---

## 1. Accessibilité (WCAG 2.2 AA)

Référence détaillée : skill global `accessibility` (patterns HTML/CSS/ARIA complets).
Ici, vérifier concrètement dans `src/components/` et `src/routes/` :

- **Formulaires** (`login.tsx`, `signup.tsx`, `signup.role.tsx`, onboarding) : labels
  associés, messages d'erreur avec `aria-invalid`/`aria-describedby`/`role="alert"`,
  `autocomplete` sur les champs de mot de passe.
- **Navigation** : `Sidebar`, `Header`, `BottomNav` — landmarks (`nav`, `aria-label`),
  ordre de focus logique, lien d'évitement ("skip to content").
- **Composants interactifs** : boutons icône sans texte (`MicButton`, actions de
  l'assistant) → `aria-label`. États du micro/voix annoncés via `aria-live`
  (cohérent avec `useVoice`).
- **Contraste** : palette Tailwind utilisée (vérifier `tailwind.config` / tokens) —
  contrôler les couleurs de texte sur fond clair/sombre (4.5:1 texte normal, 3:1 UI).
- **Focus visible** : pas de `outline: none` global sans `:focus-visible` de
  remplacement (`globals.css` / styles partagés).
- **Mouvement** : animations (GSAP/Framer Motion éventuelles) respectent
  `prefers-reduced-motion`.
- **Cible tactile** : boutons/icônes ≥ 24×24px (44×44 recommandé), important pour un
  public incluant des enfants avec troubles moteurs/attentionnels.
- **Assistant vocal** : alternative textuelle systématique au vocal (le chat affiche le
  texte en plus de la synthèse vocale), contrôle clavier complet du micro.
- **Lecture/fiches** : structure de titres (`h1`→`h2`→...) cohérente dans
  `bibliotheque/$slug.tsx`, `ReadingProgress` annoncée aux lecteurs d'écran.

Outils suggérés (à mentionner, pas forcément à lancer) :
```bash
npx lighthouse http://localhost:5173 --only-categories=accessibility
npx @axe-core/cli http://localhost:5173
```

---

## 2. RGPD / Protection des données

### 2.1 Cartographie des données

Lire `supabase/migrations/` (notamment `00001_init.sql`, `00021_extend_profiles.sql`,
`00012_chat_sessions.sql`, `00007_fiches.sql`, `00004_forum_replies.sql`,
`00005_forum_threads.sql`) pour lister :

- Quelles tables contiennent des données personnelles (`profiles`, `chat_sessions`,
  messages de forum, `reading_progress`, avatars dans `00022_avatars_storage_bucket.sql`).
- Si des colonnes laissent deviner des informations sensibles (diagnostic, âge,
  handicap, nom de l'enfant) — vérifier si elles sont nécessaires (principe de
  minimisation, art. 5.1.c).
- Si des transcripts de l'assistant vocal (`chat_sessions`) contiennent potentiellement
  des données de santé en clair, et comment ils sont protégés (RLS, rétention).

### 2.2 Base légale et consentement

- Existe-t-il un mécanisme de **consentement explicite** à l'inscription
  (`signup.tsx`, `signup.role.tsx`) pour le traitement de données de santé (art. 9.2.a) ?
- **Mineurs** : si l'utilisateur est un enfant, le compte est-il créé/géré par un parent
  ("rôle" dans `signup.role.tsx`) ? Vérifier que le rôle "parent/aidant" est bien le
  titulaire du consentement.
- Présence (ou absence) d'une case de consentement séparée pour : CGU, politique de
  confidentialité, traitement de données de santé.

### 2.3 Droits des personnes concernées

Vérifier dans le code (profil, paramètres) si l'utilisateur peut :
- Accéder à ses données (export).
- Les rectifier (édition de profil).
- Demander leur **effacement** (suppression de compte → cascade sur `profiles`,
  `chat_sessions`, messages forum, `reading_progress`, `saved_resources`).
- S'opposer / retirer son consentement.

S'il n'existe aucune route/feature pour ça → 🔴 manquant, à signaler comme prioritaire.

### 2.4 Sous-traitants et transferts de données

- **Supabase** : préciser la région d'hébergement du projet (EU recommandé pour RGPD).
- **Anthropic (`ANTHROPIC_API_KEY`, Edge Function `/chat`)** : les transcripts/messages
  envoyés au LLM transitent vers un sous-traitant tiers (potentiellement hors UE) —
  vérifier qu'un DPA / clauses contractuelles types (SCC) couvrent ce transfert, et que
  la politique de confidentialité le mentionne.
- **Vercel** (hébergement frontend) : idem, mentionner dans le registre des traitements.
- Conclusion attendue : liste des sous-traitants + besoin d'un registre des traitements
  (art. 30 RGPD) s'il n'existe pas.

### 2.5 Sécurité des données

- **RLS Supabase** : pour chaque table contenant des données personnelles, vérifier
  qu'une politique RLS existe (croiser avec `/supabase-rls` si une table en manque).
- **Secrets** : `ANTHROPIC_API_KEY` bien en Edge Function secret, jamais côté client
  (vérifier `src/lib/ai/`, aucune clé dans le bundle).
- **Chiffrement** : HTTPS forcé (Vercel par défaut), stockage Supabase chiffré at-rest
  (géré par Supabase, à mentionner).
- **Rétention** : existe-t-il une politique de durée de conservation (ex: suppression
  des `chat_sessions` après X mois) ? Si rien n'est prévu → 🟠.

### 2.6 Cookies et traceurs

- Lister tout SDK tiers (analytics, error tracking type Sentry, etc.) dans
  `package.json` / `src/main.tsx`.
- Si présence de cookies non strictement nécessaires → bandeau de consentement requis
  (pas encore implémenté en France pour Supabase auth cookies "essentiels", mais à
  vérifier pour tout ajout d'analytics).

### 2.7 Documents légaux

Vérifier l'existence de pages/routes pour :
- Politique de confidentialité
- CGU / CGV
- Mentions légales

Chercher dans `src/routes/` — si absentes, lister comme 🔴 (obligatoire avant mise en
production publique), avec recommandation de créer une route publique (`/legal/*`)
et de les lier dans le footer/sidebar.

---

## 3. Sécurité applicative (complément)

- `.env.local` non commité (vérifier `.gitignore`).
- Headers de sécurité (CSP, `X-Frame-Options`, etc.) — configuration Vercel ou
  `vite.config.ts`.
- Dépendances : `npm audit` pour vulnérabilités connues.
- Validation des entrées utilisateur côté Edge Functions (`/chat`, `/embed`) avant
  appel au LLM.

---

## Format de sortie attendu

```markdown
# Audit de conformité — Zenko (date)

## Résumé exécutif
(3-5 lignes : nombre de points critiques/majeurs/mineurs, verdict global)

## 1. Accessibilité
| Sévérité | Constat | Fichier(s) | Recommandation |
|---|---|---|---|
| 🔴 | ... | ... | ... |

## 2. RGPD
| Sévérité | Constat | Fichier(s) | Recommandation |
|---|---|---|---|

## 3. Sécurité
| Sévérité | Constat | Fichier(s) | Recommandation |
|---|---|---|---|

## Plan d'action priorisé
1. ...
2. ...
```
