---
name: seo-geo-toolkit
description: Implémente le référencement naturel complet (SEO technique, on-page, JSON-LD/schema.org, sitemap, robots.txt) ET le référencement IA (GEO / Generative Engine Optimization, llms.txt, contenu citable par ChatGPT/Perplexity/Claude/Google AI) en code pur, pour n'importe quel projet (Next.js, React/Vite SPA, HTML statique). Utiliser quand on demande "améliore le SEO", "ajoute du JSON-LD", "fais une page géo-localisée", "optimise pour les IA / GEO", "sitemap", "robots.txt", "rich results", "schema.org", "LocalBusiness", "FAQPage", "llms.txt", "metadata", "Open Graph".
metadata:
  version: "1.0"
---

# SEO & GEO Toolkit

Boîte à outils générique pour construire **tout le référencement naturel d'un site en code pur**, sans dépendance
externe : metadata, balises Open Graph/Twitter, JSON-LD (schema.org), sitemap.xml, robots.txt, et le **GEO**
(Generative Engine Optimization = être cité par ChatGPT, Perplexity, Google AI Overviews, Claude).

S'applique à n'importe quelle stack : adapter les snippets ci-dessous au framework du projet (Next.js App Router,
React/Vite SPA, Nuxt, Astro, HTML statique...).

---

## 1. Metadata (title, description, OG, canonical)

### Next.js (App Router)

```tsx
// app/ma-page/page.tsx — page statique
export const metadata: Metadata = {
  title: "Titre orienté requête (≤ 60 caractères) | Marque",
  description: "Description claire, 120-160 caractères, qui donne envie de cliquer et reprend le mot-clé principal.",
  alternates: { canonical: "https://example.com/ma-page" },
  openGraph: {
    title: "...",
    description: "...",
    url: "https://example.com/ma-page",
    type: "website",
    images: [{ url: "https://example.com/og/ma-page.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};
```

```tsx
// app/produits/[slug]/page.tsx — page dynamique
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getItem(params.slug);
  const title = `${item.name} — ${item.shortPitch} | Marque`;
  const description = item.metaDescription ?? item.excerpt.slice(0, 155);
  return {
    title,
    description,
    alternates: { canonical: `https://example.com/produits/${item.slug}` },
    openGraph: { title, description, type: "website", images: [item.image ?? "/og-default.jpg"] },
  };
}
```

Penser `metadataBase` dans le `layout.tsx` racine pour que les URL relatives marchent partout.

### React / Vite SPA (sans SSR)

Sans SSR, il faut injecter les balises côté client (au minimum) ET idéalement pré-rendre le HTML pour les
crawlers qui n'exécutent pas JS (voir section GEO).

```tsx
// components/SEOHead.tsx — composant générique réutilisable
import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: "website" | "article" | "product" | "profile";
  ogImage?: string;
  keywords?: string[];
  robots?: string; // "index, follow" | "noindex, nofollow"
}

export default function SEOHead(props: SEOProps) {
  useEffect(() => {
    document.title = props.title;

    const setMeta = (name: string, content?: string, attr: "name" | "property" = "name") => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", props.description);
    if (props.keywords?.length) setMeta("keywords", props.keywords.join(", "));
    if (props.robots) setMeta("robots", props.robots);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = props.canonical ?? window.location.href;

    setMeta("og:title", props.title, "property");
    setMeta("og:description", props.description, "property");
    setMeta("og:type", props.ogType ?? "website", "property");
    setMeta("og:url", canonical.href, "property");
    if (props.ogImage) setMeta("og:image", props.ogImage, "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", props.title);
    setMeta("twitter:description", props.description);
    if (props.ogImage) setMeta("twitter:image", props.ogImage);
  }, [props]);

  return null;
}
```

Usage : `<SEOHead title="..." description="..." canonical="https://example.com/page" />` en haut de chaque page/route.

### Astro / Nuxt / HTML statique

Injecter directement dans le `<head>` du layout — pas de hook nécessaire, c'est déjà du SSR/SSG :

```html
<title>Titre orienté requête | Marque</title>
<meta name="description" content="..." />
<link rel="canonical" href="https://example.com/page" />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:type" content="website" />
<meta property="og:image" content="https://example.com/og.jpg" />
<meta name="twitter:card" content="summary_large_image" />
```

---

## 2. JSON-LD (schema.org) — catalogue de templates

Règles générales :
- Toujours `JSON.stringify(obj)` pour l'injection — jamais d'interpolation de string brute (échappe `<`, `"`, etc. et évite l'injection de script).
- Un objet par schéma logique, ou un `@graph` unique combinant plusieurs entités liées par `@id`.
- Ne mettre que des champs avec une vraie valeur (utiliser des spreads conditionnels `...(value && {...})`).

