// Webhook déclenché par les triggers DB pour indexer automatiquement
// les nouveaux forum_threads et forum_replies dans la table documents.
// POST { source_type, source_id, content, metadata }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function requireEnv(key: string): string {
  const val = Deno.env.get(key);
  if (!val) throw new Error(`Variable d'environnement manquante : ${key}`);
  return val;
}

const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') ?? '*';
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Réservé aux appels internes depuis les triggers DB (supabase_functions.http_request).
  // On vérifie que l'appelant présente bien la service_role key.
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { source_type, source_id, content, metadata } = await req.json();

    if (!source_type || !source_id || !content) {
      return new Response(
        JSON.stringify({ error: 'source_type, source_id et content sont requis.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = requireEnv('SUPABASE_URL');

    // Générer l'embedding via /embed
    const embedRes = await fetch(`${supabaseUrl}/functions/v1/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({ input: content }),
    });

    if (!embedRes.ok) {
      throw new Error(`Erreur /embed : ${embedRes.status}`);
    }

    const { embedding } = await embedRes.json();

    const supabase = createClient(supabaseUrl, serviceKey);

    // Supprimer l'ancien document pour cette source avant ré-insertion
    await supabase
      .from('documents')
      .delete()
      .eq('source_type', source_type)
      .eq('source_id', source_id);

    const { error } = await supabase.from('documents').insert({
      source_type,
      source_id,
      content,
      metadata: metadata ?? {},
      embedding,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Erreur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
