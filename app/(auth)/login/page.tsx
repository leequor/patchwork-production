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
      description="Staff access to the repair desk. The session is held in a secure cookie."
    >
      <LoginForm notice={readParam(params.message)} errorNotice={readParam(params.error)} />
    </AuthCard>
  );
}
