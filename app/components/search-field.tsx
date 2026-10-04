"use client";

import { useId, type ReactNode } from "react";
import Icon from "./ui-icon";

export default function SearchField({ id, label, value, onChange, maxLength, shortcut = false, children }: {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  shortcut?: boolean;
  children?: ReactNode;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-meta font-medium text-secondary">{label}</label>
        {shortcut && <kbd id={`${inputId}-hint`} className="text-meta font-medium text-muted">Ctrl / ⌘ K to focus</kbd>}
      </div>
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
        <input id={inputId} type="search" value={value} maxLength={maxLength} aria-describedby={shortcut ? `${inputId}-hint` : undefined}
          onChange={(event) => onChange(event.target.value)} className={`search-input ${children ? "pr-24" : ""}`} />
        {children}
      </div>
    </div>
  );
}
