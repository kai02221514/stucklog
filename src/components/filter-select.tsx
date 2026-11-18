"use client";

import { useEffect, useRef, useState } from "react";

export type SelectOption<T extends string = string> = {
  label: string;
  value: T;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none">
      <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FilterSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  mode = "filter",
}: {
  label: string;
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  mode?: "filter" | "select";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];
  const isUnfiltered = value === "all";
  const displayValue = mode === "select" ? selected.label : isUnfiltered ? label : `${label}：${selected.label}`;
  const buttonLabel = mode === "select"
    ? `${label}を選択：${selected.label}`
    : isUnfiltered
      ? `${label}で絞り込む`
      : `${label}で絞り込む：${selected.label}`;

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        aria-label={buttonLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between gap-3 rounded-md border border-[#cbd5e1] bg-white px-4 text-left text-sm text-[#475569] outline-none transition hover:border-[#94a3b8] focus-visible:border-[#2563eb] focus-visible:ring-2 focus-visible:ring-[#dbeafe]"
      >
        <span className="min-w-0 truncate">{displayValue}</span>
        <ChevronIcon open={open} />
      </button>
      {open ? (
        <div role="listbox" aria-label={`${label}の候補`} className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-full overflow-hidden rounded-lg border border-[#e2e8f0] bg-white p-1.5 shadow-[0_16px_36px_rgba(15,23,42,0.14)]">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center rounded-md px-3 py-2.5 text-left text-sm transition ${isSelected ? "bg-[#eff6ff] font-medium text-[#1d4ed8]" : "text-[#334155] hover:bg-[#f8fafc]"}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
