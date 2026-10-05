"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import MeetingAsk from "./meeting-ask";

const questions = ["Summarize my meetings", "List open action items"];

export default function LibraryWorkspace({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const chat = useRef<HTMLDivElement>(null);
  const previousScroll = useRef(0);
  useEffect(() => {
    if (!open) return;
    if (window.matchMedia("(max-width: 1099px)").matches) chat.current?.scrollIntoView({ block: "start" });
    (chat.current?.querySelector<HTMLElement>("textarea:enabled") ?? chat.current?.querySelector<HTMLButtonElement>("button[aria-controls]"))?.focus({ preventScroll: true });
  }, [open]);
  function close() {
    setOpen(false);
    requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 1099px)").matches) window.scrollTo({ top: previousScroll.current });
      chat.current?.querySelector<HTMLButtonElement>("button[aria-controls=panel-Ask]")?.focus({ preventScroll: true });
    });
  }
  return <div className={`grid min-w-0 items-start gap-6 ${open ? "min-[1100px]:grid-cols-[minmax(0,1fr)_minmax(0,.7fr)]" : ""}`}>
    <div className="min-w-0">{children}</div>
    <div id="library-ask" ref={chat} className="library-ask min-w-0">
      <MeetingAsk open={open} onOpen={() => { previousScroll.current = window.scrollY; setOpen(true); }} onClose={close} suggestions={questions} />
    </div>
  </div>;
}
