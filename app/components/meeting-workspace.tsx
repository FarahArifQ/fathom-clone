"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { type Meeting } from "@/lib/meetings";
import EmptyPanel from "./empty-panel";
import MeetingTranscript from "./meeting-transcript";
import ParticipantAvatar from "./participant-avatar";

const tabs = ["Summary", "Transcript", "Details"] as const;
type Tab = typeof tabs[number];

export default function MeetingWorkspace({ meeting }: { meeting: Meeting }) {
  const [active, setActive] = useState<Tab>("Summary");
  const [contentTab, setContentTab] = useState<"Summary" | "Transcript">("Summary");

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const restoreContentTab = () => {
      if (desktop.matches) setActive((current) => current === "Details" ? contentTab : current);
    };
    desktop.addEventListener("change", restoreContentTab);
    return () => desktop.removeEventListener("change", restoreContentTab);
  }, [contentTab]);

  function selectTab(tab: Tab) {
    setActive(tab);
    if (tab !== "Details") setContentTab(tab);
  }

  function navigateTabs(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"))
      .filter((button) => button.getClientRects().length > 0);
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1
      : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
    event.preventDefault();
    buttons[next].focus();
    buttons[next].click();
  }

  return (
    <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <div role="tablist" aria-label="Meeting sections" onKeyDown={navigateTabs} className="mb-5 flex gap-1 rounded-xl border border-slate-200 bg-white p-1.5">
          {tabs.map((tab) => (
            <button key={tab} id={`tab-${tab}`} role="tab" aria-selected={active === tab} aria-controls={`panel-${tab}`} tabIndex={active === tab ? 0 : -1} onClick={() => selectTab(tab)}
              className={`min-h-11 flex-1 rounded-lg px-3 text-sm font-medium transition-colors ${tab === "Details" ? "lg:hidden" : ""} ${active === tab ? "bg-teal-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className={`${active === "Details" ? "hidden lg:block" : ""} overflow-hidden rounded-xl border border-slate-200 bg-white`}>
          <div id="panel-Summary" role="tabpanel" aria-labelledby="tab-Summary" tabIndex={0} hidden={contentTab !== "Summary"}>
            <EmptyPanel title="Summary" description="No summary yet. AI generation is not connected in this seed demo." />
          </div>
          <div id="panel-Transcript" role="tabpanel" aria-labelledby="tab-Transcript" tabIndex={0} hidden={contentTab !== "Transcript"}>
            <MeetingTranscript meeting={meeting} />
          </div>
        </div>
      </div>
      <aside id="panel-Details" role="tabpanel" aria-labelledby="tab-Details" tabIndex={0} className={`${active !== "Details" ? "hidden lg:block" : ""} min-w-0 space-y-6`}>
        <header className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
          <h2 className="mb-4 text-xs font-semibold tracking-wider text-slate-600 uppercase">Attendees · {meeting.participants.length}</h2>
          <ul className="space-y-3">
            {meeting.participants.map((name) => <li key={name} className="flex items-center gap-3 text-sm text-slate-700"><ParticipantAvatar name={name} /><span>{name}</span></li>)}
          </ul>
        </header>
        <EmptyPanel title="Action items" description="No action items yet. Tasks will appear after AI generation is connected." />
        <EmptyPanel title="Annotations" description="No annotations yet. Notes and highlights are not connected in this seed demo." />
      </aside>
    </div>
  );
}
