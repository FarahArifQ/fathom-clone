"use client";

import { useId, useState } from "react";
import { useAsk } from "./use-ask";
import AskThread from "./ask-thread";
import AskComposer from "./ask-composer";
import type { AskInput } from "@/lib/ask-schema";

const scopes = [{ value: "meeting", label: "This meeting" }, { value: "all", label: "All meetings" }] as const;

export default function MeetingAsk({ meetingId, onJump }: { meetingId: string; onJump: (seconds: number) => void }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [scope, setScope] = useState<AskInput["scope"]>("meeting");
  const id = useId();
  const { turns, pending, ask, retry, clear } = useAsk();
  function submit(text: string) {
    if (ask({ question: text, scope, meeting_id: meetingId })) setQuestion("");
  }
  return (
    <section aria-label="Ask about meetings" className="fixed inset-x-3 bottom-3 z-20 overflow-hidden rounded-xl border border-teal-800 bg-white shadow-lg sm:left-auto sm:right-6 sm:w-96">
      <button type="button" aria-expanded={open} aria-controls={`${id}-panel`} onClick={() => setOpen((current) => !current)}
        className="flex min-h-12 w-full items-center justify-between gap-4 bg-teal-800 px-5 py-3 text-left text-sm font-semibold text-white hover:bg-teal-900">
        <span>Ask a question</span><span>{open ? "Collapse" : "Open"}</span>
      </button>
      <div id={`${id}-panel`} hidden={!open}>
        <div className="flex max-h-[70dvh] flex-col">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
            <div role="group" aria-label="Ask scope" className="flex gap-1">
              {scopes.map((option) => <button key={option.value} type="button" disabled={pending} aria-pressed={scope === option.value}
                onClick={() => setScope(option.value)} className={`min-h-9 rounded-lg px-2 text-xs font-medium disabled:opacity-60 ${scope === option.value ? "bg-teal-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                {option.label}
              </button>)}
            </div>
            <button type="button" disabled={pending || !turns.length} onClick={() => { clear(); setQuestion(""); }}
              className="min-h-9 shrink-0 rounded px-2 text-xs font-medium text-teal-800 hover:bg-teal-50 disabled:opacity-50">New chat</button>
          </div>
          <AskThread turns={turns} open={open} pending={pending} meetingId={meetingId} onSuggest={submit} onRetry={retry}
            onJump={(seconds) => { onJump(seconds); setOpen(false); }} />
          <AskComposer value={question} onChange={setQuestion} onSend={() => submit(question)} pending={pending} open={open} />
        </div>
      </div>
    </section>
  );
}
