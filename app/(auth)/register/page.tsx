import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Staff access",
};

const linkClass = "tap font-sans font-semibold text-ink underline underline-offset-4 hover:text-accent";

export default function RegisterPage() {
  /* The escape hatch has to be wired to something: `registerAction` already
     refuses unless this flag is set, and until now nothing rendered the form at
     all, so the flag could never do what it promises. */
  const openSignup = process.env.NEXT_PUBLIC_ALLOW_STAFF_SIGNUP === "true";

  if (openSignup) {
    return (
      <AuthCard
        title="Create a staff account"
        description="Open registration is on for this deployment. Owners can close it again from the environment."
        footer={<p>Accounts created here are technicians until an owner changes the role.</p>}
      >
        <RegisterForm />
      </AuthCard>
    );
  }

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
          className="primary inline-flex h-10 w-full items-center justify-center rounded-sm font-sans text-[14px] font-semibold transition-[filter] hover:brightness-[1.06]"
        >
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
