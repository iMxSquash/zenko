import { useCallback, useEffect, useRef, useState } from 'react';
import type { SpeechToText, TextToSpeech } from './types';
import { WebSpeechSTT, WebSpeechTTS, isWebSpeechSupported } from './webspeech';

export function useVoice() {
  const isSupported = isWebSpeechSupported();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);

  const sttRef = useRef<SpeechToText | null>(null);
  const ttsRef = useRef<TextToSpeech | null>(null);
  const isListeningRef = useRef(false);

  const restartIfListening = useCallback(() => {
    if (isListeningRef.current && sttRef.current) {
      try {
        sttRef.current.start();
      } catch {
        // ignore - peut arriver si stop() a été appelé entre-temps
      }
    }
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    try {
      sttRef.current = new WebSpeechSTT();
      ttsRef.current = new WebSpeechTTS();

      sttRef.current.onResult((text) => {
        setTranscript(text);
        setInterimTranscript('');
      });

      sttRef.current.onInterimResult((text) => {
        setInterimTranscript(text);
      });

      sttRef.current.onError(() => {
        setInterimTranscript('');
        isListeningRef.current = false;
        setIsListening(false);
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
    isListeningRef.current = true;
    setIsListening(true);
    sttRef.current.start();
  };

  const stopListening = () => {
    isListeningRef.current = false;
    sttRef.current?.stop();
    setIsListening(false);
  };

  const speak = (text: string) => {
    if (!ttsRef.current) return;
    setIsSpeaking(true);
    ttsRef.current.speak(text, () => setIsSpeaking(false));
  };

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      ttsRef.current?.setMuted(next);
      return next;
    });
  };

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    speak,
    isSpeaking,
    muted,
    toggleMute,
  };
}
