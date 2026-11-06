import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-display", weight: ["600", "700", "800"] });
const body = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: "Asteriskos", template: "%s — Asteriskos" },
  description: "Departamento de Latín e Grego",
  appleWebApp: { capable: true, title: "Asteriskos", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F4F6" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0E11" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="gl" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
