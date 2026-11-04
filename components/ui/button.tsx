import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-fill text-white shadow-inset-line hover:brightness-110 active:brightness-95 disabled:opacity-60",
  secondary:
    "bg-raised text-ink ring-1 ring-inset ring-hairline hover:bg-overlay active:brightness-95 disabled:opacity-60",
  ghost: "bg-transparent text-ink-secondary hover:bg-overlay hover:text-ink",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-[13px]",
  md: "h-10 px-4 text-[14px]",
  lg: "h-11 px-5 text-[15px]",
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
        "inline-flex select-none items-center justify-center gap-2 rounded-lg font-sans font-semibold",
        "transition-[background-color,transform,color,filter] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
