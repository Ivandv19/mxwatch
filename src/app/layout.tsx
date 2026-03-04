import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

export const metadata: Metadata = {
  title: "mxwatch — Mapa de seguridad en México",
  description:
    "Plataforma interactiva para visualizar el control territorial de carteles y eventos de seguridad en toda la República Mexicana.",
  keywords: ["México", "seguridad", "carteles", "mapa", "crimen organizado", "visualización territorial"],
  openGraph: {
    title: "mxwatch",
    description: "Mapa interactivo de seguridad en México",
    url: "https://mxwatch.mgdc.site",
    siteName: "mxwatch",
    images: [
      {
        url: "/og-image.png", // Ensure this exists or we can generate one
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased flex flex-col min-h-dvh`}
      >
        <Navbar />
        <main className="flex-1 w-full pt-[64px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
