"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AppBrand from "./app-brand";
import { IconButton } from "./ui";

const sections = [
  { id: "overview", label: "Overview", href: "#overview" },
  { id: "how-it-works", label: "How it works", href: "#how-it-works" },
  { id: "what-is-different", label: "What is different", href: "#what-is-different" },
  { id: "library", label: "Library", href: "/library" },
];

export default function LandingNav() {
  const [active, setActive] = useState("overview");
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: "-96px 0px -50% 0px" });
    sections.forEach(({ id }) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);
  function closeMenu() { setOpen(false); trigger.current?.querySelector("button")?.focus(); }
  function links(mobile: boolean) {
    return sections.map((section) => <Link key={section.id} href={section.href} aria-current={active === section.id ? "location" : undefined}
      onClick={() => {
        setOpen(false);
        if (section.href.startsWith("#")) { setActive(section.id); document.getElementById(section.id)?.focus({ preventScroll: true }); }
      }}
      className={`landing-nav-link inline-flex min-h-10 items-center rounded-lg px-3 text-meta font-medium ${mobile ? "w-full" : ""}`}>{section.label}</Link>);
  }
  return <header className="landing-header sticky top-4 z-50 mx-auto mt-4 w-[calc(100%-32px)] max-w-6xl shrink-0"
    onKeyDown={(event) => { if (event.key === "Escape" && open) { event.preventDefault(); closeMenu(); } }}>
    <nav aria-label="Main navigation" className="glass flex h-16 items-center justify-between gap-4 rounded-[var(--radius-capsule)] px-4 sm:px-6">
      <AppBrand />
      <div className="hidden items-center gap-1 min-[800px]:flex">{links(false)}</div>
      <div ref={trigger} className="min-[800px]:hidden">
        <IconButton icon={open ? "close" : "menu"} label={open ? "Close menu" : "Menu"} aria-expanded={open} aria-controls="landing-menu"
          onClick={() => setOpen(!open)} className="px-2" />
      </div>
    </nav>
    <div id="landing-menu" hidden={!open} className="glass absolute inset-x-0 top-[calc(100%+8px)] rounded-xl p-3 min-[800px]:hidden">
      <nav aria-label="Page sections">{links(true)}</nav>
    </div>
  </header>;
}
