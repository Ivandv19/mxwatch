import type { MetadataRoute } from 'next'

/**
 * Configuración del archivo robots.txt para motores de búsqueda.
 * Define qué rutas pueden ser rastreadas por los bots (SEO).
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*', // Aplica a todos los buscadores (Google, Bing, etc.)
            allow: '/',    // Permite el rastreo de todo el sitio
        },
        sitemap: 'https://mxwatch.mgdc.site/sitemap.xml', // Referencia al Mapa del Sitio
    }
}
