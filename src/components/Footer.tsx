"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Enlaces de navegación principal
const NAV_LINKS = [
	{ href: "/", label: "Inicio" },
	{ href: "/mapa", label: "Mapa interactivo" },
];

// Enlaces legales y de cumplimiento
const LEGAL_LINKS = [
	{ href: "/legal/terms", label: "Términos y Condiciones" },
	{ href: "/legal/privacy", label: "Política de Privacidad" },
];

/**
 * Pie de página global con información institucional, navegación y estado del sistema.
 * Se oculta automáticamente en la vista del mapa para maximizar el área visual.
 */
export default function Footer() {
	const pathname = usePathname();

	// Ocultar en ruta de mapa interactivo para optimización de espacio
	if (pathname === "/mapa") return null;

	return (
		<footer className="w-full border-t border-white/10 bg-[#080c12] mt-auto transition-colors duration-300">
			<div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16">
				{/* Grid principal: Branding, Navegación, Legal y Newsletter */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
					{/* Columna 1: Identidad y Estado del Sistema */}
					<div className="flex flex-col gap-5">
						<Link
							href="/"
							className="flex items-center gap-3 select-none w-fit group"
						>
							<Image
								src="/logo.png"
								alt="MxWatch Logo"
								width={32}
								height={32}
								className="w-8 h-8 rounded-lg shadow-[0_0_15px_rgba(230,57,70,0.3)] group-hover:scale-110 transition-transform"
							/>
							<span className="text-xl font-bold tracking-tight text-[#f0f4ff]">
								mxwatch
							</span>
						</Link>
						<p className="text-[#8b98b8] text-sm leading-relaxed max-w-xs">
							Monitoreo independiente de seguridad en México. Visualización de
							control territorial basada en fuentes públicas.
						</p>
						{/* Indicador de actividad en tiempo real */}
						<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit">
							<span className="h-1.5 w-1.5 rounded-full animate-pulse bg-accent shadow-[0_0_8px_var(--accent-glow)]" />
							<span className="text-[10px] font-bold uppercase tracking-widest text-[#5e6c8b]">
								Sistema Activo
							</span>
						</div>
					</div>

					{/* Columna 2: Navegación Principal */}
					<div className="flex flex-col gap-5">
						<h3 className="font-bold text-[#f0f4ff] uppercase tracking-wider text-xs">
							Plataforma
						</h3>
						<ul className="flex flex-col gap-3">
							{NAV_LINKS.map(({ href, label }) => (
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

					{/* Columna 3: Enlaces Legales */}
					<div className="flex flex-col gap-5">
						<h3 className="font-bold text-[#f0f4ff] uppercase tracking-wider text-xs">
							Legal
						</h3>
						<ul className="flex flex-col gap-3">
							{LEGAL_LINKS.map(({ href, label }) => (
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

					{/* Columna 4: Suscripción al Boletín */}
					<div className="flex flex-col gap-5">
						<h3 className="font-bold text-[#f0f4ff] uppercase tracking-wider text-xs">
							Boletín
						</h3>
						<form
							className="flex flex-col gap-3"
							onSubmit={(e) => e.preventDefault()}
						>
							<input
								type="email"
								placeholder="Tu correo electrónico"
								className="px-4 py-2 rounded-md border border-white/10 bg-white/5 text-[#f0f4ff] text-sm focus:outline-none focus:border-accent transition-all"
							/>
							<button
								type="submit"
								className="px-4 py-2 rounded-md bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-colors shadow-lg shadow-accent/10"
							>
								Suscribirse
							</button>
						</form>
					</div>
				</div>

				{/* Barra inferior: Créditos, Stack Tecnológico y Copyright */}
				<div className="border-t border-white/10 pt-12 flex flex-col items-center gap-8">
					{/* Créditos y Tecnologías Utilizadas */}
					<div className="flex flex-col items-center gap-5">
						<p className="text-sm font-medium text-[#8b98b8]">
							Desarrollado por{" "}
							<span className="font-bold text-[#f0f4ff]">Sinx</span>
						</p>
						<div className="flex flex-wrap justify-center gap-2">
							{["Next.js", "Tailwind", "D3-geo", "TopoJSON", "Hono"].map(
								(tech) => (
									<span
										key={tech}
										className="px-3 py-1 text-xs font-medium rounded-full border border-white/10 bg-white/5 text-[#8b98b8] transition-all hover:border-accent hover:text-accent cursor-default"
									>
										{tech}
									</span>
								),
							)}
						</div>
					</div>

					{/* Copyright Dinámico */}
					<p className="text-xs text-[#5e6c8b] text-center">
						© {new Date().getFullYear()}{" "}
						<span className="font-bold text-[#5e6c8b]/80">mxwatch</span> — Todos
						los derechos reservados.
					</p>
				</div>
			</div>
		</footer>
	);
}
