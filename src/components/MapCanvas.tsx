"use client";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	ComposableMap,
	Geographies,
	Geography,
	ZoomableGroup,
} from "react-simple-maps";
import { feature } from "topojson-client";
import { getLiveMapData } from "@/actions/mapData";
import {
	useLiveStateData,
	useMapActions,
	useSelectedCartel,
	useSelectedState,
} from "@/store/mapStore";

// Recurso TopoJSON con los límites geográficos de México.
const geoUrl = "/maps/mexico.json";

// Constantes de configuración para la proyección y el zoom.
const MEXICO_CENTER: [number, number] = [-102.34, 24.01];
const DEFAULT_ZOOM = 1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1.5;

interface TooltipState {
	content: string; // Nombre del estado
	cartel: string; // Cárteles presentes
	color: string; // Color representativo
	x: number; // Posición X relativa
	y: number; // Posición Y relativa
}

interface ErrorState {
	map: string | null;
	data: string | null;
}

interface TopoData {
	type: "Topology";
	arcs: unknown[];
	objects: {
		states: unknown;
	};
}

interface CartelStyle {
	fill: string;
	stroke: string;
	strokeWidth: number;
	cartel: string;
	opacity: number;
	liveDataRaw: { color?: string } | null;
}

interface MemoizedMapProps {
	features: unknown[];
	position: { coordinates: [number, number]; zoom: number };
	handleMoveEnd: (position: {
		coordinates: [number, number];
		zoom: number;
	}) => void;
	getCartelStyle: (stateName: string) => CartelStyle;
	selectedState: string | null;
	setSelectedState: (state: string | null) => void;
	setTooltip: React.Dispatch<React.SetStateAction<TooltipState | null>>;
	mapScale: number;
	containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Núcleo interactivo del mapa: renderiza geografía, gestiona zoom y visualiza control territorial.
 */
export default function MapCanvas() {
	// Estado Global (Zustand)
	const selectedCartel = useSelectedCartel();
	const selectedState = useSelectedState();
	const liveStateData = useLiveStateData();
	const { setSelectedState, setLiveStateData } = useMapActions();

	// Estado Local: Vista, datos crudos y UI
	const [position, setPosition] = useState({
		coordinates: MEXICO_CENTER,
		zoom: DEFAULT_ZOOM,
	});
	const [topoData, setTopoData] = useState<TopoData | null>(null);
	const [tooltip, setTooltip] = useState<TooltipState | null>(null);
	const [errors, setErrors] = useState<ErrorState>({ map: null, data: null });
	const [isLoading, setIsLoading] = useState({ map: true, data: true });

	const mapContainerRef = useRef<HTMLDivElement>(null);

	/** Efecto: Carga asíncrona de geometría (TopoJSON) e inteligencia (DB) con AbortController */
	useEffect(() => {
		const controller = new AbortController();

		// 1. Carga de Geometría
		setIsLoading((prev) => ({ ...prev, map: true }));
		fetch(geoUrl, { signal: controller.signal })
			.then((res) => (res.ok ? res.json() : Promise.reject()))
			.then((data) => {
				setTopoData(data);
				setErrors((prev) => ({ ...prev, map: null }));
			})
			.catch(
				(err) =>
					err.name !== "AbortError" &&
					setErrors((prev) => ({ ...prev, map: "Error geometría" })),
			)
			.finally(() => setIsLoading((prev) => ({ ...prev, map: false })));

		// 2. Carga de Inteligencia en Vivo
		setIsLoading((prev) => ({ ...prev, data: true }));
		getLiveMapData()
			.then((data) => {
				setLiveStateData(data);
				setErrors((prev) => ({ ...prev, data: null }));
			})
			.catch(() =>
				setErrors((prev) => ({ ...prev, data: "Error inteligencia" })),
			)
			.finally(() => setIsLoading((prev) => ({ ...prev, data: false })));

		return () => controller.abort();
	}, [setLiveStateData]);

	/** Handlers de control de cámara (Zoom/Reset) */
	const handleZoomIn = useCallback(
		() =>
			setPosition((p) => ({
				...p,
				zoom: Math.min(p.zoom * ZOOM_STEP, MAX_ZOOM),
			})),
		[],
	);
	const handleZoomOut = useCallback(
		() =>
			setPosition((p) => ({
				...p,
				zoom: Math.max(p.zoom / ZOOM_STEP, DEFAULT_ZOOM),
			})),
		[],
	);
	const handleReset = useCallback(
		() => setPosition({ coordinates: MEXICO_CENTER, zoom: DEFAULT_ZOOM }),
		[],
	);
	const handleClearSelection = useCallback(
		() => setSelectedState(null),
		[setSelectedState],
	);

	/** Efecto: Atajos de teclado para navegación táctica (+, -, R, ESC) */
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			)
				return;
			if (["+", "="].includes(e.key)) {
				e.preventDefault();
				handleZoomIn();
			}
			if (["-", "_"].includes(e.key)) {
				e.preventDefault();
				handleZoomOut();
			}
			if (["r", "R", "0"].includes(e.key)) {
				e.preventDefault();
				handleReset();
			}
			if (e.key === "Escape") {
				e.preventDefault();
				handleClearSelection();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleZoomIn, handleZoomOut, handleReset, handleClearSelection]);

	/** Lógica de estilizado dinámico: colores, opacidad y patrones según filtros y dominio */
	const getCartelStyle = useCallback(
		(stateName: string): CartelStyle => {
			const stateRecord = liveStateData.find((s) => s.stateName === stateName);

			if (!stateRecord || stateRecord.cartels.length === 0) {
				return {
					fill: "rgba(25, 40, 60, 0.4)",
					stroke: "rgba(80, 110, 150, 0.4)",
					strokeWidth: 0.5,
					cartel: "Sin datos",
					opacity: 1,
					liveDataRaw: null,
				};
			}

			const isCartelMatch =
				selectedCartel &&
				stateRecord.cartels.some(
					(c) => c.slug === selectedCartel || c.id === selectedCartel,
				);
			const isDimmed = selectedCartel && !isCartelMatch;
			const dominantCartel =
				stateRecord.cartels.find((c) => c.isDominant) || stateRecord.cartels[0];
			const primaryColor = dominantCartel.color;
			const cartelNames = stateRecord.cartels.map((c) => c.name).join(" / ");

			// Caso especial: Tamaulipas (patrón de bicefalia)
			if (stateRecord.cartels.length > 1 && stateName === "Tamaulipas") {
				return {
					fill: isDimmed
						? "url(#pattern-tamaulipas-dimmed)"
						: isCartelMatch
							? "url(#pattern-tamaulipas-highlighted)"
							: "url(#pattern-tamaulipas-normal)",
					stroke: isDimmed
						? `${primaryColor}30`
						: isCartelMatch
							? "white"
							: primaryColor,
					strokeWidth: isCartelMatch ? 2 : 1,
					cartel: cartelNames,
					opacity: isDimmed ? 0.4 : 1,
					liveDataRaw: dominantCartel,
				};
			}

			// Estilo estándar por cartel dominante
			return {
				fill: isDimmed
					? `${primaryColor}18`
					: isCartelMatch
						? `${primaryColor}dd`
						: `${primaryColor}44`,
				stroke: isDimmed
					? `${primaryColor}30`
					: isCartelMatch
						? "white"
						: primaryColor,
				strokeWidth: isCartelMatch ? 2 : 1,
				cartel: cartelNames,
				opacity: isDimmed ? 0.4 : 1,
				liveDataRaw: dominantCartel,
			};
		},
		[selectedCartel, liveStateData],
	);

	// Memoización de features TopoJSON para evitar recálculos costosos
	const features = useMemo(() => {
		if (!topoData?.objects?.states) return [];
		try {
			const result = feature(
				topoData as never,
				topoData.objects.states as never,
			);
			return "features" in result
				? (result as { features: unknown[] }).features
				: [];
		} catch {
			return [];
		}
	}, [topoData]);

	// Escala adaptativa según dispositivo (Mobile/Desktop)
	const mapScale = useMemo(
		() =>
			typeof window !== "undefined" && window.innerWidth < 768 ? 900 : 1400,
		[],
	);

	return (
		<div
			ref={mapContainerRef}
			className="relative flex-1 w-full h-full bg-[#080c12] overflow-hidden cursor-crosshair"
		>
			{/* HUD: Gestión de errores y carga */}
			{errors.map && <ErrorDisplay message={errors.map} />}
			{errors.data && <ErrorDisplay message={errors.data} />}
			{isLoading.map && !errors.map && <LoadingOverlay />}

			<div
				className="absolute inset-0 flex items-center justify-center bg-[#05080c]"
				style={{
					backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
				}}
			>
				{tooltip && <StrategicTooltip tooltip={tooltip} />}

				{!topoData && !errors.map ? (
					<LoadingIndicator />
				) : (
					topoData && (
						<MemoizedMap
							features={features}
							position={position}
							handleMoveEnd={setPosition}
							getCartelStyle={getCartelStyle}
							selectedState={selectedState}
							setSelectedState={setSelectedState}
							setTooltip={setTooltip}
							mapScale={mapScale}
							containerRef={mapContainerRef}
						/>
					)
				)}

				<KeyboardShortcutsHint />
				<MapControls
					onZoomIn={handleZoomIn}
					onZoomOut={handleZoomOut}
					onReset={handleReset}
					zoom={position.zoom}
				/>
			</div>
		</div>
	);
}

