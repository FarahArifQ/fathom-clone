import Link from "next/link";
import { formatMeetingDate, type Meeting } from "@/lib/meetings";
import type { TranscriptMatch } from "@/lib/search-schema";
import ParticipantAvatar from "./participant-avatar";
import TranscriptCitation from "./transcript-citation";
import Icon from "./ui-icon";
import { Tag } from "./ui";

export default function MeetingCard({ meeting, match }: { meeting: Meeting; match?: TranscriptMatch }) {
  const attendees = meeting.participants.length;
  return <li className="meeting-card p-5 sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <Tag>{meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)}</Tag>
        <h2 className="mt-3 break-words">
          <Link href={`/meetings/${meeting.id}`} className="meeting-card-title hover:text-accent">{meeting.title}</Link>
        </h2>
      </div>
      <Icon name="arrow" className="mt-1 size-5 shrink-0 text-accent" />
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-meta font-medium text-muted">
        <time dateTime={meeting.date}>{formatMeetingDate(meeting.date)}</time>
        <span className="inline-flex items-center gap-2 tabular-nums"><Icon name="clock" className="size-4" />{meeting.durationMinutes} min</span>
        <span>{meeting.transcript.length} transcript lines</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2" aria-label="Attendees">
          {meeting.participants.slice(0, 4).map((name) => <ParticipantAvatar key={name} name={name} />)}
          {attendees > 4 && <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface-raised text-meta font-medium text-secondary">+{attendees - 4}</span>}
        </div>
        <span className="text-meta font-medium text-secondary">{attendees} {attendees === 1 ? "attendee" : "attendees"}</span>
      </div>
    </div>
    {match && <div className="mt-5 border-t border-border pt-4">
      <p className="mb-2 text-meta font-medium text-muted">Matched in the transcript</p>
      <TranscriptCitation citation={match} compact />
      <p className="mt-2 line-clamp-3 break-words text-secondary">{match.text}</p>
    </div>}
  </li>;
}
