import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MeetingWorkspace from "@/app/components/meeting-workspace";
import Icon from "@/app/components/ui-icon";
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
    <main className="mx-auto w-full max-w-6xl px-5 pt-8 pb-28 sm:px-8 sm:pt-10">
      <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-meta font-medium text-accent"><Icon name="arrow" className="size-5 rotate-180" />Back to library</Link>
      <p className="mt-3 mb-7 text-meta leading-6 text-secondary">{meeting.isSeed && "Seed demo · Fictional meeting · Transcript excerpt · "}No recording available</p>
      <header className="mb-8">
        <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">{meeting.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-base text-secondary">
          <span className="rounded-lg bg-accent-soft px-2 py-1 text-meta font-medium text-accent capitalize">{meeting.type}</span>
          <time dateTime={meeting.date}>{formatMeetingDate(meeting.date)}</time>
          <span>{meeting.durationMinutes} min</span>
        </div>
      </header>
      <MeetingWorkspace key={`${meeting.id}:${seconds ?? "summary"}`} meeting={meeting} initialSummary={summary} initialAnnotations={annotations} initialSeconds={seconds} />
    </main>
  );
}
