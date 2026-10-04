"use client";

import { useRef, useState } from "react";
import { actionUpdateSchema, annotationSchema, type Annotation } from "@/lib/interaction-schema";
import { requestJson } from "@/lib/client-request";
import type { Meeting } from "@/lib/meetings";

export function useMeetingInteractions(id: string, initial: Annotation[], onActionSaved: (id: string, completed: boolean) => void) {
  const [annotations, setAnnotations] = useState(initial);
  const [pending, setPending] = useState(new Set<string>());
  const inFlight = useRef(new Set<string>());
  const [error, setError] = useState("");

  async function save(key: string, work: () => Promise<void>) {
    if (inFlight.current.has(key)) return;
    inFlight.current.add(key);
    setPending(new Set(inFlight.current));
    setError("");
    try { await work(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to save the change. Please retry."); }
    finally { inFlight.current.delete(key); setPending(new Set(inFlight.current)); }
  }

  function completeAction(actionId: string, completed: boolean) {
    return save(`action:${actionId}`, async () => {
      const result = await requestJson(`/api/action-items/${encodeURIComponent(actionId)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed }),
      }, actionUpdateSchema);
      onActionSaved(result.id, result.completed);
    });
  }

  function highlight(segment: Meeting["transcript"][number]) {
    return save(`highlight:${segment.startSeconds}`, async () => {
      const result = await requestJson(`/api/meetings/${encodeURIComponent(id)}/annotations`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "highlight", timestamp_seconds: segment.startSeconds, note: segment.text }),
      }, annotationSchema);
      setAnnotations((current) => current.some((item) => item.id === result.id) ? current :
        [...current, result].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds));
    });
  }

  return { annotations, pending, error, completeAction, highlight };
}
