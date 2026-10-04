"use client";

import { useEffect, useState } from "react";
import { requestJson } from "@/lib/client-request";
import { transcriptMatchesSchema, type TranscriptMatch } from "@/lib/search-schema";

export function useTranscriptSearch(query: string) {
  const term = query.trim();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ query: string; matches: TranscriptMatch[]; error: string } | null>(null);
  useEffect(() => {
    if (!term) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const matches = await requestJson(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]),
        }, transcriptMatchesSchema);
        if (!controller.signal.aborted) setResult({ query: term, matches, error: "" });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ query: term, matches: [], error: error instanceof Error ? error.message : "Search is unavailable. Please retry." });
      }
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [term, attempt]);
  return {
    matches: result?.query === term ? result.matches : [],
    error: term && result?.query === term ? result.error : "",
    pending: !!term && result?.query !== term,
    retry: () => { setResult(null); setAttempt((current) => current + 1); },
  };
}
