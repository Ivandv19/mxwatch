import { Suspense } from "react";
import MapSidebar from "@/components/MapSidebar";
import MapCanvas from "@/components/MapCanvas";

// Configuración de runtime para Cloudflare Pages.
// 'force-dynamic' habilita Server Actions (POST) en esta ruta estática.
// 'edge' asegura ejecución de baja latencia cerca del usuario.
export const dynamic = "force-dynamic";
export const runtime = "edge";

/**
 * Vista principal del mapa interactivo.
 * Compone el lienzo geográfico (MapCanvas) y el panel de inteligencia (MapSidebar).
 */
export default function MapaPage() {
    return (
        <div className="flex flex-col md:flex-row h-[calc(100dvh-64px)] w-full overflow-hidden bg-[#080c12]">
            {/* Panel lateral con fallback de carga para evitar bloqueo del renderizado */}
            <Suspense fallback={<div className="w-full md:w-[380px] bg-[#0f1520] shrink-0" />}>
                <MapSidebar />
            </Suspense>

            {/* Lienzo SVG interactivo de México */}
            <MapCanvas />
        </div>
    );
}