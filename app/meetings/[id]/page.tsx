import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MeetingWorkspace from "@/app/components/meeting-workspace";
import Icon from "@/app/components/ui-icon";
import ParticipantAvatar from "@/app/components/participant-avatar";
import { Tag } from "@/app/components/ui";
import { formatMeetingDate } from "@/lib/meetings";
import { getMeetings } from "@/lib/supabase";
import { getSavedSummary } from "@/lib/summary-store";
import { getAnnotations } from "@/lib/annotation-store";

export async function generateMetadata({ params }: PageProps<"/meetings/[id]">): Promise<Metadata> {
  const { id } = await params;
  const [meeting] = await getMeetings(id);
  return { title: meeting?.title ?? "Meeting not found" };
}

export default async function MeetingPage({ params, searchParams }: PageProps<"/meetings/[id]">) {
  const { id } = await params;
  const [meeting] = await getMeetings(id);
  if (!meeting) notFound();
  const [summary, annotations] = await Promise.all([getSavedSummary(id), getAnnotations(id)]);
  const { t } = await searchParams;
  const seconds = typeof t === "string" && /^\d{1,6}$/.test(t) ? Number(t) : undefined;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-28 sm:px-8 sm:pt-10">
      <Link href="/library" className="inline-flex min-h-11 items-center gap-2 text-meta font-medium text-accent"><Icon name="arrow" className="size-5 rotate-180" />Back to library</Link>
      <header className="mt-5 mb-8">
        <h1 className="break-words">{meeting.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 text-meta font-medium text-secondary">
          <Tag>{meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)}</Tag>
          <time dateTime={meeting.date}>{formatMeetingDate(meeting.date)}</time>
          <span className="inline-flex items-center gap-2 tabular-nums"><Icon name="clock" className="size-4" />{meeting.durationMinutes} min</span>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2" aria-label="Attendees">
              {meeting.participants.slice(0, 4).map((name) => <ParticipantAvatar key={name} name={name} />)}
            </div>
            <span>{meeting.participants.length} {meeting.participants.length === 1 ? "attendee" : "attendees"}</span>
          </div>
        </div>
        <p className="mt-4 text-meta text-muted">{meeting.isSeed && "Fictional seed meeting · Transcript excerpt · "}No recording available</p>
      </header>
      <MeetingWorkspace key={`${meeting.id}:${seconds ?? "summary"}`} meeting={meeting} initialSummary={summary} initialAnnotations={annotations} initialSeconds={seconds} />
    </main>
  );
}
