import { cn } from '@/lib/utils';
import { Microphone, MicrophoneSlash } from '@phosphor-icons/react';

interface MicButtonProps {
  isListening: boolean;
  disabled?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  onClick: () => void;
}

export function MicButton({
  isListening,
  disabled,
  hasError,
  errorMessage,
  onClick,
}: MicButtonProps) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-label={isListening ? "Arrêter l'écoute" : 'Commencer à parler'}
        title={hasError ? errorMessage : undefined}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
          isListening
            ? 'bg-brand text-white shadow-md'
            : hasError
              ? 'bg-red-100 text-red-500 hover:bg-red-200'
              : 'bg-neutral-100 text-text-muted hover:bg-brand/10',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {isListening ? <MicrophoneSlash size={18} /> : <Microphone size={18} />}
      </button>
    </div>
  );
}
