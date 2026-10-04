import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Meeting not found</h1>
      <p className="mt-4 text-slate-600">This meeting is not in the seed library.</p>
      <Link href="/" className="mt-6 inline-block font-medium text-teal-700">← Back to library</Link>
    </main>
  );
}
