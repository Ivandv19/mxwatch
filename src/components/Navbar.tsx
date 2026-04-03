import Link from "next/link";

/**
 * Barra de navegación principal.
 * Contiene el logotipo y el acceso a la página de inicio.
 */
export default function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-[64px] border-b border-white/10 bg-[#080c12]/60 backdrop-blur-md">
            <nav className="w-full max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-center">
                <Link
                    href="/"
                    className="flex items-center gap-3 select-none transition-opacity hover:opacity-90"
                    aria-label="mxwatch home"
                >
                    {/* Logotipo táctico MX */}
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold bg-accent text-white shadow-[0_0_15px_rgba(230,57,70,0.3)]">
                        MX
                    </span>
                    <div className="flex flex-col leading-none">
                        <span className="text-lg font-bold tracking-tight text-[#f0f4ff]">
                            mxwatch
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent leading-none">
                            beta
                        </span>
                    </div>
                </Link>
            </nav>
        </header>
    );
}
