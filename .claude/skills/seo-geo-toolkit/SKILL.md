---
name: seo-geo-toolkit
description: Implémente le référencement naturel (SEO technique, on-page, JSON-LD/schema.org, sitemap, robots.txt) ET le référencement IA (GEO / Generative Engine Optimization, llms.txt, contenu citable par ChatGPT/Perplexity/Claude) en code pur pour l'écosystème detailing.fr / cms-template / formulaire_cms. Utiliser quand on demande "améliore le SEO", "ajoute du JSON-LD", "fais une page géo-localisée", "optimise pour les IA / GEO", "sitemap", "robots.txt", "rich results", "schema.org", "LocalBusiness", "FAQPage", "llms.txt".
metadata:
  version: "1.0"
  scope: "Alternance (detailing.fr, cms-template, formulaire_cms)"
---

# SEO & GEO Toolkit — écosystème Alternance

Référence pour implémenter le SEO et le GEO (SEO + Generative Engine Optimization) **directement en code**, sans
outil externe, sur les deux stacks du projet :

- **`detailing.fr`** — Next.js 14 App Router, métadonnées natives (`generateMetadata`, `sitemap.ts`, `robots.ts`).
- **`cms-template`** — React + Vite (SPA), pas de SSR → SEO injecté côté client via `SEOHead` + `services/jsonld.ts`.
- **`formulaire_cms`** — ne génère pas de SEO directement, mais provisionne le `site_config` qui alimente le SEO de `cms-template`.

Toujours vérifier les fichiers réels avant de dupliquer du code :
- `cms-template/src/services/jsonld.ts` — générateurs JSON-LD réutilisables
- `cms-template/src/services/sitemap.ts` — sitemap + robots.txt générés côté tenant
- `cms-template/src/components/SEOHead.tsx` — injection des balises meta/OG/Twitter
- `cms-template/src/types/index.ts` — interface `SiteConfig` (source de vérité des données tenant pour le SEO)
- `detailing.fr/src/app/layout.tsx` — metadata globale + Organization JSON-LD
- `detailing.fr/src/app/sitemap.ts` et `robots.ts` — sitemap/robots natifs Next.js
- `detailing.fr/src/app/boutiques/[slug]/page.tsx` — exemple complet de LocalBusiness JSON-LD par detailer
- `detailing.fr/src/app/page.tsx` — exemple de `@graph` multi-entités (Organization, WebSite, Service, FAQPage…)

---

## 1. Metadata (title, description, OG, canonical)

### Next.js (`detailing.fr`)

Pages statiques : export `metadata` dans `page.tsx`. Pages dynamiques (`[slug]`) : `generateMetadata()`.

```tsx
// app/services/polissage/page.tsx
export const metadata: Metadata = {
  title: "Polissage automobile : tarifs, étapes et pros près de vous | Detailing.fr",
  description: "Tout savoir sur le polissage auto : prix moyen, étapes, différence avec le lustrage, et annuaire de pros qualifiés.",
  alternates: { canonical: "https://detailing.fr/services/polissage" },
  openGraph: {
    title: "...",
    description: "...",
    url: "https://detailing.fr/services/polissage",
    type: "website",
    images: [{ url: "https://detailing.fr/og/polissage.jpg", width: 1200, height: 630 }],
  },
};
```

```tsx
// app/boutiques/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const detailer = await getDetailerBySlug(params.slug);
  const title = `${detailer.name} — Detailing auto à ${detailer.city} | Avis & Tarifs`;
  const description = `${detailer.name} à ${detailer.city} (${detailer.department}) : ${detailer.services.slice(0,3).join(", ")}. Avis clients, horaires, devis.`;
  return {
    title,
    description,
    alternates: { canonical: `https://detailing.fr/boutiques/${detailer.slug}` },
    openGraph: { title, description, type: "profile", images: [detailer.logo ?? "/og-default.jpg"] },
  };
}
```

Règles :
- Title ≤ 60 caractères, description 120-160 caractères, inclure ville/région pour les pages géo.
- Toujours un `canonical` explicite (évite le duplicate content sur les pages géo qui partagent du contenu).
- `metadataBase` est déjà défini dans `layout.tsx` racine → les URL relatives marchent dans les enfants.

### Vite/React (`cms-template`)

Pas de SSR : on utilise `<SEOHead />` (composant existant, injection DOM via `useEffect`). À placer en haut de chaque page/route.

```tsx
import SEOHead from "@/components/SEOHead";

