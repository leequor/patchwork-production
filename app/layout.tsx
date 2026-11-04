import type { Metadata, Viewport } from "next";
import { Libre_Franklin, Source_Serif_4 } from "next/font/google";

import { APP_DESCRIPTION, APP_NAME, getSiteUrl } from "@/lib/config";

import "./globals.css";

const display = Libre_Franklin({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const text = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-text",
  display: "swap",
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
  themeColor: "#E9E6DE",
  colorScheme: "light",
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
      className={`${display.variable} ${text.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
