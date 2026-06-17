// POST { input: string } → { embedding: number[] }
// Génère un embedding gte-small (384 dims) via Supabase AI - sans clé API externe.
// Appelé en interne par /chat, /autoembed et le script de backfill (service_role uniquement).

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function requireEnv(key: string): string {
  const val = Deno.env.get(key);
  if (!val) throw new Error(`Variable d'environnement manquante : ${key}`);
  return val;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Réservé aux appelants internes : /chat, /autoembed, script de backfill.
  // Un JWT anon valide ne suffit pas - seule la service_role key est acceptée.
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { input } = await req.json();

    if (!input || typeof input !== 'string') {
      return new Response(JSON.stringify({ error: 'Le champ "input" (string) est requis.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session = new Supabase.ai.Session('gte-small');
    const embedding = await session.run(input, {
      mean_pool: true,
      normalize: true,
    });

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error("La génération de l'embedding a échoué.");
    }

    return new Response(JSON.stringify({ embedding }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Erreur interne',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
