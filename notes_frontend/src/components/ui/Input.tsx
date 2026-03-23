"use client";

import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, className = "", id, ...props }: InputProps) {
  // Hooks must be called unconditionally to satisfy react-hooks/rules-of-hooks.
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <label className="block">
      {label ? <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span> : null}
      <input
        id={inputId}
        aria-describedby={hintId}
        className={
          "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 " +
          "shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 " +
          className
        }
        {...props}
      />
      {hint ? (
        <span id={hintId} className="mt-1 block text-xs text-slate-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