// --- Sub-componentes de UI y Renderizado Optimizado ---

const StrategicTooltip = React.memo(
	({ tooltip }: { tooltip: TooltipState }) => (
		<div
			className="absolute z-50 pointer-events-none transition-transform duration-75 ease-out"
			style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}
		>
			<div className="bg-[#0a0f18]/95 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-2xl flex flex-col gap-1.5 min-w-[180px]">
				<span className="text-[10px] font-black uppercase tracking-widest text-[#5e6c8b]">
					Estado
				</span>
				<span className="text-sm font-bold text-[#f0f4ff]">
					{tooltip.content}
				</span>
				<div className="h-[1px] w-full bg-white/5 my-0.5" />
				<div className="flex items-center gap-2">
					<div
						className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
						style={{ backgroundColor: tooltip.color }}
					/>
					<span
						className="text-xs font-mono font-bold"
						style={{ color: tooltip.color }}
					>
						{tooltip.cartel}
					</span>
				</div>
			</div>
		</div>
	),
);
StrategicTooltip.displayName = "StrategicTooltip";

const LoadingOverlay = () => (
	<div className="absolute inset-0 bg-[#080c12]/80 backdrop-blur-sm flex items-center justify-center z-40">
		<div className="flex flex-col items-center gap-4">
			<div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
			<span className="text-xs font-mono uppercase tracking-[0.2em] text-[#8b98b8]">
				Sincronizando...
			</span>
		</div>
	</div>
);

