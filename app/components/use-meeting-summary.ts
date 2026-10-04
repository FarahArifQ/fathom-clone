"use client";

import { useState } from "react";
import { summarySchema, type MeetingSummary } from "@/lib/summary-schema";

export function useMeetingSummary(id: string, initial: MeetingSummary | null) {
  const [summary, setSummary] = useState(initial);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (generating || summary) return;
    setGenerating(true);
    setError("");
    try {
      const response = await fetch(`/api/meetings/${encodeURIComponent(id)}/summarize`, {
        method: "POST", signal: AbortSignal.timeout(115_000),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const message = typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
          ? body.error : "Unable to generate the summary. Please retry.";
        setError(message);
        return;
      }
      const parsed = summarySchema.safeParse(body);
      if (!parsed.success) { setError("The summary response has an invalid format. Please retry."); return; }
      setSummary(parsed.data);
    } catch {
      setError("The request timed out or could not reach the server. Please retry; saved summaries will be reused.");
    } finally { setGenerating(false); }
  }

  return { summary, generating, error, generate };
}
