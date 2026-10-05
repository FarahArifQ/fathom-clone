"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Icon from "./ui-icon";
import AppBrand from "./app-brand";
import LandingNav from "./landing-nav";

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      const search = document.getElementById("meeting-search");
      if (search) search.focus();
      else router.push("/library#meeting-search");
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, [router]);
  if (pathname === "/") return <LandingNav />;
  return <header className="app-header glass sticky top-0 z-50 border-x-0 border-t-0">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
      <AppBrand />
      <nav aria-label="Main navigation">
        <Link href="/library#meeting-search" onClick={(event) => {
          const search = document.getElementById("meeting-search");
          if (search) { event.preventDefault(); search.focus(); }
        }} className="button button-ghost">
          <Icon name="search" /><span>Search</span><kbd className="hidden text-meta sm:inline">Ctrl / ⌘ K</kbd>
        </Link>
      </nav>
    </div>
  </header>;
}
