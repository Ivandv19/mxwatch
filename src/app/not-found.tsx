import Link from "next/link";

export default function NotFound() {
    return (
        <div className="relative w-full flex flex-col items-center justify-center min-h-[calc(100dvh-64px)] px-8 text-center py-20 overflow-hidden bg-[#080c12]">
            {/* Background elements to match Home page */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-square opacity-[0.03] pointer-events-none rounded-full bg-white blur-3xl z-0" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent opacity-[0.06] blur-[120px] pointer-events-none rounded-full z-0" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Status-like badge for 404 */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase text-accent shadow-sm backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent-glow)]" />
                    Error 404: Ruta no encontrada
                </div>

                <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl text-[#f0f4ff] drop-shadow-sm leading-tight">
                    Zona <br className="sm:hidden" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#f47e86]">fuera de cobertura</span>
                </h1>

                <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#8b98b8] font-medium">
                    Lo sentimos, la sección que buscas no existe o ha sido reubicada dentro del sistema táctico.
                </p>

                <div className="mt-12 flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/"
                        className="group relative inline-flex h-12 md:h-14 items-center justify-center rounded-lg bg-accent px-8 text-base font-semibold text-white transition-all hover:bg-accent-hover hover:-translate-y-0.5 shadow-[0_0_30px_-10px_var(--accent-glow)]"
                    >
                        <svg className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Regresar al Inicio</span>
                    </Link>
                    <Link
                        href="/mapa"
                        className="inline-flex h-12 md:h-14 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-8 text-base font-semibold text-[#f0f4ff] transition-all hover:bg-white/10"
                    >
                        Explorar Mapa
                    </Link>
                </div>
            </div>

            {/* Tactical grid background element */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
                    backgroundSize: "40px 40px"
                }}
            />
        </div>
    );
}
