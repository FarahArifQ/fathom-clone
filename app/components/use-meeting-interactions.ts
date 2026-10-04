"use client";

import { useRef, useState } from "react";
import { actionUpdateSchema, annotationSchema, type Annotation } from "@/lib/interaction-schema";
import { requestJson } from "@/lib/client-request";
import type { Meeting } from "@/lib/meetings";

export type SavedNotice = { id: number; message: string; undo?: () => Promise<boolean> };

export function useMeetingInteractions(id: string, initial: Annotation[], onActionSaved: (id: string, completed: boolean) => void) {
  const [annotations, setAnnotations] = useState(initial);
  const [pending, setPending] = useState(new Set<string>());
  const inFlight = useRef(new Set<string>());
  const nextNotice = useRef(0);
  const [notice, setNotice] = useState<SavedNotice | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState<(() => Promise<boolean>) | null>(null);
  function notify(message: string, undo?: SavedNotice["undo"]) {
    setNotice({ id: ++nextNotice.current, message, undo });
  }
  async function save(key: string, work: () => Promise<void>): Promise<boolean> {
    if (inFlight.current.has(key)) return false;
    inFlight.current.add(key);
    setPending(new Set(inFlight.current)); setError(""); setRetry(null);
    try { await work(); return true; }
    catch {
      setError("We couldn't save that change. Please try again.");
      setRetry(() => () => save(key, work));
      return false;
    } finally { inFlight.current.delete(key); setPending(new Set(inFlight.current)); }
  }
  function completeAction(actionId: string, completed: boolean, undo = false): Promise<boolean> {
    return save(`action:${actionId}`, async () => {
      const result = await requestJson(`/api/action-items/${encodeURIComponent(actionId)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed }),
      }, actionUpdateSchema);
      onActionSaved(result.id, result.completed);
      notify(undo ? "Action item change undone." : result.completed ? "Action item completed." : "Action item marked incomplete.",
        undo ? undefined : () => completeAction(actionId, !result.completed, true));
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
      notify("Highlight saved.");
    });
  }
  function dismissNotice() { setNotice(null); }
  return { annotations, pending, error, retry, notice, dismissNotice, completeAction, highlight };
}
