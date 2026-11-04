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
          "h-10 w-full rounded-sm border border-line bg-raised px-2.5 font-sans text-[13px] text-ink",
          "outline-none transition-colors duration-150 hover:border-[#B8B2A6] focus:border-accent",
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
        {hint ? <span className="font-sans text-[13px] text-muted">{hint}</span> : null}
      </div>
      <textarea
        id={id}
        className={cn(
          "min-h-[96px] w-full rounded-sm border border-line bg-raised px-2.5 py-2 font-serif text-[15px] leading-6 text-ink",
          "outline-none transition-colors duration-150 placeholder:text-muted/60 hover:border-[#B8B2A6] focus:border-accent",
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
      className="flex min-h-11 cursor-pointer items-start gap-2.5 rounded-sm bg-paper px-2.5 py-2.5"
    >
      <input
        id={id}
        name={id}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 rounded-none border-line bg-raised accent-[#CE3F1B]"
      />
      <span>
        <span className="block font-sans text-[13px] font-semibold text-ink">{label}</span>
        {description ? (
          <span className="mt-0.5 block font-serif text-[13px] leading-5 text-muted">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
