"use client";

import * as React from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
}

/**
 * Simple Tailwind button consistent with the light/modern style guide.
 */
export function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes: Record<Size, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
  };

  const variants: Record<Variant, string> = {
    primary:
      "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 shadow-sm shadow-blue-500/20",
    secondary:
      "bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 border border-slate-200 shadow-sm",
    danger:
      "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm shadow-red-500/20",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200",
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {leftIcon ? <span aria-hidden="true">{leftIcon}</span> : null}
      {children}
    </button>
  );
}
