// GET (sans body)
// Exporte toutes les données personnelles de l'utilisateur authentifié (art. 20 RGPD).
// Retourne un JSON contenant profile, chat_sessions+messages, forum_threads, forum_replies,
// saved_resources, reading_progress.

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
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = requireEnv('SUPABASE_URL');
    const anonKey = requireEnv('SUPABASE_ANON_KEY');
    const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const db = createClient(supabaseUrl, serviceKey);

    const [profileRes, sessionsRes, threadsRes, repliesRes, savedRes, progressRes] =
      await Promise.all([
        db.from('profiles').select('*').eq('id', user.id).single(),
        db.from('chat_sessions').select('*, chat_messages(*)').eq('user_id', user.id),
        db.from('forum_threads').select('*').eq('user_id', user.id),
        db.from('forum_replies').select('*').eq('user_id', user.id),
        db.from('saved_resources').select('*').eq('user_id', user.id),
        db.from('reading_progress').select('*').eq('user_id', user.id),
      ]);

    const payload = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      profile: profileRes.data,
      chat_sessions: sessionsRes.data ?? [],
      forum_threads: threadsRes.data ?? [],
      forum_replies: repliesRes.data ?? [],
      saved_resources: savedRes.data ?? [],
      reading_progress: progressRes.data ?? [],
    };

    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="zenko-export-${user.id.slice(0, 8)}.json"`,
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Erreur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
