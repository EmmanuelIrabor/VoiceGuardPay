"use client";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/context/LanguageContext";

const cache = new Map<string, string>();

export function useTranslate(text: string) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(text);
  const requestId = useRef(0);

  useEffect(() => {
    if (language === "en") {
      setTranslated(text);
      return;
    }

    const cacheKey = `${language}:${text}`;
    if (cache.has(cacheKey)) {
      setTranslated(cache.get(cacheKey)!);
      return;
    }

    const currentRequestId = ++requestId.current;

    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target: language }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (currentRequestId !== requestId.current) return;
        if (data.translatedText) {
          cache.set(cacheKey, data.translatedText);
          setTranslated(data.translatedText);
        }
      })
      .catch(() => setTranslated(text));
  }, [text, language]);

  return translated;
}