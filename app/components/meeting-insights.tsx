import type { SavedSummary } from "@/lib/interaction-schema";
import EmptyPanel from "./empty-panel";
import TimestampButton from "./timestamp-button";
import TranscriptText from "./transcript-text";

export default function MeetingInsights({ summary, onJump, pending, onComplete }: {
  summary: SavedSummary | null; onJump: (seconds: number) => void; pending: Set<string>;
  onComplete: (id: string, completed: boolean) => void;
}) {
  return (
    <>
      {summary?.action_items.length ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Action items</h2>
          <ul className="mt-5 divide-y divide-slate-100">
            {summary.action_items.map((item) => (
              <li key={item.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <input id={`action-${item.id}`} type="checkbox" checked={item.completed} disabled={pending.has(`action:${item.id}`)}
                    onChange={(event) => onComplete(item.id, event.target.checked)} aria-label={`${item.completed ? "Mark incomplete" : "Mark complete"}: ${item.description}`}
                    className="mt-1.5 h-5 w-5 shrink-0 cursor-pointer accent-teal-800 disabled:cursor-wait" />
                  <p className={`text-sm leading-7 ${item.completed ? "text-slate-600" : "text-slate-800"}`}>
                    <TranscriptText text={item.description} onJump={onJump} />
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  {item.assignee ?? <span className="rounded border border-slate-300 px-2 py-1 font-medium text-slate-800">Needs owner</span>}
                  <TimestampButton seconds={item.timestamp_seconds} onJump={onJump} />
                </div>
                {pending.has(`action:${item.id}`) && <p role="status" className="mt-2 text-xs text-slate-600">Saving task…</p>}
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
              <li key={chapter.start_seconds} className="flex items-start gap-3 py-1 text-sm leading-6">
                <TimestampButton seconds={chapter.start_seconds} onJump={onJump} />
                <span className="min-w-0 pt-1.5 text-slate-700"><TranscriptText text={chapter.title} onJump={onJump} /></span>
              </li>
            ))}
          </ol>
        </section>
      ) : <EmptyPanel title="Chapters" description="No chapters yet. Generate a summary to outline the conversation." />}
    </>
  );
}
