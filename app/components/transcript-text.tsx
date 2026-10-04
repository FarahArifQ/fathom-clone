import TimestampButton from "./timestamp-button";

export function transcriptParts(text: string) {
  return text.split(/(\b\d{1,3}:[0-5]\d\b)/g).map((part, index) => {
    const match = /^(\d{1,3}):([0-5]\d)$/.exec(part);
    return { text: part, index, seconds: match ? Number(match[1]) * 60 + Number(match[2]) : undefined };
  });
}

export default function TranscriptText({ text, onJump }: { text: string; onJump: (seconds: number) => void }) {
  return transcriptParts(text).map((part) => part.seconds === undefined ? part.text :
    <TimestampButton key={part.index} seconds={part.seconds} onJump={onJump} />);
}
