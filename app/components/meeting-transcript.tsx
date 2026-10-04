"use client";

import { useEffect, useId, useState } from "react";
import { formatTimestamp, type Meeting } from "@/lib/meetings";
import SearchField from "./search-field";

export default function MeetingTranscript({ meeting, targetSeconds }: { meeting: Meeting; targetSeconds?: number }) {
  const [query, setQuery] = useState("");
  const [speaker, setSpeaker] = useState("");
  const speakerId = useId();
  useEffect(() => {
    if (targetSeconds === undefined) return;
    const element = document.getElementById(`t-${targetSeconds}`);
    element?.scrollIntoView({ block: "center" });
    element?.focus({ preventScroll: true });
  }, [targetSeconds]);
  const speakers = [...new Set(meeting.transcript.map((line) => line.speaker))];
  const results = meeting.transcript.filter((line) =>
    (!speaker || line.speaker === speaker) && line.text.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <section aria-label="Transcript">
      <div className="border-b border-slate-200 p-5 sm:p-7">
        <div className="flex flex-col gap-4 xl:flex-row">
          <SearchField label="Search transcript" value={query} onChange={setQuery} />
          <div className="min-w-0 xl:w-48">
            <label htmlFor={speakerId} className="mb-2 block text-sm font-medium text-slate-700">Speaker</label>
            <select id={speakerId} value={speaker} onChange={(event) => setSpeaker(event.target.value)} className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900">
              <option value="">All speakers</option>
              {speakers.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
        </div>
        <p role="status" className="mt-4 text-xs text-slate-600">{results.length} of {meeting.transcript.length} lines</p>
      </div>
      <ol className="divide-y divide-slate-100 px-5 sm:px-7">
        {results.map((segment) => {
          const seconds = segment.startSeconds;
          const timestamp = formatTimestamp(seconds);
          return (
            <li key={seconds} id={`t-${seconds}`} tabIndex={-1} className="scroll-mt-6 py-6 target:bg-teal-50 focus:bg-teal-50">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-900">{segment.speaker}</span>
                <a href={`#t-${seconds}`} aria-label={`Jump to ${timestamp}`} className="inline-flex min-h-8 items-center rounded px-2 text-xs text-teal-800 tabular-nums hover:bg-teal-50">{timestamp}</a>
              </div>
              <p className="text-sm leading-7 text-slate-700">{segment.text}</p>
            </li>
          );
        })}
      </ol>
      {!results.length && (
        <div className="px-5 py-12 text-center">
          <h2 className="font-semibold">No matching transcript lines</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Try a different phrase or choose another speaker.</p>
          <button onClick={() => { setQuery(""); setSpeaker(""); }} className="mt-4 min-h-11 rounded-lg px-4 text-sm font-medium text-teal-800 hover:bg-teal-50">Clear filters</button>
        </div>
      )}
      <p className="border-t border-slate-100 px-5 py-5 text-xs leading-6 text-slate-600 sm:px-7">This excerpt covers part of the {meeting.durationMinutes}-minute seed meeting. Timestamps link to text.</p>
    </section>
  );
}
