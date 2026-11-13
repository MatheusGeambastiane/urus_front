"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type RecognitionEvent = { resultIndex: number; results: { length: number; [index: number]: { isFinal: boolean; 0: { transcript: string } } } };
type Recognition = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void; abort: () => void;
};
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

const subscribe = () => () => {};
const getSupported = () => {
  const browser = window as SpeechWindow;
  return Boolean(browser.SpeechRecognition || browser.webkitSpeechRecognition);
};

export function useDictation(onText: (text: string) => void) {
  const supported = useSyncExternalStore(subscribe, getSupported, () => false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recognition = useRef<Recognition | null>(null);
  const callback = useRef(onText);
  useEffect(() => { callback.current = onText; }, [onText]);
  useEffect(() => {
    return () => {
      if (recognition.current) {
        recognition.current.onresult = null; recognition.current.onerror = null; recognition.current.onend = null;
        recognition.current.abort();
      }
    };
  }, []);
  const stop = () => {
    if (recognition.current) { recognition.current.onresult = null; recognition.current.stop(); }
    setListening(false);
  };
  const start = (existing: string) => {
    const browser = window as SpeechWindow;
    const Constructor = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!Constructor) return;
    recognition.current?.abort();
    const speech = new Constructor();
    recognition.current = speech;
    speech.lang = "pt-BR";
    speech.interimResults = true;
    speech.continuous = true;
    setError("");
    speech.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) text += `${event.results[i][0].transcript} `;
      callback.current([existing.trim(), text.trim()].filter(Boolean).join(" "));
    };
    speech.onerror = (event) => {
      setListening(false);
      setError(event.error === "not-allowed" ? "Permita o acesso ao microfone para ditar." : "Não foi possível ouvir. Tente novamente ou digite sua mensagem.");
    };
    speech.onend = () => setListening(false);
    try { speech.start(); setListening(true); }
    catch { setError("Não foi possível iniciar o microfone."); }
  };
  return { supported, listening, error, start, stop };
}
