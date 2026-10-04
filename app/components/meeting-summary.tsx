import { summarySections, type MeetingSummary } from "@/lib/summary-schema";
import TranscriptText from "./transcript-text";
import { Button } from "./ui";

export default function MeetingSummaryPanel({ summary, generating, error, onGenerate, onJump }: {
  summary: MeetingSummary | null; generating: boolean; error: string; onGenerate: () => void;
  onJump: (seconds: number) => void;
}) {
  return (
    <section aria-label="Summary" aria-busy={generating} className="p-5 sm:p-7">
      {summary ? (
        <>
          <h2 className="text-accent">TL;DR</h2>
          <p className="mt-3 border-l-2 border-accent pl-4 text-lg leading-8 text-foreground"><TranscriptText text={summary.tldr} onJump={onJump} /></p>
          {summarySections(summary.summary_markdown).map((section) => (
            <div key={section.title} className="mt-8">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <ul className="mt-3 list-disc space-y-3 pl-5 text-base leading-7 text-secondary">
                {section.items.map((item) => <li key={item}><TranscriptText text={item.slice(2)} onJump={onJump} /></li>)}
              </ul>
            </div>
          ))}
          <p className="mt-8 text-meta leading-6 text-secondary">AI-generated from the transcript. Check source passages for accuracy.</p>
        </>
      ) : (
        <>
          <h2 className="text-lg font-semibold">No summary yet</h2>
          <p className="mt-3 text-base leading-7 text-secondary">Generate a summary, action items, and chapters from this meeting&apos;s transcript.</p>
          <Button disabled={generating} onClick={onGenerate} className="mt-5">
            {generating ? "Generating summary…" : error ? "Retry" : "Generate summary"}
          </Button>
          {generating && <p role="status" className="mt-3 text-base text-secondary">Reading the transcript and preparing your meeting notes…</p>}
        </>
      )}
      {error && <p role="alert" className="mt-4 rounded-lg border border-border-strong bg-surface-raised p-4 text-base leading-6 text-foreground">{error}</p>}
    </section>
  );
}
