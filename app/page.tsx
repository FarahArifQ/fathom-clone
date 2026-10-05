import type { Metadata } from "next";
import Link from "next/link";
import LandingMotion from "./components/landing-motion";
import LandingPreview from "./components/landing-preview";
import Icon, { type IconName } from "./components/ui-icon";
import { Tag } from "./components/ui";

export const metadata: Metadata = {
  title: { absolute: "Meeting Notes | Clear next steps after every meeting" },
  description: "Turn a meeting transcript into short notes, checkable actions and answers with source citations. Explore an open demo with fictional meetings.",
};

const steps = [
  { title: "Add a meeting", text: "Meetings are already added for this demo. Choose a prepared transcript from the library." },
  { title: "Get a short summary and action items", text: "Generate Decisions and Key points, then check off the tasks as you finish them." },
  { title: "Ask questions and jump to the moment", text: "Ask what you need to know. Follow a citation back to the speaker and the exact line." },
];
const differences: { icon: IconName; title: string; text: string }[] = [
  { icon: "note", title: "Short notes, distinct points", text: "Decisions and Key points stay separate. The summary is designed to avoid saying the same thing twice." },
  { icon: "link", title: "Answers with a source", text: "Every supported Ask answer cites transcript moments. When the evidence is missing, it says so. Summary points link when source times are saved." },
  { icon: "owner", title: "Missing owners stay visible", text: "Unassigned action items are flagged, so an important next step does not disappear between people." },
];

export default function Home() {
  return <LandingMotion>
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-8">
      <section id="overview" tabIndex={-1} aria-labelledby="overview-title" className="grid items-center gap-10 pt-12 pb-16 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-12 lg:pt-20 lg:pb-24">
        <div className="min-w-0">
          <p className="mb-5 text-meta font-medium text-accent">For the moment after the meeting</p>
          <h1 id="overview-title" className="max-w-xl text-[40px] leading-[1.1] tracking-tight sm:text-[52px]">The meeting ends.<br />The next step is clear.</h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-secondary">Turn a meeting into a short summary, checkable action items, and answers that point to the exact moment.</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link href="/library" className="button button-primary min-h-12 px-6">Try the demo<Icon name="arrow" /></Link>
            <Link href="/meetings/m5" className="inline-flex min-h-12 items-center gap-2 rounded-lg text-meta font-semibold text-secondary hover:text-accent">See a sample meeting<Icon name="arrow" className="size-4" /></Link>
          </div>
          <p className="mt-5 text-meta text-muted">Open demo. Fictional meetings. No sign-in.</p>
        </div>
        <LandingPreview />
      </section>

      <section id="how-it-works" tabIndex={-1} aria-labelledby="how-title" data-reveal className="border-t border-border py-16 sm:py-20">
        <p className="mb-3 text-meta font-medium text-accent">How it works</p>
        <h2 id="how-title" className="text-3xl">A clear path from conversation to action</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0">
          {steps.map((step, index) => <li key={step.title} className="border-t border-border pt-6 md:border-t-0 md:border-l md:px-6 md:pt-0 md:first:border-l-0 md:first:pl-0 md:last:pr-0">
            <span aria-hidden="true" className="text-meta font-semibold text-accent tabular-nums">0{index + 1}</span>
            <h3 className="mt-3 text-lg">{step.title}</h3>
            <p className="mt-3 text-secondary">{step.text}</p>
          </li>)}
        </ol>
      </section>

      <section id="what-is-different" tabIndex={-1} aria-labelledby="different-title" data-reveal className="border-t border-border py-16 sm:py-20">
        <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div>
            <p className="mb-3 text-meta font-medium text-accent">What is different</p>
            <h2 id="different-title" className="text-3xl">Useful notes.<br />Evidence you can follow.</h2>
            <p className="mt-4 max-w-sm text-secondary">Keep the useful parts of the conversation close to their source.</p>
          </div>
          <ul className="divide-y divide-border">
            {differences.map((item) => <li key={item.title} className="flex gap-4 py-6 first:pt-0 last:pb-0">
              <Icon name={item.icon} className="mt-1 size-6 shrink-0 text-accent" />
              <div className="min-w-0"><h3 className="text-lg">{item.title}</h3><p className="mt-2 text-secondary">{item.text}</p>
                {item.icon === "owner" && <div className="mt-3"><Tag tone="warning">Needs owner</Tag></div>}
              </div>
            </li>)}
          </ul>
        </div>
      </section>

      <aside aria-label="About this demo" data-reveal className="flex items-start gap-4 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <Icon name="info" className="mt-1 size-5 shrink-0 text-accent" />
        <div><h2 className="text-lg">A small, honest demo</h2><p className="mt-2 text-secondary">The meetings and people are fictional seed data. Recording and live capture are not included. Summaries and Ask use AI when you request them.</p></div>
      </aside>

      <section id="library" tabIndex={-1} aria-labelledby="library-title" data-reveal className="py-16 text-center sm:py-20">
        <h2 id="library-title" className="text-3xl">Start with a conversation</h2>
        <p className="mx-auto mt-4 max-w-lg text-secondary">Open the library, choose a meeting, and follow the next step back to what was said.</p>
        <Link href="/library" className="button button-primary mt-7 min-h-12 px-6">Try the demo<Icon name="arrow" /></Link>
      </section>
    </main>
  </LandingMotion>;
}
