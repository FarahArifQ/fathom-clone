import Link from "next/link";
import { formatTimestamp } from "@/lib/meetings";
import type { TranscriptMatch } from "@/lib/search-schema";

export default function TranscriptCitation({ citation, currentMeetingId, onJump, compact = false }: {
  citation: TranscriptMatch; currentMeetingId?: string; onJump?: (seconds: number) => void;
  compact?: boolean;
}) {
  const label = `${citation.meeting_title} · ${citation.speaker} · ${formatTimestamp(citation.timestamp_seconds)}`;
  const content = compact && currentMeetingId === citation.meeting_id ? `${citation.speaker} · ${formatTimestamp(citation.timestamp_seconds)}` : label;
  const className = `inline-flex items-center px-2 py-1 text-left text-xs leading-5 font-medium text-teal-800 hover:bg-teal-50 ${compact ? "min-h-8 rounded-full border border-teal-200 bg-white" : "min-h-11 rounded"}`;
  return currentMeetingId === citation.meeting_id && onJump ? (
    <button type="button" className={className} aria-label={`Go to ${label}`} onClick={() => onJump(citation.timestamp_seconds)}>{content}</button>
  ) : (
    <Link className={className} aria-label={`Go to ${label}`} href={`/meetings/${encodeURIComponent(citation.meeting_id)}?t=${citation.timestamp_seconds}`}>{content}</Link>
  );
}
