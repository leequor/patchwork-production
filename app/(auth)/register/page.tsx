import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Staff access",
};

const linkClass = "font-sans font-semibold text-ink underline underline-offset-4 hover:text-accent";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Invite-only staff access"
      description="Patchwork is the shop's internal desk. Owners and managers create the account, and you get it with a temporary password."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className={linkClass}>
            Sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-5">
        <p className="font-sans text-[16px] leading-7 text-ink">
          Ask an owner or manager to add you from the <span className="font-semibold">Team</span> page.
          They hand over an email and a temporary password for the first sign-in.
        </p>

        <div className="rounded-sm bg-overlay px-4 py-3.5">
          <p className="font-sans text-[13px] font-semibold text-ink">After your first sign-in</p>
          <p className="mt-1 font-sans text-[14px] leading-6 text-ink-secondary">
            Change the temporary password from “Forgot password” on the sign-in screen. Nobody on
            the desk needs to know it but you.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex h-11 w-full items-center justify-center rounded-sm bg-accent font-sans text-[15px] font-semibold text-white transition-colors hover:bg-accent-deep"
        >
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
