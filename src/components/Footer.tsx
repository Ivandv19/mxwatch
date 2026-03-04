"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const FOOTER_LINKS = [
    {
        heading: "Plataforma",
        links: [
            { href: "/", label: "Inicio" },
            { href: "/mapa", label: "Mapa interactivo" },
        ],
    },
];

export default function Footer() {
    const pathname = usePathname();

    if (pathname === "/mapa") return null;

    return (
        <footer className="w-full border-t border-white/10 bg-[#080c12] mt-auto">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16">

                {/* Main grid: brand (2 cols) + 1 nav group = 3 total */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-3">

                    {/* Brand — spans 2 columns */}
                    <div className="col-span-2 flex flex-col gap-5">
                        <Link href="/" className="flex items-center gap-3 select-none w-fit group">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold bg-accent text-white shadow-[0_0_15px_rgba(230,57,70,0.3)] group-hover:scale-110 transition-transform">
                                MX
                            </span>
                            <span className="text-xl font-bold tracking-tight text-[#f0f4ff]">
                                mxwatch
                            </span>
                        </Link>
                        <p className="text-[#8b98b8] text-sm leading-relaxed">
                            Monitoreo independiente de seguridad en México. Visualización de control territorial basada en fuentes públicas y periodísticas.
                        </p>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit">
                            <span className="h-1.5 w-1.5 rounded-full animate-pulse bg-accent shadow-[0_0_8px_var(--accent)]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5e6c8b]">
                                Sistema Activo
                            </span>
                        </div>
                    </div>

                    {/* Nav columns — 1 col each */}
                    {FOOTER_LINKS.map(({ heading, links }) => (
                        <div key={heading} className="flex flex-col gap-5">
                            <h3 className="font-bold text-[#f0f4ff] uppercase tracking-wider text-xs">
                                {heading}
                            </h3>
                            <ul className="flex flex-col gap-3">
                                {links.map(({ href, label }) => (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            className="text-sm text-[#8b98b8] hover:text-accent transition-colors"
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-16 pt-8 border-t border-white/10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[#8b98b8]">
                        © {new Date().getFullYear()} <span className="font-bold text-[#f0f4ff]">mxwatch</span> — Proyecto independiente con fines informativos.
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {["Next.js", "Tailwind", "MapLibre", "Bun"].map((tech) => (
                            <span
                                key={tech}
                                className="px-3 py-1 text-xs font-medium rounded-full border border-white/10 bg-white/5 text-[#8b98b8] transition-all hover:border-accent hover:text-accent cursor-default"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
