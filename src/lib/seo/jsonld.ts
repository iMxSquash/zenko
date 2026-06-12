import type { Fiche, ForumThread, PublicProfile } from '@/types';
import { useEffect } from 'react';
import { siteConfig } from './site';

// biome-ignore lint/suspicious/noExplicitAny: JSON-LD payloads are arbitrary schema.org graphs
export type JsonLd = Record<string, any>;

export function generateOrganizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: siteConfig.image,
  };
}

export function generateWebSiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: 'fr-FR',
    publisher: { '@id': `${siteConfig.url}/#organization` },
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}

export function generateLearningResourceJsonLd(fiche: Fiche): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: fiche.title,
    description: fiche.description,
    url: `${siteConfig.url}/bibliotheque/${fiche.slug}`,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    learningResourceType: 'Fiche pratique',
    educationalLevel: fiche.category,
    author: { '@type': 'Person', name: fiche.author },
    publisher: { '@id': `${siteConfig.url}/#organization` },
  };
}

export function generateDiscussionForumPostingJsonLd(thread: ForumThread): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: thread.title,
    text: thread.content,
    url: `${siteConfig.url}/forum/${thread.id}`,
    datePublished: thread.createdAt,
    inLanguage: 'fr-FR',
    about: thread.category,
    commentCount: thread.replies.length,
    author: { '@type': 'Person', name: thread.author.name },
  };
}

export function generateProfilePageJsonLd(profile: PublicProfile): JsonLd {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Membre Zenko';

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: `${siteConfig.url}/profile/${profile.id}`,
    mainEntity: {
      '@type': 'Person',
      name,
      image: profile.avatarUrl ?? undefined,
    },
  };
}

/** Injects a `<script type="application/ld+json">` tag, scoped by `elementId`, for the
 * lifetime of the mounted component. Pass `null` to skip injection (e.g. while data is
 * loading). Use a distinct `elementId` per schema on a page. */
export function useJsonLd(jsonLd: JsonLd | null, elementId: string) {
  useEffect(() => {
    if (!jsonLd) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = elementId;
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [jsonLd, elementId]);
}
