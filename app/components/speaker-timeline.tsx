import type { Meeting } from "@/lib/meetings";
import { speakerColor } from "@/lib/speakers";
import TimestampButton from "./timestamp-button";

export default function SpeakerTimeline({ meeting, speaker, onSpeaker, onJump }: {
  meeting: Meeting; speaker: string; onSpeaker: (speaker: string) => void; onJump: (seconds: number) => void;
}) {
  const speakers = [...new Set(meeting.transcript.map((line) => line.speaker))];
  const end = meeting.transcript.at(-1)?.startSeconds ?? 0;
  return <section aria-label="Speaker timeline" className="mb-5">
    <div className="mb-2 flex flex-wrap items-center justify-between gap-3 text-meta font-medium text-secondary">
      <span>Speaker timeline</span>
      <div className="flex items-center gap-2">
        <TimestampButton seconds={meeting.transcript[0]?.startSeconds ?? 0} onJump={onJump} />
        <span aria-hidden="true">–</span><TimestampButton seconds={end} onJump={onJump} />
      </div>
    </div>
    <div aria-hidden="true" className="flex h-3 overflow-hidden rounded-lg bg-surface-raised">
      {meeting.transcript.map((line, index) => <span key={`${line.startSeconds}-${line.speaker}`}
        style={{ flexGrow: Math.max(1, (meeting.transcript[index + 1]?.startSeconds ?? end + 1) - line.startSeconds),
          backgroundColor: !speaker || line.speaker === speaker ? speakerColor(meeting, line.speaker) : "var(--border)" }} />)}
    </div>
    <div role="group" aria-label="Filter timeline by speaker" className="mt-2 flex flex-wrap gap-2">
      <button type="button" aria-pressed={!speaker} onClick={() => onSpeaker("")}
        className="button button-ghost px-2">All speakers</button>
      {speakers.map((name) => <button key={name} type="button" aria-pressed={speaker === name}
        onClick={() => onSpeaker(speaker === name ? "" : name)}
        className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-2 text-meta font-medium ${speaker === name ? "border-accent bg-accent-soft" : "border-transparent hover:border-border"}`}
        style={{ color: speakerColor(meeting, name) }}>
        <span aria-hidden="true" className="size-2 rounded-lg" style={{ backgroundColor: speakerColor(meeting, name) }} />{name}
      </button>)}
    </div>
    <p className="mt-2 text-meta text-muted">Transcript intervals are approximate. Select a speaker to filter the lines.</p>
  </section>;
}
