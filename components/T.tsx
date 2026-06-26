"use client";
import { useTranslate } from "@/lib/hooks/useTranslate";

export default function T({ children }: { children: string }) {
  const translated = useTranslate(children);
  return <>{translated}</>;
}