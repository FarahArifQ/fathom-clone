import { Skeleton } from "@/app/components/ui";

export default function LoadingMeeting() {
  return <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8" role="status" aria-label="Loading meeting">
    <p className="mb-5 text-meta text-secondary">Loading meeting…</p>
    <Skeleton className="h-8 w-3/4" /><Skeleton className="mt-4 mb-8 h-5 w-1/2" />
    <div className="grid gap-6 min-[800px]:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
      <div className="panel space-y-5 p-5"><Skeleton className="h-10 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-5 w-full" /></div>
      <div className="glass hidden space-y-5 rounded-xl p-5 min-[800px]:block"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
    </div>
  </main>;
}
