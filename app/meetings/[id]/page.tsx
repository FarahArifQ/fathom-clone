import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MeetingWorkspace from "@/app/components/meeting-workspace";
import { formatMeetingDate } from "@/lib/meetings";
import { getMeetings } from "@/lib/supabase";
import { getSavedSummary } from "@/lib/summary-store";
import { getAnnotations } from "@/lib/annotation-store";

export async function generateMetadata({ params }: PageProps<"/meetings/[id]">): Promise<Metadata> {
  const { id } = await params;
  const [meeting] = await getMeetings(id);
  return { title: meeting?.title ?? "Meeting not found" };
}

export default async function MeetingPage({ params }: PageProps<"/meetings/[id]">) {
  const { id } = await params;
  const [meeting] = await getMeetings(id);
  if (!meeting) notFound();
  const [summary, annotations] = await Promise.all([getSavedSummary(id), getAnnotations(id)]);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <Link href="/" className="inline-flex min-h-11 items-center text-sm font-medium text-teal-800">← Back to library</Link>
      <p className="mt-3 mb-7 text-xs leading-6 text-slate-600">{meeting.isSeed && "Seed demo · Fictional meeting · Transcript excerpt · "}No recording available</p>
      <header className="mb-8">
        <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">{meeting.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
          <span className="rounded bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800 capitalize">{meeting.type}</span>
          <time dateTime={meeting.date}>{formatMeetingDate(meeting.date)}</time>
          <span>{meeting.durationMinutes} min</span>
        </div>
      </header>
      <MeetingWorkspace key={meeting.id} meeting={meeting} initialSummary={summary} initialAnnotations={annotations} />
    </main>
  );
}
