import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function SelectField({
  id,
  label,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="font-sans text-[13px] font-semibold text-ink">
        {label}
      </label>
      <select
        id={id}
        className={cn(
          "h-10 w-full rounded-lg border border-hairline bg-raised px-2.5 font-sans text-[13px] text-ink",
          "outline-none transition-[border-color,box-shadow] duration-150 hover:border-hairline-strong focus:border-accent focus:ring-2 focus:ring-accent/40 focus-visible:outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function TextAreaField({
  id,
  label,
  hint,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-sans text-[13px] font-semibold text-ink">
          {label}
        </label>
        {hint ? <span className="font-sans text-[13px] text-ink-secondary">{hint}</span> : null}
      </div>
      <textarea
        id={id}
        className={cn(
          "min-h-[96px] w-full rounded-lg border border-hairline bg-raised px-2.5 py-2 font-sans text-[15px] leading-6 text-ink",
          "outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-secondary/60 hover:border-hairline-strong focus:border-accent focus:ring-2 focus:ring-accent/40 focus-visible:outline-none",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function CheckboxField({
  id,
  label,
  description,
  defaultChecked,
}: {
  id: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-11 cursor-pointer items-start gap-2.5 rounded-lg bg-canvas px-2.5 py-2.5 transition-colors duration-150 hover:bg-raised/60"
    >
      <input
        id={id}
        name={id}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 rounded border-hairline bg-raised accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      />
      <span>
        <span className="block font-sans text-[13px] font-semibold text-ink">{label}</span>
        {description ? (
          <span className="mt-0.5 block font-sans text-[13px] leading-5 text-ink-secondary">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
