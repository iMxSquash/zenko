import { useAssistant } from '@/hooks/useAssistant';
import type { AssistantSource } from '@/types';
import type { Message } from '@ai-sdk/react';
import { PaperPlaneTilt, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';
import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { MicButton } from './MicButton';
import { VoiceStatus } from './VoiceStatus';

interface ChatAssistantProps {
  sessionId?: string;
}

export function ChatAssistant({ sessionId }: ChatAssistantProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    error,
    isListening,
    startListening,
    stopListening,
    isSpeaking,
    muted,
    toggleMute,
    isSupported,
    voiceError,
  } = useAssistant(sessionId);

  const isLoading = status === 'submitted' || status === 'streaming';

  const bottomRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <VoiceStatus isListening={isListening} isLoading={isLoading} isSpeaking={isSpeaking} />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !isLoading && !error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <img src="/favicon.svg" alt="" className="h-16 w-16" />
            <p className="font-display text-h3 font-semibold text-text-primary">
              Un moment avec Zenko
            </p>
            <p className="max-w-xs text-sm text-text-muted">
              Posez votre question sur l&apos;accompagnement des enfants neurodivergents.
            </p>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <MessageRow key={m.id} message={m} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-card bg-neutral-100 px-4 py-2.5 text-sm" aria-hidden="true">
                  <span className="inline-flex gap-1">
                    <span className="motion-safe:animate-bounce">·</span>
                    <span className="motion-safe:animate-bounce [animation-delay:0.1s]">·</span>
                    <span className="motion-safe:animate-bounce [animation-delay:0.2s]">·</span>
                  </span>
                </div>
              </div>
            )}
            {error && (
              <div role="alert" className="flex justify-start">
                <div className="rounded-card bg-red-50 px-4 py-2.5 text-sm text-red-600">
                  {error.message || 'Une erreur est survenue, veuillez réessayer.'}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <span aria-live="polite" className="sr-only">
        {isLoading ? 'Réponse en cours…' : ''}
      </span>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border px-4 py-3"
      >
        {isSupported && (
          <MicButton
            isListening={isListening}
            disabled={isLoading}
            hasError={!!voiceError}
            errorMessage={voiceError ?? undefined}
            onClick={() => (isListening ? stopListening() : startListening())}
          />
        )}

        <label htmlFor="chat-input" className="sr-only">
          Votre message
        </label>
        <input
          id="chat-input"
          value={input}
          onChange={handleInputChange}
          placeholder="Posez votre question…"
          disabled={isLoading}
          className="flex-1 rounded-full border border-border bg-transparent px-4 py-2 text-sm outline-none focus:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          aria-label="Envoyer"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-opacity disabled:opacity-40"
        >
          <PaperPlaneTilt size={16} />
        </button>

        <button
          type="button"
          aria-label={muted ? 'Activer la lecture vocale' : 'Désactiver la lecture vocale'}
          onClick={toggleMute}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-muted hover:text-brand transition-colors"
        >
          {muted ? <SpeakerSlash size={18} /> : <SpeakerHigh size={18} />}
        </button>
      </form>
    </div>
  );
}

function MessageRow({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const sources: AssistantSource[] = !isUser
    ? ((message.annotations?.[0] as { sources?: AssistantSource[] })?.sources ?? [])
    : [];

  return (
    <MessageBubble
      role={message.role === 'user' ? 'user' : 'assistant'}
      content={message.content}
      sources={sources}
    />
  );
}
