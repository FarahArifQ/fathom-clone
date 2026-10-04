import type { Annotation } from "@/lib/interaction-schema";
import EmptyPanel from "./empty-panel";
import TimestampButton from "./timestamp-button";
import TranscriptText from "./transcript-text";
import { Panel } from "./ui";

export default function MeetingAnnotations({ annotations, onJump }: { annotations: Annotation[]; onJump: (seconds: number) => void }) {
  if (!annotations.length) return <EmptyPanel title="Annotations" description="No annotations yet. Highlight a transcript line to save it here." />;
  return (
    <Panel glass className="p-5 sm:p-7">
      <h2 className="text-lg font-semibold">Annotations</h2>
      <ul className="mt-4 divide-y divide-border">
        {annotations.map((annotation) => (
          <li key={annotation.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <span className="text-meta font-medium text-accent capitalize">{annotation.type}</span>
              <TimestampButton seconds={annotation.timestamp_seconds} onJump={onJump} />
            </div>
            <p className="mt-2 text-base leading-7 text-secondary"><TranscriptText text={annotation.note} onJump={onJump} /></p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