<SEOHead
  title={`${service.name} — ${siteConfig.name}`}
  description={service.metaDescription ?? service.shortDescription}
  keywords={[service.name, siteConfig.business?.areaServed ?? "", "detailing auto"]}
  siteName={siteConfig.name}
  ogType="website"
  ogImage={service.image}
  canonical={`${siteUrl}/services/${service.slug}`}
/>
```

Pour un article de blog → `ogType="article"` + `articlePublishedTime`, `articleModifiedTime`, `articleTags`.

⚠️ Important pour `cms-template` : comme c'est une SPA, les balises meta sont injectées **après** le premier rendu.
Pour les robots/crawlers IA qui n'exécutent pas JS (cf. section GEO), privilégier le pré-rendu côté `formulaire_cms`
au build (ou un futur SSR) si le contenu doit être indexable sans JS.

---

## 2. JSON-LD (schema.org) — catalogue

### `cms-template` : utiliser les générateurs existants

Ne pas réécrire de schémas à la main — `src/services/jsonld.ts` contient déjà :

| Fonction | Type schema.org | Usage |
|---|---|---|
| `generateOrganizationJsonLd(siteConfig, siteUrl)` | `LocalBusiness` | À injecter sur **toutes les pages** (footer/layout global) — NAP + geo + horaires |
| `generateWebSiteJsonLd(siteUrl)` | `WebSite` | Page d'accueil uniquement |
| `generatePageJsonLd(title, description, image, url, siteConfig)` | `WebPage` | Pages de contenu génériques |
| `generateArticleJsonLd(post, siteConfig, siteUrl)` | `NewsArticle` | Articles de blog |
| `generateBreadcrumbJsonLd(breadcrumbs, siteUrl)` | `BreadcrumbList` | Toute page avec fil d'Ariane |
| `generateFAQJsonLd(faqs)` | `FAQPage` | Pages avec section FAQ (très utilisé en GEO, voir section 4) |
| `generateProductJsonLd(...)` | `Product` + `Offer` | Pages services/tarifs |
| `generateItemListJsonLd(items, siteUrl)` | `ItemList` | Listes (services, articles, galerie) |
| `generateOfferJsonLd(...)` | `Offer` | Tarifs détaillés |
| `generateAggregateRatingJsonLd(value, count)` | `AggregateRating` | À injecter dans `Organization`/`Product` si avis dispo |

Injection via le hook existant :

```tsx
import { useJsonLd } from "@/hooks/useJsonLd";
import { generateOrganizationJsonLd, generateFAQJsonLd } from "@/services/jsonld";

// dans une page de service avec FAQ
useJsonLd(generateOrganizationJsonLd(siteConfig, siteUrl), "org-jsonld");
useJsonLd(generateFAQJsonLd(faqs), "faq-jsonld");
```

Pour combiner plusieurs schémas sur une page, injecter chacun avec un `elementId` différent (le 2e argument
de `injectJsonLd`/`useJsonLd`) — ne jamais réutiliser le même id sinon le précédent est écrasé.

**Manquant à ajouter si besoin** (suivre le même style — fonction pure qui retourne l'objet JSON-LD) :
- `generateServiceJsonLd(service, siteConfig, siteUrl)` → `@type: "Service"`, `provider: Organization`, `areaServed`.
- `generateHowToJsonLd(steps)` → `@type: "HowTo"` pour les articles "comment faire X" (très utile en GEO).
- `generateVideoObjectJsonLd(...)` si galerie vidéo.

### `detailing.fr` : pattern `@graph` inline

Pour les pages riches (accueil, fiche detailer, pages géo), construire un objet `@graph` avec plusieurs entités
liées par `@id`, comme dans `app/page.tsx` et `app/boutiques/[slug]/page.tsx` :

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": `https://detailing.fr/boutiques/${detailer.slug}#business`,
      name: detailer.name,
      image: detailer.logo,
      address: {
        "@type": "PostalAddress",
        streetAddress: detailer.address,
        addressLocality: detailer.city,
        postalCode: detailer.postalCode,
        addressRegion: detailer.region,
        addressCountry: "FR",
      },
      geo: detailer.lat && detailer.lng ? {
        "@type": "GeoCoordinates",
        latitude: detailer.lat,
        longitude: detailer.lng,
      } : undefined,
      openingHoursSpecification: detailer.openingHours?.map(h => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.dayOfWeek,
        opens: h.opens,
        closes: h.closes,
      })),
      ...(detailer.rating && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: detailer.rating.value,
          reviewCount: detailer.rating.count,
        },
      }),
      sameAs: detailer.socials ? Object.values(detailer.socials).filter(Boolean) : undefined,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `https://detailing.fr/boutiques/${detailer.slug}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: "https://detailing.fr" },
        { "@type": "ListItem", position: 2, name: "Annuaire", item: "https://detailing.fr/boutiques" },
        { "@type": "ListItem", position: 3, name: detailer.city, item: `https://detailing.fr/villes/${detailer.citySlug}` },
        { "@type": "ListItem", position: 4, name: detailer.name },
      ],
    },
  ],
};
```

Puis injecter en JSX :

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

⚠️ **Sécurité** : ne jamais interpoler de string directement dans le HTML — toujours `JSON.stringify(obj)` (échappe
correctement les `<`, `"`, etc.). Ne pas insérer de contenu utilisateur non sanitisé dans `name`/`description`
sans vérifier qu'il ne contient pas de séquences de fermeture `</script>`.

