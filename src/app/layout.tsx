import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";

// Configuración de tipografías de Google Fonts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Metadatos globales y SEO de la plataforma.
 * Incluye configuraciones para OpenGraph (Redes Sociales) y Twitter Cards.
 */
export const metadata: Metadata = {
  title: "mxwatch — Mapa de seguridad en México",
  description:
    "Plataforma interactiva para visualizar el control territorial de carteles y eventos de seguridad en toda la República Mexicana.",
  keywords: ["México", "seguridad", "carteles", "mapa", "crimen organizado", "visualización territorial"],
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "mxwatch",
    description: "Mapa interactivo de seguridad en México",
    url: "https://mxwatch.mgdc.site",
    siteName: "mxwatch",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "mxwatch — Mapa de seguridad en México",
    description: "Plataforma de visualización de seguridad en México",
    creator: "@mxwatch",
  },
};

/**
 * Layout principal de la aplicación.
 * Define la estructura base (HTML, Head, Body, Navbar, Footer).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Datos Estructurados (JSON-LD) para mejorar el SEO en buscadores
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "mxwatch",
    "description": "Mapa interactivo de seguridad y control territorial en México.",
    "url": "https://mxwatch.mgdc.site",
    "applicationCategory": "PublicInformation",
    "genre": "Security & Analysis",
    "browserRequirements": "Requires JavaScript",
    "operatingSystem": "All",
  };

  return (
    <html lang="es" className="dark">
      <head>
        {/* Inyección de JSON-LD y Analytics (Umami) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src="https://umami.fluxdv.icu/script.js"
          data-website-id="7d9d6a44-ae40-4784-894d-0509fda3ac05"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased flex flex-col min-h-dvh`}
      >
        <Navbar />
        {/* Contenido principal de las páginas con padding para el Navbar fijo */}
        <main className="flex-1 w-full pt-[64px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
