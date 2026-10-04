"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Meeting } from "@/lib/meetings";
import SearchField from "./search-field";
import { useTranscriptSearch } from "./use-transcript-search";
import MeetingCard from "./meeting-card";
import LibrarySkeleton from "./library-skeleton";
import { Button, EmptyState, IconButton } from "./ui";

export default function MeetingLibrary({ meetings, loadError = false }: { meetings: Meeting[]; loadError?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const search = useTranscriptSearch(query);
  const matches = new Map(search.matches.slice().reverse().map((line) => [line.meeting_id, line]));
  const results = meetings.filter((meeting) =>
    [meeting.title, ...meeting.participants].some((text) => text.toLowerCase().includes(term)) || matches.has(meeting.id),
  ).sort((a, b) => b.date.localeCompare(a.date));
  useEffect(() => {
    if (window.location.hash === "#meeting-search") document.getElementById("meeting-search")?.focus();
  }, []);

  if (loadError) return <EmptyState title="Meetings couldn't load" icon="info"
    description="Your meeting library is unavailable right now. Try loading it again.">
    <Button variant="secondary" onClick={() => router.refresh()}>Retry loading meetings</Button>
  </EmptyState>;

  return <section aria-label="Meeting library">
    <SearchField id="meeting-search" label="Search meetings, people or what was said" value={query} onChange={setQuery} maxLength={200} shortcut>
      {query && <IconButton icon="close" label="Clear" onClick={() => setQuery("")} className="absolute right-1 top-2 px-2" />}
    </SearchField>
    <div className="mt-6 mb-4 flex flex-wrap items-center justify-between gap-2 text-meta font-medium text-muted">
      <p role="status">{search.pending ? "Searching transcripts…" : `${results.length} ${results.length === 1 ? "meeting" : "meetings"}${term ? " found" : ""}`}</p>
      <span>Newest first</span>
    </div>
    {search.error && <div role="alert" className="mb-4 rounded-lg border border-warning/40 bg-warning-soft p-4">
      <p className="text-warning">Transcript search is unavailable. Title and attendee matches are still shown.</p>
      <Button variant="ghost" onClick={search.retry} className="mt-2">Retry transcript search</Button>
    </div>}
    {results.length > 0 && <ul className="space-y-4">
      {results.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} match={matches.get(meeting.id)} />)}
    </ul>}
    {search.pending && <div className={results.length ? "mt-4" : ""}><LibrarySkeleton /></div>}
    {!results.length && !search.pending && !search.error && <EmptyState
      title={term ? "No meetings found" : "No meetings yet"} icon={term ? "search" : "note"}
      description={term ? "Try a meeting title, an attendee's name, or a phrase from the transcript." : "Your meeting library is empty. Imported meetings will appear here."}>
      {term && <Button variant="secondary" onClick={() => setQuery("")}>Clear search</Button>}
    </EmptyState>}
  </section>;
}
