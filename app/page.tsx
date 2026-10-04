import MeetingLibrary from "@/app/components/meeting-library";
import { meetings } from "@/lib/seed-meetings";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="mb-9">
        <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-teal-800 uppercase">After the conversation</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Meeting library</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">Find a conversation. Revisit the details.</p>
        <p className="mt-5 text-xs leading-6 text-slate-600">Seed demo: four fictional meetings with transcript excerpts. No recordings or live capture.</p>
      </header>
      <MeetingLibrary meetings={meetings} />
    </main>
  );
}
