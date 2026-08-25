import { useState, useCallback, useEffect, useRef } from 'react';
import { scopedStorage } from '@/lib/storage';

const RATE_KEY = '__app_speech_rate';
const VOICE_KEY = '__app_speech_voice';

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rate, setRateState] = useState<number>(() => {
    try {
      const raw = scopedStorage.getItem(RATE_KEY);
      if (raw) return parseFloat(raw);
    } catch {
      // ignore
    }
    return 0.9;
  });
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    try {
      const raw = scopedStorage.getItem(VOICE_KEY);
      if (raw) return raw;
    } catch {
      // ignore
    }
    return '';
  });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis?.getVoices() || [];
      setVoices(v);
    };
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  useEffect(() => {
    try {
      scopedStorage.setItem(RATE_KEY, String(rate));
    } catch {
      // ignore
    }
  }, [rate]);

  useEffect(() => {
    try {
      scopedStorage.setItem(VOICE_KEY, selectedVoice);
    } catch {
      // ignore
    }
  }, [selectedVoice]);

  const speak = useCallback(
    (text: string) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.lang = 'en-US';

      // 选择声音
      if (selectedVoice) {
        const v = voices.find((voice) => voice.name === selectedVoice);
        if (v) utterance.voice = v;
      } else {
        // 默认优先选英语女声
        const englishVoice = voices.find(
          (v) => v.lang.startsWith('en') && /female|samantha|google us/i.test(v.name),
        ) || voices.find((v) => v.lang.startsWith('en'));
        if (englishVoice) utterance.voice = englishVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [rate, selectedVoice, voices],
  );

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const setRate = useCallback((r: number) => {
    setRateState(Math.max(0.5, Math.min(2, r)));
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    rate,
    setRate,
    voices,
    selectedVoice,
    setSelectedVoice,
    supported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  };
}
