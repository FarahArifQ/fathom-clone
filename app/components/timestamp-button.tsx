import { formatTimestamp } from "@/lib/meetings";

export default function TimestampButton({ seconds, onJump }: { seconds: number; onJump: (seconds: number) => void }) {
  const timestamp = formatTimestamp(seconds);
  return (
    <button type="button" onClick={() => onJump(seconds)} aria-label={`Go to transcript at ${timestamp}`}
      className="inline-flex min-h-9 shrink-0 items-center rounded px-2 text-xs font-medium text-teal-800 tabular-nums hover:bg-teal-50">
      {timestamp}
    </button>
  );
}
