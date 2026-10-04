import { Skeleton } from "./ui";

export default function LibrarySkeleton({ controls = false }: { controls?: boolean }) {
  return <div role="status" aria-label="Loading meetings" className="space-y-4">
    <p className="text-meta font-medium text-muted">Loading meetings…</p>
    {controls && <><Skeleton className="h-5 w-64" /><Skeleton className="mb-8 h-14 w-full" /></>}
    {[0, 1, 2].map((row) => <div key={row} className="panel space-y-4 p-5 sm:p-6">
      <Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-3/4" />
      <div className="flex justify-between gap-4"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-8 w-24" /></div>
    </div>)}
  </div>;
}
