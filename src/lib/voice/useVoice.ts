import { useCallback, useEffect, useRef, useState } from 'react';
import type { SpeechToText, TextToSpeech } from './types';
import { WebSpeechSTT, WebSpeechTTS, isWebSpeechSupported } from './webspeech';

const STT_ERRORS: Record<string, string> = {
  'not-allowed':
    'Accès au micro refusé. Vérifiez les autorisations dans Réglages système > Confidentialité > Microphone.',
  'audio-capture': 'Aucun microphone détecté.',
  network:
    "Connexion réseau requise pour la reconnaissance vocale (Chrome envoie l'audio à Google).",
  'service-not-allowed':
    'Service de reconnaissance vocale non disponible. Essayez Chrome sur HTTPS ou vérifiez votre connexion.',
  'language-not-supported': 'Langue non supportée par ce navigateur pour la reconnaissance vocale.',
};

// Errors that are expected during normal continuous use — let onEnd handle restarts
const BENIGN_STT_ERRORS = new Set(['no-speech', 'aborted']);

export function useVoice() {
  const isSupported = isWebSpeechSupported();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const sttRef = useRef<SpeechToText | null>(null);
  const ttsRef = useRef<TextToSpeech | null>(null);
  const isListeningRef = useRef(false);
  const hasReceivedResultRef = useRef(false);
  const noResultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const restartIfListening = useCallback(() => {
    if (!isListeningRef.current || !sttRef.current) return;
    // Small delay to avoid rapid restart loops (Chrome Mac fires onend immediately on no-speech)
    setTimeout(() => {
      if (isListeningRef.current && sttRef.current) {
        try {
          sttRef.current.start();
        } catch {
          // ignore - peut arriver si stop() a été appelé entre-temps
        }
      }
    }, 150);
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    try {
      sttRef.current = new WebSpeechSTT();
      ttsRef.current = new WebSpeechTTS();

      sttRef.current.onResult((text) => {
        hasReceivedResultRef.current = true;
        setTranscript(text);
        setInterimTranscript('');
      });

      sttRef.current.onInterimResult((text) => {
        hasReceivedResultRef.current = true;
        setInterimTranscript(text);
      });

      sttRef.current.onError((err) => {
        setInterimTranscript('');
        if (!BENIGN_STT_ERRORS.has(err)) {
          isListeningRef.current = false;
          setIsListening(false);
          setVoiceError(STT_ERRORS[err] ?? `Erreur reconnaissance vocale (${err}).`);
          console.error('[voice] STT error:', err);
        }
        // no-speech / aborted: benign — onEnd will restart if still listening
      });

      // Chrome/Mac arrête la reconnaissance silencieusement après silence :
      // onend redémarre tant que l'utilisateur n'a pas cliqué sur stop.
      sttRef.current.onEnd(restartIfListening);
    } catch {
      // Navigateur ne supporte pas l'API même si la détection a passé
    }

    return () => {
      sttRef.current?.stop();
      ttsRef.current?.cancel();
    };
  }, [isSupported, restartIfListening]);

  const startListening = () => {
    if (!sttRef.current) return;
    setTranscript('');
    setInterimTranscript('');
    setVoiceError(null);
    hasReceivedResultRef.current = false;
    isListeningRef.current = true;
    setIsListening(true);
    sttRef.current.start();

    // If no audio is picked up at all after 8s, surface a hint
    noResultTimeoutRef.current = setTimeout(() => {
      if (isListeningRef.current && !hasReceivedResultRef.current) {
        isListeningRef.current = false;
        setIsListening(false);
        sttRef.current?.stop();
        setVoiceError(
          'Aucun son capté après 8 secondes. Vérifiez que le micro est autorisé pour ce navigateur dans Réglages système, et que vous utilisez Chrome ou Safari.'
        );
      }
    }, 8000);
  };

  const stopListening = () => {
    if (noResultTimeoutRef.current) {
      clearTimeout(noResultTimeoutRef.current);
      noResultTimeoutRef.current = null;
    }
    isListeningRef.current = false;
    sttRef.current?.stop();
    setIsListening(false);
  };

  const speak = (text: string) => {
    if (!ttsRef.current) return;
    setIsSpeaking(true);
    ttsRef.current.speak(text, () => setIsSpeaking(false));
  };

  const stopSpeaking = useCallback(() => {
    ttsRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      ttsRef.current?.setMuted(next);
      return next;
    });
  };

  const primeTTS = () => ttsRef.current?.prime();

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    speak,
    isSpeaking,
    stopSpeaking,
    muted,
    toggleMute,
    voiceError,
    primeTTS,
  };
}
