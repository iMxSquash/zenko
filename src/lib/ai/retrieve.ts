import { env } from '@/lib/env';

export const CHAT_ENDPOINT = `${env.supabaseUrl}/functions/v1/chat`;

export function chatHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    apikey: env.supabaseAnonKey,
  };
}
