"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import type { Meeting } from "@/lib/meetings";
import type { Annotation, SavedSummary } from "@/lib/interaction-schema";
import MeetingTranscript from "./meeting-transcript";
import ParticipantAvatar from "./participant-avatar";
import MeetingSummaryPanel from "./meeting-summary";
import MeetingInsights from "./meeting-insights";
import { useMeetingSummary } from "./use-meeting-summary";
import { useMeetingInteractions } from "./use-meeting-interactions";
import MeetingAnnotations from "./meeting-annotations";
import MeetingAsk from "./meeting-ask";
import MeetingToast from "./meeting-toast";
import ChapterLinks from "./chapter-links";
import { SidebarSection } from "./empty-panel";
import { Button, Tabs } from "./ui";

const tabs = ["Summary", "Transcript", "Ask", "Details"] as const;
type Tab = typeof tabs[number];
type ReadingTab = "Summary" | "Transcript";

export default function MeetingWorkspace({ meeting, initialSummary, initialAnnotations, initialSeconds }: {
  meeting: Meeting; initialSummary: SavedSummary | null; initialAnnotations: Annotation[]; initialSeconds?: number;
}) {
  const initialLine = initialSeconds === undefined ? undefined : meeting.transcript.findLast((line) => line.startSeconds <= initialSeconds);
  const initialTab = initialLine ? "Transcript" : "Summary";
  const [active, setActive] = useState<Tab>(initialTab);
  const [contentTab, setContentTab] = useState<Exclude<Tab, "Details">>(initialTab);
  const [lastReadingTab, setLastReadingTab] = useState<ReadingTab>(initialTab);
  const [target, setTarget] = useState<{ seconds: number; visit: number } | null>(initialLine ? { seconds: initialLine.startSeconds, visit: 1 } : null);
  const { summary, generating, error, generate, updateAction } = useMeetingSummary(meeting.id, initialSummary);
  const interactions = useMeetingInteractions(meeting.id, initialAnnotations, updateAction);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 800px)");
    const restoreContentTab = () => {
      if (desktop.matches) setActive((current) => current === "Details" ? contentTab : current);
    };
    desktop.addEventListener("change", restoreContentTab);
    return () => desktop.removeEventListener("change", restoreContentTab);
  }, [contentTab]);

  function selectTab(tab: Tab) {
    setActive(tab);
    if (tab !== "Details") setContentTab(tab);
    if (tab === "Summary" || tab === "Transcript") setLastReadingTab(tab);
  }
  function jumpToTranscript(seconds: number) {
    const line = meeting.transcript.findLast((segment) => segment.startSeconds <= seconds) ?? meeting.transcript[0];
    if (!line) return;
    selectTab("Transcript");
    setTarget((current) => ({ seconds: line.startSeconds, visit: (current?.visit ?? 0) + 1 }));
  }
  function navigateTabs(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button")).filter((button) => button.getClientRects().length > 0);
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1
      : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
    event.preventDefault(); buttons[next].focus(); buttons[next].click();
  }

  return <div className="grid items-start gap-6 min-[800px]:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
    {interactions.error && <div role="alert" className="rounded-lg border border-warning/40 bg-warning-soft p-4 min-[800px]:col-span-2">
      <p className="text-warning">{interactions.error}</p>
      <Button variant="ghost" onClick={() => void interactions.retry?.()} className="mt-2">Retry saving</Button>
    </div>}
    <div className="min-w-0">
      <Tabs aria-label="Meeting sections" onKeyDown={navigateTabs} className="mb-5 gap-2 sm:gap-4">
        {tabs.map((tab) => <button key={tab} id={`tab-${tab}`} role="tab" aria-selected={active === tab} aria-controls={`panel-${tab}`}
          tabIndex={active === tab ? 0 : -1} onClick={() => selectTab(tab)}
          className={`tab flex-1 ${tab === "Details" ? "min-[800px]:hidden" : ""}`}>{tab}</button>)}
      </Tabs>
      <div className={active === "Details" ? "hidden min-[800px]:block" : ""}>
      {meeting.durationMinutes >= 30 && !!summary?.chapters.length && contentTab !== "Ask" && <section aria-label="Chapter outline" className="mb-4">
        <p className="mb-2 text-meta font-medium text-secondary">Chapter outline</p>
        <ChapterLinks chapters={summary.chapters} activeSeconds={target?.seconds} onJump={jumpToTranscript} strip />
      </section>}
      <div hidden={contentTab === "Ask"} className="overflow-clip rounded-xl border border-border bg-surface">
        <div id="panel-Summary" role="tabpanel" aria-labelledby="tab-Summary" tabIndex={0} hidden={contentTab !== "Summary"}>
          <MeetingSummaryPanel meeting={meeting} summary={summary} generating={generating} error={error} onGenerate={generate} onJump={jumpToTranscript} />
        </div>
        <div id="panel-Transcript" role="tabpanel" aria-labelledby="tab-Transcript" tabIndex={0} hidden={contentTab !== "Transcript"}>
          <MeetingTranscript key={target?.visit ?? 0} meeting={meeting} targetSeconds={target?.seconds}
            annotations={interactions.annotations} pending={interactions.pending} onHighlight={interactions.highlight} onJump={jumpToTranscript} />
        </div>
      </div>
      <MeetingAsk meetingId={meeting.id} open={contentTab === "Ask" && active !== "Details"} onOpen={() => selectTab("Ask")}
        onClose={() => { selectTab(lastReadingTab); document.getElementById(`tab-${lastReadingTab}`)?.focus(); }} onJump={jumpToTranscript} />
      </div>
    </div>
    <aside id="panel-Details" role="tabpanel" aria-label="Meeting details" aria-labelledby={active === "Details" ? "tab-Details" : undefined}
      tabIndex={0} className={`${active !== "Details" ? "hidden min-[800px]:block" : ""} meeting-sidebar glass thin-scrollbar min-w-0 overflow-y-auto rounded-xl`}>
      <MeetingInsights summary={summary} activeSeconds={target?.seconds} onJump={jumpToTranscript} pending={interactions.pending} onComplete={interactions.completeAction} />
      <SidebarSection title="Attendees" count={meeting.participants.length}>
        {meeting.participants.length ? <ul className="space-y-3">{meeting.participants.map((name) =>
          <li key={name} className="flex items-center gap-3 text-secondary"><ParticipantAvatar name={name} /><span className="min-w-0 break-words">{name}</span></li>)}</ul>
          : <p className="text-secondary">No attendees are listed for this meeting.</p>}
      </SidebarSection>
      <MeetingAnnotations annotations={interactions.annotations} onJump={jumpToTranscript} />
    </aside>
    {interactions.notice && <MeetingToast key={interactions.notice.id} notice={interactions.notice} busy={!!interactions.pending.size} onDismiss={interactions.dismissNotice} />}
  </div>;
}
