/**
 * Componente de marcador de posición para secciones aún no desarrolladas.
 * Presenta un mensaje amigable indicando que la sección está en construcción.
 */
export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            {/* Aviso visual de estado */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase text-accent shadow-sm backdrop-blur-md">
                En Construcción
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#f0f4ff] mb-4">
                {title}
            </h1>
            <p className="max-w-md text-[#8b98b8] font-medium">
                Estamos trabajando en esta sección para brindarte la mejor información sobre la seguridad en México. Vuelve pronto.
            </p>
        </div>
    );
}
