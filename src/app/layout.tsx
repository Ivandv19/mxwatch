// biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD para SEO
import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

// Configuración de tipografías optimizadas con Google Fonts
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
 * Metadatos globales para SEO, OpenGraph y Twitter Cards.
 */
export const metadata: Metadata = {
	title: "mxwatch — Mapa de seguridad en México",
	description:
		"Plataforma interactiva para visualizar el control territorial de carteles y eventos de seguridad en toda la República Mexicana.",
	keywords: [
		"México",
		"seguridad",
		"carteles",
		"mapa",
		"crimen organizado",
		"visualización territorial",
	],
	icons: { icon: "/favicon.png" },
	openGraph: {
		title: "mxwatch",
		description: "Mapa interactivo de seguridad en México",
		url: "https://mxwatch.mgdc.site",
		siteName: "mxwatch",
		images: [{ url: "/og-image.png", width: 1200, height: 630 }],
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
 * Layout raíz de la aplicación: estructura HTML, fuentes, SEO técnico y componentes persistentes.
 */
export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	// Datos Estructurados (JSON-LD) para rich snippets en buscadores
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: "mxwatch",
		description:
			"Mapa interactivo de seguridad y control territorial en México.",
		url: "https://mxwatch.mgdc.site",
		applicationCategory: "PublicInformation",
		genre: "Security & Analysis",
		browserRequirements: "Requires JavaScript",
		operatingSystem: "All",
	};

	return (
		<html lang="es" className="dark">
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>

				{/* Analytics respetuoso con la privacidad (Umami) */}
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
				{/* Contenedor principal con offset para navbar fijo */}
				<main className="flex-1 w-full pt-[64px]">{children}</main>
				<Footer />
			</body>
		</html>
	);
}
