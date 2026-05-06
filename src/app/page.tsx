"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";

/**
 * Página de inicio (Landing): presenta la propuesta de valor y métricas clave.
 * Sirve como punto de entrada principal hacia el mapa interactivo.
 */
export default function Home() {
	// Variantes para animaciones escalonadas
	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.1,
			},
		},
	};

	const itemVariants: Variants = {
		hidden: { opacity: 0, y: 15 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
				ease: [0.25, 0.1, 0.25, 1.0],
			},
		},
	};

	return (
		<div className="relative w-full flex flex-col items-center justify-center min-h-[calc(100dvh-64px)] px-8 text-center py-20 overflow-hidden">
			<motion.div
				className="w-full max-w-6xl mx-auto flex flex-col items-center"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				{/* Efectos de iluminación de fondo (Glow) con animación suave */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 0.03 }}
					transition={{ duration: 2 }}
					className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-square pointer-events-none rounded-full bg-white blur-3xl z-[-1]"
				/>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 0.06 }}
					transition={{ duration: 1.5, delay: 0.5 }}
					className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent blur-[120px] pointer-events-none rounded-full z-[-1]"
				/>

				{/* Badge de estado actual de la plataforma */}
				<motion.div
					variants={itemVariants}
					className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase text-[#8b98b8] shadow-sm backdrop-blur-md"
				>
					<span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--accent-glow)]" />
					Plataforma Beta
				</motion.div>

				{/* Encabezado principal con jerarquía visual y gradiente de acento */}
				<motion.h1
					variants={itemVariants}
					className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl text-[#f0f4ff] drop-shadow-sm leading-[1.15]"
				>
					La seguridad de México, <br className="hidden sm:block" />
					<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#f47e86]">
						visualizada en detalle
					</span>
				</motion.h1>

				<motion.p
					variants={itemVariants}
					className="mt-6 max-w-2xl text-lg leading-relaxed text-[#8b98b8] font-medium"
				>
					Una herramienta interactiva y transparente para rastrear el control
					territorial de los cárteles y eventos de seguridad a lo largo de toda
					la República Mexicana.
				</motion.p>

				{/* Rejilla de estadísticas rápidas (KPIs) del sistema */}
				<motion.div
					variants={itemVariants}
					className="mt-20 w-full max-w-3xl grid grid-cols-2 gap-4 sm:grid-cols-3"
				>
					{[
						{ label: "Cárteles mapeados", value: "5" },
						{ label: "Estados cubiertos", value: "32" },
						{ label: "Eventos registrados", value: "0", highlight: false },
					].map(({ label, value, highlight = true }) => (
						<div
							key={label}
							className={`flex flex-col items-center justify-center gap-1 rounded-2xl border ${highlight ? "border-white/5 bg-[#0f1520] shadow-sm" : "border-white/5 bg-[#080c12] opacity-60"} p-6 transition-colors hover:bg-[#1c2636] backdrop-blur-sm`}
						>
							<span className="text-3xl font-bold tracking-tight text-[#f0f4ff]">
								{value}
							</span>
							<span className="text-sm font-medium text-[#8b98b8] text-center">
								{label}
							</span>
						</div>
					))}
				</motion.div>

				{/* Llamada a la acción (CTA) principal hacia el mapa */}
				<motion.div
					variants={itemVariants}
					className="mt-20 flex flex-col sm:flex-row gap-4"
				>
					<Link
						href="/mapa"
						className="group relative inline-flex h-12 md:h-14 items-center justify-center rounded-lg bg-accent px-8 text-base font-semibold text-white transition-all hover:bg-accent-hover hover:-translate-y-0.5 shadow-[0_0_30px_-10px_var(--accent-glow)]"
					>
						<span>Abrir el mapa interactivo</span>
						<svg
							className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M14 5l7 7m0 0l-7 7m7-7H3"
							/>
						</svg>
					</Link>
				</motion.div>
			</motion.div>
		</div>
	);
}
