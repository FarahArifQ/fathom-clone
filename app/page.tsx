import MeetingLibrary from "@/app/components/meeting-library";
import LibrarySkeleton from "@/app/components/library-skeleton";
import Icon from "@/app/components/ui-icon";
import { Suspense } from "react";
import { getMeetings } from "@/lib/supabase";

async function LibraryContent() {
  let meetings: Awaited<ReturnType<typeof getMeetings>> = [];
  let loadError = false;
  try {
    meetings = await getMeetings();
  } catch {
    loadError = true;
  }
  return <MeetingLibrary meetings={meetings} loadError={loadError} />;
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 sm:py-12">
      <header className="mb-8">
        <h1>Meeting library</h1>
        <p className="mt-3 max-w-2xl text-secondary">Revisit conversations, find what was said, and turn meeting notes into next steps.</p>
        <p className="mt-4 flex items-start gap-2 text-meta font-medium text-muted"><Icon name="info" className="mt-0.5 size-4 shrink-0" />Fictional seed meetings with transcript excerpts. No recordings or live capture.</p>
      </header>
      <Suspense fallback={<LibrarySkeleton controls />}><LibraryContent /></Suspense>
    </main>
  );
}
