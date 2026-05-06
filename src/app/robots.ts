import type { MetadataRoute } from "next";

/**
 * Configuración dinámica de robots.txt para directivas de rastreo SEO.
 */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*", // Aplica a todos los motores de búsqueda
			allow: "/", // Permite el rastreo completo del sitio
		},
		sitemap: "https://mxwatch.mgdc.site/sitemap.xml", // Ubicación del sitemap para indexación eficiente
	};
}
