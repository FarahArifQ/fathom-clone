export default function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-stone-50 px-5 py-7">
        <p className="text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </section>
  );
}
