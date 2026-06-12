// GET /sitemap → sitemap.xml généré dynamiquement (pages statiques + une entrée par fiche publiée).
// Exposé publiquement via le rewrite Vercel /sitemap.xml (voir vercel.json).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

const STATIC_PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/login', changefreq: 'monthly', priority: '0.5' },
  { path: '/bibliotheque', changefreq: 'weekly', priority: '0.8' },
  { path: '/forum', changefreq: 'daily', priority: '0.6' },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc: string, changefreq: string, priority: string, lastmod?: string): string {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmodTag}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_ANON_KEY'));

    const { data: fiches, error } = await supabase
      .from('fiches')
      .select('slug, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const entries = [
      ...STATIC_PAGES.map((page) =>
        urlEntry(`${SITE_URL}${page.path}`, page.changefreq, page.priority)
      ),
      ...(fiches ?? []).map((fiche) =>
        urlEntry(
          `${SITE_URL}/bibliotheque/${fiche.slug}`,
          'monthly',
          '0.7',
          new Date(fiche.created_at).toISOString().slice(0, 10)
        )
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
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
