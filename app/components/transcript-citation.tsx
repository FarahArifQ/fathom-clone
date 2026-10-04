import Link from "next/link";
import { formatTimestamp } from "@/lib/meetings";
import type { TranscriptMatch } from "@/lib/search-schema";

export default function TranscriptCitation({ citation, currentMeetingId, onJump, compact = false }: {
  citation: TranscriptMatch; currentMeetingId?: string; onJump?: (seconds: number) => void;
  compact?: boolean;
}) {
  const label = `${citation.meeting_title} · ${citation.speaker} · ${formatTimestamp(citation.timestamp_seconds)}`;
  const content = compact ? `${citation.speaker} · ${formatTimestamp(citation.timestamp_seconds)}` : label;
  const className = "timestamp-chip relative z-10 max-w-full break-words text-left";
  return currentMeetingId === citation.meeting_id && onJump ? (
    <button type="button" className={className} aria-label={`Go to ${label}`} onClick={() => onJump(citation.timestamp_seconds)}>{content}</button>
  ) : (
    <Link className={className} aria-label={`Go to ${label}`} href={`/meetings/${encodeURIComponent(citation.meeting_id)}?t=${citation.timestamp_seconds}`}>{content}</Link>
  );
}
