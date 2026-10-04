"use client";

import { useEffect, useRef } from "react";
import type { AskTurn } from "./use-ask";
import TranscriptCitation from "./transcript-citation";

const questions = ["What decisions were agreed?", "What tasks have an owner?", "What deadlines were discussed?"];

export default function AskThread({ turns, open, pending, meetingId, onSuggest, onRetry, onJump }: {
  turns: AskTurn[]; open: boolean; pending: boolean; meetingId: string;
  onSuggest: (question: string) => void; onRetry: (id: number) => void; onJump: (seconds: number) => void;
}) {
  const thread = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open && thread.current) thread.current.scrollTop = thread.current.scrollHeight;
  }, [turns, open]);
  return (
    <div ref={thread} role="log" aria-label="Ask conversation" aria-live="polite" aria-relevant="additions text"
      className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-4">
      {!turns.length && <div className="space-y-2" aria-label="Suggested questions">
        <p className="mb-3 text-sm leading-6 text-slate-600">Ask about the transcript. Answers cite their sources.</p>
        {questions.map((question) => <button key={question} type="button" onClick={() => onSuggest(question)}
          className="min-h-9 w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-xs font-medium text-teal-800 hover:bg-teal-50">{question}</button>)}
      </div>}
      {turns.map((turn) => <div key={turn.id} className="space-y-3">
        <div aria-label="Your message" className="ml-auto w-fit max-w-[90%] rounded-xl rounded-br-sm bg-teal-800 px-3 py-2 text-white">
          <p className="mb-1 text-[10px] font-medium">{turn.input.scope === "all" ? "All meetings" : "This meeting"}</p>
          <p className="text-sm leading-6 whitespace-pre-wrap break-words">{turn.input.question}</p>
        </div>
        <div aria-label="Assistant message" className="mr-auto w-fit max-w-[95%] rounded-xl rounded-bl-sm bg-slate-100 px-3 py-2 text-slate-800">
          {turn.status === "pending" ? <p className="text-sm leading-6">Thinking...</p> : turn.status === "error" ? <>
            <p className="text-sm leading-6 break-words">{turn.error}</p>
            <button type="button" disabled={pending} onClick={() => onRetry(turn.id)}
              className="mt-2 min-h-9 rounded px-2 text-xs font-medium text-teal-800 hover:bg-teal-50 disabled:opacity-50">Retry</button>
          </> : turn.answer && <>
            <p className="text-sm leading-6 whitespace-pre-wrap break-words">{turn.answer.answer}</p>
            {turn.answer.context_truncated && <p className="mt-2 text-xs leading-5 text-slate-600">Transcript context was trimmed to fit. This answer covers only the included text.</p>}
            {turn.answer.citations.length > 0 && <ul aria-label="Answer sources" className="mt-2 flex flex-wrap gap-1.5">
              {turn.answer.citations.map((citation) => <li key={citation.id} className="min-w-0 max-w-full">
                <TranscriptCitation citation={citation} currentMeetingId={meetingId} onJump={onJump} compact />
              </li>)}
            </ul>}
          </>}
        </div>
      </div>)}
    </div>
  );
}
