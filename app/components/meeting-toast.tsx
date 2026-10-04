"use client";

import { useEffect, useRef } from "react";
import type { SavedNotice } from "./use-meeting-interactions";
import { Button, IconButton } from "./ui";

export default function MeetingToast({ notice, busy, onDismiss }: {
  notice: SavedNotice; busy: boolean; onDismiss: () => void;
}) {
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (busy) return;
    timer.current = window.setTimeout(onDismiss, 8000);
    return () => window.clearTimeout(timer.current);
  }, [busy, onDismiss]);
  const keepVisible = () => window.clearTimeout(timer.current);
  return <div role="status" aria-live="polite" onFocusCapture={keepVisible} onMouseEnter={keepVisible}
    className="glass fixed inset-x-4 bottom-4 z-40 flex flex-wrap items-center gap-2 rounded-lg px-4 py-3 min-[800px]:right-auto min-[800px]:left-8">
    <p className="min-w-0 flex-1 text-meta font-medium text-foreground">{notice.message}</p>
    {notice.undo && <Button variant="ghost" disabled={busy} onClick={() => void notice.undo?.()} className="px-2">Undo</Button>}
    <IconButton icon="close" label="Dismiss" onClick={onDismiss} className="px-2" />
  </div>;
}