### Pages géo (régions/départements/villes)

Utiliser `ItemList` (liste des detailers de la zone) + `LocalBusiness` minimal par item + `FAQPage` (questions
type "Comment trouver un detailer à {ville} ?", générées dynamiquement comme dans `regions/[slug]/page.tsx`).
Pour les zones, `GeoCircle` / `geoMidpoint` + `geoRadius` (cf. `page.tsx` ligne ~404-422) permet de signaler une
zone de couverture (`areaServed`) plutôt qu'un point unique.

---

## 3. Sitemaps & robots.txt

### Next.js (`detailing.fr`)

- `src/app/sitemap.ts` → export `MetadataRoute.Sitemap`. Les entités dynamiques volumineuses (régions, villes,
  blog, detailers) doivent être **séparées en sitemaps dédiés** (`sitemap-regions.xml`, etc., générés par des
  routes `app/sitemap-xxx.xml/route.ts`) et référencées dans un `sitemap_index.xml` — Google limite chaque
  sitemap à 50 000 URLs.
- `priority`/`changeFrequency` : accueil 1.0/daily, annuaire 0.9/daily, listes géo 0.8/weekly, pages légales
  0.3/yearly. Garder cette hiérarchie pour les nouvelles pages.
- `src/app/robots.ts` → bloquer `/api/`, `/admin/`, `/_next/`, `/private/`, fichiers `*.json`. Toujours lister
  tous les sitemaps dans `sitemap: [...]`.

### Vite/React (`cms-template`)

- `src/services/sitemap.ts` construit le XML à la main (`generatePagesSitemap`, `generateBlogSitemap`,
  `generateSitemapIndex`, `generateRobotsTxt`) à partir des données Supabase du tenant (services, articles).
- `syncSitemaps()` envoie le XML généré au backend (`formulaire_cms` via `/api/write-sitemaps`) qui écrit les
  fichiers statiques sur le sous-domaine du tenant (puisque la SPA ne peut pas servir de fichiers dynamiques
  à la racine sans backend). **Quand on ajoute un nouveau type de contenu indexable** (ex: galerie, pages
  promo), il faut : 1) ajouter une fonction `generateXxxSitemap()`, 2) l'inclure dans `generateSitemapIndex()`,
  3) vérifier que `syncSitemaps()` l'envoie bien au backend.
- Si une nouvelle page doit être bloquée à l'indexation (page de paiement, dashboard interne), l'ajouter dans
  `disallowPaths` de `generateRobotsTxt()`.

---

## 4. GEO — Generative Engine Optimization (référencement IA)

Le "GEO" ici = optimiser pour être **cité par les moteurs IA** (ChatGPT/SearchGPT, Perplexity, Google AI
Overviews, Claude). Ces moteurs s'appuient fortement sur : contenu structuré, schema.org (surtout `FAQPage`,
`HowTo`, `Organization`), réponses directes et autonomes, et accès non bloqué pour leurs crawlers.

### 4.1 `llms.txt`

Fichier `public/llms.txt` (Next.js : `src/app/llms.txt/route.ts` ou fichier statique dans `public/`) — résumé
en Markdown du site destiné aux LLM : qui est l'entreprise, quelles pages sont importantes, liens directs.

```
# Detailing.fr

> Annuaire national de detailers automobiles professionnels en France, avec guides, tarifs et un portail SaaS
> pour les pros (sites web, prise de RDV, gestion clients).

## Pages principales
- [Annuaire des detailers](https://detailing.fr/annuaire): recherche par ville/région
- [Guide des services](https://detailing.fr/services): polissage, céramique, PPF, nettoyage intérieur, avec tarifs moyens
- [Glossaire](https://detailing.fr/glossaire): définitions des termes du detailing auto
- [FAQ](https://detailing.fr/faq): questions fréquentes sur le detailing et la plateforme

## Pour les pros
- [Rejoindre l'annuaire](https://detailing.fr/boutiques/rejoindre): inscription des professionnels
```

