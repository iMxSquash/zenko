export interface SpeechToText {
  start(): void;
  stop(): void;
  onResult(cb: (text: string) => void): void;
  onInterimResult(cb: (text: string) => void): void;
  onError(cb: (err: string) => void): void;
  onEnd(cb: () => void): void;
}

export interface TextToSpeech {
  speak(text: string, onEnd?: () => void): void;
  cancel(): void;
  setMuted(muted: boolean): void;
  // Must be called from a user gesture to unlock iOS speechSynthesis
  prime(): void;
}
