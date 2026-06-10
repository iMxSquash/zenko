// Pipeline RAG complet : embed question → match_documents → streamText Gemini
// POST { messages: Message[], conversationId?: string }
// Retourne un data stream AI SDK avec la réponse et les sources en annotation.

import { createGoogleGenerativeAI } from 'https://esm.sh/@ai-sdk/google@1.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createDataStreamResponse, streamText } from 'https://esm.sh/ai@4.3.0';

function requireEnv(key: string): string {
  const val = Deno.env.get(key);
  if (!val) throw new Error(`Variable d'environnement manquante : ${key}`);
  return val;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `Tu es un assistant bienveillant qui aide les familles et professionnels accompagnant des enfants neurodivergents (TSA, TDAH, DYS, TDI).

Règles strictes :
- Réponds UNIQUEMENT à partir du CONTEXTE fourni ci-dessous.
- Si la réponse n'est pas dans le contexte, dis-le honnêtement sans inventer.
- Cite les sources utilisées (titre de la fiche ou sujet de la discussion).
- Ton bienveillant, accessible, adapté aux familles.
- Ne donne jamais de conseil médical ni de diagnostic.
- Refuse poliment les questions hors sujet (neurodivergence, accompagnement).
- Réponds toujours en français.`;

type MatchedDoc = {
  source_type: string;
  source_id: string;
  content: string;
  metadata: Record<string, string>;
  similarity: number;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Auth
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

    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: '"messages" doit être un tableau non vide.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lastContent: string = messages.at(-1)?.content ?? '';

    if (!lastContent) {
      return new Response(
        JSON.stringify({ error: 'Le dernier message ne contient pas de contenu.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 1. Embedding de la question
    const embedRes = await fetch(`${supabaseUrl}/functions/v1/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({ input: lastContent }),
    });

    if (!embedRes.ok) {
      throw new Error(`Erreur /embed : ${embedRes.status}`);
    }

    const { embedding } = await embedRes.json();

    // 2. Recherche sémantique top-6
    const serviceClient = createClient(supabaseUrl, serviceKey);
    const { data: docs, error: rpcError } = await serviceClient.rpc('match_documents', {
      query_embedding: embedding,
      match_count: 6,
    });
    if (rpcError) throw rpcError;

    const matchedDocs = (docs ?? []) as MatchedDoc[];

    // 3. Contexte pour le prompt
    const context = matchedDocs
      .map((d) => `[${d.metadata?.title ?? d.source_id}]\n${d.content}`)
      .join('\n\n---\n\n');

    const sources = matchedDocs.map((d) => {
      if (d.source_type === 'forum_reply') {
        return {
          source_type: d.source_type,
          source_id: d.metadata?.thread_id ?? d.source_id,
          title: d.metadata?.thread_title ?? 'Discussion du forum',
        };
      }
      return {
        source_type: d.source_type,
        source_id: d.source_id,
        title: d.metadata?.title ?? d.source_id,
      };
    });

    // 4. Stream Gemini avec annotation des sources
    const google = createGoogleGenerativeAI({ apiKey: requireEnv('GEMINI_API_KEY') });

    return createDataStreamResponse({
      execute: async (dataStream) => {
        dataStream.writeMessageAnnotation({ sources });

        const result = streamText({
          model: google('gemini-2.0-flash'),
          system: `${SYSTEM_PROMPT}\n\n## CONTEXTE\n\n${context}`,
          messages,
          maxTokens: 1024,
        });

        result.mergeIntoDataStream(dataStream);
      },
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Erreur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
