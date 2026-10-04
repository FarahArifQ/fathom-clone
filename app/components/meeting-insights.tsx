import { formatTimestamp } from "@/lib/meetings";
import type { MeetingSummary } from "@/lib/summary-schema";
import EmptyPanel from "./empty-panel";

export default function MeetingInsights({ summary, onJump }: { summary: MeetingSummary | null; onJump: (seconds: number) => void }) {
  return (
    <>
      {summary?.action_items.length ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Action items</h2>
          <ul className="mt-5 divide-y divide-slate-100">
            {summary.action_items.map((item, index) => (
              <li key={index} className="py-4 first:pt-0 last:pb-0">
                <p className="text-sm leading-7 text-slate-800">{item.description}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  {item.assignee ?? <span className="rounded border border-slate-300 px-2 py-1 font-medium text-slate-800">Needs owner</span>}
                  <button onClick={() => onJump(item.timestamp_seconds)} className="min-h-9 rounded px-2 text-teal-800 tabular-nums hover:bg-teal-50">{formatTimestamp(item.timestamp_seconds)}</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : <EmptyPanel title="Action items" description={summary ? "No action items were identified in this transcript." : "No action items yet. Generate a summary to extract tasks."} />}
      {summary?.chapters.length ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Chapters</h2>
          <ol className="mt-4 space-y-2">
            {summary.chapters.map((chapter) => (
              <li key={chapter.start_seconds}>
                <button onClick={() => onJump(chapter.start_seconds)} className="flex min-h-11 w-full items-start gap-3 rounded-lg py-2 text-left text-sm leading-6 hover:bg-teal-50">
                  <span className="shrink-0 text-teal-800 tabular-nums">{formatTimestamp(chapter.start_seconds)}</span>
                  <span className="text-slate-700">{chapter.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      ) : <EmptyPanel title="Chapters" description="No chapters yet. Generate a summary to outline the conversation." />}
    </>
  );
}
