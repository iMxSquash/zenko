import { CHAT_ENDPOINT, chatHeaders } from '@/lib/ai/retrieve';
import { supabase } from '@/lib/supabase/client';
import { useVoice } from '@/lib/voice/useVoice';
import type { AssistantSource, ChatSession } from '@/types';
import { useChat } from '@ai-sdk/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export function useAssistant(sessionId?: string) {
  const queryClient = useQueryClient();
  const voice = useVoice();

  const { data: session } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: () => supabase.auth.getSession().then((r) => r.data.session),
    staleTime: 1000 * 60 * 5,
  });

  const chat = useChat({
    api: CHAT_ENDPOINT,
    headers: session ? chatHeaders(session.access_token) : {},
    body: sessionId ? { conversationId: sessionId } : undefined,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (firstUserMessage: string) => {
      if (!session?.user.id) throw new Error('Session requise');
      const title =
        firstUserMessage.length > 60 ? `${firstUserMessage.slice(0, 57)}…` : firstUserMessage;
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({ title, user_id: session.user.id })
        .select('id')
        .single();
      if (error) throw error;
      return data as ChatSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_sessions'] });
    },
  });

  const currentSessionIdRef = useRef<string | undefined>(sessionId);
  const prevMessageCountRef = useRef(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: persist only on new messages
  useEffect(() => {
    const msgs = chat.messages;
    if (msgs.length <= prevMessageCountRef.current || !session) return;
    prevMessageCountRef.current = msgs.length;

    const lastMsg = msgs.at(-1);
    if (!lastMsg) return;

    async function persist() {
      if (!lastMsg) return;

      if (!currentSessionIdRef.current && lastMsg.role === 'user') {
        const created = await createSessionMutation.mutateAsync(lastMsg.content);
        currentSessionIdRef.current = created.id;
      }
      if (!currentSessionIdRef.current) return;

      const sources: AssistantSource[] | null =
        lastMsg.role === 'assistant'
          ? ((lastMsg.annotations?.[0] as { sources?: AssistantSource[] })?.sources ?? null)
          : null;

      await supabase.from('chat_messages').insert({
        session_id: currentSessionIdRef.current,
        role: lastMsg.role,
        content: lastMsg.content,
        sources,
      });
    }

    persist().catch(console.error);
  }, [chat.messages.length]);

  // Accumulates confirmed speech segments; reset on startListening or submit
  const stableVoiceTextRef = useRef('');

  const handleStartListening = () => {
    stableVoiceTextRef.current = chat.input;
    voice.startListening();
  };

  const handleSubmit: typeof chat.handleSubmit = (e) => {
    stableVoiceTextRef.current = '';
    voice.stopListening();
    chat.handleSubmit(e);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: mirror stable + interim to input while listening
  useEffect(() => {
    if (!voice.isListening) return;
    const display = `${stableVoiceTextRef.current} ${voice.interimTranscript}`.trim();
    chat.setInput(display);
  }, [voice.interimTranscript, voice.isListening]);

  const lastTranscriptRef = useRef('');

  // biome-ignore lint/correctness/useExhaustiveDependencies: accumulate final segment in input
  useEffect(() => {
    if (!voice.transcript || voice.transcript === lastTranscriptRef.current) return;
    lastTranscriptRef.current = voice.transcript;
    stableVoiceTextRef.current = `${stableVoiceTextRef.current} ${voice.transcript}`.trim();
    chat.setInput(stableVoiceTextRef.current);
  }, [voice.transcript]);

  const lastAssistantMsg = chat.messages.filter((m) => m.role === 'assistant').at(-1);
  const lastSpokenIdRef = useRef<string | undefined>(undefined);

  // biome-ignore lint/correctness/useExhaustiveDependencies: speak only on new assistant message
  useEffect(() => {
    if (!lastAssistantMsg || chat.status === 'streaming') return;
    if (lastAssistantMsg.id === lastSpokenIdRef.current) return;
    lastSpokenIdRef.current = lastAssistantMsg.id;
    voice.speak(lastAssistantMsg.content);
  }, [lastAssistantMsg?.id, chat.status]);

  return { ...chat, ...voice, startListening: handleStartListening, handleSubmit };
}

export function useChatSessions() {
  return useQuery({
    queryKey: ['chat_sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ChatSession[];
    },
  });
}

export function useChatMessages(sessionId: string) {
  return useQuery({
    queryKey: ['chat_messages', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });
}
