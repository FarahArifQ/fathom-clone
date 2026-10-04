import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EmptyPanel from "@/app/components/empty-panel";
import { formatMeetingDate, meetings, timestampSeconds } from "@/lib/seed-meetings";

export function generateStaticParams() {
  return meetings.map((meeting) => ({ id: meeting.id }));
}

export async function generateMetadata({ params }: PageProps<"/meetings/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: meetings.find((meeting) => meeting.id === id)?.title ?? "Meeting not found" };
}

export default async function MeetingPage({ params }: PageProps<"/meetings/[id]">) {
  const { id } = await params;
  const meeting = meetings.find((item) => item.id === id);
  if (!meeting) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <Link href="/" className="text-sm font-medium text-teal-700">← Back to library</Link>
      <header className="mt-8 mb-9">
        <div className="mb-4 flex items-center gap-3 text-xs">
          <span className="rounded-md bg-teal-50 px-2.5 py-1 font-medium text-teal-800 capitalize">{meeting.type}</span>
          <span className="text-slate-500">Seed data · Fictional meeting</span>
        </div>
        <h1 className="max-w-3xl text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">{meeting.title}</h1>
        <p className="mt-4 text-sm text-slate-500"><time dateTime={meeting.date}>{formatMeetingDate(meeting.date)}</time><span aria-hidden="true"> · </span>{meeting.durationMinutes} min<span aria-hidden="true"> · </span>{meeting.participants.length} attendees</p>
        <ul aria-label="Attendees" className="mt-5 flex flex-wrap gap-2">
          {meeting.participants.map((name) => <li key={name} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">{name}</li>)}
        </ul>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-lg font-semibold tracking-tight">Transcript</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Seed excerpt, not the full {meeting.durationMinutes}-minute meeting. Timestamps link to passages; no recording is available.</p>
          </div>
          <ol className="divide-y divide-slate-100 px-6">
            {meeting.transcript.map((segment) => {
              const seconds = timestampSeconds(segment.t);
              return (
                <li key={seconds} id={`t-${seconds}`} className="scroll-mt-6 py-5 target:rounded-lg target:bg-teal-50">
                  <div className="mb-2 flex items-center gap-3">
                    <a href={`#t-${seconds}`} aria-label={`Jump to ${segment.t}`} className="rounded bg-stone-100 px-2 py-1 font-mono text-xs text-teal-800">{segment.t}</a>
                    <span className="text-sm font-semibold">{segment.speaker}</span>
                  </div>
                  <p className="text-sm leading-7 text-slate-600">{segment.text}</p>
                </li>
              );
            })}
          </ol>
        </section>
        <aside aria-label="Meeting insights" className="space-y-5">
          <EmptyPanel title="AI summary" description="No summary saved. AI generation will be connected in a later build step." />
          <EmptyPanel title="Action items" description="No action items saved. Tasks will appear here after AI generation is connected." />
        </aside>
      </div>
    </main>
  );
}
