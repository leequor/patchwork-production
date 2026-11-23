import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The dev indicator sits on top of the bench in design screenshots.
  devIndicators: false,
};

export default nextConfig;
