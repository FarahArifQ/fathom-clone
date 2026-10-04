import type { MeetingSummary } from "@/lib/summary-schema";
import { formatTimestamp } from "@/lib/meetings";

export default function ChapterLinks({ chapters, activeSeconds, onJump, strip = false }: {
  chapters: MeetingSummary["chapters"]; activeSeconds?: number; onJump: (seconds: number) => void; strip?: boolean;
}) {
  const active = activeSeconds === undefined ? undefined : chapters.findLast((chapter) => chapter.start_seconds <= activeSeconds);
  return <ol className={strip ? "thin-scrollbar flex gap-3 overflow-x-auto pb-3" : "space-y-2"}>
    {chapters.map((chapter) => <li key={chapter.start_seconds} className={strip ? "min-w-44 max-w-64 shrink-0" : ""}>
      <button type="button" onClick={() => onJump(chapter.start_seconds)} aria-current={active === chapter ? "location" : undefined}
        className="chapter-link flex min-h-10 w-full items-start gap-3 rounded-lg border border-border px-3 py-2 text-left text-meta hover:border-accent">
        <span className="shrink-0 font-medium text-accent tabular-nums">{formatTimestamp(chapter.start_seconds)}</span>
        <span className="min-w-0 break-words text-secondary">{chapter.title}</span>
      </button>
    </li>)}
  </ol>;
}
