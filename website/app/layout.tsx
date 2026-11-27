import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "11:11 — A little chance. A real connection.",
  description: "Personality-led blind dates, thoughtfully planned around an experience for two. Explore the 11:11 concept.",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
