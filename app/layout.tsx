import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NFL XOs - Análisis Táctico Profesional",
  description: "Scoreboard en vivo, Power Ranking editorial, y tácticas ofensivas/defensivas. Análisis profesional de fútbol americano.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
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
