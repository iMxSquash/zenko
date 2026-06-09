// Backfill : indexe toutes les fiches et messages forum dans la table documents.
// Requiert VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans l'environnement.
//
// Usage : npx tsx supabase/seed/index-documents.ts

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const EMBED_URL = `${SUPABASE_URL}/functions/v1/embed`;

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch(EMBED_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY as string,
    },
    body: JSON.stringify({ input: text }),
  });
  if (!res.ok) throw new Error(`/embed a retourné ${res.status}`);
  const { embedding } = await res.json();
  return embedding;
}

// Découpe un texte en chunks d'environ 500 tokens (~375 mots)
function chunkText(text: string, maxWords = 375): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }
  return chunks.length > 0 ? chunks : [text];
}

async function upsertDocument(params: {
  source_type: 'fiche' | 'forum_thread' | 'forum_reply';
  source_id: string;
  content: string;
  metadata: Record<string, unknown>;
}) {
  // Supprimer les anciens chunks pour cette source avant ré-insertion
  await supabase
    .from('documents')
    .delete()
    .eq('source_type', params.source_type)
    .eq('source_id', params.source_id);

  const chunks = chunkText(params.content);

  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk);
    const { error } = await supabase.from('documents').insert({
      source_type: params.source_type,
      source_id: params.source_id,
      content: chunk,
      metadata: params.metadata,
      embedding,
    });
    if (error) throw error;
  }
}

async function indexFiches() {
  const { data: fiches, error } = await supabase.from('fiches').select('*');
  if (error) throw error;

  for (const fiche of fiches) {
    await upsertDocument({
      source_type: 'fiche',
      source_id: fiche.slug,
      content: `${fiche.title}\n\n${fiche.description}`,
      metadata: { title: fiche.title, slug: fiche.slug, category: fiche.category },
    });
    console.log(`✓ fiche : ${fiche.slug}`);
  }
}

async function indexForum() {
  const { data: threads, error } = await supabase
    .from('forum_threads')
    .select('*, forum_replies(*)');
  if (error) throw error;

  for (const thread of threads) {
    await upsertDocument({
      source_type: 'forum_thread',
      source_id: thread.id,
      content: `${thread.title}\n\n${thread.content}`,
      metadata: { title: thread.title, thread_id: thread.id, category: thread.category },
    });

    for (const reply of thread.forum_replies ?? []) {
      await upsertDocument({
        source_type: 'forum_reply',
        source_id: reply.id,
        content: reply.content,
        metadata: { thread_title: thread.title, thread_id: thread.id },
      });
    }
    console.log(`✓ thread : ${thread.title}`);
  }
}

async function main() {
  console.log('Indexation en cours…');
  await indexFiches();
  await indexForum();
  console.log('Indexation terminée.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
