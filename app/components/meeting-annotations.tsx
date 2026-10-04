import type { Annotation } from "@/lib/interaction-schema";
import EmptyPanel from "./empty-panel";
import TimestampButton from "./timestamp-button";
import TranscriptText from "./transcript-text";

export default function MeetingAnnotations({ annotations, onJump }: { annotations: Annotation[]; onJump: (seconds: number) => void }) {
  if (!annotations.length) return <EmptyPanel title="Annotations" description="No annotations yet. Highlight a transcript line to save it here." />;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
      <h2 className="text-lg font-semibold">Annotations</h2>
      <ul className="mt-4 divide-y divide-slate-100">
        {annotations.map((annotation) => (
          <li key={annotation.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-teal-800 capitalize">{annotation.type}</span>
              <TimestampButton seconds={annotation.timestamp_seconds} onJump={onJump} />
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-700"><TranscriptText text={annotation.note} onJump={onJump} /></p>
          </li>
        ))}
      </ul>
    </section>
  );
}