Pour `cms-template`, générer un `llms.txt` par tenant à partir de `site_config` (nom, description, services,
zone géographique, lien contact) — même logique que `sitemap.ts`, à ajouter côté `formulaire_cms` au
provisioning ou via une route statique générée au build.

### 4.2 Autoriser les crawlers IA dans `robots.txt`

Sauf besoin explicite de les bloquer, autoriser : `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `PerplexityBot`,
`ClaudeBot`, `Google-Extended`, `Applebot-Extended`. Exemple à ajouter dans `robots.ts` :

```ts
rules: [
  { userAgent: "*", allow: "/", disallow: [...] },
  { userAgent: ["GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended"], allow: "/" },
],
```

### 4.3 Contenu citable

- Chaque page de contenu (guide, glossaire, service) doit avoir un **paragraphe de réponse directe** dès le
  début (definition/réponse en 1-3 phrases) avant les détails — c'est ce que les IA extraient en priorité.
- `FAQPage` JSON-LD sur toute page avec une section FAQ (déjà supporté par `generateFAQJsonLd`) : les questions
  doivent être formulées comme une vraie recherche utilisateur ("Combien coûte un polissage automobile ?").
- `HowTo` JSON-LD pour les guides procéduraux (étapes numérotées dans le contenu ET dans le schema).
- Dates `datePublished`/`dateModified` toujours renseignées (déjà fait dans `generateArticleJsonLd`) — les IA
  pondèrent la fraîcheur du contenu.
- Garder une hiérarchie de titres propre (`h1` unique, `h2`/`h3` logiques) : les IA segmentent le contenu par
  heading pour citer la bonne section.

---

## 5. Checklists

### Nouvelle page de service (`detailing.fr` ou `cms-template`)
1. `metadata`/`generateMetadata` (ou `<SEOHead>`) avec title/description orientés requête utilisateur + canonical.
2. JSON-LD `Service` (ou `Product`) + `Organization`/`LocalBusiness` lié via `provider`.
3. Si FAQ présente → `FAQPage` JSON-LD.
4. Ajouter l'URL dans le sitemap correspondant avec priorité/fréquence cohérente.
5. Vérifier le maillage interne (lien depuis la page parente + breadcrumb).

### Nouvelle page géo (région/département/ville)
1. Title/description incluant le nom de la zone + intention ("près de moi", "pas cher", etc.).
2. `ItemList` des detailers de la zone + `LocalBusiness` minimal par item (nom, adresse, geo).
3. `FAQPage` avec questions géo-spécifiques générées dynamiquement (cf. `regions/[slug]/page.tsx`).
4. `BreadcrumbList` cohérent avec la hiérarchie région > département > ville.
5. Sitemap dédié (`sitemap-regions.xml`/`sitemap-cities.xml`) avec `lastModified` réel si data dynamique.

### Nouveau tenant (`cms-template` / provisioning)
1. Vérifier que `site_config.business` est rempli (geo, openingHours, areaServed, addressLocality,
   addressCountry, priceRange) → alimente `generateOrganizationJsonLd`.
2. `generateOrganizationJsonLd` injecté globalement (layout) avec `LocalBusiness`.
3. `sitemap.ts` du tenant inclut bien les pages services + blog (`generatePagesSitemap`/`generateBlogSitemap`).
4. `robots.txt` du tenant généré et synchronisé (`syncSitemaps`).
5. (Optionnel GEO) `llms.txt` du tenant généré avec nom, description, services, zone, contact.

### Nouvel article de blog
1. `generateArticleJsonLd` (NewsArticle) avec `datePublished`/`dateModified`, `focus_keyword`, `tags`.
2. `<SEOHead ogType="article">` avec `articlePublishedTime`/`articleTags`.
3. `BreadcrumbList` (Accueil > Blog > Article).
4. Ajout au sitemap blog avec `lastmod` = date de publication/modif.
5. Paragraphe de réponse directe en intro (pour GEO) + structure `h2`/`h3` claire.

---

## 6. Validation

- Google Rich Results Test / Schema Markup Validator (schema.org/validator) pour valider chaque JSON-LD avant
  déploiement — coller le `JSON.stringify(jsonLd, null, 2)`.
- Vérifier qu'un seul `<script type="application/ld+json">` par schéma logique (pas de doublons d'id sur
  `cms-template`, attention aux re-renders qui pourraient empiler des scripts).
- Sur `cms-template`, tester en désactivant JS (ou via "View Source") pour voir ce qu'un crawler non-JS verra —
  si le contenu critique est absent, prioriser le pré-rendu/SSG pour ces pages.
