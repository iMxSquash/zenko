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
        .single<Pick<ChatSession, 'id'>>();
      if (error) throw error;
      if (!data) throw new Error('Création de la session impossible');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_sessions'] });
    },
  });

  const currentSessionIdRef = useRef<string | undefined>(sessionId);
  const persistedUserCountRef = useRef(0);
  const persistedAssistantIdRef = useRef<string | undefined>(undefined);

  // Persiste le message utilisateur dès son envoi
  // biome-ignore lint/correctness/useExhaustiveDependencies: persist only on new messages
  useEffect(() => {
    const userMsgs = chat.messages.filter((m) => m.role === 'user');
    if (userMsgs.length <= persistedUserCountRef.current || !session) return;
    persistedUserCountRef.current = userMsgs.length;

    const lastUserMsg = userMsgs.at(-1);
    if (!lastUserMsg) return;

    async function persist() {
      if (!lastUserMsg) return;

      if (!currentSessionIdRef.current) {
        const created = await createSessionMutation.mutateAsync(lastUserMsg.content);
        currentSessionIdRef.current = created.id;
      }

      await supabase.from('chat_messages').insert({
        session_id: currentSessionIdRef.current,
        role: 'user',
        content: lastUserMsg.content,
        sources: null,
      });
    }

    persist().catch(console.error);
  }, [chat.messages.length]);

  // Persiste la réponse de l'assistant une fois le streaming terminé
  // biome-ignore lint/correctness/useExhaustiveDependencies: persist only when streaming finishes
  useEffect(() => {
    if (chat.status !== 'ready' || !session) return;

    const lastMsg = chat.messages.at(-1);
    if (!lastMsg || lastMsg.role !== 'assistant') return;
    if (persistedAssistantIdRef.current === lastMsg.id) return;
    if (!currentSessionIdRef.current) return;
    persistedAssistantIdRef.current = lastMsg.id;

    const sources: AssistantSource[] | null =
      (lastMsg.annotations?.[0] as { sources?: AssistantSource[] })?.sources ?? null;

    supabase
      .from('chat_messages')
      .insert({
        session_id: currentSessionIdRef.current,
        role: 'assistant',
        content: lastMsg.content,
        sources,
      })
      .then(({ error }) => {
        if (error) console.error(error);
      });
  }, [chat.status]);

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
