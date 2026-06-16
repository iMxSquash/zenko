import { cn } from '@/lib/utils';
import { Mic, MicOff } from 'lucide-react';

interface MicButtonProps {
  isListening?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  fullWidth?: boolean;
  variant?: 'brand' | 'brand-green';
  children?: React.ReactNode;
}

export function MicButton({
  isListening,
  disabled,
  onClick,
  type = 'button',
  fullWidth,
  variant = 'brand',
  children,
}: MicButtonProps) {
  const filled = children ? !disabled : isListening;
  return (
    <button
      type={type}
      aria-label={children ? undefined : isListening ? "Arrêter l'écoute" : 'Commencer à parler'}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-display font-semibold transition-colors',
        fullWidth ? 'w-full px-6 py-4' : 'h-10 w-10',
        filled
          ? cn(
              variant === 'brand-green' ? 'bg-brand-green' : 'bg-brand',
              'text-white shadow-md hover:opacity-90'
            )
          : 'bg-neutral-100 text-text-muted outline outline-1 outline-offset-[-1px] outline-border-default hover:bg-brand/10',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      {children ?? (isListening ? <MicOff size={18} /> : <Mic size={18} />)}
    </button>
  );
}
