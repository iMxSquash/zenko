# Skill: new-edge-function

## Auto-invoke

Invoquer automatiquement quand l'utilisateur demande de :

- Créer une Edge Function Supabase (`"crée une edge function …"`)
- Implémenter de la logique serveur (clé API secrète, streaming, traitement lourd)
- Créer ou modifier un fichier dans `supabase/functions/`
- Implémenter le pipeline RAG ou l'endpoint `/chat`

Crée une Supabase Edge Function (Deno) pour le projet Zenko.

## Ce que tu reçois

L'utilisateur décrit la fonction à créer (ex: `/new-edge-function send-notification`).

## Emplacement

`supabase/functions/<nom>/index.ts`

## Template de base

```ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth - vérifier le JWT Supabase si la fonction est protégée
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Body
    const {
      /* params */
    } = await req.json();

    // Logique métier ici

    return new Response(
      JSON.stringify({
        /* résultat */
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Internal error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
```

## Template fonction publique (sans auth)

Retirer le bloc auth et utiliser `SUPABASE_SERVICE_ROLE_KEY` si besoin d'accès complet à la DB.

## Template avec streaming (chatbot)

```ts
import { streamText } from "https://esm.sh/ai";
import { createAnthropic } from "https://esm.sh/@ai-sdk/anthropic";

const anthropic = createAnthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY")!,
});

// Dans le handler :
const result = await streamText({
  model: anthropic("claude-sonnet-4-6"),
  system: systemPrompt,
  messages,
});

return result.toDataStreamResponse({ headers: corsHeaders });
```

## Variables d'environnement disponibles

| Variable                    | Usage                                                        |
| --------------------------- | ------------------------------------------------------------ |
| `SUPABASE_URL`              | URL du projet (automatique)                                  |
| `SUPABASE_ANON_KEY`         | Clé publique (automatique)                                   |
| `SUPABASE_SERVICE_ROLE_KEY` | Accès admin DB (bypass RLS)                                  |
| `ANTHROPIC_API_KEY`         | À définir dans Supabase Dashboard → Edge Functions → Secrets |

## Règles

- Toujours gérer le preflight CORS (`OPTIONS`)
- Toujours vérifier l'auth si la fonction expose des données utilisateur
- Toujours entourer la logique d'un try/catch avec réponse 500
- Ne jamais lire `ANTHROPIC_API_KEY` côté client - uniquement dans les Edge Functions
- Documenter les paramètres attendus en commentaire en haut du fichier