### Organization / LocalBusiness (à mettre sur toutes les pages, layout global)

```ts
function generateOrganizationJsonLd(config: {
  name: string; url: string; logo?: string; description?: string;
  address?: { street?: string; city?: string; postalCode?: string; country?: string; region?: string };
  geo?: { lat: number | string; lng: number | string };
  phone?: string; email?: string;
  openingHours?: { dayOfWeek: string[]; opens: string; closes: string }[];
  sameAs?: string[]; // réseaux sociaux
  areaServed?: string | string[];
  priceRange?: string;
  isLocalBusiness?: boolean; // true => LocalBusiness, false => Organization
}) {
  return {
    "@context": "https://schema.org",
    "@type": config.isLocalBusiness ? "LocalBusiness" : "Organization",
    name: config.name,
    url: config.url,
    ...(config.description && { description: config.description }),
    ...(config.logo && { logo: config.logo, image: config.logo }),
    ...(config.sameAs?.length && { sameAs: config.sameAs }),
    ...(config.address && {
      address: {
        "@type": "PostalAddress",
        ...(config.address.street && { streetAddress: config.address.street }),
        ...(config.address.city && { addressLocality: config.address.city }),
        ...(config.address.postalCode && { postalCode: config.address.postalCode }),
        ...(config.address.region && { addressRegion: config.address.region }),
        ...(config.address.country && { addressCountry: config.address.country }),
      },
    }),
    ...(config.geo && {
      geo: { "@type": "GeoCoordinates", latitude: config.geo.lat, longitude: config.geo.lng },
    }),
    ...(config.openingHours?.length && {
      openingHoursSpecification: config.openingHours.map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.dayOfWeek,
        opens: h.opens,
        closes: h.closes,
      })),
    }),
    ...((config.phone || config.email) && {
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Support",
        ...(config.phone && { telephone: config.phone }),
        ...(config.email && { email: config.email }),
      },
    }),
    ...(config.areaServed && { areaServed: config.areaServed }),
    ...(config.priceRange && { priceRange: config.priceRange }),
  };
}
```

### WebSite (page d'accueil, avec sitelinks search box)

