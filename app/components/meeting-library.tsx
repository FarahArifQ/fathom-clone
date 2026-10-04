"use client";

import Link from "next/link";
import { useState } from "react";
import { formatMeetingDate, type Meeting } from "@/lib/meetings";
import ParticipantAvatar from "./participant-avatar";
import SearchField from "./search-field";

export default function MeetingLibrary({ meetings }: { meetings: Meeting[] }) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const results = meetings.filter((meeting) =>
    [meeting.title, ...meeting.participants, ...meeting.transcript.map((line) => line.text)]
      .some((text) => text.toLowerCase().includes(term)),
  ).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section aria-label="Meeting library">
      <SearchField label="Search by title, participant, or transcript text" value={query} onChange={setQuery} />
      <div className="mt-6 mb-3 flex items-center justify-between text-xs text-slate-600">
        <p role="status">{results.length} {results.length === 1 ? "meeting" : "meetings"}{term && " found"}</p>
        <span>Newest first</span>
      </div>
      {results.length ? (
        <ul className="overflow-hidden rounded-xl border border-slate-200 bg-white divide-y divide-slate-200">
          {results.map((meeting) => (
            <li key={meeting.id}>
              <Link href={`/meetings/${meeting.id}`} className="group grid gap-5 px-5 py-6 transition-colors hover:bg-teal-50/50 focus-visible:outline-offset-[-3px] sm:px-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div className="min-w-0">
                  <span className="rounded bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800 capitalize">{meeting.type}</span>
                  <h2 className="mt-3 text-lg leading-7 font-semibold tracking-tight group-hover:text-teal-800 sm:text-xl">{meeting.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                    <time dateTime={meeting.date}>{formatMeetingDate(meeting.date)}</time>
                    <span>{meeting.durationMinutes} min</span>
                    <span>{meeting.transcript.length} transcript lines</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-5 md:justify-end">
                  <div className="flex -space-x-1.5" aria-label="Participants">
                    {meeting.participants.map((name) => <ParticipantAvatar key={name} name={name} />)}
                  </div>
                  <span aria-hidden="true" className="text-xl text-teal-800">↗</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
          <h2 className="text-lg font-semibold">{term ? "No meetings found" : "No meetings yet"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{term ? "Try another title, participant name, or phrase from a transcript." : "Your meeting library is empty."}</p>
          {term && <button onClick={() => setQuery("")} className="mt-5 min-h-11 rounded-lg bg-teal-800 px-5 text-sm font-medium text-white hover:bg-teal-900">Clear search</button>}
        </div>
      )}
    </section>
  );
}
