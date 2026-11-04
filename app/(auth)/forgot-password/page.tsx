import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
};

const linkClass = "font-sans font-semibold text-ink underline underline-offset-4 hover:text-accent";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter your account email. If it matches, a single-use reset link is sent."
      footer={
        <p>
          Remembered it?{" "}
          <Link href="/login" className={linkClass}>
            Back to sign in
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
