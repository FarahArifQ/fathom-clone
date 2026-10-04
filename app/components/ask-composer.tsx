"use client";

import { useEffect, useId, useRef } from "react";

export default function AskComposer({ value, onChange, onSend, pending, open }: {
  value: string; onChange: (value: string) => void; onSend: () => void; pending: boolean; open: boolean;
}) {
  const id = useId();
  const input = useRef<HTMLTextAreaElement>(null);
  const wasPending = useRef(false);
  useEffect(() => {
    if (!open || !input.current) return;
    input.current.style.height = "auto";
    input.current.style.height = `${Math.min(input.current.scrollHeight, 112)}px`;
  }, [value, open]);
  useEffect(() => {
    if (open && wasPending.current && !pending) input.current?.focus({ preventScroll: true });
    wasPending.current = pending;
  }, [pending, open]);
  function send() {
    if (!pending && value.trim().length >= 3) onSend();
  }
  return (
    <form onSubmit={(event) => { event.preventDefault(); send(); }} className="shrink-0 border-t border-slate-200 px-3 pt-3 pb-2">
      <label htmlFor={id} className="sr-only">Your question</label>
      <p id={`${id}-keys`} className="sr-only">Enter sends. Shift+Enter adds a new line.</p>
      <div className="flex items-end gap-2">
        <textarea ref={input} id={id} value={value} onChange={(event) => onChange(event.target.value)} rows={1}
          maxLength={500} minLength={3} required disabled={pending} aria-describedby={`${id}-keys ${id}-count`}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); }
          }} className="min-h-10 max-h-28 min-w-0 flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-6 disabled:bg-slate-50" />
        <button type="submit" disabled={pending || value.trim().length < 3}
          className="min-h-10 shrink-0 rounded-lg bg-teal-800 px-3 text-sm font-medium text-white hover:bg-teal-900 disabled:cursor-default disabled:opacity-60">Send</button>
      </div>
      <p id={`${id}-count`} className="mt-1 text-right text-[10px] text-slate-500">{value.length}/500</p>
    </form>
  );
}
