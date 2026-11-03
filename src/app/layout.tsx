import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Jyotisha Kundli — Vedic birth chart, dasha, panchang & matching",
    template: "%s · Jyotisha Kundli",
  },
  description:
    "Free Vedic astrology software: Swiss Ephemeris birth chart, Vimshottari dasha, divisional charts, panchang, muhurat, Ashtakoot matching, yogas and a printable PDF report.",
  keywords: [
    "kundli",
    "vedic astrology",
    "birth chart",
    "vimshottari dasha",
    "panchang",
    "kundli matching",
    "ashtakoot",
    "jyotisha",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
