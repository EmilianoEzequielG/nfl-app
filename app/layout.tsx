import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Balón Suelto - Análisis Táctico NFL",
  description: "Scoreboard en vivo, Power Ranking editorial, y tácticas ofensivas/defensivas. Análisis profesional de fútbol americano.",
  applicationName: "Balón Suelto",
  openGraph: {
    title: "Balón Suelto",
    // siteName es el que muestran WhatsApp, Twitter y Facebook como origen del enlace
    siteName: "Balón Suelto",
    description: "Scoreboard en vivo, Power Ranking editorial y guía táctica de la NFL.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Balón Suelto",
    description: "Scoreboard en vivo, Power Ranking editorial y guía táctica de la NFL.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col font-outfit">{children}</body>
    </html>
  );
}
