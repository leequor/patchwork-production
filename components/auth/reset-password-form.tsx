"use client";

import { useActionState } from "react";

import { resetPasswordAction } from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { PasswordField } from "@/components/ui/password-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialAuthState } from "@/lib/auth/types";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialAuthState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "error" ? <Alert tone="error">{state.message}</Alert> : null}

      <PasswordField
        id="password"
        name="password"
        label="New password"
        hint="At least 6 characters"
        placeholder="Enter a new password"
        autoComplete="new-password"
        error={state.fieldErrors?.password}
        required
      />

      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm new password"
        placeholder="Type it again"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPassword}
        required
      />

      <SubmitButton pendingText="Updating password...">Update password</SubmitButton>
    </form>
  );
}
