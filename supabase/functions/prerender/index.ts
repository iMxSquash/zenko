// GET /prerender?path=/bibliotheque/:slug → page HTML statique avec meta/OG/JSON-LD réels,
// servie aux crawlers (bots SEO + bots IA) qui n'exécutent pas le JS de la SPA.
// Exposée via les rewrites Vercel ciblant les user-agents bots (voir vercel.json).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { marked } from 'https://esm.sh/marked@12';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function requireEnv(key: string): string {
  const val = Deno.env.get(key);
  if (!val) throw new Error(`Variable d'environnement manquante : ${key}`);
  return val;
}

// Garder en phase avec src/lib/seo/site.ts (SITE_URL).
const SITE_URL = 'https://zenkoo.vercel.app';
const SITE_NAME = 'Zenko';
const SITE_DESCRIPTION =
  "ZENKO réunit l'école, la famille et les spécialistes dans un espace partagé pour accompagner les enfants neurodivergents.";
const SITE_IMAGE = `${SITE_URL}/assets/og-image.png`;

// biome-ignore lint/suspicious/noExplicitAny: JSON-LD payloads are arbitrary schema.org graphs
type JsonLd = Record<string, any>;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function organizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: SITE_IMAGE,
  };
}

function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'fr-FR',
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

type Fiche = {
  slug: string;
  title: string;
  description: string;
  category: string;
  author: string;
  content: string | null;
  created_at: string;
  updated_at: string;
};

function learningResourceJsonLd(fiche: Fiche): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: fiche.title,
    description: fiche.description,
    url: `${SITE_URL}/bibliotheque/${fiche.slug}`,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    learningResourceType: 'Fiche pratique',
    educationalLevel: fiche.category,
    datePublished: fiche.created_at,
    dateModified: fiche.updated_at,
    author: { '@type': 'Person', name: fiche.author },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

type ForumThread = {
  id: string;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
};

type ForumReply = {
  author_name: string;
  content: string;
};

function discussionForumPostingJsonLd(thread: ForumThread, replyCount: number): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: thread.title,
    text: thread.content,
    url: `${SITE_URL}/forum/${thread.id}`,
    datePublished: thread.created_at,
    inLanguage: 'fr-FR',
    commentCount: replyCount,
    author: { '@type': 'Person', name: thread.author_name },
  };
}

type PageData = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  jsonLd: JsonLd[];
  bodyHtml: string;
};

