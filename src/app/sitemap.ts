import type { MetadataRoute } from 'next'

/**
 * Generador dinámico del Mapa del Sitio (Sitemap.xml).
 * Ayuda a los buscadores a indexar las páginas clave de la plataforma.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://mxwatch.mgdc.site';

    return [
        {
            url: baseUrl, // Página de Inicio (Prioridad Máxima)
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/mapa`, // Mapa Interactivo (Prioridad Alta)
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
    ]
}
