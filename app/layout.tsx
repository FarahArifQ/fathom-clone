import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Meeting Notes", template: "%s | Meeting Notes" },
  description: "A Fathom-inspired meeting library with fictional seed transcript excerpts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a href="#content" className="sr-only focus:not-sr-only focus:bg-white focus:p-4">Skip to content</a>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
            <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
              <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-xl bg-teal-800 text-lg text-white">m</span>
              Meeting Notes
            </Link>
            <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm">
              <Link href="/" className="font-medium text-teal-800">Library</Link>
            </nav>
          </div>
        </header>
        <div id="content" className="flex flex-1 flex-col">{children}</div>
        <footer className="mx-auto w-full max-w-6xl px-5 py-6 text-xs text-slate-500 sm:px-8">Built around the conversation. Inspired by Fathom.</footer>
      </body>
    </html>
  );
}
