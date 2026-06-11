import type { AssistantSource } from '@/types';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sourceUrl(source: AssistantSource): string {
  return source.source_type === 'fiche'
    ? `/bibliotheque/${source.source_id}`
    : `/forum/${source.source_id}`;
}

// Remplace les citations "[Titre de la source]" par des liens markdown vers la ressource citée
export function linkifySources(content: string, sources: AssistantSource[]): string {
  return sources.reduce((text, source) => {
    const pattern = new RegExp(`\\[${escapeRegExp(source.title)}\\](?!\\()`, 'g');
    return text.replace(pattern, `[${source.title}](${sourceUrl(source)})`);
  }, content);
}
