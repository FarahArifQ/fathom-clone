"use client";

import { useEffect, useId, useRef, useState } from "react";
import { type Meeting } from "@/lib/meetings";
import type { Annotation } from "@/lib/interaction-schema";
import SearchField from "./search-field";
import TimestampButton from "./timestamp-button";
import TranscriptText from "./transcript-text";
import { Tag } from "./ui";
import SpeakerTimeline from "./speaker-timeline";
import { speakerColor } from "@/lib/speakers";

export default function MeetingTranscript({ meeting, targetSeconds, annotations, pending, onHighlight, onJump }: {
  meeting: Meeting; targetSeconds?: number; annotations: Annotation[]; pending: Set<string>;
  onHighlight: (segment: Meeting["transcript"][number]) => void; onJump: (seconds: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [speaker, setSpeaker] = useState("");
  const speakerId = useId();
  const transcriptId = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [flashing, setFlashing] = useState(targetSeconds !== undefined);
  useEffect(() => {
    if (targetSeconds === undefined) return;
    const container = viewport.current;
    const element = container?.querySelector<HTMLLIElement>(`[id="t-${targetSeconds}"]`);
    if (!container || !element) return;
    container.scrollTo({
      top: container.scrollTop + element.getBoundingClientRect().top - container.getBoundingClientRect().top
        - (container.clientHeight - element.offsetHeight) / 2,
    });
    element.focus({ preventScroll: true });
    const timer = window.setTimeout(() => setFlashing(false), 2000);
    return () => window.clearTimeout(timer);
  }, [targetSeconds]);
  useEffect(() => {
    if (!expanded) return;
    const trackScroll = () => setShowBackToTop((viewport.current?.getBoundingClientRect().top ?? 0) < -200);
    window.addEventListener("scroll", trackScroll, { passive: true });
    return () => window.removeEventListener("scroll", trackScroll);
  }, [expanded]);
  const speakers = [...new Set(meeting.transcript.map((line) => line.speaker))];
  const results = meeting.transcript.filter((line) =>
    (!speaker || line.speaker === speaker) && line.text.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const visibleLines = new Set(results);

  return (
    <section aria-label="Transcript">
      <div className="border-b border-border p-5 sm:p-7">
        {meeting.durationMinutes >= 30 && meeting.transcript.length > 0 && <SpeakerTimeline meeting={meeting} speaker={speaker} onSpeaker={setSpeaker} onJump={onJump} />}
        <div className="flex flex-col gap-4 xl:flex-row">
          <SearchField label="Search transcript" value={query} onChange={setQuery} />
          <div className="min-w-0 xl:w-48">
            <label htmlFor={speakerId} className="mb-2 block text-meta font-medium text-secondary">Speaker</label>
            <select id={speakerId} value={speaker} onChange={(event) => setSpeaker(event.target.value)} className="h-14 w-full rounded-lg border border-border-strong bg-surface px-3 text-base text-foreground">
              <option value="">All speakers</option>
              {speakers.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p role="status" className="text-meta text-secondary">Showing {results.length} of {meeting.transcript.length} lines</p>
          <button type="button" aria-expanded={expanded} aria-controls={transcriptId}
            onClick={() => { setExpanded(!expanded); setShowBackToTop(false); }}
            className="min-h-11 rounded-lg px-3 text-base font-medium text-accent hover:bg-accent-soft">
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>
      <div id={transcriptId} ref={viewport} role="region" aria-label="Transcript lines" tabIndex={0}
        onScroll={(event) => { if (!expanded) setShowBackToTop(event.currentTarget.scrollTop > 200); }}
        className={`relative focus-visible:-outline-offset-2 ${expanded ? "" : "max-h-[50vh] overflow-y-auto overscroll-contain lg:max-h-[60vh]"}`}>
      {showBackToTop && (
        <div className="sticky top-0 z-10 flex h-0 justify-end pr-5 sm:pr-7">
          <button type="button" onClick={() => {
            if (expanded) viewport.current?.scrollIntoView({ block: "start" });
            else viewport.current?.scrollTo({ top: 0 });
            viewport.current?.focus({ preventScroll: true });
            setShowBackToTop(false);
          }} className="mt-2 min-h-11 rounded-lg border border-border-strong bg-surface px-3 text-base font-medium text-accent shadow-sm hover:bg-accent-soft">
            Back to top
          </button>
        </div>
      )}
      <ol className="divide-y divide-border px-5 sm:px-7">
        {meeting.transcript.map((segment) => {
          const seconds = segment.startSeconds;
          const notes = annotations.filter((annotation) => annotation.timestamp_seconds === seconds);
          const highlighted = notes.some((annotation) => annotation.type === "highlight");
          const saving = pending.has(`highlight:${seconds}`);
          return (
            <li key={`${seconds}-${segment.speaker}`} id={`t-${seconds}`} tabIndex={-1} hidden={!visibleLines.has(segment)}
              className={`scroll-mt-6 py-6 ${flashing && seconds === targetSeconds ? "transcript-target" : ""}`}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-base font-semibold" style={{ color: speakerColor(meeting, segment.speaker) }}>{segment.speaker}</span>
                <TimestampButton seconds={seconds} onJump={onJump} />
              </div>
              <p className="text-base leading-7 text-secondary"><TranscriptText text={segment.text} onJump={onJump} /></p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-meta">
                <button type="button" onClick={() => onHighlight(segment)} disabled={highlighted || saving}
                  aria-label={`${highlighted ? "Highlighted" : "Highlight"} ${segment.speaker}'s transcript line`}
                  className="min-h-10 rounded-lg px-2 font-medium text-accent hover:bg-accent-soft disabled:cursor-default disabled:text-secondary">
                  {saving ? "Saving highlight…" : highlighted ? "Highlighted" : "Highlight"}
                </button>
                {highlighted && <span role="status"><Tag tone="success">Saved highlight</Tag></span>}
              </div>
              {notes.filter((note) => note.type !== "highlight" || note.note !== segment.text).map((note) => (
                <p key={note.id} className="mt-3 border-l-2 border-accent pl-3 text-base leading-7 text-secondary">
                  <span className="font-medium capitalize">{note.type}: </span><TranscriptText text={note.note} onJump={onJump} />
                </p>
              ))}
            </li>
          );
        })}
      </ol>
      {!results.length && (
        <div className="px-5 py-12 text-center">
          <h2 className="font-semibold">No matching transcript lines</h2>
          <p className="mt-2 text-base leading-6 text-secondary">Try a different phrase or choose another speaker.</p>
          <button onClick={() => { setQuery(""); setSpeaker(""); }} className="mt-4 min-h-11 rounded-lg px-4 text-base font-medium text-accent hover:bg-accent-soft">Clear filters</button>
        </div>
      )}
      <p className="border-t border-border px-5 py-5 text-meta leading-6 text-secondary sm:px-7">This excerpt covers part of the {meeting.durationMinutes}-minute seed meeting. Timestamps link to text.</p>
      </div>
    </section>
  );
}
