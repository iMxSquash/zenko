// Update SITE_URL once the production domain is confirmed (also update public/robots.txt,
// public/llms.txt, vercel.json and supabase/functions/sitemap accordingly).
export const SITE_URL = 'https://zenkoo.vercel.app';

export const siteConfig = {
  name: 'Zenko',
  description:
    "ZENKO réunit l'école, la famille et les spécialistes dans un espace partagé pour accompagner les enfants neurodivergents.",
  url: SITE_URL,
  locale: 'fr_FR',
  image: `${SITE_URL}/assets/og-image.png`,
} as const;
