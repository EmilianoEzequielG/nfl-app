import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "NFL XOs - Análisis Táctico Profesional",
  description: "Scoreboard en vivo, Power Ranking editorial, y tácticas ofensivas/defensivas. Análisis profesional de fútbol americano.",
  openGraph: {
    title: "NFL XOs",
    description: "Análisis táctico profesional de la NFL",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col font-outfit">{children}</body>
    </html>
  );
}