```ts
function generateWebSiteJsonLd(siteUrl: string, searchPath = "/recherche?q={search_term_string}") {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}${searchPath}` },
      "query-input": "required name=search_term_string",
    },
  };
}
```

### WebPage générique

```ts
function generatePageJsonLd(title: string, description: string, url: string, siteUrl: string, image?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    ...(image && { image }),
    isPartOf: { "@type": "WebSite", url: siteUrl },
  };
}
```

### Article / BlogPosting / NewsArticle

```ts
function generateArticleJsonLd(article: {
  title: string; description?: string; url: string; image?: string;
  datePublished: string; dateModified?: string; authorName?: string;
  publisherName: string; publisherLogo?: string; keywords?: string[];
  type?: "Article" | "BlogPosting" | "NewsArticle";
}) {
  return {
    "@context": "https://schema.org",
    "@type": article.type ?? "BlogPosting",
    headline: article.title,
    ...(article.description && { description: article.description }),
    ...(article.image && { image: [article.image] }),
    datePublished: article.datePublished,
    dateModified: article.dateModified ?? article.datePublished,
    ...(article.authorName && { author: { "@type": "Person", name: article.authorName } }),
    publisher: {
      "@type": "Organization",
      name: article.publisherName,
      ...(article.publisherLogo && { logo: { "@type": "ImageObject", url: article.publisherLogo } }),
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": article.url },
    ...(article.keywords?.length && { keywords: article.keywords.join(", ") }),
  };
}
```

### BreadcrumbList

```ts
function generateBreadcrumbJsonLd(items: { name: string; url?: string }[], siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url && { item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}` }),
    })),
  };
}
```

### FAQPage (très utile aussi pour le GEO, voir section 4)

```ts
function generateFAQJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
```

### HowTo (guides procéduraux — fort impact GEO)

```ts
function generateHowToJsonLd(howTo: { name: string; description?: string; steps: { name: string; text: string; image?: string }[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: howTo.name,
    ...(howTo.description && { description: howTo.description }),
    step: howTo.steps.map((s) => ({
      "@type": "HowToStep",
      name: s.name,
      text: s.text,
      ...(s.image && { image: s.image }),
    })),
  };
}
```

### Product / Service + Offer

```ts
function generateProductJsonLd(product: { name: string; description?: string; image?: string; price?: string; currency?: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.description && { description: product.description }),
    ...(product.image && { image: product.image }),
    url: product.url,
    ...(product.price && {
      offers: {
        "@type": "Offer",
        price: product.price.replace(/[^0-9.,]/g, "").replace(",", "."),
        priceCurrency: product.currency ?? "EUR",
        url: product.url,
      },
    }),
  };
}

function generateServiceJsonLd(service: { name: string; description?: string; providerName: string; areaServed?: string | string[]; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    ...(service.description && { description: service.description }),
    provider: { "@type": "Organization", name: service.providerName },
    ...(service.areaServed && { areaServed: service.areaServed }),
    url: service.url,
  };
}
```

### ItemList (listes : articles, produits, résultats d'annuaire)

```ts
function generateItemListJsonLd(items: { name: string; url: string; description?: string; image?: string }[], siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}`,
      name: item.name,
      ...(item.description && { description: item.description }),
      ...(item.image && { image: item.image }),
    })),
  };
}
```

### AggregateRating (à fusionner dans Organization/Product si avis dispo)

```ts
function generateAggregateRatingJsonLd(ratingValue: number | string, reviewCount: number | string, bestRating = "5") {
  return { "@type": "AggregateRating", ratingValue, reviewCount, bestRating, worstRating: "1" };
}
```

### Combiner plusieurs entités avec `@graph`

```ts
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { ...generateOrganizationJsonLd({ ...config, isLocalBusiness: true }), "@id": `${pageUrl}#business` },
    { ...generateBreadcrumbJsonLd(breadcrumbs, siteUrl), "@id": `${pageUrl}#breadcrumb` },
    { ...generateFAQJsonLd(faqs), "@id": `${pageUrl}#faq` },
  ],
};
```

### Injection

```tsx
// Next.js / Astro / SSR — dans le JSX du <head> ou du body
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

```ts
// SPA / client-side
function injectJsonLd(jsonLd: unknown, elementId: string) {
  document.getElementById(elementId)?.remove();
  const script = document.createElement("script");
  script.id = elementId;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(jsonLd);
  document.head.appendChild(script);
}
```

Pour combiner plusieurs schémas sur une même page sans `@graph`, donner un `elementId` différent à chaque injection.

---

## 3. Sitemap & robots.txt

### Next.js (App Router, natif)

```ts
// app/sitemap.ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://example.com";
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    // ...pages dynamiques via fetch/DB, en respectant la limite de 50 000 URL/sitemap
  ];
}
```

