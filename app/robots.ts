import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/config";

/**
 * The desk is internal. Only the public pages are offered to crawlers: the
 * tracker, the status board, the front door and the legal-ish marker pages.
 * Anything under /(workspace) is behind a session and must not be indexed even
 * if a crawler follows a link — the layout sends it to the sign-in screen.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/track", "/status", "/login"],
        disallow: ["/api/", "/auth/", "/tickets", "/inventory", "/invoices", "/customers", "/team"],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
