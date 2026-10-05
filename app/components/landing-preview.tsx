import Link from "next/link";
import seed from "@/data/seed-meetings.json";
import { formatMeetingDate } from "@/lib/meetings";
import ParticipantAvatar from "./participant-avatar";
import TranscriptCitation from "./transcript-citation";
import { Panel, Tag } from "./ui";

export default function LandingPreview() {
  const meeting = seed.meetings.find((item) => item.id === "m5");
  if (!meeting) return null;
  const lines = meeting.transcript.filter((line) => ["24:14", "24:48"].includes(line.t));
  return <figure className="min-w-0">
    <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-2 text-meta font-medium text-muted">
      <span>Inside Meeting Notes</span><span>Fictional seed meeting</span>
    </figcaption>
    <Panel className="overflow-hidden">
      <div className="border-b border-border p-5 sm:p-6">
        <Tag>{meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)}</Tag>
        <h2 className="mt-3">{meeting.title}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-meta text-muted">
          <time dateTime={meeting.date}>{formatMeetingDate(meeting.date)}</time><span>{meeting.durationMinutes} min</span>
          <span>{meeting.participants.length} attendees</span>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <h3 className="mb-5 text-meta font-semibold text-secondary">From the transcript</h3>
        <ol className="space-y-6">
          {lines.map((line) => {
            const [minutes, seconds] = line.t.split(":").map(Number);
            return <li key={line.t}>
              <div className="mb-2 flex items-center gap-3"><ParticipantAvatar name={line.speaker} /><span className="font-semibold">{line.speaker}</span></div>
              <p className="text-secondary">{line.text}</p>
              <div className="mt-3"><TranscriptCitation compact citation={{ id: `${meeting.id}:${line.t}`, meeting_id: meeting.id,
                meeting_title: meeting.title, speaker: line.speaker, timestamp_seconds: minutes * 60 + seconds, text: line.text }} /></div>
            </li>;
          })}
        </ol>
      </div>
      <div className="border-t border-border px-5 py-3 sm:px-6">
        <Link href={`/meetings/${meeting.id}`} className="button button-ghost px-0">Open this meeting</Link>
      </div>
    </Panel>
  </figure>;
}
