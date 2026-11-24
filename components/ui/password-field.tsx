"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { FormField, type FormFieldProps } from "./form-field";

/**
 * A password field that can be read back.
 *
 * Typing blind on a phone keyboard is the most common way a first sign-in fails,
 * and it fails silently — you cannot see that you dropped a capital. So the eye
 * is always there, not revealed after an error.
 *
 * The toggle is a real button: `aria-pressed` announces the state, the label
 * changes with it, and the icon is not the only cue (the icon itself swaps
 * between eye and eye-with-slash for anyone who reads shapes rather than labels).
 * It is `type="button"` so it can never submit the form.
 *
 * Focus order is deliberate: the eye comes after the field, so tabbing from the
 * field reaches "reveal" before "submit" — where you would want it at the moment
 * you realise you cannot see what you typed.
 */
export function PasswordField({
  className,
  ...props
}: Omit<FormFieldProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      {...props}
      type={visible ? "text" : "password"}
      className={className}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((shown) => !shown)}
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
          title={visible ? "Hide password" : "Show password"}
          className={cn(
            "grid h-9 w-9 place-items-center rounded-full text-ink-tertiary",
            "transition-colors duration-150 hover:bg-white/[0.06] hover:text-ink",
            "focus-visible:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
            "active:scale-[0.94]",
            visible && "text-accent-bright",
          )}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
          )}
        </button>
      }
    />
  );
}
