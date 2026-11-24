import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Sans } from "next/font/google";

import { APP_DESCRIPTION, APP_NAME, getSiteUrl } from "@/lib/config";

import { AmbientField } from "@/components/patchwork/ambient-field";
import { PointerDust } from "@/components/patchwork/pointer-dust";

import "./globals.css";

/**
 * Two faces, both sourced for the job they do. Instrument Sans is drawn for
 * interfaces on screens and carries the product's voice at display sizes;
 * IBM Plex Mono sets the ticket codes, tracking codes and money, where figures
 * have to line up in a column.
 */
const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#09080F",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${mono.variable}`}
    >
      <body>
        <AmbientField />
        {/*
          Dust, over every page and every panel. It sits above the content on
          purpose: it is the air in the room, so a workspace panel must not hide
          it. `pointer-events-none` keeps it out of the way of clicks, and its
          opacity keeps it out of the way of reading.
        */}
        <PointerDust className="pointer-events-none fixed inset-0 z-[45] h-full w-full opacity-55" />
        {children}
      </body>
    </html>
  );
}
