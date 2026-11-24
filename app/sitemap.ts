import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/config";

/**
 * Only the pages a customer or an operator could land on without a session.
 * A sitemap that lists the workspace would advertise doors that redirect.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/track`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/status`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
