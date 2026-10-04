"use client";

import { useState } from "react";
import { savedSummarySchema, type SavedSummary } from "@/lib/interaction-schema";
import { requestJson } from "@/lib/client-request";

export function useMeetingSummary(id: string, initial: SavedSummary | null) {
  const [summary, setSummary] = useState(initial);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (generating || summary) return;
    setGenerating(true);
    setError("");
    try {
      const result = await requestJson(`/api/meetings/${encodeURIComponent(id)}/summarize`, {
        method: "POST", signal: AbortSignal.timeout(115_000),
      }, savedSummarySchema);
      setSummary(result);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to generate the summary. Please retry.");
    } finally { setGenerating(false); }
  }

  function updateAction(id: string, completed: boolean) {
    setSummary((current) => current && ({ ...current, action_items: current.action_items.map((item) => item.id === id ? { ...item, completed } : item) }));
  }

  return { summary, generating, error, generate, updateAction };
}
