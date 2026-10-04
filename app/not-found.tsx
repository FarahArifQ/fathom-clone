import Link from "next/link";
import Icon from "./components/ui-icon";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Meeting not found</h1>
      <p className="mt-4 text-secondary">This meeting is not in your library.</p>
      <Link href="/" className="mt-6 inline-flex min-h-10 items-center gap-2 font-medium text-accent"><Icon name="arrow" className="size-5 rotate-180" />Back to library</Link>
    </main>
  );
}
