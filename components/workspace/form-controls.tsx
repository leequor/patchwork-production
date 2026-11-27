import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type SelectControlProps = SelectHTMLAttributes<HTMLSelectElement> & {
  children: ReactNode;
  wrapperClassName?: string;
};

/** Native select behavior with the same inset field, size, and arrow everywhere. */
export function SelectControl({
  children,
  className,
  wrapperClassName,
  ...props
}: SelectControlProps) {
  return (
    <span className={cn("relative block", wrapperClassName)}>
      <select
        className={cn(
          "field-inset h-11 w-full appearance-none rounded border border-hairline bg-raised pl-3 pr-9 font-sans text-[16px] text-ink",
          "outline-none transition-[border-color,box-shadow] duration-150 ease-[var(--ease-out)] hover:border-hairline-strong focus-visible:border-accent-bright focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-55",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary"
      />
    </span>
  );
}

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
      <SelectControl id={id} className={className} {...props}>
        {children}
      </SelectControl>
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
          "field-inset min-h-[96px] w-full rounded border border-hairline bg-raised px-3 py-2 font-sans text-[16px] leading-6 text-ink",
          "outline-none transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] placeholder:text-ink-secondary/60 hover:border-hairline-strong focus:border-accent focus-visible:outline-none",
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
