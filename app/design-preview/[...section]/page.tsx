import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DesignPreviewContent, isSupportedPreviewSection } from "@/components/workspace/design-preview-pages";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { PREVIEW_USER } from "@/lib/preview/fixtures";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Workspace review | Patchwork" };

/**
 * Read-only, fixture-backed copies of the authenticated workspace screens.
 * The real routes remain protected; this route never reads or writes shop data.
 */
export default async function WorkspaceSectionPreview({
  params,
}: {
  params: Promise<{ section: string[] }>;
}) {
  if (process.env.NEXT_PUBLIC_DESIGN_PREVIEW !== "true") {
    notFound();
  }

  const section = (await params).section.join("/");
  if (!isSupportedPreviewSection(section)) {
    notFound();
  }

  return (
    <WorkspaceShell user={PREVIEW_USER} preview>
      <DesignPreviewContent section={section} />
    </WorkspaceShell>
  );
}
