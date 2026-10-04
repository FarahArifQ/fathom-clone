import { formatTimestamp } from "@/lib/meetings";
import Icon from "./ui-icon";

export default function TimestampChip({ seconds, onJump }: { seconds: number; onJump: (seconds: number) => void }) {
  const timestamp = formatTimestamp(seconds);
  return (
    <button type="button" onClick={() => onJump(seconds)} aria-label={`Go to transcript at ${timestamp}`}
      className="timestamp-chip">
      <Icon name="clock" className="size-4" />{timestamp}
    </button>
  );
}
