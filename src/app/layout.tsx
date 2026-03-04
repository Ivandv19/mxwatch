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
  keywords: ["México", "seguridad", "carteles", "mapa", "crimen organizado"],
  openGraph: {
    title: "mxwatch",
    description: "Mapa interactivo de seguridad en México",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
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
