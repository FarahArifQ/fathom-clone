"use client";

import { Button, EmptyState } from "@/app/components/ui";

export default function MeetingError({ retry }: { retry: () => void }) {
  return <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
    <EmptyState title="This meeting couldn't load" icon="info" description="We couldn't load the meeting notes right now. Please try again.">
      <Button onClick={retry}>Retry loading meeting</Button>
    </EmptyState>
  </main>;
}
