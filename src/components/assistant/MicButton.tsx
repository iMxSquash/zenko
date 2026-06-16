import { cn } from '@/lib/utils';
import { Microphone, MicrophoneSlash } from '@phosphor-icons/react';

interface MicButtonProps {
  isListening: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function MicButton({ isListening, disabled, onClick }: MicButtonProps) {
  return (
    <button
      type="button"
      aria-label={isListening ? "Arrêter l'écoute" : 'Commencer à parler'}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
        isListening
          ? 'bg-brand text-white shadow-md'
          : 'bg-neutral-100 text-text-muted hover:bg-brand/10',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      {isListening ? <MicrophoneSlash size={18} /> : <Microphone size={18} />}
    </button>
  );
}