const LoadingIndicator = React.memo(() => (
	<div className="flex flex-col items-center gap-4 text-[#8b98b8]">
		<div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
		<span className="text-xs font-mono uppercase tracking-[0.2em]">
			Cargando Mapa...
		</span>
	</div>
));
LoadingIndicator.displayName = "LoadingIndicator";

const MapControls = React.memo(
	({
		onZoomIn,
		onZoomOut,
		onReset,
		zoom,
	}: {
		onZoomIn: () => void;
		onZoomOut: () => void;
		onReset: () => void;
		zoom: number;
	}) => (
		<div className="absolute top-20 md:bottom-6 right-4 md:right-6 flex flex-col gap-2 z-20">
			<button
				type="button"
				onClick={onZoomIn}
				disabled={zoom >= MAX_ZOOM}
				className="w-9 h-9 rounded-lg bg-[#0f1520]/80 border border-white/10 hover:bg-[#1c2636] transition-all disabled:opacity-30"
				aria-label="Acercar"
			>
				+
			</button>
			<button
				type="button"
				onClick={onZoomOut}
				disabled={zoom <= DEFAULT_ZOOM}
				className="w-9 h-9 rounded-lg bg-[#0f1520]/80 border border-white/10 hover:bg-[#1c2636] transition-all disabled:opacity-30"
				aria-label="Alejar"
			>
				-
			</button>
			<button
				type="button"
				onClick={onReset}
				className="w-9 h-9 rounded-lg bg-[#0f1520]/80 border border-white/10 text-accent hover:bg-accent/10 transition-all"
				aria-label="Resetear"
			>
				⟲
			</button>
		</div>
	),
);
MapControls.displayName = "MapControls";

const KeyboardShortcutsHint = () => (
	<div className="absolute bottom-6 left-6 z-30 bg-[#0f1520]/60 backdrop-blur-sm border border-white/5 rounded-lg px-3 py-2 text-[10px] font-mono text-[#5e6c8b] hidden md:block">
		<div className="flex items-center gap-3">
			<span>+ / - : Zoom</span>
			<span>R : Reset</span>
			<span>ESC : Limpiar</span>
		</div>
	</div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
	<div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
		<div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 flex items-center gap-2">
			<span className="text-red-400 text-xs font-mono">⚠️ {message}</span>
			<button
				type="button"
				onClick={() => window.location.reload()}
				className="text-xs text-red-400/70 hover:text-red-400 ml-2 underline"
			>
				Reintentar
			</button>
		</div>
	</div>
);

