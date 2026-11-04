import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-onAccent hover:bg-gold active:bg-[#8E2A10] disabled:bg-accent/60",
  secondary:
    "bg-wash text-ink hover:bg-[#D2CDC2] active:bg-[#C8C3B8] disabled:opacity-60",
  ghost: "bg-transparent text-muted hover:bg-wash hover:text-ink",
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
        "inline-flex select-none items-center justify-center gap-2 rounded-sm font-sans font-semibold",
        "transition-[background-color,transform,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
