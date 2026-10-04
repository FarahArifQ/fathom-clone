export default function ParticipantAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  return (
    <span title={name} aria-label={name} className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white bg-slate-100 text-xs font-semibold text-slate-700">
      {initials}
    </span>
  );
}
