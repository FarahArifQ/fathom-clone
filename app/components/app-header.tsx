"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "./ui-icon";

export default function AppHeader() {
  const router = useRouter();
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      const search = document.getElementById("meeting-search");
      if (search) search.focus();
      else router.push("/#meeting-search");
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, [router]);
  return <header className="app-header glass sticky top-0 z-50 border-x-0 border-t-0">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
      <Link href="/" className="flex min-h-10 min-w-0 items-center gap-3 rounded-lg font-semibold">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-on-accent"><Icon name="note" /></span>
        <span className="truncate">Meeting Notes</span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/#meeting-search" onClick={(event) => {
          const search = document.getElementById("meeting-search");
          if (search) { event.preventDefault(); search.focus(); }
        }} className="button button-ghost">
          <Icon name="search" /><span>Search</span><kbd className="hidden text-meta sm:inline">Ctrl / ⌘ K</kbd>
        </Link>
      </nav>
    </div>
  </header>;
}
