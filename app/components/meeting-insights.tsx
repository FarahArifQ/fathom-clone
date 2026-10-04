import type { SavedSummary } from "@/lib/interaction-schema";
import EmptyPanel, { SidebarSection } from "./empty-panel";
import TimestampButton from "./timestamp-button";
import TranscriptText from "./transcript-text";
import ChapterLinks from "./chapter-links";
import { Tag } from "./ui";

export default function MeetingInsights({ summary, activeSeconds, onJump, pending, onComplete }: {
  summary: SavedSummary | null; activeSeconds?: number; onJump: (seconds: number) => void; pending: Set<string>;
  onComplete: (id: string, completed: boolean) => void;
}) {
  const actions = summary?.action_items ?? [];
  const chapters = summary?.chapters ?? [];
  return <>
    {actions.length ? <SidebarSection title="Action items" count={actions.length}
      status={`${actions.filter((item) => item.completed).length} of ${actions.length} done`}>
      <ul className="divide-y divide-border">
        {actions.map((item) => <li key={item.id} className="py-4 first:pt-0 last:pb-0">
          <div className="flex items-start gap-2">
            <label htmlFor={`action-${item.id}`} className="flex size-10 shrink-0 items-center justify-center">
              <input id={`action-${item.id}`} type="checkbox" checked={item.completed} disabled={pending.has(`action:${item.id}`)}
                onChange={(event) => onComplete(item.id, event.target.checked)}
                aria-label={`${item.completed ? "Mark incomplete" : "Mark complete"}: ${item.description}`}
                className="h-5 w-5 cursor-pointer accent-success disabled:cursor-wait" />
            </label>
            <p className={`min-w-0 break-words pt-2 ${item.completed ? "text-success" : "text-foreground"}`}>
              <TranscriptText text={item.description} onJump={onJump} />
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-meta text-secondary">
            {item.assignee ?? <Tag tone="warning">Needs owner</Tag>}
            <TimestampButton seconds={item.timestamp_seconds} onJump={onJump} />
          </div>
          {pending.has(`action:${item.id}`) && <p role="status" className="mt-2 text-meta text-secondary">Saving task…</p>}
        </li>)}
      </ul>
    </SidebarSection> : <EmptyPanel title="Action items" description={summary ? "No action items were identified in this transcript." : "No action items yet. Generate a summary to extract tasks."} />}
    {chapters.length ? <SidebarSection title="Chapters" count={chapters.length}>
      <ChapterLinks chapters={chapters} activeSeconds={activeSeconds} onJump={onJump} />
    </SidebarSection> : <EmptyPanel title="Chapters" description="No chapters yet. Generate a summary to outline the conversation." />}
  </>;
}
