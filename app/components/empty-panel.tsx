import type { ReactNode } from "react";

export function SidebarSection({ title, count, status, children }: {
  title: string; count: number; status?: string; children: ReactNode;
}) {
  return <section className="min-w-0 border-b border-border px-5 py-6 last:border-b-0">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2>{title}</h2><span className="rounded-lg bg-surface-raised px-2 py-1 text-meta font-medium text-secondary tabular-nums">{count}</span>
    </div>
    {status && <p className="mb-4 text-meta font-medium text-secondary" role="status">{status}</p>}
    {children}
  </section>;
}

export default function EmptyPanel({ title, description }: { title: string; description: string }) {
  return <SidebarSection title={title} count={0}><p className="text-secondary">{description}</p></SidebarSection>;
}