function renderPage(data: PageData): string {
  const fullTitle = `${data.title} | ${SITE_NAME}`;
  const url = `${SITE_URL}${data.path}`;
  const image = data.image ?? SITE_IMAGE;
  const robots = data.noIndex ? 'noindex, nofollow' : 'index, follow';

  const jsonLdTags = data.jsonLd
    .map((entry) => `<script type="application/ld+json">${JSON.stringify(entry)}</script>`)
    .join('\n    ');

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#2f9dd4" />
    <meta name="description" content="${escapeHtml(data.description)}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${escapeHtml(fullTitle)}" />
    <meta property="og:description" content="${escapeHtml(data.description)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="fr_FR" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(data.description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    <title>${escapeHtml(fullTitle)}</title>
    ${jsonLdTags}
  </head>
  <body>
    ${data.bodyHtml}
  </body>
</html>
`;
}

function notFoundPage(path: string): string {
  return renderPage({
    title: 'Page introuvable',
    description: SITE_DESCRIPTION,
    path,
    noIndex: true,
    jsonLd: [],
    bodyHtml: '<h1>Page introuvable</h1>',
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestUrl = new URL(req.url);
    const path = requestUrl.searchParams.get('path') ?? '/';

    const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_ANON_KEY'));

    let html: string;

    const ficheMatch = path.match(/^\/bibliotheque\/([^/]+)$/);
    const threadMatch = path.match(/^\/forum\/([^/]+)$/);

    if (path === '/') {
      html = renderPage({
        title: 'Accompagner les enfants neurodivergents, ensemble',
        description: SITE_DESCRIPTION,
        path: '/',
        jsonLd: [organizationJsonLd(), websiteJsonLd()],
        bodyHtml: `<h1>${escapeHtml(SITE_NAME)}</h1><p>${escapeHtml(SITE_DESCRIPTION)}</p>`,
      });
    } else if (path === '/bibliotheque') {
      const description =
        "Des fiches pratiques pour accompagner les enfants TSA, TDAH, DYS et TDI au quotidien, à l'école comme à la maison.";
      const { data: fiches } = await supabase
        .from('fiches')
        .select('slug, title, description, category')
        .order('created_at', { ascending: false });

      const items = (fiches ?? [])
        .map(
          (f) =>
            `<li><a href="${SITE_URL}/bibliotheque/${escapeHtml(f.slug)}">${escapeHtml(f.title)}</a> — ${escapeHtml(f.description)}</li>`
        )
        .join('\n');

      html = renderPage({
        title: 'Bibliothèque de ressources',
        description,
        path: '/bibliotheque',
        jsonLd: [breadcrumbJsonLd([{ name: 'Bibliothèque', path: '/bibliotheque' }])],
        bodyHtml: `<h1>Bibliothèque de ressources</h1><p>${escapeHtml(description)}</p><ul>\n${items}\n</ul>`,
      });
    } else if (ficheMatch) {
      const slug = ficheMatch[1];
      const { data: fiche } = await supabase
        .from('fiches')
        .select('slug, title, description, category, author, content, created_at, updated_at')
        .eq('slug', slug)
        .maybeSingle<Fiche>();

      if (!fiche) {
        html = notFoundPage(path);
      } else {
        const contentHtml = fiche.content ? await marked.parse(fiche.content) : '';
        html = renderPage({
          title: fiche.title,
          description: fiche.description,
          path: `/bibliotheque/${fiche.slug}`,
          jsonLd: [
            learningResourceJsonLd(fiche),
            breadcrumbJsonLd([
              { name: 'Bibliothèque', path: '/bibliotheque' },
              { name: fiche.title, path: `/bibliotheque/${fiche.slug}` },
            ]),
          ],
          bodyHtml: `<article>
      <p>${escapeHtml(fiche.category)}</p>
      <h1>${escapeHtml(fiche.title)}</h1>
      <p>${escapeHtml(fiche.description)}</p>
      ${contentHtml}
      <p>Par ${escapeHtml(fiche.author)}</p>
    </article>`,
        });
      }
    } else if (path === '/forum') {
      const description =
        "Échangez avec des enseignants, des parents et des spécialistes autour de l'accompagnement des enfants neurodivergents.";
      const { data: threads } = await supabase
        .from('forum_threads')
        .select('id, title, content')
        .order('created_at', { ascending: false })
        .limit(50);

      const items = (threads ?? [])
        .map(
          (t) =>
            `<li><a href="${SITE_URL}/forum/${escapeHtml(t.id)}">${escapeHtml(t.title)}</a></li>`
        )
        .join('\n');

      html = renderPage({
        title: "Forum d'entraide",
        description,
        path: '/forum',
        jsonLd: [breadcrumbJsonLd([{ name: 'Forum', path: '/forum' }])],
        bodyHtml: `<h1>Forum d'entraide</h1><p>${escapeHtml(description)}</p><ul>\n${items}\n</ul>`,
      });
    } else if (threadMatch) {
      const threadId = threadMatch[1];
      const { data: thread } = await supabase
        .from('forum_threads')
        .select('id, title, content, author_name, created_at')
        .eq('id', threadId)
        .maybeSingle<ForumThread>();

      if (!thread) {
        html = notFoundPage(path);
      } else {
        const { data: replies } = await supabase
          .from('forum_replies')
          .select('author_name, content')
          .eq('thread_id', threadId)
          .order('created_at', { ascending: true });

        const replyItems = ((replies ?? []) as ForumReply[])
          .map(
            (r) =>
              `<li><strong>${escapeHtml(r.author_name)}</strong> : ${escapeHtml(r.content)}</li>`
          )
          .join('\n');

        html = renderPage({
          title: thread.title,
          description: thread.content.slice(0, 160),
          path: `/forum/${thread.id}`,
          jsonLd: [
            discussionForumPostingJsonLd(thread, replies?.length ?? 0),
            breadcrumbJsonLd([
              { name: 'Forum', path: '/forum' },
              { name: thread.title, path: `/forum/${thread.id}` },
            ]),
          ],
          bodyHtml: `<article>
      <h1>${escapeHtml(thread.title)}</h1>
      <p>Par ${escapeHtml(thread.author_name)}</p>
      <p>${escapeHtml(thread.content)}</p>
      <ul>
${replyItems}
      </ul>
    </article>`,
        });
      }
    } else {
      html = notFoundPage(path);
    }

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