```ts
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://example.com";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/_next/", "/private/"] },
      { userAgent: ["GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended"], allow: "/" },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`],
  };
}
```

Au-delà de 50 000 URL : créer plusieurs `app/sitemap-xxx.xml/route.ts` (ou `generateSitemaps()` de Next.js) et
un `sitemap_index.xml` qui les référence.

### SPA / build statique (pas de routing serveur)

Générer le XML programmatiquement au build (script Node) et l'écrire dans `dist/`/`public/` :

```ts
function generateSitemapXml(urls: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[]) {
  const items = urls.map((u) => `
  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
    ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ""}
    ${u.priority !== undefined ? `<priority>${u.priority}</priority>` : ""}
  </url>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}
</urlset>`;
}

function generateRobotsTxt(opts: { sitemapUrl: string; disallow?: string[]; allowAiCrawlers?: boolean }) {
  const lines = ["User-agent: *", "Allow: /"];
  for (const path of opts.disallow ?? []) lines.push(`Disallow: ${path}`);
  if (opts.allowAiCrawlers) {
    lines.push("", "User-agent: GPTBot", "Allow: /", "", "User-agent: PerplexityBot", "Allow: /", "", "User-agent: ClaudeBot", "Allow: /");
  }
  lines.push("", `Sitemap: ${opts.sitemapUrl}`);
  return lines.join("\n");
}
```

Priorités/fréquences usuelles : accueil `1.0/daily`, pages catégorie `0.8/weekly`, contenu profond `0.6/monthly`,
pages légales `0.3/yearly`.

---

## 4. GEO — Generative Engine Optimization (référencement IA)

Le GEO consiste à optimiser pour être **cité comme source par les moteurs IA** (ChatGPT/SearchGPT, Perplexity,
Google AI Overviews, Claude). Ces moteurs valorisent : contenu structuré (schema.org), réponses directes et
autonomes, fraîcheur, et un accès non bloqué pour leurs crawlers.

### 4.1 `llms.txt`

Fichier `public/llms.txt` (ou route dédiée en SSR) : résumé Markdown du site pour les LLM — qui est l'entité,
pages clés avec description courte.

```
# Nom du site

> Description en 1-2 phrases : ce qu'est le site, pour qui, ce qu'il propose.

## Pages principales
- [Nom de la page](https://example.com/page): description courte de ce qu'on y trouve
- [FAQ](https://example.com/faq): questions fréquentes
```

### 4.2 Crawlers IA dans `robots.txt`

Sauf besoin explicite de bloquer, autoriser : `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `PerplexityBot`,
`ClaudeBot`, `Google-Extended`, `Applebot-Extended` (voir snippet section 3).

### 4.3 Contenu citable

- Réponse directe en 1-3 phrases dès le début de chaque page de contenu (definition/réponse), avant les détails —
  c'est ce que les IA extraient en priorité pour citer la source.
- `FAQPage` JSON-LD sur toute section FAQ, avec des questions formulées comme de vraies recherches utilisateur.
- `HowTo` JSON-LD pour le contenu procédural, avec les mêmes étapes numérotées dans le texte et dans le schema.
- Toujours renseigner `datePublished`/`dateModified` — les IA pondèrent la fraîcheur.
- Hiérarchie de titres propre (`h1` unique par page, `h2`/`h3` logiques) : les IA segmentent par heading pour
  citer la bonne section.
- Sur les SPA sans SSR : si le contenu critique n'apparaît qu'après exécution JS, les crawlers non-JS (et
  certains bots IA) ne le verront pas — prioriser le pré-rendu/SSG/SSR pour les pages de contenu indexable.

---

## 5. Checklist par type de page

### Page de contenu (service/produit/landing)
1. Title (≤60c, mot-clé devant) + description (120-160c) + canonical.
2. Open Graph + Twitter card.
3. JSON-LD `WebPage`/`Product`/`Service` + `Organization` lié.
4. `FAQPage` si section FAQ.
5. Ajout au sitemap avec priorité cohérente + lien interne depuis une page parente.

### Page géo-localisée (ville/région/zone)
1. Title/description incluant la zone + intention de recherche.
2. `ItemList` + `LocalBusiness`/`Organization` avec `geo`/`address`/`areaServed`.
3. `FAQPage` avec questions géo-spécifiques.
4. `BreadcrumbList` cohérent avec la hiérarchie géographique.
5. Sitemap dédié si volume important, `lastmod` réel si data dynamique.

### Article de blog
1. JSON-LD `Article`/`BlogPosting` avec dates et auteur.
2. OG type `article` (published/modified time, tags).
3. `BreadcrumbList`.
4. Sitemap blog avec `lastmod` = date de publication/modif.
5. Réponse directe en intro + structure de titres claire (GEO).

### Site entier (one-time)
1. `robots.txt` avec règles + crawlers IA + sitemap(s).
2. `sitemap.xml` (ou index) couvrant toutes les pages indexables.
3. `Organization`/`WebSite` JSON-LD global (layout).
4. `llms.txt` à la racine.
5. Favicon, `manifest.json`, balises `theme-color` (qualité technique générale).

---

## 6. Validation

- Coller `JSON.stringify(jsonLd, null, 2)` dans le Schema Markup Validator (schema.org/validator) ou Google
  Rich Results Test avant déploiement.
- Vérifier qu'il n'y a pas de doublons de `<script type="application/ld+json">` (même id écrasé/empilé sur les SPA).
- Tester le rendu "vue source"/sans JS pour s'assurer que le contenu indexable est bien présent côté serveur.
