import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Staff access",
};

const linkClass = "font-medium text-ink underline underline-offset-4 hover:text-gold";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Staff accounts are invite-only"
      description="Patchwork is the internal repair desk. Owners and managers create staff accounts with a temporary password."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className={linkClass}>
            Sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-4 text-[13.5px] leading-6 text-muted">
        <p>
          Ask an owner or manager to add you from the <span className="text-ink">Team</span> page.
          They will give you the email and temporary password for your first sign-in.
        </p>
        <div className="rounded bg-paper p-3.5">
          <p className="text-[11.5px] text-muted">After your first sign-in</p>
          <p className="mt-1 text-[12.5px] text-ink">
            Change the temporary password from “Forgot password” on the sign-in screen.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex h-9 w-full items-center justify-center rounded bg-wash text-[13px] font-medium text-ink transition-colors hover:bg-line"
        >
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
