"use client";

import { useId, useState } from "react";
import { useAsk } from "./use-ask";
import AskThread from "./ask-thread";
import AskComposer from "./ask-composer";
import { IconButton } from "./ui";
import type { AskInput } from "@/lib/ask-schema";

const scopes = [{ value: "meeting", label: "This meeting" }, { value: "all", label: "All meetings" }] as const;

export default function MeetingAsk({ meetingId, open, onOpen, onClose, onJump, suggestions }: {
  meetingId?: string; open: boolean; onOpen: () => void; onClose: () => void; onJump?: (seconds: number) => void; suggestions?: readonly string[];
}) {
  const [question, setQuestion] = useState("");
  const [scope, setScope] = useState<AskInput["scope"]>(meetingId ? "meeting" : "all");
  const id = useId();
  const { turns, pending, ask, retry, clear } = useAsk();
  function submit(text: string) {
    if (ask({ question: text, scope, meeting_id: meetingId ?? "library" })) setQuestion("");
  }
  return <>
    {!open && <button type="button" onClick={onOpen} aria-expanded={false} aria-controls="panel-Ask"
      className={`glass fixed right-6 bottom-6 z-40 min-h-12 items-center gap-4 rounded-lg px-5 text-meta font-semibold text-accent ${meetingId ? "hidden min-[800px]:inline-flex" : "inline-flex"}`}>
      {meetingId ? "Ask a question" : "Ask across meetings"}
    </button>}
    <section id="panel-Ask" role={meetingId ? "tabpanel" : "region"} aria-labelledby={meetingId ? "tab-Ask" : `${id}-heading`} hidden={!open}
      className={`glass ask-panel overflow-hidden ${open ? "flex flex-col" : ""} rounded-xl`}>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 id={`${id}-heading`}>{meetingId ? "Ask the transcript" : "Ask across meetings"}</h2>
        <IconButton icon="close" label="Close" onClick={onClose} aria-controls={`${id}-chat`} />
      </header>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        {meetingId ? <div role="group" aria-label="Ask scope" className="flex gap-1">
          {scopes.map((option) => <button key={option.value} type="button" disabled={pending} aria-pressed={scope === option.value}
            onClick={() => setScope(option.value)}
            className={`min-h-10 rounded-lg px-2 text-meta font-medium disabled:text-secondary ${scope === option.value ? "bg-accent-soft text-accent" : "text-secondary hover:bg-surface-raised"}`}>
            {option.label}
          </button>)}
        </div> : <p className="px-2 text-meta font-medium text-accent">All meetings</p>}
        <button type="button" disabled={pending || !turns.length} onClick={() => { clear(); setQuestion(""); }}
          className="button button-ghost px-2 disabled:text-secondary">New chat</button>
      </div>
      {!meetingId && <p className="border-b border-border px-4 py-2 text-meta text-muted">Saved task completion is not included in transcript answers.</p>}
      <div id={`${id}-chat`} className="flex min-h-0 flex-1 flex-col">
        <AskThread turns={turns} open={open} pending={pending} meetingId={meetingId} questions={suggestions} onSuggest={submit} onRetry={retry} onJump={onJump} />
        <AskComposer value={question} onChange={setQuestion} onSend={() => submit(question)} pending={pending} open={open} />
      </div>
    </section>
  </>;
}
