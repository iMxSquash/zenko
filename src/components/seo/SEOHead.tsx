import { siteConfig } from '@/lib/seo/site';
import { useEffect } from 'react';

type SEOHeadProps = {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

/** Sets per-page title, meta description, canonical and Open Graph/Twitter tags.
 * Zenko is a client-rendered SPA, so this runs after the initial render — non-JS
 * crawlers will only see the defaults from `index.html`. */
export function SEOHead({ title, description, path = '/', image, noIndex }: SEOHeadProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${siteConfig.name}`;
    const desc = description ?? siteConfig.description;
    const url = `${siteConfig.url}${path}`;
    const ogImage = image ?? siteConfig.image;

    document.title = fullTitle;

    setMetaTag('name', 'description', desc);
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    setLinkTag('canonical', url);

    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', desc);
    setMetaTag('property', 'og:url', url);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');
    setMetaTag('property', 'og:locale', siteConfig.locale);
    setMetaTag('property', 'og:site_name', siteConfig.name);

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', desc);
    setMetaTag('name', 'twitter:image', ogImage);
  }, [title, description, path, image, noIndex]);

  return null;
}
