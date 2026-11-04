import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
};

function readParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string | string[]; error?: string | string[] }>;
}) {
  const params = await searchParams;

  return (
    <AuthCard
      title="Sign in"
      description="Your staff email and password open the desk. The session is held in a secure cookie."
      footer={<p>Invited by an owner or manager? Use the temporary password they gave you, then set your own.</p>}
    >
      <LoginForm notice={readParam(params.message)} errorNotice={readParam(params.error)} />
    </AuthCard>
  );
}
