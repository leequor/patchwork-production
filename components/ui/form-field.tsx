import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  labelExtra?: ReactNode;
};

export function FormField({
  id,
  label,
  hint,
  error,
  labelExtra,
  className,
  ...inputProps
}: FormFieldProps) {
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="font-sans text-[13px] font-semibold tracking-[0.01em] text-ink"
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
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          "h-11 w-full rounded-lg border border-hairline bg-raised px-3 font-sans text-[16px] text-ink",
          "outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-secondary/60",
          "hover:border-hairline-strong focus:border-accent focus:ring-2 focus:ring-accent/40 focus-visible:outline-none",
          error ? "border-negative focus:border-negative" : null,
          className,
        )}
        {...inputProps}
      />
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
