"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function LandingMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !("IntersectionObserver" in window)) return;
    const elements = root.current?.querySelectorAll<HTMLElement>("[data-reveal]") ?? [];
    const showAll = () => elements.forEach((element) => { element.dataset.reveal = "visible"; });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { (entry.target as HTMLElement).dataset.reveal = "visible"; observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    elements.forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight) element.dataset.reveal = "visible";
      else { element.dataset.reveal = "pending"; observer.observe(element); }
    });
    const reduce = () => { if (preference.matches) { observer.disconnect(); showAll(); } };
    preference.addEventListener("change", reduce);
    return () => { observer.disconnect(); showAll(); preference.removeEventListener("change", reduce); };
  }, []);
  return <div ref={root} className="landing-motion">{children}</div>;
}
