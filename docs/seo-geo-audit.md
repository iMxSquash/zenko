# Audit SEO / GEO - Zenko

État au 2026-06-12, suite à la PR [#13](https://github.com/iMxSquash/zenko/pull/13) (feat/seo).

## ✅ Déjà en place

- `robots.txt` avec règles + allowlist crawlers IA (GPTBot, ClaudeBot, PerplexityBot, etc.)
- `llms.txt` à la racine
- `sitemap.xml` généré dynamiquement depuis la table `fiches` (Edge Function + rewrite Vercel)
- JSON-LD : `Organization`, `WebSite`, `LearningResource`, `DiscussionForumPosting`, `ProfilePage`, `BreadcrumbList`
- `SEOHead` : title, description, canonical, OG/Twitter par route
- Accès anonyme aux pages publiques (bibliothèque, forum, profils)

## ✅ Résolu - assets manquants

`index.html`, `vite.config.ts` et `src/lib/seo/site.ts` référencent désormais des fichiers présents
dans `public/` : `favicon.svg`, `apple-touch-icon.png`, `pwa-192x192.png`, `pwa-512x512.png` et
`assets/og-image.png`. Générés depuis le logo (`favicon.svg`) via `scripts/generate-brand-assets.mjs`
(placeholders à remplacer par un design final si besoin).

## ✅ Résolu - domaine placeholder

`SITE_URL = 'https://zenkoo.vercel.app'` (`src/lib/seo/site.ts`) est confirmé comme domaine de
production. Déjà cohérent dans `public/robots.txt`, `public/llms.txt`, `vercel.json` et
`supabase/functions/sitemap/index.ts` - le commentaire "à confirmer" a été retiré.

## ✅ Résolu - limite structurelle SPA (pré-rendu bots)

`SEOHead` continue de mettre à jour titre/description/canonical/OG **côté client via `useEffect`**,
mais une nouvelle Edge Function `supabase/functions/prerender` sert un HTML statique
(meta/OG/JSON-LD + contenu réel) aux crawlers détectés par user-agent (`vercel.json`, rewrites
`has: user-agent`) sur `/`, `/bibliotheque`, `/bibliotheque/:slug`, `/forum`, `/forum/:threadId`.
Les humains continuent de recevoir la SPA normale. Voir section "SEO / GEO - pré-rendu pour les bots"
du README.

## ✅ Résolu - datePublished/dateModified sur LearningResource

`generateLearningResourceJsonLd` (`src/lib/seo/jsonld.ts`) et `learningResourceJsonLd`
(`supabase/functions/prerender/index.ts`) exposent désormais `datePublished`/`dateModified` à
partir de `created_at`/`updated_at` de la table `fiches` (migration `00026_fiches_updated_at.sql`,
trigger `handle_updated_at`).

## ✅ Résolu - llms.txt enrichi + OG image width/height

`public/llms.txt` liste désormais le `sitemap.xml` et décrit les catégories de fiches
(TSA/TDAH/DYS/TDI). `index.html`, `SEOHead` et `prerender` déclarent `og:image:width`/
`og:image:height` (1200×630) - l'asset `og-image.png` reste à créer (voir 🔴 Critique).

## 🟡 Moyen

- Pas de `FAQPage` sur la landing - fort potentiel GEO pour un sujet de niche
  (ex. "comment gérer une crise sensorielle TSA").
- `generateOrganizationJsonLd` n'a pas de `sameAs` (réseaux sociaux) - à ajouter si Zenko a des comptes.

## 🟢 Mineur

- Pas de `twitter:site` (handle Twitter/X de Zenko, si existant).
- `sitemap.xml` n'inclut pas `/forum/:threadId` - probablement volontaire (contenu UGC dynamique),
  à confirmer que c'est intentionnel.

## Suivi

- [x] Ajouter `favicon.svg`
- [x] Ajouter `og-image.png` + icônes PWA (`apple-touch-icon.png`, `pwa-192x192.png`, `pwa-512x512.png`)
- [x] Confirmer le domaine de production et propager `SITE_URL`
- [x] Pré-rendu des pages bibliothèque/forum pour les crawlers (Edge Function `prerender`)
- [x] `datePublished`/`dateModified` sur `LearningResource`
- [x] Enrichir `llms.txt` (catégories + sitemap) et déclarer `og:image:width`/`height`
- [ ] `FAQPage` JSON-LD sur la landing
