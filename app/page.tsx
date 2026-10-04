import Link from "next/link";
import { formatMeetingDate, meetings } from "@/lib/seed-meetings";

export default function Home() {
  const sortedMeetings = [...meetings].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-teal-700 uppercase">Your meeting space</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Meeting library</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">Pick up where the conversation left off. Browse your meetings and revisit the details.</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">{meetings.length} seed meetings</span>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {sortedMeetings.map((meeting) => (
          <Link key={meeting.id} href={`/meetings/${meeting.id}`} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-teal-600 hover:shadow-md sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3 text-xs">
              <span className="rounded-md bg-teal-50 px-2.5 py-1 font-medium text-teal-800 capitalize">{meeting.type}</span>
              <span className="text-slate-500">Seed data</span>
            </div>
            <h2 className="text-xl leading-7 font-semibold tracking-tight group-hover:text-teal-800">{meeting.title}</h2>
            <p className="mt-3 text-sm text-slate-500"><time dateTime={meeting.date}>{formatMeetingDate(meeting.date)}</time><span aria-hidden="true"> · </span>{meeting.durationMinutes} min</p>
            <p className="mt-6 text-sm leading-6 text-slate-600">{meeting.participants.join(", ")}</p>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5 text-sm">
              <span className="text-slate-500">Transcript excerpt</span>
              <span className="font-medium text-teal-700">Open meeting <span aria-hidden="true">↗</span></span>
            </div>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-sm leading-6 text-slate-500">Fictional demo meetings. Recording, live capture, and calendar sync are out of scope.</p>
    </main>
  );
}