/**
 * Renderizador SVG memoizado. Evita re-renders masivos durante interacciones de mouse o UI externa.
 */
const MemoizedMap = React.memo(
	({
		features,
		position,
		handleMoveEnd,
		getCartelStyle,
		selectedState,
		setSelectedState,
		setTooltip,
		mapScale,
		containerRef,
	}: MemoizedMapProps) => {
		const handleMouseEnter = useCallback(
			(e: React.MouseEvent, stateName: string, style: CartelStyle) => {
				if (!containerRef.current) return;
				const rect = containerRef.current.getBoundingClientRect();
				setTooltip({
					content: stateName,
					cartel: style.cartel,
					color:
						style.stroke === "white"
							? (style.liveDataRaw?.color ?? "#8b98b8")
							: style.stroke,
					x: e.clientX - rect.left,
					y: e.clientY - rect.top,
				});
			},
			[containerRef, setTooltip],
		);

		const handleMouseMove = useCallback(
			(e: React.MouseEvent) => {
				if (!containerRef.current) return;
				const rect = containerRef.current.getBoundingClientRect();
				setTooltip((prev) =>
					prev
						? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top }
						: null,
				);
			},
			[containerRef, setTooltip],
		);

		return (
			<div className="absolute inset-0 z-10">
				<ComposableMap
					projection="geoMercator"
					projectionConfig={{ scale: mapScale, center: MEXICO_CENTER }}
					className="w-full h-full"
				>
					<defs>
						{/* Patrones SVG para zonas de disputa territorial (bicefalia) */}
						<pattern
							id="pattern-tamaulipas-normal"
							width="12"
							height="12"
							patternUnits="userSpaceOnUse"
							patternTransform="rotate(45)"
						>
							<rect width="6" height="12" fill="#9b59b6" fillOpacity={0.4} />
							<rect
								x="6"
								width="6"
								height="12"
								fill="#1abc9c"
								fillOpacity={0.4}
							/>
						</pattern>
						<pattern
							id="pattern-tamaulipas-highlighted"
							width="12"
							height="12"
							patternUnits="userSpaceOnUse"
							patternTransform="rotate(45)"
						>
							<rect width="6" height="12" fill="#9b59b6" fillOpacity={0.8} />
							<rect
								x="6"
								width="6"
								height="12"
								fill="#1abc9c"
								fillOpacity={0.8}
							/>
						</pattern>
						<pattern
							id="pattern-tamaulipas-dimmed"
							width="12"
							height="12"
							patternUnits="userSpaceOnUse"
							patternTransform="rotate(45)"
						>
							<rect width="6" height="12" fill="#9b59b6" fillOpacity={0.15} />
							<rect
								x="6"
								width="6"
								height="12"
								fill="#1abc9c"
								fillOpacity={0.15}
							/>
						</pattern>
					</defs>

					<ZoomableGroup
						zoom={position.zoom}
						center={position.coordinates}
						onMoveEnd={handleMoveEnd}
						maxZoom={MAX_ZOOM}
					>
						<Geographies geography={features}>
							{({ geographies }) =>
								geographies.map((geo) => {
									const stateName = geo.properties.state_name;
									const style = getCartelStyle(stateName);
									return (
										<Geography
											key={geo.rsmKey}
											geography={geo}
											fill={style.fill}
											stroke={style.stroke}
											strokeWidth={style.strokeWidth}
											onMouseEnter={(e) =>
												handleMouseEnter(e, stateName, style)
											}
											onMouseMove={handleMouseMove}
											onMouseLeave={() => setTooltip(null)}
											onClick={() =>
												setSelectedState(
													selectedState === stateName ? null : stateName,
												)
											}
											style={{
												default: {
													opacity: style.opacity,
													outline: "none",
													transition: "all 200ms ease",
												},
												hover: {
													fillOpacity: 0.8,
													stroke: "white",
													strokeWidth: 2,
												},
											}}
										/>
									);
								})
							}
						</Geographies>
					</ZoomableGroup>
				</ComposableMap>
			</div>
		);
	},
	(prev, next) =>
		prev.position.zoom === next.position.zoom &&
		prev.selectedState === next.selectedState &&
		prev.features === next.features,
);

MemoizedMap.displayName = "MemoizedMap";
