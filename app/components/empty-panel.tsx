export default function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-5 border-t border-slate-100 pt-5">
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </section>
  );
}
