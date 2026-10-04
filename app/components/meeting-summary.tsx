import type { Meeting } from "@/lib/meetings";
import { summarySections, type MeetingSummary } from "@/lib/summary-schema";
import TranscriptText, { transcriptParts } from "./transcript-text";
import TimestampButton from "./timestamp-button";
import { Button, Skeleton } from "./ui";

export default function MeetingSummaryPanel({ meeting, summary, generating, error, onGenerate, onJump }: {
  meeting: Meeting; summary: MeetingSummary | null; generating: boolean; error: string; onGenerate: () => void;
  onJump: (seconds: number) => void;
}) {
  const times = new Set(meeting.transcript.map((line) => line.startSeconds));
  return <section aria-label="Summary" aria-busy={generating} className="p-5 sm:p-7">
    <div data-template-slot className="mb-4" />
    {summary ? <>
      <div className="tldr-block rounded-lg px-5 py-5">
        <h2 className="mb-3 text-accent">TL;DR</h2>
        <p className="text-lg leading-relaxed text-foreground"><TranscriptText text={summary.tldr} onJump={onJump} /></p>
      </div>
      <p className="mt-3 text-meta text-secondary">Click any timestamp to jump to that moment in the transcript</p>
      {summarySections(summary.summary_markdown).map((section) => <section key={section.title} className="mt-8">
        <h2>{section.title}</h2>
        <ul className="mt-4 space-y-5">
          {section.items.map((item) => {
            const parts = transcriptParts(item.slice(2));
            const seconds = [...new Set(parts.flatMap((part) => part.seconds !== undefined && times.has(part.seconds) ? [part.seconds] : []))];
            const text = parts.filter((part) => part.seconds === undefined || !times.has(part.seconds)).map((part) => part.text).join("").replace(/\[\s*\]|\(\s*\)/g, "").trim();
            return <li key={item} className="border-l border-border pl-4">
              <p className="text-secondary">{text}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {seconds.length ? seconds.map((time) => <TimestampButton key={time} seconds={time} onJump={onJump} />)
                  : <span className="text-meta text-muted">No source timestamp saved</span>}
              </div>
            </li>;
          })}
        </ul>
      </section>)}
      <p className="mt-8 text-meta text-secondary">AI-generated from the transcript. Check source passages for accuracy.</p>
    </> : <>
      <h2>No summary yet</h2>
      <p className="mt-3 text-secondary">Generate a summary, action items, and chapters from this meeting&apos;s transcript.</p>
      <Button disabled={generating} onClick={onGenerate} className="mt-5">{generating ? "Generating summary…" : error ? "Retry" : "Generate summary"}</Button>
      {generating && <div className="mt-6 space-y-4" role="status">
        <p className="text-meta text-secondary">Reading the transcript and preparing your meeting notes…</p>
        <Skeleton className="h-24 w-full" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-5 w-full" />
      </div>}
    </>}
    {error && <p role="alert" className="mt-4 rounded-lg border border-warning/40 bg-warning-soft p-4 text-warning">{error}</p>}
  </section>;
}
