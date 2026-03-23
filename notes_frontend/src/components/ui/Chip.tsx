"use client";

import * as React from "react";

export interface ChipProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  title?: string;
}

export function Chip({ children, selected, onClick, onRemove, title }: ChipProps) {
  const interactive = Boolean(onClick);
  const base =
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors";
  const styles = selected
    ? "border-blue-200 bg-blue-50 text-blue-700"
    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  if (!interactive) {
    return (
      <span className={`${base} ${styles}`} title={title}>
        {children}
      </span>
    );
  }

  return (
    <span className={`${base} ${styles}`} title={title}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2"
        aria-pressed={selected}
      >
        {children}
      </button>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Remove"
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
