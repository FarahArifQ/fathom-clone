import { Panel } from "./ui";

export default function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <Panel glass className="p-5 sm:p-7">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-5 border-t border-border pt-5">
        <p className="text-base leading-6 text-secondary">{description}</p>
      </div>
    </Panel>
  );
}
