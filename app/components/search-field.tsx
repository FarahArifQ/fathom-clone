"use client";

import { useId } from "react";

export default function SearchField({ label, value, onChange, maxLength }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <input id={id} type="search" value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base text-slate-900" />
    </div>
  );
}
