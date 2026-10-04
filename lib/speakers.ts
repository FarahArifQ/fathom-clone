import type { Meeting } from "./meetings";

export function speakerColor(meeting: Meeting, name: string) {
  const names = [...new Set([...meeting.participants, ...meeting.transcript.map((line) => line.speaker)])];
  return `var(--speaker-${Math.max(0, names.indexOf(name)) % 8})`;
}
