import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppHeader from "./components/app-header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Meeting Notes", template: "%s | Meeting Notes" },
  description: "Find your meetings, revisit the transcript, and turn conversations into clear notes and next steps. Fictional seed meetings for this demo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a href="#content" className="skip-link">Skip to content</a>
        <AppHeader />
        <div id="content" className="flex flex-1 flex-col">{children}</div>
        <footer className="mx-auto w-full max-w-6xl border-t border-border px-4 py-6 text-meta font-medium text-muted sm:px-8">Meeting Notes · Transcript review, summaries and next steps.</footer>
      </body>
    </html>
  );
}
