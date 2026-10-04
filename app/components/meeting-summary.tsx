import { summarySections, type MeetingSummary } from "@/lib/summary-schema";
import TranscriptText from "./transcript-text";

export default function MeetingSummaryPanel({ summary, generating, error, onGenerate, onJump }: {
  summary: MeetingSummary | null; generating: boolean; error: string; onGenerate: () => void;
  onJump: (seconds: number) => void;
}) {
  return (
    <section aria-label="Summary" aria-busy={generating} className="p-5 sm:p-7">
      {summary ? (
        <>
          <h2 className="text-xs font-semibold tracking-wider text-teal-800 uppercase">TL;DR</h2>
          <p className="mt-3 border-l-2 border-teal-700 pl-4 text-lg leading-8 text-slate-800"><TranscriptText text={summary.tldr} onJump={onJump} /></p>
          {summarySections(summary.summary_markdown).map((section) => (
            <div key={section.title} className="mt-8">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <ul className="mt-3 list-disc space-y-3 pl-5 text-sm leading-7 text-slate-700">
                {section.items.map((item) => <li key={item}><TranscriptText text={item.slice(2)} onJump={onJump} /></li>)}
              </ul>
            </div>
          ))}
          <p className="mt-8 text-xs leading-6 text-slate-600">AI-generated from the transcript. Check source passages for accuracy.</p>
        </>
      ) : (
        <>
          <h2 className="text-lg font-semibold">No summary yet</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Generate a summary, action items, and chapters from this meeting&apos;s transcript.</p>
          <button disabled={generating} onClick={onGenerate} className="mt-5 min-h-11 rounded-lg bg-teal-800 px-5 text-sm font-medium text-white hover:bg-teal-900 disabled:cursor-wait disabled:opacity-70">
            {generating ? "Generating summary…" : "Generate summary"}
          </button>
          {generating && <p role="status" className="mt-3 text-sm text-slate-600">Reading the transcript and preparing your meeting notes…</p>}
        </>
      )}
      {error && <p role="alert" className="mt-4 rounded-lg border border-slate-300 bg-stone-50 p-4 text-sm leading-6 text-slate-800">{error}</p>}
    </section>
  );
}
