"use client";

import { useId, useState } from "react";
import { useAsk } from "./use-ask";
import AskThread from "./ask-thread";
import AskComposer from "./ask-composer";
import { IconButton } from "./ui";
import type { AskInput } from "@/lib/ask-schema";

const scopes = [{ value: "meeting", label: "This meeting" }, { value: "all", label: "All meetings" }] as const;

export default function MeetingAsk({ meetingId, open, onOpen, onClose, onJump }: {
  meetingId: string; open: boolean; onOpen: () => void; onClose: () => void; onJump: (seconds: number) => void;
}) {
  const [question, setQuestion] = useState("");
  const [scope, setScope] = useState<AskInput["scope"]>("meeting");
  const id = useId();
  const { turns, pending, ask, retry, clear } = useAsk();
  function submit(text: string) {
    if (ask({ question: text, scope, meeting_id: meetingId })) setQuestion("");
  }
  return <>
    {!open && <button type="button" onClick={onOpen} aria-expanded={false} aria-controls="panel-Ask"
      className="glass fixed right-6 bottom-6 z-40 hidden min-h-12 items-center gap-4 rounded-lg px-5 text-meta font-semibold text-accent min-[800px]:inline-flex">
      Ask a question
    </button>}
    <section id="panel-Ask" role="tabpanel" aria-labelledby="tab-Ask" hidden={!open}
      className={`glass ask-panel overflow-hidden ${open ? "flex flex-col" : ""} rounded-xl`}>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2>Ask the transcript</h2>
        <IconButton icon="close" label="Close" onClick={onClose} aria-controls={`${id}-chat`} />
      </header>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div role="group" aria-label="Ask scope" className="flex gap-1">
          {scopes.map((option) => <button key={option.value} type="button" disabled={pending} aria-pressed={scope === option.value}
            onClick={() => setScope(option.value)}
            className={`min-h-10 rounded-lg px-2 text-meta font-medium disabled:text-secondary ${scope === option.value ? "bg-accent-soft text-accent" : "text-secondary hover:bg-surface-raised"}`}>
            {option.label}
          </button>)}
        </div>
        <button type="button" disabled={pending || !turns.length} onClick={() => { clear(); setQuestion(""); }}
          className="button button-ghost px-2 disabled:text-secondary">New chat</button>
      </div>
      <div id={`${id}-chat`} className="flex min-h-0 flex-1 flex-col">
        <AskThread turns={turns} open={open} pending={pending} meetingId={meetingId} onSuggest={submit} onRetry={retry} onJump={onJump} />
        <AskComposer value={question} onChange={setQuestion} onSend={() => submit(question)} pending={pending} open={open} />
      </div>
    </section>
  </>;
}
