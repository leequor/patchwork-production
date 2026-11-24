import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "quiet";
type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  /* Brass hardware: a metal face with an etched label, not a coloured glow. */
  primary: "primary hover:brightness-[1.06] active:brightness-95 disabled:opacity-55",
  secondary:
    "bg-raised ring-1 ring-inset ring-white/[0.08] text-ink hover:ring-white/[0.16] hover:bg-overlay active:bg-overlay disabled:opacity-55",
  ghost: "bg-transparent text-ink-secondary hover:bg-raised hover:text-ink disabled:opacity-55",
  quiet: "bg-transparent text-ink-tertiary hover:text-ink disabled:opacity-55",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[12px]",
  md: "h-9 px-3.5 text-[13px]",
  lg: "h-11 px-5 text-[14px]",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 rounded-sm font-sans font-semibold",
        "transition-[background-color,border-color,color,filter,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright",
        "active:translate-y-px disabled:pointer-events-none",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
