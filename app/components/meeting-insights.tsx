import type { SavedSummary } from "@/lib/interaction-schema";
import EmptyPanel from "./empty-panel";
import TimestampButton from "./timestamp-button";
import TranscriptText from "./transcript-text";
import { Panel, Tag } from "./ui";

export default function MeetingInsights({ summary, onJump, pending, onComplete }: {
  summary: SavedSummary | null; onJump: (seconds: number) => void; pending: Set<string>;
  onComplete: (id: string, completed: boolean) => void;
}) {
  return (
    <>
      {summary?.action_items.length ? (
        <Panel glass className="p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Action items</h2>
          <ul className="mt-5 divide-y divide-border">
            {summary.action_items.map((item) => (
              <li key={item.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <label htmlFor={`action-${item.id}`} className="flex size-10 shrink-0 items-center justify-center">
                  <input id={`action-${item.id}`} type="checkbox" checked={item.completed} disabled={pending.has(`action:${item.id}`)}
                    onChange={(event) => onComplete(item.id, event.target.checked)} aria-label={`${item.completed ? "Mark incomplete" : "Mark complete"}: ${item.description}`}
                    className="h-5 w-5 cursor-pointer accent-success disabled:cursor-wait" />
                  </label>
                  <p className={`text-base leading-7 ${item.completed ? "text-success" : "text-foreground"}`}>
                    <TranscriptText text={item.description} onJump={onJump} />
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-meta text-secondary">
                  {item.assignee ?? <Tag tone="warning">Needs owner</Tag>}
                  <TimestampButton seconds={item.timestamp_seconds} onJump={onJump} />
                </div>
                {pending.has(`action:${item.id}`) && <p role="status" className="mt-2 text-meta text-secondary">Saving task…</p>}
              </li>
            ))}
          </ul>
        </Panel>
      ) : <EmptyPanel title="Action items" description={summary ? "No action items were identified in this transcript." : "No action items yet. Generate a summary to extract tasks."} />}
      {summary?.chapters.length ? (
        <Panel glass className="p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Chapters</h2>
          <ol className="mt-4 space-y-2">
            {summary.chapters.map((chapter) => (
              <li key={chapter.start_seconds} className="flex items-start gap-3 py-1 text-base leading-6">
                <TimestampButton seconds={chapter.start_seconds} onJump={onJump} />
                <span className="min-w-0 pt-1.5 text-secondary"><TranscriptText text={chapter.title} onJump={onJump} /></span>
              </li>
            ))}
          </ol>
        </Panel>
      ) : <EmptyPanel title="Chapters" description="No chapters yet. Generate a summary to outline the conversation." />}
    </>
  );
}
