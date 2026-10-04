export default function ParticipantAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  return (
    <span title={name} aria-label={name} className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-raised text-meta font-semibold text-secondary">
      {initials}
    </span>
  );
}
