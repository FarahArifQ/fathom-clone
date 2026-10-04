import TimestampButton from "./timestamp-button";

export default function TranscriptText({ text, onJump }: { text: string; onJump: (seconds: number) => void }) {
  return text.split(/(\b\d{1,3}:[0-5]\d\b)/g).map((part, index) => {
    const match = /^(\d{1,3}):([0-5]\d)$/.exec(part);
    return match ? <TimestampButton key={index} seconds={Number(match[1]) * 60 + Number(match[2])} onJump={onJump} /> : part;
  });
}
