import type { MetadataRoute } from 'next';

/**
 * Configuración dinámica del sitemap para indexación en buscadores.
 * Define las rutas principales y su prioridad de rastreo.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://mxwatch.mgdc.site';

    return [
        {
            url: baseUrl, // Página de inicio: máxima prioridad
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/mapa`, // Mapa interactivo: alta prioridad por contenido dinámico
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
    ];
}