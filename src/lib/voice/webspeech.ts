import type { SpeechToText, TextToSpeech } from './types';

// Web Speech API - non incluse dans les types DOM TypeScript standard
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  resultIndex: number;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionResultEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrEvent {
  error: string;
}

type SpeechRecognitionCtor = new () => ISpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | undefined {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as SpeechRecognitionCtor | undefined;
}

export class WebSpeechSTT implements SpeechToText {
  private recognition: ISpeechRecognition;
  private resultCb: ((text: string) => void) | null = null;
  private interimCb: ((text: string) => void) | null = null;

  constructor() {
    const SR = getSpeechRecognitionCtor();
    if (!SR) throw new Error('SpeechRecognition non disponible');
    this.recognition = new SR();
    this.recognition.lang = 'fr-FR';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result?.[0]?.transcript ?? '';
        if (!text) continue;
        if (result.isFinal) {
          this.resultCb?.(text);
        } else {
          this.interimCb?.(text);
        }
      }
    };
  }

  start() {
    this.recognition.start();
  }

  stop() {
    this.recognition.stop();
  }

  onResult(cb: (text: string) => void) {
    this.resultCb = cb;
  }

  onInterimResult(cb: (text: string) => void) {
    this.interimCb = cb;
  }

  onError(cb: (err: string) => void) {
    this.recognition.onerror = (event: SpeechRecognitionErrEvent) => cb(event.error);
  }

  onEnd(cb: () => void) {
    this.recognition.onend = cb;
  }
}

export class WebSpeechTTS implements TextToSpeech {
  private synth = window.speechSynthesis;
  private muted = false;
  private primed = false;

  speak(text: string, onEnd?: () => void) {
    if (this.muted) {
      onEnd?.();
      return;
    }

    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';

    const voices = this.synth.getVoices();
    const frVoice = voices.find((v) => v.lang.startsWith('fr'));
    if (frVoice) utterance.voice = frVoice;

    utterance.onend = () => onEnd?.();
    this.synth.speak(utterance);
  }

  cancel() {
    this.synth.cancel();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) this.synth.cancel();
  }

  prime() {
    if (this.primed) return;
    this.primed = true;
    // iOS blocks speechSynthesis from async contexts unless it was first called
    // from a synchronous user gesture. A silent utterance unlocks it for the session.
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    this.synth.speak(u);
  }
}

export function isWebSpeechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    getSpeechRecognitionCtor() !== undefined &&
    'speechSynthesis' in window
  );
}
