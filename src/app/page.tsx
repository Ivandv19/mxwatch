import Link from "next/link";

export default function Home() {
  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-[calc(100dvh-64px)] px-8 text-center py-20 overflow-hidden">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-square opacity-[0.03] pointer-events-none rounded-full bg-white blur-3xl z-[-1]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent opacity-[0.06] blur-[120px] pointer-events-none rounded-full z-[-1]" />

        {/* Status badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase text-[#8b98b8] shadow-sm backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--accent-glow)]" />
          Plataforma Beta
        </div>

        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl text-[#f0f4ff] drop-shadow-sm leading-[1.15]">
          La seguridad de México, <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#f47e86]">visualizada en detalle</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#8b98b8] font-medium">
          Una herramienta interactiva y transparente para rastrear el control territorial de los cárteles y eventos de seguridad a lo largo de toda la República Mexicana.
        </p>



        {/* Grid stats */}
        <div className="mt-20 w-full max-w-3xl grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: "Cárteles mapeados", value: "5" },
            { label: "Estados cubiertos", value: "32" },
            { label: "Eventos registrados", value: "0", highlight: false },
          ].map(({ label, value, highlight = true }) => (
            <div
              key={label}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl border ${highlight ? 'border-white/5 bg-[#0f1520] shadow-sm' : 'border-white/5 bg-[#080c12] opacity-60'} p-6 transition-colors hover:bg-[#1c2636] backdrop-blur-sm`}
            >
              <span className="text-3xl font-bold tracking-tight text-[#f0f4ff]">
                {value}
              </span>
              <span className="text-sm font-medium text-[#8b98b8] text-center">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-20 flex flex-col sm:flex-row gap-4">
          <Link
            href="/mapa"
            className="group relative inline-flex h-12 md:h-14 items-center justify-center rounded-lg bg-accent px-8 text-base font-semibold text-white transition-all hover:bg-accent-hover hover:-translate-y-0.5 shadow-[0_0_30px_-10px_var(--accent-glow)]"
          >
            <span>Abrir el mapa interactivo</span>
            <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
