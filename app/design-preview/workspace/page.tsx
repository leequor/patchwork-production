import { notFound } from "next/navigation";

import { MissionControl } from "@/components/workspace/mission-control";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { PREVIEW_DASHBOARD, PREVIEW_QUEUE, PREVIEW_USER } from "@/lib/preview/fixtures";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Mission control preview" };

import type { Metadata } from "next";

/**
 * Design review surface for the workspace. Renders the real Mission Control
 * and the real shell against fixture data so the bench can be inspected
 * without a Supabase project. Local only — 404s in any other environment.
 */
export default function WorkspacePreviewPage() {
  if (process.env.NEXT_PUBLIC_DESIGN_PREVIEW !== "true") {
    notFound();
  }

  return (
    <WorkspaceShell user={PREVIEW_USER}>
      <MissionControl queue={PREVIEW_QUEUE} {...PREVIEW_DASHBOARD} />
    </WorkspaceShell>
  );
}
