interface VoiceStatusProps {
  isListening: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
}

export function VoiceStatus({ isListening, isLoading, isSpeaking }: VoiceStatusProps) {
  const label = isListening
    ? 'En écoute…'
    : isLoading
      ? 'Génération…'
      : isSpeaking
        ? 'Lecture…'
        : null;

  if (!label) return null;

  return (
    <div aria-live="polite" className="px-4 py-1 text-center text-xs text-text-muted">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
        {label}
      </span>
    </div>
  );
}
