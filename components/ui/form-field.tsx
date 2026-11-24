import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  labelExtra?: ReactNode;
  /** Sits inside the field's right edge — a reveal toggle, a unit, an icon. */
  trailing?: ReactNode;
};

export function FormField({
  id,
  label,
  hint,
  error,
  labelExtra,
  trailing,
  className,
  ...inputProps
}: FormFieldProps) {
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="font-sans text-[13px] font-medium text-ink"
        >
          {label}
        </label>
        {labelExtra ? (
          <span className="font-sans text-[13px] text-ink-secondary">{labelExtra}</span>
        ) : hint ? (
          <span id={`${id}-hint`} className="font-sans text-[13px] text-ink-secondary">
            {hint}
          </span>
        ) : null}
      </div>
      <div className="relative">
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "h-11 w-full rounded-sm border border-hairline-strong bg-[#07060d] px-3 font-sans text-[16px] text-ink",
            "shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)] outline-none",
            "transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "placeholder:text-ink-tertiary hover:ring-white/[0.16]",
            "focus:border-accent/70 focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.9),0_0_0_3px_rgba(110,92,247,0.20)] focus-visible:outline-none",
            error ? "border-negative focus:border-negative" : null,
            trailing ? "pr-11" : null,
            className,
          )}
          {...inputProps}
        />
        {trailing ? (
          <span className="absolute inset-y-0 right-1 flex items-center">{trailing}</span>
        ) : null}
      </div>
      {hint && labelExtra ? (
        <p id={`${id}-hint`} className="font-sans text-[13px] leading-5 text-ink-secondary">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="font-sans text-[13px] leading-5 text-negative">
          {error}
        </p>
      ) : null}
    </div>
  );
}
